# Multi-stage Dockerfile for DompetKu Stats Server
# Light Alpine-based Node.js runtime with Better-SQLite3 support

FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0
ENV DB_PATH=/app/data/dompetku_stats.db

# better-sqlite3 needs libstdc++ at runtime
RUN apk add --no-cache libstdc++

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts
# Rebuild native better-sqlite3 for target architecture
RUN npm rebuild better-sqlite3

COPY --from=builder /app/dist ./dist
COPY src/schema.sql ./src/schema.sql

# Persistent volume for SQLite data
VOLUME ["/app/data"]

EXPOSE 4000

CMD ["node", "dist/server.js"]

