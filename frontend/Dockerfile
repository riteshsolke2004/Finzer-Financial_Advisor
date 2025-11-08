# ===== STAGE 1: Builder =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

RUN npm ci

COPY src ./src
COPY public ./public
COPY index.html ./

RUN npm run build

# ===== STAGE 2: Production Runtime =====
FROM nginx:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
