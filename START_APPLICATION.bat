@echo off
title Auto Video App - 1-Click Launcher

echo ===================================================
echo   Launching Auto Video Generator (All 3 Services)
echo ===================================================

echo.
echo [1/3] Starting TTS Python FastAPI Engine (Port 8001)...
start "1. TTS Engine (Port 8001)" cmd /k "cd /d "%~dp0tts" && python -m uvicorn api.index:app --host 127.0.0.1 --port 8001"

ping 127.0.0.1 -n 3 >nul

echo [2/3] Starting Express Backend API (Port 3001)...
start "2. Backend API (Port 3001)" cmd /k "cd /d "%~dp0backend" && node server.js"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Starting Next.js Frontend Studio (Port 3000)...
start "3. Frontend Studio (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo   All 3 Services Launched Successfully!
echo   - Web Studio:    http://localhost:3000
echo   - Backend API:   http://localhost:3001
echo   - TTS Engine:    http://127.0.0.1:8001
echo ===================================================
echo.
echo Opening Web Studio in browser...
ping 127.0.0.1 -n 3 >nul
start http://localhost:3000
