use std::fmt::{self, Debug, Formatter};

use async_session::{async_trait, Session, SessionStore};
use ciborium::{de::from_reader, ser::into_writer};
use redust::resp::from_data;
use serde_bytes::ByteBuf;

use crate::RedisPool;

#[derive(Clone)]
pub struct RedisSessionStore {
	pool: RedisPool,
}

impl RedisSessionStore {
	pub fn new(pool: RedisPool) -> Self {
		Self { pool }
	}
}

impl Debug for RedisSessionStore {
	fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
		f.debug_struct("RedisSessionStore").finish()
	}
}

#[async_trait]
impl SessionStore for RedisSessionStore {
	async fn load_session(&self, cookie_value: String) -> anyhow::Result<Option<Session>> {
		let id = Session::id_from_cookie_value(&cookie_value)?;
		let bytes = from_data::<ByteBuf>(self.pool.get().await?.cmd(["GET", &id]).await?)?;
		let sess = from_reader::<Session, _>(bytes.as_slice())?;

		Ok(sess.validate())
	}

	async fn store_session(&self, session: Session) -> anyhow::Result<Option<String>> {
		let mut bytes = vec![];
		into_writer(&session, &mut bytes)?;

		let mut conn = self.pool.get().await?;
		match session.expires_in() {
			None => {
				conn.cmd([b"SET".as_ref(), session.id().as_bytes(), &bytes])
					.await?
			}
			Some(ex) => {
				conn.cmd([
					b"SET".as_ref(),
					session.id().as_bytes(),
					&bytes,
					b"EX",
					ex.as_secs().to_string().as_bytes(),
				])
				.await?
			}
		};
		Ok(session.into_cookie_value())
	}

	async fn destroy_session(&self, session: Session) -> anyhow::Result<()> {
		self.pool.get().await?.cmd(["DEL", session.id()]).await?;
		Ok(())
	}

	async fn clear_store(&self) -> anyhow::Result<()> {
		self.pool.get().await?.cmd(["FLUSHDB"]).await?;
		Ok(())
	}
}
