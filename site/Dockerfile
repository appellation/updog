FROM node

EXPOSE 3000

ARG WS_API_BASE
ENV NEXT_PUBLIC_WS_API_BASE $WS_API_BASE
ARG HTTP_API_BASE
ENV NEXT_PUBLIC_HTTP_API_BASE $HTTP_API_BASE

WORKDIR /root/src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./site ./site

RUN npm i -g pnpm
RUN pnpm i --filter updog-site
RUN pnpm run -r --filter updog-site build

WORKDIR /root/src/site

ENTRYPOINT ["pnpm", "start"]
