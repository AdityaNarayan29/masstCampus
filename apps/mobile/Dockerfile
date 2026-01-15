# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy packages
COPY packages ./packages

# Copy mobile app
COPY apps/mobile ./apps/mobile

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build the mobile app
WORKDIR /app/apps/mobile
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/apps/mobile/.next ./apps/mobile/.next
COPY --from=builder /app/apps/mobile/public ./apps/mobile/public
COPY --from=builder /app/apps/mobile/node_modules ./apps/mobile/node_modules
COPY --from=builder /app/apps/mobile/package.json ./apps/mobile/package.json

WORKDIR /app/apps/mobile

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
