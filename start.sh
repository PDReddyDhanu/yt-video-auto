#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Start the Python FastAPI TTS server on port 8001 (listening only locally inside the container)
echo "Starting TeluguVoice AI FastAPI Server on port 8001..."
python3 -m uvicorn tts.api.index:app --host 127.0.0.1 --port 8001 &

# Give FastAPI server 2 seconds to start up
sleep 2

# Start the Express backend (it will listen on the port provided by the environment, i.e., $PORT or fallback to 3001)
echo "Starting Auto-Video Express Backend..."
cd backend
exec node server.js
