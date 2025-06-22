# Stage 1: Build the application
FROM node:20.19-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install


# Copy all source files
COPY . .

# Build the application
RUN npx nest build

# Stage 2: Production runtime
# FROM gcr.io/distroless/nodejs20-debian11

# WORKDIR /app

# # Copy necessary files from builder
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/dist ./dist


# Run the application
# CMD ["dist/main.js"]
CMD ["npm", "run", "start:dev"]