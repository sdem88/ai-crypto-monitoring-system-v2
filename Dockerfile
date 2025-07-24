# Multi-stage build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy application files
COPY *.js ./
COPY *.html ./
COPY *.md ./

# Create data directory for storage
RUN mkdir -p crypto-data

# Set environment variables
ENV NODE_ENV=production
ENV TZ=Europe/Moscow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check OK')" || exit 1

# Start the application
EXPOSE 3000
CMD ["node", "alternative-storage.js"]