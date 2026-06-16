from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi.responses import StreamingResponse, JSONResponse
import edge_tts
import logging
import base64

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TeluguVoiceAI")

app = FastAPI(
    title="TeluguVoice AI Backend",
    description="Lifetime Free Neural Text-to-Speech service using Microsoft Edge TTS",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text script to synthesize")
    language_code: str = Field("te-IN", description="Language: te-IN or en-US")
    gender: str = Field("FEMALE", description="Voice gender: MALE or FEMALE")
    voice_id: str = Field(None, description="Direct Neural Voice ID (e.g. te-IN-ShrutiNeural)")
    speed: float = Field(1.0, ge=0.5, le=2.0, description="Speaking rate: 0.5 to 2.0")
    pitch: int = Field(0, ge=-20, le=20, description="Pitch offset in Hz: -20 to 20")

# Voice Mapping
VOICE_MAPPING = {
    "te-IN": {
        "FEMALE": "te-IN-ShrutiNeural",
        "MALE": "te-IN-MohanNeural"
    },
    "en-US": {
        "FEMALE": "en-US-AriaNeural",
        "MALE": "en-US-GuyNeural"
    }
}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "TeluguVoice AI Backend", "engine": "Edge Neural TTS"}

@app.get("/api/voices")
def get_voices():
    # Return available voice configuration details with actual real names
    return {
        "te-IN": [
            {"id": "te-IN-ShrutiNeural", "name": "Shruti (Female)", "gender": "FEMALE", "style": "Natural / Expressive"},
            {"id": "te-IN-MohanNeural", "name": "Mohan (Male)", "gender": "MALE", "style": "Official / Natural"},
            {"id": "en-US-AvaMultilingualNeural", "name": "Ava (Female - Multilingual)", "gender": "FEMALE", "style": "Bright / Clear"},
            {"id": "en-US-AndrewMultilingualNeural", "name": "Andrew (Male - Multilingual)", "gender": "MALE", "style": "Warm / Natural"},
            {"id": "en-US-EmmaMultilingualNeural", "name": "Emma (Female - Multilingual)", "gender": "FEMALE", "style": "Clear / Friendly"},
            {"id": "en-US-BrianMultilingualNeural", "name": "Brian (Male - Multilingual)", "gender": "MALE", "style": "Solid / Deep"},
            {"id": "fr-FR-VivienneMultilingualNeural", "name": "Vivienne (Female - Multilingual)", "gender": "FEMALE", "style": "Smooth / Elegant"},
            {"id": "fr-FR-RemyMultilingualNeural", "name": "Remy (Male - Multilingual)", "gender": "MALE", "style": "Polished / Rich"},
            {"id": "de-DE-SeraphinaMultilingualNeural", "name": "Seraphina (Female - Multilingual)", "gender": "FEMALE", "style": "Clear / Calming"},
            {"id": "de-DE-FlorianMultilingualNeural", "name": "Florian (Male - Multilingual)", "gender": "MALE", "style": "Resonant / Warm"},
            {"id": "it-IT-GiuseppeMultilingualNeural", "name": "Giuseppe (Male - Multilingual)", "gender": "MALE", "style": "Deep / Expressive"},
            {"id": "pt-BR-ThalitaMultilingualNeural", "name": "Thalita (Female - Multilingual)", "gender": "FEMALE", "style": "Warm / Conversational"}
        ],
        "en-US": [
            {"id": "en-US-AriaNeural", "name": "Aria (Female)", "gender": "FEMALE", "style": "Professional / Clear"},
            {"id": "en-US-GuyNeural", "name": "Guy (Male)", "gender": "MALE", "style": "Conversational / Warm"},
            {"id": "en-US-AvaNeural", "name": "Ava (Female)", "gender": "FEMALE", "style": "Bright / Youthful"},
            {"id": "en-US-AndrewNeural", "name": "Andrew (Male)", "gender": "MALE", "style": "Warm / Friendly"},
            {"id": "en-US-EmmaNeural", "name": "Emma (Female)", "gender": "FEMALE", "style": "Clear / Conversational"},
            {"id": "en-US-BrianNeural", "name": "Brian (Male)", "gender": "MALE", "style": "Solid / Authoritative"},
            {"id": "en-US-JennyNeural", "name": "Jenny (Female)", "gender": "FEMALE", "style": "Natural / Friendly"},
            {"id": "en-IN-NeerjaNeural", "name": "Neerja (Female - Indian Accent)", "gender": "FEMALE", "style": "Expressive / Natural"},
            {"id": "en-IN-PrabhatNeural", "name": "Prabhat (Male - Indian Accent)", "gender": "MALE", "style": "Official / Clear"}
        ]
    }

@app.post("/api/generate")
async def generate_audio(request: TTSRequest):
    logger.info(f"Synthesizing text: '{request.text[:30]}...' Voice: {request.voice_id}, Lang: {request.language_code}, Speed: {request.speed}, Pitch: {request.pitch}")
    
    # 1. Determine Microsoft Neural Voice
    if request.voice_id:
        voice = request.voice_id
    else:
        voice_lang = VOICE_MAPPING.get(request.language_code)
        if not voice_lang:
            raise HTTPException(status_code=400, detail=f"Unsupported language code: {request.language_code}")
            
        voice = voice_lang.get(request.gender)
        if not voice:
            raise HTTPException(status_code=400, detail=f"Unsupported voice gender: {request.gender} for language {request.language_code}")
    
    # 2. Map speed (0.5x - 2.0x) to edge-tts rate string
    percentage = int((request.speed - 1.0) * 100)
    rate_str = f"{percentage:+d}%"
    
    # 3. Map pitch (-20Hz - 20Hz) to edge-tts pitch string
    pitch_str = f"{request.pitch:+d}Hz"
    
    try:
        # 4. Create edge-tts Communicate object with speed and pitch
        communicate = edge_tts.Communicate(request.text, voice, rate=rate_str, pitch=pitch_str)
        
        # 4. Asynchronous generator to stream audio chunks
        async def audio_generator():
            has_chunks = False
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    has_chunks = True
                    yield chunk["data"]
            if not has_chunks:
                logger.error("No audio chunks returned from Edge TTS service")
                
        # 5. Stream response directly back to browser
        return StreamingResponse(
            audio_generator(), 
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        logger.error(f"Error during audio generation: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to generate audio: {str(e)}"}
        )

@app.post("/api/generate-with-words")
async def generate_audio_with_words(request: TTSRequest):
    """Generate audio AND return per-word timestamps for synchronized caption display."""
    logger.info(f"[WithWords] Synthesizing: '{request.text[:40]}...' Voice: {request.voice_id}, Speed: {request.speed}, Pitch: {request.pitch}")

    # 1. Resolve voice
    if request.voice_id:
        voice = request.voice_id
    else:
        voice_lang = VOICE_MAPPING.get(request.language_code)
        if not voice_lang:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language_code}")
        voice = voice_lang.get(request.gender)
        if not voice:
            raise HTTPException(status_code=400, detail=f"Unsupported gender: {request.gender}")

    # 2. Build rate / pitch strings
    percentage = int((request.speed - 1.0) * 100)
    rate_str  = f"{percentage:+d}%"
    pitch_str = f"{request.pitch:+d}Hz"

    try:
        communicate = edge_tts.Communicate(request.text, voice, rate=rate_str, pitch=pitch_str)

        audio_chunks: list[bytes] = []
        word_timestamps: list[dict] = []

        # Collect ALL events — audio chunks AND WordBoundary events
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_chunks.append(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # offset and duration are in 100-nanosecond ticks
                TICKS_PER_SEC = 10_000_000
                start_sec = chunk["offset"] / TICKS_PER_SEC
                dur_sec   = chunk["duration"] / TICKS_PER_SEC
                word_timestamps.append({
                    "word":  chunk["text"],
                    "start": round(start_sec, 3),
                    "end":   round(start_sec + dur_sec, 3)
                })

        if not audio_chunks:
            raise ValueError("No audio data returned from Edge TTS service")

        audio_bytes  = b"".join(audio_chunks)
        audio_b64    = base64.b64encode(audio_bytes).decode("ascii")

        logger.info(f"[WithWords] Generated {len(audio_bytes)} bytes, {len(word_timestamps)} word boundaries")

        return JSONResponse(content={
            "audio_b64":       audio_b64,
            "word_timestamps": word_timestamps
        })

    except Exception as e:
        logger.error(f"[WithWords] Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed: {str(e)}"}
        )
