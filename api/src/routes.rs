use std::collections::HashSet;

use axum::{
	extract::{
		ws::{Message, WebSocket},
		Path, State, WebSocketUpgrade,
	},
	http::StatusCode,
	response::{IntoResponse, Response},
	Json,
};
use axum_macros::debug_handler;
use axum_sessions::extractors::{ReadableSession, WritableSession};
use futures::{
	future::select,
	stream::{SplitSink, SplitStream},
	FutureExt, SinkExt, StreamExt, TryStreamExt,
};
use orion::{
	errors::UnknownCryptoError,
	pwhash::{hash_password, hash_password_verify, Password},
};
use redust::{model::pubsub, pool::Object, resp::from_data, Connection};
use serde::{Deserialize, Serialize};
use tokio::task::spawn_blocking;
use tracing::error;

use crate::{
	error::Result,
	middleware::ROOM_SESSION_KEY,
	models::{PubSubPacket, Room, WsOp, WsPacket},
	AppState, RedisPool,
};

const PASSWORD_HASH_ITERATIONS: u32 = 3;
const PASSWORD_MEMORY: u32 = 1 << 16;

#[derive(Debug, Deserialize)]
pub struct CreateRoomRequest {
	password: String,
}

#[derive(Debug, Serialize)]
struct CreateRoomResponse {
	id: String,
}

#[debug_handler]
pub async fn get_rooms(
	State(state): State<AppState>,
	mut sess: WritableSession,
) -> Result<Json<HashSet<String>>> {
	let maybe_rooms = sess.get::<Vec<String>>(ROOM_SESSION_KEY);
	sess.remove(ROOM_SESSION_KEY);

	match maybe_rooms {
		None => Ok(Json(HashSet::new())),
		Some(cookie_rooms) => {
			let actual_rooms = state.room_store.filter_keys(cookie_rooms).await?;

			sess.insert(ROOM_SESSION_KEY, &actual_rooms)?;
			Ok(Json(actual_rooms))
		}
	}
}

#[debug_handler]
pub async fn create_room(
	State(state): State<AppState>,
	mut sess: WritableSession,
	Json(body): Json<CreateRoomRequest>,
) -> Result<Response> {
	let hashed_password = if body.password.is_empty() {
		None
	} else {
		let password = Password::from_slice(body.password.as_bytes())?;
		Some(
			spawn_blocking(move || {
				hash_password(&password, PASSWORD_HASH_ITERATIONS, PASSWORD_MEMORY)
			})
			.await??,
		)
	};

	let id = nanoid::nanoid!();
	let room = Room {
		id: id.clone(),
		owner_id: sess.id().to_string(),
		name: None,
		password: hashed_password,
	};

	let saved = state.room_store.set(&id, &room).await?;

	if saved {
		let mut rooms = sess
			.get::<HashSet<String>>(ROOM_SESSION_KEY)
			.unwrap_or_default();
		rooms.insert(id.clone());
		sess.insert(ROOM_SESSION_KEY, rooms)?;

		let response = CreateRoomResponse { id };
		Ok((StatusCode::CREATED, Json(response)).into_response())
	} else {
		Ok(StatusCode::LOCKED.into_response())
	}
}

#[derive(Debug, Deserialize)]
pub struct JoinRoomRequest {
	password: String,
}

#[debug_handler]
pub async fn join_room(
	State(state): State<AppState>,
	Path(room_id): Path<String>,
	mut sess: WritableSession,
	Json(body): Json<JoinRoomRequest>,
) -> Result<StatusCode> {
	let is_valid_password = state
		.room_store
		.get(&room_id)
		.await?
		.map(|room| {
			let is_valid = match room.password {
				Some(hash) => {
					let password = Password::from_slice(body.password.as_bytes())?;
					hash_password_verify(&hash, &password).is_ok()
				}
				None => body.password.is_empty(),
			};

			Ok::<_, UnknownCryptoError>(is_valid)
		})
		.transpose()?
		.unwrap_or(false);

	let status = if is_valid_password {
		let mut rooms = sess
			.get::<HashSet<String>>(ROOM_SESSION_KEY)
			.unwrap_or_default();
		rooms.insert(room_id);
		sess.insert(ROOM_SESSION_KEY, rooms)?;
		StatusCode::OK
	} else {
		StatusCode::UNAUTHORIZED
	};

	Ok(status)
}

#[debug_handler]
pub async fn handle_ws(
	State(state): State<AppState>,
	Path(room_id): Path<String>,
	sess: ReadableSession,
	ws: WebSocketUpgrade,
) -> Response {
	let client_id = sess.id().to_string();
	ws.on_upgrade(
		|socket| async move { stream_ws(state, room_id, client_id, socket).await.unwrap() },
	)
}

async fn stream_ws(
	state: AppState,
	room_id: String,
	client_id: String,
	stream: WebSocket,
) -> Result<()> {
	let hello_packet = PubSubPacket {
		src_id: &client_id,
		dst_id: None,
		op: WsOp::Hello,
	};

	state
		.db
		.get()
		.await?
		.cmd(["PUBLISH", &room_id, &serde_json::to_string(&hello_packet)?])
		.await?;

	let mut signals = Object::take(state.db.get().await?);
	signals.cmd(["SUBSCRIBE", &room_id]).await?;

	let (tx, rx) = stream.split();
	let publisher = consume_pubsub(&client_id, signals, tx).boxed();
	let consumer = consume_ws(&room_id, &client_id, state.db.clone(), rx).boxed();

	select(consumer, publisher).await;
	Ok(())
}

async fn consume_ws<'a>(
	room_id: &'a str,
	client_id: &'a str,
	pool: RedisPool,
	mut stream: SplitStream<WebSocket>,
) -> Result<()> {
	while let Some(Ok(msg)) = stream.next().await {
		let packet = match &msg {
			Message::Ping(data) => {
				// let _ = stream.send(Message::Pong(data.clone())).await;
				continue;
			}
			Message::Close(_) => break,
			Message::Binary(data) => serde_json::from_slice::<WsPacket>(data)?,
			Message::Text(data) => serde_json::from_str::<WsPacket>(data)?,
			_ => continue,
		};

		let packet = PubSubPacket {
			dst_id: Some(packet.client_id),
			op: packet.op,
			src_id: client_id,
		};

		pool.get()
			.await?
			.cmd(["PUBLISH", &room_id, &serde_json::to_string(&packet)?])
			.await?;
	}

	Ok(())
}

async fn consume_pubsub(
	client_id: &str,
	mut messages: Connection,
	mut out: SplitSink<WebSocket, Message>,
) -> Result<()> {
	while let Some(message) = messages.try_next().await? {
		let payload = from_data::<pubsub::Response>(message)?;
		match payload {
			pubsub::Response::Message(msg) => {
				let packet = serde_json::from_slice::<PubSubPacket>(&msg.data)?;
				if packet.should_send_to_client(client_id) {
					let send_packet = WsPacket {
						client_id: packet.src_id,
						op: packet.op,
					};
					out.send(Message::Text(serde_json::to_string(&send_packet)?))
						.await?;
				}
			}
			_ => error!("Unexpected pubsub message"),
		}
	}

	Ok(())
}
