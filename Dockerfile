# ============================================================
# Dockerfile — только фронтенд (Next.js)
# ============================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

ENV NODE_ENV=production
RUN npm run build

# Production образ
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root пользователь
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем standalone-билд
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
