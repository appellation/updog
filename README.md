# meat

A P2P video chat web app based on WebRTC.

## Development

This project is structured as a monorepo architected around 2 languages with 2 projects:

- Rust
	- API
- Typescript
	- Website

### Rust

The Rust projects are built using Cargo. Each project specifies its own dependencies which are
pulled in at compile time.

#### API

The API is located in the `api/` directory. To run the API, run `cargo run api`.

The API depends on Redis. You must specify a `REDIS_URI` environment variable in a `.env` file in
the root directory of this project.

```
REDIS_URI=redis://localhost:6379
```

### Typescript

The Typescript projects are setup using a pnpm monorepo. Run `pnpm i` to install the dependencies
for each project.

#### Website

The website is built using Next.js. In the `site/` directory, run `pnpm run dev` to launch the
development build of the website.

You must create a `.env.local` file in the `site/` directory that contains API connection
information.

```
NEXT_PUBLIC_HTTP_API_BASE=http://localhost:8080
NEXT_PUBLIC_WS_API_BASE=ws://localhost:8080
```
