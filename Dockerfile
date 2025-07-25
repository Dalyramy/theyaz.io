# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS prod
WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Expose port 8080 (Vite default preview port)
EXPOSE 8080

# Set environment variables (can be overridden at runtime)
ENV NODE_ENV=production

# Start the static server
CMD ["serve", "-s", "dist", "-l", "8080"]