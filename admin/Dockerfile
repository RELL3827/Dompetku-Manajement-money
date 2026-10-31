# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
RUN npm run build

# Production static serving with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy to telemetry server if co-located
    location /api/ {
        proxy_pass http://stats-server:4000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP "";
        proxy_set_header X-Forwarded-For "";
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
