# ---------- Stage 1: Build stage ----------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY . .

# ---------- Stage 2: Runtime stage ----------
FROM node:18-alpine

WORKDIR /app

# Copy node_modules and code from the build stage
COPY --from=build /app /app

# Expose your backend port
EXPOSE 8000

# Start your app
CMD ["npm", "start", "dev"]
