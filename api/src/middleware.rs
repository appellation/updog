use std::{collections::HashSet, future::Future, pin::Pin};

use tide::{Next, Request, StatusCode};

use crate::State;

pub const ROOM_SESSION_KEY: &'static str = "ROOMS";

pub fn client_id<'a>(
	req: Request<State>,
	next: Next<'a, State>,
) -> Pin<Box<dyn Future<Output = tide::Result> + Send + 'a>> {
	Box::pin(async move {
		let room_id = req.param("room_id")?;

		match req.session().get::<HashSet<String>>(ROOM_SESSION_KEY) {
			Some(set) if set.contains(room_id) => Ok(next.run(req).await),
			_ => Err(tide::Error::from_str(
				StatusCode::Unauthorized,
				"unable to stream before joining",
			)),
		}
	})
}
