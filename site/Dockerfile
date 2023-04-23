FROM node:18-alpine

EXPOSE 3000

ARG WS_API_BASE
ENV NEXT_PUBLIC_WS_API_BASE $WS_API_BASE
ARG HTTP_API_BASE
ENV NEXT_PUBLIC_HTTP_API_BASE $HTTP_API_BASE

RUN corepack enable && corepack prepare pnpm@7.18.0 --activate

WORKDIR /root/src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./site/package.json ./site/
RUN pnpm i --filter=updog-site 

COPY ./site ./site

WORKDIR /root/src/site

CMD ["pnpm", "start"]
