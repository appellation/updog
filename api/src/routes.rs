use std::collections::HashSet;

use async_std::prelude::*;
use lazy_static::lazy_static;
use redis::{
	aio::{Connection, PubSub},
	cmd, AsyncCommands, Script,
};
use serde::{Deserialize, Serialize};
use tide::{Body, Request, Response, StatusCode};
use tide_websockets::{Message, WebSocketConnection};

use crate::{
	middleware::ROOM_SESSION_KEY,
	models::{PubSubPacket, WsOp, WsPacket},
	State, ONE_DAY_IN_SECONDS,
};

const GET_EXISTING_KEYS: &'static str = include_str!("../scripts/get_existing_keys.lua");

lazy_static! {
	static ref GET_EXISTING_KEYS_SCRIPT: Script = Script::new(GET_EXISTING_KEYS);
}

#[derive(Debug, Deserialize)]
struct CreateRoomRequest {
	password: String,
}

#[derive(Debug, Serialize)]
struct CreateRoomResponse {
	id: String,
}

pub async fn get_rooms(mut req: Request<State>) -> tide::Result {
	let maybe_rooms = req.session().get::<HashSet<String>>(ROOM_SESSION_KEY);
	req.session_mut().remove(ROOM_SESSION_KEY);

	match maybe_rooms {
		None => Ok(Body::from_json(&[(); 0])?.into()),
		Some(cookie_rooms) => {
			let mut conn = req.state().db.get_async_std_connection().await?;

			let actual_rooms = GET_EXISTING_KEYS_SCRIPT
				.key(cookie_rooms.iter().collect::<Vec<_>>())
				.invoke_async::<_, Vec<Option<String>>>(&mut conn)
				.await?
				.into_iter()
				.filter_map(|e| e)
				.collect::<HashSet<_>>();

			req.session_mut().insert(ROOM_SESSION_KEY, &actual_rooms)?;
			Ok(Body::from_json(&actual_rooms)?.into())
		}
	}
}

pub async fn create_room(mut req: Request<State>) -> tide::Result {
	let body = req.body_json::<CreateRoomRequest>().await?;
	let id = nanoid::nanoid!();

	let mut conn = req.state().db.get_async_std_connection().await?;
	let existing: redis::Value = cmd("SET")
		.arg(&id)
		.arg(body.password)
		.arg("EX")
		.arg(ONE_DAY_IN_SECONDS)
		.arg("NX")
		.query_async(&mut conn)
		.await?;

	if let redis::Value::Okay = existing {
		let mut rooms = req
			.session()
			.get::<HashSet<String>>(ROOM_SESSION_KEY)
			.unwrap_or_default();
		rooms.insert(id.clone());
		req.session_mut().insert(ROOM_SESSION_KEY, rooms)?;

		let response = CreateRoomResponse { id };
		Ok(Response::builder(StatusCode::Created)
			.body(Body::from_json(&response)?)
			.build())
	} else {
		Ok(StatusCode::Locked.into())
	}
}

#[derive(Debug, Deserialize)]
struct JoinRoomRequest {
	password: String,
}

pub async fn join_room(mut req: Request<State>) -> tide::Result {
	let body = req.body_json::<JoinRoomRequest>().await?;
	let room_id = req.param("room_id")?.to_owned();

	let password: Option<String> = req
		.state()
		.db
		.clone()
		.get_async_std_connection()
		.await?
		.get(&room_id)
		.await?;

	let status = if Some(body.password) == password {
		let mut rooms = req
			.session()
			.get::<HashSet<String>>(ROOM_SESSION_KEY)
			.unwrap_or_default();
		rooms.insert(room_id);
		req.session_mut().insert(ROOM_SESSION_KEY, rooms)?;
		StatusCode::Ok
	} else {
		StatusCode::Unauthorized
	};

	Ok(status.into())
}

pub async fn stream_ws(req: Request<State>, stream: WebSocketConnection) -> tide::Result<()> {
	let room_id = req.param("room_id")?.to_owned();
	let client_id = req.session().id();

	let hello_packet = PubSubPacket {
		src_id: client_id,
		dst_id: None,
		op: WsOp::Hello,
	};

	let mut conn = req.state().db.get_async_std_connection().await?;
	conn.publish(&room_id, serde_json::to_string(&hello_packet)?)
		.await?;

	let signals = req.state().db.get_async_std_connection().await?;
	let mut signals = signals.into_pubsub();
	signals.subscribe(&room_id).await?;

	let publisher = consume_pubsub(client_id, signals, stream.clone());
	let consumer = consume_ws(&room_id, client_id, conn, stream);

	consumer.try_race(publisher).await?;
	Ok(())
}

async fn consume_ws<'a>(
	room_id: &'a str,
	client_id: &'a str,
	mut conn: Connection,
	mut stream: WebSocketConnection,
) -> tide::Result<()> {
	while let Some(Ok(msg)) = stream.next().await {
		let packet = match &msg {
			Message::Ping(data) => {
				let _ = stream.send(Message::Pong(data.clone())).await;
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

		conn.publish(room_id, serde_json::to_string(&packet)?)
			.await?;
	}

	Ok(())
}

async fn consume_pubsub(
	client_id: &str,
	pubsub: PubSub,
	out: WebSocketConnection,
) -> tide::Result<()> {
	let mut messages = pubsub.into_on_message();

	while let Some(message) = messages.next().await {
		let payload = message.get_payload::<String>()?;
		let packet = serde_json::from_str::<PubSubPacket>(&payload)?;
		if (packet.dst_id == None && packet.src_id != client_id) || packet.dst_id == Some(client_id)
		{
			let send_packet = WsPacket {
				client_id: packet.src_id,
				op: packet.op,
			};
			out.send_string(serde_json::to_string(&send_packet)?)
				.await?;
		}
	}

	Ok(())
}
