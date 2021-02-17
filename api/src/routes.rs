use std::collections::HashSet;

use async_std::prelude::*;
use lazy_static::lazy_static;
use redis::{aio::PubSub, cmd, AsyncCommands, Script};
use serde::{Deserialize, Serialize};
use tide::{Body, Request, Response, StatusCode};
use tide_websockets::WebSocketConnection;

use crate::{
	middleware::ROOM_SESSION_KEY,
	models::{WsOp, WsPacket},
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

pub async fn stream_ws(mut req: Request<State>, stream: WebSocketConnection) -> tide::Result<()> {
	println!("new ws opened");
	let room_id = req.param("room_id")?.to_owned();
	let client_id = req.session().id();

	let hello_packet = WsPacket {
		src_id: client_id,
		dst_id: None,
		op: WsOp::Hello,
	};

	let mut conn = req.state().db.get_async_std_connection().await?;
	conn.publish(&room_id, serde_json::to_string(&hello_packet)?)
		.await?;

	let mut signals = conn.into_pubsub();
	signals.subscribe(&room_id).await?;

	let publisher = consume_pubsub(client_id, signals, stream.clone());
	let mut consumer = stream.filter_map(|msg| msg.ok()).take_while(|msg| !msg.is_close());
	let consumer = consumer.try_for_each(|_| Ok(()));
	consumer.try_race(publisher).await?;

	req.session_mut().remove(&room_id);
	println!("ws closed");

	Ok(())
}

pub async fn publish_ws(mut req: Request<State>) -> tide::Result {
	let signal = req.body_json().await?;
	let room_id = req.param("room_id")?;
	let dst_id = urlencoding::decode(req.param("client_id")?)?;
	let src_id = req.session().id();

	let signal_packet = WsPacket {
		src_id,
		dst_id: Some(&dst_id),
		op: WsOp::Signal(signal),
	};

	let mut conn = req.state().db.get_async_std_connection().await?;
	conn.publish(room_id, serde_json::to_string(&signal_packet)?)
		.await?;

	Ok(StatusCode::Ok.into())
}

async fn consume_pubsub(
	client_id: &str,
	pubsub: PubSub,
	out: WebSocketConnection,
) -> tide::Result<()> {
	let mut messages = pubsub.into_on_message();

	while let Some(message) = messages.next().await {
		let payload = message.get_payload::<String>()?;
		let packet = serde_json::from_str::<WsPacket>(&payload)?;
		if (packet.dst_id == None && packet.src_id != client_id) || packet.dst_id == Some(client_id)
		{
			out.send_string(payload).await?;
		}
	}

	Ok(())
}
