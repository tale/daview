FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
RUN pnpm run build
RUN pnpm prune --prod

FROM gcr.io/distroless/nodejs:18
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/package.json
CMD ["dist/server/index.js"]

EXPOSE 3000
ARG BUILD_DATE
ARG VERSION
ARG GIT_STATE

LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.authors="Aarnav Tale <aarnavtale@icloud.com>"
LABEL org.opencontainers.image.source="https://github.com/tale/daview"
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.revision=${GIT_STATE}
LABEL org.opencontainers.image.vendor="Aarnav Tale"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.ref.name="tale.me/library/daview"
LABEL org.opencontainers.image.title="DAView"
LABEL org.opencontainers.image.description="Proxy a WebDAV instance with a nicer UI and custom authentication"
LABEL org.opencontainers.image.base.name="gcr.io/distroless/nodejs:18"