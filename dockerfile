# Stage 1: Build application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .

ARG VITE_API_URL=https://residentback.crousz.app
ARG VITE_BACKURL_ETUDIANT=https://studentback.crousz.app
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKURL_ETUDIANT=$VITE_BACKURL_ETUDIANT

RUN yarn build

# Stage 2: Serve static assets with Nginx
FROM nginx:stable-alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# SPA routing support + Gzip compression
RUN printf 'server {\n\
    listen 3000;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n\
        expires 30d;\n\
        add_header Cache-Control "public, no-transform";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
