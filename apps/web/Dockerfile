# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/frontend ./apps/frontend

# Build
WORKDIR /app/apps/frontend
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/next.config.js ./apps/frontend/

WORKDIR /app/apps/frontend

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
