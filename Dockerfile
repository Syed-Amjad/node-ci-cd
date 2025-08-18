# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package*.json ./
# Dev deps installed in builder only; final image will be production-only
RUN npm ci

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Run tests and lint in build context to fail fast (optional if done in Jenkins)
# RUN npm run lint && npm test
RUN npm prune --omit=dev

FROM node:${NODE_VERSION} AS runtime
# Add tini for proper signal handling
RUN apk add --no-cache tini
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Labels for traceability
ARG APP_VERSION=0.0.0
ARG COMMIT_SHA=unknown
LABEL org.opencontainers.image.title="node-hello-prod" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${COMMIT_SHA}"
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://localhost:3000/health || exit 1
USER node
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","src/server.js"]

