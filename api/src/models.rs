use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Room {
	pub id: String,
	pub owner_id: String,
	pub name: Option<String>,
	pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PubSubPacket<'a> {
	pub src_id: &'a str,
	pub dst_id: Option<&'a str>,
	pub op: WsOp,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WsPacket<'a> {
	pub client_id: &'a str,
	pub op: WsOp,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "t", content = "d")]
pub enum WsOp {
	Signal(Value),
	Hello,
}
