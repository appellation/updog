FROM node

EXPOSE 3000

WORKDIR /root/src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./site ./site

RUN npm i -g pnpm
RUN pnpm i --filter meat-site
RUN pnpm run -r --filter meat-site build

WORKDIR /root/src/site

ENTRYPOINT ["pnpm", "start"]
