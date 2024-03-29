use std::{collections::HashSet, marker::PhantomData};

use anyhow::Result;
use ciborium::{de::from_reader, ser::into_writer};
use redust::resp::{from_data, Data};
use serde::{de::DeserializeOwned, Serialize};
use serde_bytes::ByteBuf;

use crate::{RedisPool, GET_EXISTING_KEYS_SCRIPT, ONE_DAY_IN_SECONDS};

#[derive(Debug)]
pub struct Store<T> {
	redis: RedisPool,
	data_type: PhantomData<T>,
}

impl<T> Clone for Store<T> {
	fn clone(&self) -> Self {
		Self {
			redis: self.redis.clone(),
			data_type: self.data_type.clone(),
		}
	}
}

impl<T> Store<T> {
	pub fn new(redis: RedisPool) -> Self {
		Self {
			redis,
			data_type: Default::default(),
		}
	}
}

impl<T: DeserializeOwned + Serialize> Store<T> {
	pub async fn get(&self, key: &str) -> Result<Option<T>> {
		let bytes = from_data::<ByteBuf>(self.redis.get().await?.cmd(["GET", key]).await?)?;
		let data = from_reader(bytes.as_slice())?;

		Ok(data)
	}

	pub async fn set(&self, key: &str, data: &T) -> Result<bool> {
		let mut bytes = vec![];
		into_writer(data, &mut bytes)?;

		let result = self
			.redis
			.get()
			.await?
			.cmd([
				b"SET".as_ref(),
				key.as_bytes(),
				&bytes,
				b"EX",
				ONE_DAY_IN_SECONDS,
				b"NX",
			])
			.await?;

		Ok(matches!(result, Data::SimpleString(s) if s == "OK"))
	}

	pub async fn filter_keys(&self, existing: Vec<String>) -> Result<HashSet<String>> {
		let mut conn = self.redis.get().await?;

		let valid_keys = from_data::<HashSet<String>>(
			GET_EXISTING_KEYS_SCRIPT
				.exec(&mut conn)
				.keys(existing.iter().map(|k| k.as_bytes()))
				.invoke()
				.await?,
		)?;

		Ok(valid_keys)
	}
}
