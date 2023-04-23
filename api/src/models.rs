use orion::pwhash::PasswordHash;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Room {
	pub id: String,
	pub owner_id: String,
	pub name: Option<String>,
	pub password: PasswordHash,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PubSubPacket<'a> {
	pub src_id: &'a str,
	pub dst_id: Option<&'a str>,
	pub op: WsOp,
}

impl PubSubPacket<'_> {
	pub fn should_send_to_client(&self, client_id: &str) -> bool {
		(self.dst_id == None && self.src_id != client_id) || self.dst_id == Some(client_id)
	}
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
