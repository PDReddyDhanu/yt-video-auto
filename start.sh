#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Start the Python FastAPI TTS server on port 8001 (listening only locally inside the container)
echo "Starting TeluguVoice AI FastAPI Server on port 8001..."
python3 -m uvicorn tts.api.index:app --host 127.0.0.1 --port 8001 &

# Give FastAPI server 2 seconds to start up
sleep 2

# Start the Express backend (force port 7860 for Hugging Face)
echo "Starting Auto-Video Express Backend on port 7860..."
cd backend
PORT=7860 exec node server.js
