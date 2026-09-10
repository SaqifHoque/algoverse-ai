# Multi-stage build targeting next.config.js's output:"standalone" -- keeps the final image to
# just the traced production server + static assets, not the full node_modules tree.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined at build time, not read from docker-compose's `environment:`
# block (that only applies at container *run* time) -- the fallback in lib/api/client.ts
# ("http://localhost:8000/api/v1") already matches what docker-compose.yml sets at runtime, so
# this is correct as-is without needing a build ARG. If that host-mapped port ever changes,
# update the fallback there (or wire a build ARG) rather than expecting this build to pick it up.
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
