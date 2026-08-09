# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Runtime Stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only production artifacts
COPY package*.json ./
RUN npm ci --production --ignore-scripts

COPY --from=build /app/dist ./dist

EXPOSE ${PORT:-3000}

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://localhost:${PORT:-3000}/health" || exit 1

CMD ["node", "dist/index.js"]