# Use lightweight Node image
FROM node:20-slim

# Install system dependencies (including Python, FFmpeg, fontconfig, and pip)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Set up Python virtual environment and install requirements
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy python tts requirements first and install them
COPY tts/api/requirements.txt ./tts-requirements.txt
RUN pip install --no-cache-dir -r tts-requirements.txt

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy remaining code (both backend and tts directories)
COPY backend/ ./backend/
COPY tts/ ./tts/

# Make startup script executable
COPY start.sh ./
RUN chmod +x start.sh

# Expose public port (Hugging Face Spaces expects 7860)
EXPOSE 7860

# Run the startup script
CMD ["./start.sh"]
