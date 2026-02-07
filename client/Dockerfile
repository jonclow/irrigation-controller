# Irrigation Controller Frontend - React Router 7 SSR
# Multi-stage build for optimal image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install all dependencies (SSR server needs them at runtime)
COPY package*.json ./
RUN npm ci

# Copy built assets from builder
COPY --from=builder /app/build ./build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S irrigation -u 1001 -G nodejs && \
    chown -R irrigation:nodejs /app

USER irrigation

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start the SSR server
CMD ["node", "build/server/index.js"]
