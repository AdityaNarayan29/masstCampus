# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/backend ./apps/backend
COPY packages ./packages

# Generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm prisma generate

# Build
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install pnpm and production dependencies
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/backend/node_modules/.prisma
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "apps/backend/dist/main.js"]
