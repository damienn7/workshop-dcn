# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN DATABASE_URL=file:/tmp/prisma-generate.db npx prisma generate
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=file:/app/data/app.db

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=build /app/prisma/migrations ./prisma/migrations
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npm prune --omit=dev \
  && npm cache clean --force \
  && mkdir -p /app/data \
  && chown node:node /app/data \
  && chmod +x /app/docker-entrypoint.sh

USER node
EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
