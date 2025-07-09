# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

#########################
# 1. Development Stage  #
#########################
FROM node:${NODE_VERSION}-slim AS dev
WORKDIR /app

# Install dependencies (dev)
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY --link . .

# Expose Vite dev server port
EXPOSE 5173

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

#########################
# 2. Build Stage        #
#########################
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY --link . .

RUN npm run build

#########################
# 3. Production Stage   #
#########################
FROM node:${NODE_VERSION}-slim AS prod
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install lightweight static file server
RUN npm install -g serve

# Copy built assets and minimal files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose Vite preview port
EXPOSE 8080

USER appuser

CMD ["serve", "-s", "dist", "-l", "8080"]
