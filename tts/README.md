# 🎙️ TeluguVoice AI — Lifetime Free Speech Studio

TeluguVoice AI is a web-based text-to-speech platform built specifically for content creators. It converts Telugu and English scripts into high-quality, natural-sounding audio files ready for social media integration.

This application is powered by **Microsoft Edge Neural Text-to-Speech (TTS)**. It is **100% free for lifetime use with no character limits, no API keys, and no credit card billing**.

---

## ✨ Features

- 🔊 **Realistic Neural Voices**:
  - **Telugu (`te-IN`)**: 👩 Shruti (Female) & 👨 Mohan (Male)
  - **English (`en-US`)**: 👩 Aria (Female) & 👨 Guy (Male)
- 🎚️ **Pace (Speed) Control**: Adjust speaking pace dynamically from `0.5x` (slower) to `2.0x` (faster).
- 💡 **Natural Pause Insertion**: A helper toolbar to insert ellipsis `...` which naturally instructs the neural models to pause at specific script points.
- 🎛️ **Custom Web Audio Player**: Clean dark-mode seekbar player with an animated bouncing audio visualizer.
- 📥 **One-Click MP3 Download**: Downloads the high-fidelity synthesized speech directly as an `.mp3` file.
- 📜 **Script History Cards**: Locally saves your last 15 scripts and settings for quick reloading.

---

## 🚀 Public Free Deployment Guide

The project is structured to deploy instantly on free services.

### Option A: Deploy Frontend + API to Vercel (Recommended)
This deploys the React frontend as a static site and the FastAPI backend as serverless functions (configured in `api/index.py` and routed via `vercel.json`).
1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **Add New** > **Project**.
3. Import this repository.
4. Leave all settings at their default values and click **Deploy**.
5. Both the frontend dashboard and backend API will work seamlessly under your public Vercel URL!

### Option B: Deploy Standalone App to Streamlit Community Cloud
A standalone `app.py` script is included at the root. Streamlit Community Cloud will host this python application 24/7 for free.
1. Go to [Streamlit Share](https://share.streamlit.io/) and log in with GitHub.
2. Click **New app** (or **Deploy**).
3. Select this repository, branch: `main`, and main file path: `app.py`.
4. Click **Deploy**. Within 1–2 minutes, your standalone speech generator will be online!

---

## 💻 Running Locally

Ensure Python (>=3.9) and Node.js are installed.

1. **Install dependencies**:
   ```bash
   # Install python libraries
   pip install -r api/requirements.txt
   
   # Install frontend libraries
   npm install
   ```

2. **Start Backend Server**:
   ```bash
   python -m uvicorn api.index:app --port 8001
   ```

3. **Start Frontend Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5174/](http://localhost:5174/) in your browser.

4. **Run Streamlit Standalone (Optional)**:
   ```bash
   streamlit run app.py
   ```
