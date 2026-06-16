import sys
import os
import json
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

def transcribe_audio(file_path, lang="te-IN", ffmpeg_path=None):
    if ffmpeg_path:
        AudioSegment.converter = ffmpeg_path
        
    try:
        # Load audio file using pydub
        audio = AudioSegment.from_file(file_path)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load audio: {str(e)}"}))
        return

    # Detect non-silent chunks
    # min_silence_len: minimum length of silence to register in ms
    # silence_thresh: silence threshold in dBFS (e.g. -35)
    chunks = detect_nonsilent(audio, min_silence_len=400, silence_thresh=-35, seek_step=10)
    
    # If no chunks detected, treat the whole audio as one chunk
    if not chunks:
        chunks = [[0, len(audio)]]

    # Initialize speech recognition
    recognizer = sr.Recognizer()
    results = []

    for i, (start_ms, end_ms) in enumerate(chunks):
        # Crop audio to chunk (add slight padding of 100ms)
        pad = 100
        start_crop = max(0, start_ms - pad)
        end_crop = min(len(audio), end_ms + pad)
        chunk_audio = audio[start_crop:end_crop]
        
        # Export chunk to a temporary WAV in memory/tempfile
        temp_wav = f"temp_chunk_{os.getpid()}_{i}.wav"
        chunk_audio.export(temp_wav, format="wav")
        
        try:
            with sr.AudioFile(temp_wav) as source:
                audio_data = recognizer.record(source)
                # Call Google Web Speech API (free, unlimited)
                text = recognizer.recognize_google(audio_data, language=lang)
                if text:
                    results.append({
                        "start": round(start_ms / 1000.0, 2),
                        "end": round(end_ms / 1000.0, 2),
                        "text": text
                    })
        except sr.UnknownValueError:
            # Speech was unintelligible
            pass
        except Exception as e:
            # Other errors
            pass
        finally:
            # Clean up temp WAV file
            if os.path.exists(temp_wav):
                try:
                    os.remove(temp_wav)
                except:
                    pass
                    
    # Print the result as JSON to stdout
    print(json.dumps(results, ensure_ascii=True))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing audio file path argument."}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "te-IN"
    ffmpeg_path = sys.argv[3] if len(sys.argv) > 3 else None
    
    transcribe_audio(file_path, lang, ffmpeg_path)
