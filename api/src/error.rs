use axum::{
	http::StatusCode,
	response::{IntoResponse, Response},
};

#[derive(Debug)]
pub struct ResponseError(anyhow::Error);

impl<T> From<T> for ResponseError
where
	T: Into<anyhow::Error>,
{
	fn from(value: T) -> Self {
		Self(value.into())
	}
}

impl IntoResponse for ResponseError {
	#[cfg(debug_assertions)]
	fn into_response(self) -> Response {
		(StatusCode::INTERNAL_SERVER_ERROR, format!("{:?}", self.0)).into_response()
	}

	#[cfg(not(debug_assertions))]
	fn into_response(self) -> Response {
		(
			StatusCode::INTERNAL_SERVER_ERROR,
			"Internal Server Error".to_string(),
		)
			.into_response()
	}
}

pub type Result<T, E = ResponseError> = std::result::Result<T, E>;
