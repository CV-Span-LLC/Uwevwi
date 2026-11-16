# Two images from one file: `api` (the Hono server) and `web` (Caddy serving the exported site).

# ---- website build -------------------------------------------------------
FROM node:24-slim AS web-build
WORKDIR /app
ENV CI=1 EXPO_NO_TELEMETRY=1 NODE_OPTIONS=--max-old-space-size=3072
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY app.json tsconfig.json ./
COPY assets ./assets
COPY src ./src
RUN npx expo export --platform web --output-dir dist

# ---- web: static site, HTTPS and the reverse proxy ------------------------
FROM caddy:2-alpine AS web
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=web-build /app/dist /srv/www

# ---- api ------------------------------------------------------------------
FROM node:24-slim AS api
WORKDIR /app
ENV NODE_ENV=production PORT=8787
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server ./server
# The data and uploads folders are volumes; create them owned by the unprivileged user so first use is writable.
RUN mkdir -p server/data server/uploads && chown -R node:node /app
USER node
EXPOSE 8787
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:8787/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node_modules/.bin/tsx", "server/index.ts"]

# ---- app: the whole site in one container -----------------------------------
# The default target (the last stage). For hosts that run a single service: the API also serves the exported
# website, and the database and uploads live in one folder, /data, which should be a persistent volume.
FROM api AS app
ENV DATA_DIR=/data WEB_DIR=/app/dist
COPY --from=web-build --chown=node:node /app/dist ./dist
COPY deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
USER root
RUN chmod +x /usr/local/bin/entrypoint.sh && mkdir -p /data && chown node:node /data
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node_modules/.bin/tsx", "server/index.ts"]
