# Multi-stage build for a production Next.js server using `output: 'standalone'`.
# See: `node_modules/next/dist/docs/.../output.md` for standalone output details.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time injection for public env vars (these are bundled into client assets).
ARG NEXT_PUBLIC_AUTH_API_BASE_URL
ARG NEXT_PUBLIC_PG_REGISTRY_API_BASE_URL
ARG NEXT_PUBLIC_PAYMENTS_API_BASE_URL
ARG NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL
ARG NEXT_PUBLIC_MONGO_FACTORY_API_ADMIN_KEY
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_AUTH_API_BASE_URL=$NEXT_PUBLIC_AUTH_API_BASE_URL
ENV NEXT_PUBLIC_PG_REGISTRY_API_BASE_URL=$NEXT_PUBLIC_PG_REGISTRY_API_BASE_URL
ENV NEXT_PUBLIC_PAYMENTS_API_BASE_URL=$NEXT_PUBLIC_PAYMENTS_API_BASE_URL
ENV NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL=$NEXT_PUBLIC_MONGO_FACTORY_API_BASE_URL
ENV NEXT_PUBLIC_MONGO_FACTORY_API_ADMIN_KEY=$NEXT_PUBLIC_MONGO_FACTORY_API_ADMIN_KEY
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID

RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache tini
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
