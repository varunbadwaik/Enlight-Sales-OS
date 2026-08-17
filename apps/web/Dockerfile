FROM node:20-alpine AS builder

WORKDIR /app/apps/web

# Copy package files & install dependencies
COPY apps/web/package.json apps/web/package-lock.json* ./
RUN npm ci

# Copy application source code
COPY apps/web ./

ENV NEXT_PUBLIC_API_URL=http://localhost:8000
RUN npm run build

# Production runner using Next.js standalone server
FROM node:20-alpine AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/package.json ./package.json

EXPOSE 3000

CMD ["node", "server.js"]
