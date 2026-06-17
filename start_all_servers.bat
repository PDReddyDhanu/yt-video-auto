@echo off
title Auto Video App Runner

echo ===================================================
echo   Starting all services for Auto Video Generator
echo ===================================================

echo.
echo [1/3] Starting TTS FastAPI Server (Port 8001)...
start "TTS Server (Port 8001)" cmd /c "cd /d \"%~dp0tts\" && python -m uvicorn api.index:app --host 127.0.0.1 --port 8001"

echo [2/3] Starting Express Backend Server (Port 3001)...
start "Backend Server (Port 3001)" cmd /c "cd /d \"%~dp0backend\" && npm run dev"

echo [3/3] Starting Next.js Frontend Server (Port 3000)...
start "Frontend Server (Port 3000)" cmd /c "cd /d \"%~dp0frontend\" && npm run dev"

echo.
echo ===================================================
echo   All servers launched successfully!
echo   - Frontend: http://localhost:3000
echo   - Express Backend: http://localhost:3001
echo   - TTS Server: http://127.0.0.1:8001
echo ===================================================
echo.
pause
