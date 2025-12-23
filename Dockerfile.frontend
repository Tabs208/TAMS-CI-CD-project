# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Install dependencies first (better caching)
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend

# 2. Copy source and build
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# --- DEBUG: This will show us EXACTLY where the files are in the logs ---
RUN ls -la build/
# -----------------------------------------------------------------------

# Stage 2: Serve
FROM nginx:alpine

# 3. Clean and Copy
RUN rm -rf /usr/share/nginx/html/*
# We are now copying from the WORKDIR /app/frontend we set above
COPY --from=builder /app/frontend/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]