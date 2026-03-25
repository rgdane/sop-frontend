# =====================
# Stage 1: BUILDER
# =====================
FROM node:22-alpine AS builder

WORKDIR /app

ARG APP_ENV

# Copy package files first
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY src/ ./

# Copy and rename environment-specific files
COPY src/.env.${APP_ENV} ./.env
RUN cp ./public/fcm-sw.${APP_ENV}.js ./public/firebase-messaging-sw.js

# Build the application
RUN npm run build

# =====================
# Stage 2: RUNNER
# =====================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env .env

EXPOSE 8080
CMD ["npm", "start"]