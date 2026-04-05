FROM node:18-alpine AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy monorepo root files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy workspace packages that the API depends on
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY services/api/package.json ./services/api/

# Install all deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/types ./packages/types
COPY packages/config ./packages/config
COPY services/api ./services/api

# Build shared packages first
RUN pnpm --filter @school-crm/types build
RUN pnpm --filter @school-crm/config build

# Generate Prisma client
WORKDIR /app/services/api
RUN npx prisma generate

# Build API
RUN pnpm build

# Production stage
FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY services/api/package.json ./services/api/

RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/prisma ./services/api/prisma
COPY --from=builder /app/services/api/node_modules/.prisma ./services/api/node_modules/.prisma

WORKDIR /app/services/api

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
