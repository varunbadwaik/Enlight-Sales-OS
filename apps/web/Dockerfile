FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files & install dependencies
COPY apps/web/package.json apps/web/package-lock.json* /app/apps/web/
WORKDIR /app/apps/web
RUN npm ci

# Copy code & build Next.js frontend
COPY apps/web /app/apps/web
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
RUN npm run build

# Production runner
FROM node:20-alpine AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
