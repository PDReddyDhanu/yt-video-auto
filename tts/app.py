import streamlit as st
import asyncio
import edge_tts
from datetime import datetime

# Set up Streamlit Page Page Config
st.set_page_config(
    page_title="TeluguVoice AI - Free Lifetime Speech Studio",
    page_icon="🎙️",
    layout="centered"
)

# Custom Styling for dark/neon aesthetic
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1rem;
        color: #94a3b8;
        text-align: center;
        margin-bottom: 2rem;
    }
    .stTextArea textarea {
        background-color: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(99, 102, 241, 0.2) !important;
        color: #f8fafc !important;
        border-radius: 10px !important;
    }
    </style>
""", unsafe_allow_html=True)

st.markdown('<h1 class="main-header">TeluguVoice AI</h1>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">🎙️ Free Lifetime Neural Text-to-Speech Studio</p>', unsafe_allow_html=True)

# Voice configuration mapping
VOICE_MAPPING = {
    "Telugu (తెలుగు)": {
        "code": "te-IN",
        "voices": {
            "Shruti (Female Neural)": "te-IN-ShrutiNeural",
            "Mohan (Male Neural)": "te-IN-MohanNeural",
            "Ava (Female - Multilingual)": "en-US-AvaMultilingualNeural",
            "Andrew (Male - Multilingual)": "en-US-AndrewMultilingualNeural",
            "Emma (Female - Multilingual)": "en-US-EmmaMultilingualNeural",
            "Brian (Male - Multilingual)": "en-US-BrianMultilingualNeural",
            "Vivienne (Female - Multilingual)": "fr-FR-VivienneMultilingualNeural",
            "Remy (Male - Multilingual)": "fr-FR-RemyMultilingualNeural",
            "Seraphina (Female - Multilingual)": "de-DE-SeraphinaMultilingualNeural",
            "Florian (Male - Multilingual)": "de-DE-FlorianMultilingualNeural",
            "Giuseppe (Male - Multilingual)": "it-IT-GiuseppeMultilingualNeural",
            "Thalita (Female - Multilingual)": "pt-BR-ThalitaMultilingualNeural"
        },
        "default_text": "నమస్కారం, తెలుగు వాయిస్ ఏఐకి స్వాగతం! ఇది మీకు ఉచితంగా సహజమైన మానవ వాయిస్‌ను అందిస్తుంది."
    },
    "English (US)": {
        "code": "en-US",
        "voices": {
            "Aria (Female Neural)": "en-US-AriaNeural",
            "Guy (Male Neural)": "en-US-GuyNeural",
            "Ava (Female Neural)": "en-US-AvaNeural",
            "Andrew (Male Neural)": "en-US-AndrewNeural",
            "Emma (Female Neural)": "en-US-EmmaNeural",
            "Brian (Male Neural)": "en-US-BrianNeural",
            "Jenny (Female Neural)": "en-US-JennyNeural",
            "Neerja (Female - Indian Accent)": "en-IN-NeerjaNeural",
            "Prabhat (Male - Indian Accent)": "en-IN-PrabhatNeural"
        },
        "default_text": "Hello, welcome to TeluguVoice AI! This platform generates high-quality natural human-like voice synthesis for free."
    }
}

# Sidebar Info
with st.sidebar:
    st.markdown("### 🎙️ About TeluguVoice AI")
    st.write("This application uses Microsoft's Edge Neural TTS models to generate natural, human-like voice recordings.")
    st.success("✅ 100% Free Lifetime Service")
    st.info("💡 **Pro-Tip:** Punctuation marks like ellipses (`...`) or commas (`,`) naturally create short, realistic pauses in the voice reading.")

# Form controls
col1, col2 = st.columns(2)
with col1:
    lang_selection = st.selectbox("Select Script Language", list(VOICE_MAPPING.keys()))
with col2:
    voice_options = list(VOICE_MAPPING[lang_selection]["voices"].keys())
    voice_selection = st.selectbox("Select Voice Tone", voice_options)

# Text Script Input
script_text = st.text_area("Content Script (Max 5,000 characters)", value="", placeholder="Paste or type your script here...", height=220, max_chars=5000)

# Speed & Pitch Dropdowns
col_select1, col_select2 = st.columns(2)
with col_select1:
    speed_values = [round(0.5 + i * 0.05, 2) for i in range(31)]
    speed_labels = [f"{v:.2f}x (Normal)" if v == 1.0 else f"{v:.2f}x" for v in speed_values]
    speed_options = dict(zip(speed_labels, speed_values))
    speed_sel = st.selectbox("Speaking Pace (Speed)", speed_labels, index=10)
    speed = speed_options[speed_sel]
with col_select2:
    pitch_options = {
        "Deep & Authoritative (Bass) [-15Hz]": -15,
        "Warm & Mature (Baritone) [-8Hz]": -8,
        "Calm & Gentle [-4Hz]": -4,
        "Normal Voice Pitch [0Hz]": 0,
        "Bright & Clear [+4Hz]": 4,
        "Youthful & Energetic (Tenor) [+8Hz]": 8,
        "Expressive & Sharp [+15Hz]": 15
    }
    pitch_sel = st.selectbox("Voice Tone Profile (Pitch)", list(pitch_options.keys()), index=3)
    pitch = pitch_options[pitch_sel]

# Generate Button and processing
if st.button("🚀 Generate Audio", use_container_width=True):
    if not script_text.strip():
        st.warning("Please enter a text script to generate audio.")
    else:
        # Convert speed & pitch to edge-tts format
        percentage = int((speed - 1.0) * 100)
        rate_str = f"{percentage:+d}%"
        pitch_str = f"{pitch:+d}Hz"
        
        voice_id = VOICE_MAPPING[lang_selection]["voices"][voice_selection]
        
        async def synthesize_text(text, voice, rate, pitch_val):
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch_val)
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            return audio_data

        with st.spinner("Synthesizing neural voice..."):
            try:
                # Run async synthesis inside Streamlit
                audio_bytes = asyncio.run(synthesize_text(script_text, voice_id, rate_str, pitch_str))
                
                if len(audio_bytes) > 0:
                    st.success("🎉 Audio generated successfully!")
                    
                    # Display Audio Player
                    st.audio(audio_bytes, format="audio/mp3")
                    
                    # Create Dynamic Download Filename (First 3-4 words)
                    words = script_text.strip().split()
                    first_words = "_".join(words[:4])
                    import re
                    sanitized = re.sub(r'[^a-zA-Z0-9\u0c00-\u0c7f_]', '', first_words)
                    if len(sanitized) > 80:
                        sanitized = sanitized[:80]
                    filename = f"{sanitized or 'TeluguVoiceAI_Audio'}.mp3"
                    
                    st.download_button(
                        label="📥 Download MP3 File",
                        data=audio_bytes,
                        file_name=filename,
                        mime="audio/mp3",
                        use_container_width=True
                    )
                else:
                    st.error("No audio data returned. Please try modifying your script or checking your connection.")
            except Exception as e:
                st.error(f"Failed to generate audio: {str(e)}")
