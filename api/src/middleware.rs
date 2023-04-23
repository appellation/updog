use std::collections::HashSet;

use axum::{
	body::Body,
	extract::Path,
	http::{Request, StatusCode},
	middleware::Next,
	response::{IntoResponse, Response},
};
use axum_sessions::extractors::ReadableSession;

pub const ROOM_SESSION_KEY: &'static str = "ROOMS";

pub async fn authorized_for_room(
	Path(room_id): Path<String>,
	sess: ReadableSession,
	req: Request<Body>,
	next: Next<Body>,
) -> Response {
	match sess.get::<HashSet<String>>(ROOM_SESSION_KEY) {
		Some(set) if set.contains(&room_id) => {
			drop(sess);
			next.run(req).await
		}
		_ => StatusCode::UNAUTHORIZED.into_response(),
	}
}
