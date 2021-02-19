FROM rust:alpine AS build

WORKDIR /root/src
RUN apk add musl-dev
COPY ./Cargo.lock ./Cargo.toml rustfmt.toml ./
COPY ./api ./api

RUN cargo install --path ./api

FROM alpine
COPY --from=build /usr/local/cargo/bin/meat-api .
ENTRYPOINT ["/meat-api"]
