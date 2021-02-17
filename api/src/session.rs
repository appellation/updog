use std::fmt::{self, Debug, Formatter};

use redis::{aio::ConnectionManager, cmd, AsyncCommands};
use tide::{
	sessions::{Session, SessionStore},
	utils::async_trait,
};

#[derive(Clone)]
pub struct RedisSessionStore<T> {
	conn: T,
}

impl<T> RedisSessionStore<T> {
	pub fn new(conn: T) -> Self {
		Self { conn }
	}
}

impl<T> Debug for RedisSessionStore<T> {
	fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
		f.debug_struct("RedisSessionStore").finish()
	}
}

#[async_trait]
impl SessionStore for RedisSessionStore<ConnectionManager> {
	async fn load_session(&self, cookie_value: String) -> anyhow::Result<Option<Session>> {
		let id = Session::id_from_cookie_value(&cookie_value)?;
		let maybe_bytes: Option<Vec<u8>> = self.conn.clone().get(id).await?;

		Ok(maybe_bytes
			.map(|bytes| bincode::deserialize::<Session>(&bytes))
			.transpose()?
			.and_then(|sess| sess.validate()))
	}

	async fn store_session(&self, session: Session) -> anyhow::Result<Option<String>> {
		let bytes = bincode::serialize(&session)?;
		let mut conn = self.conn.clone();
		match session.expires_in() {
			None => conn.set(session.id(), bytes).await?,
			Some(ex) => conn.set_ex(session.id(), bytes, ex.as_secs() as _).await?,
		}
		Ok(session.into_cookie_value())
	}

	async fn destroy_session(&self, session: Session) -> anyhow::Result<()> {
		self.conn.clone().del(session.id()).await?;
		Ok(())
	}

	async fn clear_store(&self) -> anyhow::Result<()> {
		cmd("FLUSHDB").query_async(&mut self.conn.clone()).await?;
		Ok(())
	}
}
