# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL} \
    NODE_ENV=production

# Copy package manifests first for caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci || npm install

# Copy frontend source code
COPY . ./

# Build production bundle
RUN npm run build

# Production runtime stage
FROM nginx:alpine

# Copy built static files to Nginx web root
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
