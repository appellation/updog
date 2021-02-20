use async_std::{fs::OpenOptions, io::prelude::WriteExt, prelude::*};
use rand::{prelude::*, rngs::OsRng};
use redis::{aio::ConnectionManager, cmd, Client, RedisError};
use tide::{
	http::headers::HeaderValue,
	log::warn,
	security::{CorsMiddleware, Origin},
	sessions::SessionMiddleware,
	utils::After,
	Response,
};
use tide_websockets::WebSocket;

mod middleware;
mod models;
mod routes;
mod session;

pub const ONE_DAY_IN_SECONDS: usize = 86_400;

#[derive(Clone)]
pub struct State {
	pub db: Client,
}

async fn get_secret() -> Vec<u8> {
	match std::env::var("TIDE_SECRET") {
		Ok(data) => data.into_bytes(),
		Err(e) => {
			warn!(
				"unable to fetch TIDE_SECRET ({:?}); falling back to file",
				e
			);
			let mut file = OpenOptions::new()
				.read(true)
				.write(true)
				.create(true)
				.open("secret.key")
				.await
				.expect("load secret.key");

			let mut bytes = vec![];
			file.read_to_end(&mut bytes).await.expect("read secret.key");

			if bytes.is_empty() {
				bytes.resize(256, 0);
				OsRng.fill_bytes(&mut bytes[0..256]);

				file.write_all(&bytes).await.expect("write secret.key");
			}

			bytes
		}
	}
}

#[async_std::main]
async fn main() -> tide::Result<()> {
	tide::log::start();

	#[cfg(debug_assertions)]
	dotenv::dotenv()?;

	let client = redis::Client::open(std::env::var("REDIS_URI")?)?;
	let mut session_conn = ConnectionManager::new(client.clone()).await?;
	cmd("SELECT")
		.arg(1u8)
		.query_async(&mut session_conn)
		.await?;

	let state = State { db: client };

	let mut app = tide::with_state(state);

	app.with(SessionMiddleware::new(
		session::RedisSessionStore::new(session_conn),
		&get_secret().await,
	))
	.with(
		CorsMiddleware::new()
			.allow_origin(Origin::from(
				std::env::var("CORS_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".into()),
			))
			.allow_credentials(true)
			.allow_headers("content-type".parse::<HeaderValue>()?)
			.allow_methods("GET, POST, OPTIONS, PUT".parse::<HeaderValue>().unwrap()),
	)
	.with(After(|res: Response| async move {
		if let Some(err) = res.downcast_error::<RedisError>() {
			dbg!(err.detail());
		}

		Ok(res)
	}));

	app.at("/rooms/:room_id")
		.with(middleware::client_id)
		.get(WebSocket::new(routes::stream_ws));

	app.at("/rooms/:room_id").put(routes::join_room);

	app.at("/rooms")
		.post(routes::create_room)
		.get(routes::get_rooms);

	app.listen("127.0.0.1:8080").await?;
	Ok(())
}
