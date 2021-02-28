use std::{collections::HashSet, marker::PhantomData};

use anyhow::Result;
use lazy_static::lazy_static;
use redis::{cmd, AsyncCommands, Script};
use serde::{de::DeserializeOwned, Serialize};

use crate::ONE_DAY_IN_SECONDS;

const GET_EXISTING_KEYS: &'static str = include_str!("../scripts/get_existing_keys.lua");

lazy_static! {
	static ref GET_EXISTING_KEYS_SCRIPT: Script = Script::new(GET_EXISTING_KEYS);
}

#[derive(Debug, Clone)]
pub struct Store<T> {
	redis: redis::Client,
	data_type: PhantomData<T>,
}

impl<T> Store<T> {
	pub fn new(redis: redis::Client) -> Self {
		Self {
			redis,
			data_type: Default::default(),
		}
	}
}

impl<T: DeserializeOwned + Serialize> Store<T> {
	pub async fn get(&self, key: &str) -> Result<Option<T>> {
		let maybe_data: Option<Vec<u8>> = self
			.redis
			.get_async_std_connection()
			.await?
			.get(key)
			.await?;

		Ok(maybe_data
			.map(|data| bincode::deserialize(&data))
			.transpose()?)
	}

	pub async fn set(&self, key: &str, data: &T) -> Result<bool> {
		let mut conn = self.redis.get_async_std_connection().await?;

		let result: redis::Value = cmd("SET")
			.arg(key)
			.arg(bincode::serialize(data)?)
			.arg("EX")
			.arg(ONE_DAY_IN_SECONDS)
			.arg("NX")
			.query_async(&mut conn)
			.await?;

		Ok(redis::Value::Okay == result)
	}

	pub async fn filter_keys(&self, existing: Vec<String>) -> Result<HashSet<String>> {
		let mut conn = self.redis.get_async_std_connection().await?;

		let valid_keys = GET_EXISTING_KEYS_SCRIPT
			.key(existing)
			.invoke_async::<_, Vec<Option<String>>>(&mut conn)
			.await?
			.into_iter()
			.filter_map(|e| e)
			.collect::<HashSet<_>>();

		Ok(valid_keys)
	}
}
