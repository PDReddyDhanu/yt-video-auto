# Use lightweight Node image
FROM node:20-slim

# Install system dependencies (including standard FFmpeg as a fallback/compatibility measure)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy remaining server code
COPY . .

# Expose backend ports
EXPOSE 3001 8080 7860

# Start server
CMD ["node", "server.js"]
