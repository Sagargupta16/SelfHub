# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.11.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
USER node
# stdio MCP server: run with `docker compose run --rm -T selfhub`
ENTRYPOINT ["node"]
CMD ["build/index.js"]
