FROM rust AS build

WORKDIR /root/src
COPY ./Cargo.lock ./Cargo.toml rustfmt.toml ./
COPY ./api ./api

RUN cargo install --path ./api

FROM alpine
COPY --from=build /usr/local/cargo/bin/meat-api /usr/bin
ENTRYPOINT ["meat-api"]
