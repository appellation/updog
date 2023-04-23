use axum::{
	http::{
		header::{ACCEPT, ACCEPT_ENCODING, CONTENT_TYPE},
		HeaderValue, Method,
	},
	middleware::from_fn,
	routing::get,
	Router, Server,
};
use axum_sessions::SessionLayer;
use lazy_static::lazy_static;
use models::Room;
use rand::{prelude::*, rngs::OsRng};
use redust::{
	pool::{Manager, Pool},
	script::Script,
};
use store::Store;
use tokio::{
	fs::OpenOptions,
	io::{AsyncReadExt, AsyncWriteExt},
};
use tower_http::{compression::CompressionLayer, cors::CorsLayer, trace::TraceLayer};
use tracing::warn;

mod error;
mod middleware;
mod models;
mod routes;
mod session;
mod store;

pub const ONE_DAY_IN_SECONDS: &'static [u8] = b"86400";
const GET_EXISTING_KEYS: &'static [u8] = include_bytes!("../scripts/get_existing_keys.lua");

lazy_static! {
	pub static ref GET_EXISTING_KEYS_SCRIPT: Script = Script::new(GET_EXISTING_KEYS);
}

pub type RoomStore = Store<Room>;
pub type RedisPool = Pool<String>;

#[derive(Clone)]
pub struct AppState {
	pub room_store: RoomStore,
	pub db: RedisPool,
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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
	tracing_subscriber::fmt::init();

	#[cfg(debug_assertions)]
	let _ = dotenvy::dotenv();

	let manager = Manager::new(std::env::var("REDIS_URI").unwrap_or("localhost:6379".to_string()));
	let pool = Pool::builder(manager).build()?;

	let state = AppState {
		room_store: RoomStore::new(pool.clone()),
		db: pool.clone(),
	};

	let app = Router::new()
		.route(
			"/rooms/:room_id",
			get(routes::handle_ws)
				.layer(from_fn(middleware::authorized_for_room))
				.put(routes::join_room),
		)
		.route("/rooms", get(routes::get_rooms).post(routes::create_room))
		.route_layer(SessionLayer::new(
			session::RedisSessionStore::new(pool),
			&get_secret().await,
		))
		.layer(
			CorsLayer::new()
				.allow_origin(
					std::env::var("CORS_ORIGIN")
						.unwrap_or_else(|_| "http://localhost:3000".into())
						.parse::<HeaderValue>()?,
				)
				.allow_credentials(true)
				.allow_headers([CONTENT_TYPE, ACCEPT, ACCEPT_ENCODING])
				.allow_methods([Method::GET, Method::POST, Method::OPTIONS, Method::PUT]),
		)
		.layer(CompressionLayer::new())
		.layer(TraceLayer::new_for_http())
		.with_state(state);

	Server::bind(&"0.0.0.0:3000".parse().unwrap())
		.serve(app.into_make_service())
		.await
		.unwrap();

	Ok(())
}
