import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX,
  Sparkles, 
  Clock, 
  RotateCcw, 
  Languages, 
  User, 
  Gauge, 
  Plus, 
  History, 
  Trash2,
  HelpCircle,
  Music,
  Code,
  Layers,
  BarChart2,
  Search,
  Filter,
  Check,
  Copy,
  Terminal,
  Menu,
  X
} from 'lucide-react';

const VOICES_DATA = {
  "te-IN": [
    { id: "te-IN-ShrutiNeural", name: "Shruti (Female Neural)", style: "Natural & Expressive" },
    { id: "te-IN-MohanNeural", name: "Mohan (Male Neural)", style: "Official & Clear" },
    { id: "en-US-AvaMultilingualNeural", name: "Ava (Female - Multilingual)", style: "Bright & Clear" },
    { id: "en-US-AndrewMultilingualNeural", name: "Andrew (Male - Multilingual)", style: "Warm & Natural" },
    { id: "en-US-EmmaMultilingualNeural", name: "Emma (Female - Multilingual)", style: "Clear & Friendly" },
    { id: "en-US-BrianMultilingualNeural", name: "Brian (Male - Multilingual)", style: "Solid & Deep" },
    { id: "fr-FR-VivienneMultilingualNeural", name: "Vivienne (Female - Multilingual)", style: "Smooth & Elegant" },
    { id: "fr-FR-RemyMultilingualNeural", name: "Remy (Male - Multilingual)", style: "Polished & Rich" },
    { id: "de-DE-SeraphinaMultilingualNeural", name: "Seraphina (Female - Multilingual)", style: "Clear & Calming" },
    { id: "de-DE-FlorianMultilingualNeural", name: "Florian (Male - Multilingual)", style: "Resonant & Warm" },
    { id: "it-IT-GiuseppeMultilingualNeural", name: "Giuseppe (Male - Multilingual)", style: "Deep & Expressive" },
    { id: "pt-BR-ThalitaMultilingualNeural", name: "Thalita (Female - Multilingual)", style: "Warm & Conversational" }
  ],
  "en-US": [
    { id: "en-US-AriaNeural", name: "Aria (Female Neural)", style: "Professional & Clear" },
    { id: "en-US-GuyNeural", name: "Guy (Male Neural)", style: "Conversational & Warm" },
    { id: "en-US-AvaNeural", name: "Ava (Female)", style: "Bright & Youthful" },
    { id: "en-US-AndrewNeural", name: "Andrew (Male)", style: "Warm & Friendly" },
    { id: "en-US-EmmaNeural", name: "Emma (Female)", style: "Clear & Conversational" },
    { id: "en-US-BrianNeural", name: "Brian (Male)", style: "Solid & Authoritative" },
    { id: "en-US-JennyNeural", name: "Jenny (Female)", style: "Natural & Friendly" },
    { id: "en-IN-NeerjaNeural", name: "Neerja (Female - Indian Accent)", style: "Expressive Indian" },
    { id: "en-IN-PrabhatNeural", name: "Prabhat (Male - Indian Accent)", style: "Official Indian" }
  ]
};

const SCRIPT_TEMPLATES = {
  youtube: "నమస్కారం! ఇవాల్టి వీడియోలో మనం ఒక ఆసక్తికరమైన విషయాన్ని గురించి తెలుసుకోబోతున్నాం. ఈ వీడియోను చివరి వరకు చూడండి మరియు లైక్, షేర్ చేయడం మర్చిపోకండి!",
  commercial: "సరికొత్త టెక్నాలజీతో, మీ వ్యాపారానికి సరికొత్త రూపునిచ్చే అధునాతన ఏఐ వాయిస్ జెనరేటర్! ఇప్పుడే క్లిక్ చేసి మీ ఉచిత ట్రయల్ ప్రారంభించండి!",
  meditation: "ప్రశాంతంగా కూర్చోండి... కళ్లు మూసుకోండి... మీ శ్వాసపై ధ్యాస పెట్టండి... నెమ్మదిగా గాలి పీల్చండి... నెమ్మదిగా వదిలేయండి...",
  audiobook: "అనగనగా ఒక అందమైన అడవిలో... ఒక తెలివైన జింక నివసించేది. అది చాలా వేగంగా పరిగెత్తేది మరియు అందరితో స్నేహంగా ఉండేది..."
};

const PIANO_NOTES = [
  { note: "E2", freq: 82, color: "white" },
  { note: "F2", freq: 87, color: "white" },
  { note: "F#2", freq: 92, color: "black", leftOffset: "4.8%" },
  { note: "G2", freq: 98, color: "white" },
  { note: "G#2", freq: 104, color: "black", leftOffset: "12.2%" },
  { note: "A2", freq: 110, color: "white" },
  { note: "A#2", freq: 117, color: "black", leftOffset: "19.6%" },
  { note: "B2", freq: 123, color: "white" },
  { note: "C3", freq: 130, color: "white" },
  { note: "C#3", freq: 138, color: "black", leftOffset: "34.4%" },
  { note: "D3", freq: 147, color: "white" },
  { note: "D#3", freq: 155, color: "black", leftOffset: "41.8%" },
  { note: "E3", freq: 165, color: "white" },
  { note: "F3", freq: 174, color: "white" },
  { note: "F#3", freq: 185, color: "black", leftOffset: "56.6%" },
  { note: "G3", freq: 196, color: "white" },
  { note: "G#3", freq: 207, color: "black", leftOffset: "64.0%" },
  { note: "A3", freq: 220, color: "white" },
  { note: "A#3", freq: 233, color: "black", leftOffset: "71.4%" },
  { note: "B3", freq: 247, color: "white" },
  { note: "C4", freq: 261, color: "white" },
  { note: "C#4", freq: 277, color: "black", leftOffset: "86.2%" },
  { note: "D4", freq: 294, color: "white" },
  { note: "D#4", freq: 311, color: "black", leftOffset: "93.6%" },
  { note: "E4", freq: 329, color: "white" }
];

export default function App() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('te-IN');
  const [selectedVoice, setSelectedVoice] = useState('te-IN-ShrutiNeural');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);

  // Preset Alternate Pitch Cycling states
  const [emmaPitchIndex, setEmmaPitchIndex] = useState(0);
  const [viviennePitchIndex, setViviennePitchIndex] = useState(0);
  const [seraphinaPitchIndex, setSeraphinaPitchIndex] = useState(0);
  const [brianPitchIndex, setBrianPitchIndex] = useState(0);
  const [remyPitchIndex, setRemyPitchIndex] = useState(0);
  const [giuseppePitchIndex, setGiuseppePitchIndex] = useState(0);
  const [activePreset, setActivePreset] = useState('female-emma');
  
  // Dashboard navigation
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'clips' | 'acoustic' | 'api'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Developer API Portal Unlocking
  const [isApiUnlocked, setIsApiUnlocked] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showUnlockInput, setShowUnlockInput] = useState(false);
  const [unlockError, setUnlockError] = useState(false);

  // Load unlock state on mount
  useEffect(() => {
    const unlocked = localStorage.getItem('pdr_api_unlocked');
    if (unlocked === 'true') {
      setIsApiUnlocked(true);
    }
  }, []);

  // Safeguard: redirect if active tab is api but is not unlocked
  useEffect(() => {
    if (activeTab === 'api' && !isApiUnlocked) {
      setActiveTab('studio');
    }
  }, [activeTab, isApiUnlocked]);

  // Search & Filters for clips tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  
  // Developer API Portal Mock State
  const [apiKey, setApiKey] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);
  const [apiLangCode, setApiLangCode] = useState('python');

  // Audio Player State
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Vocal Clarity DSP State
  const [eqPreset, setEqPreset] = useState('studio'); // Default to Studio Clarity Boost for premium sound
  
  // Active Piano Note display
  const [activePianoNote, setActivePianoNote] = useState(null);

  // Application State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);
  
  // Refs
  const audioRef = useRef(null);
  const textareaRef = useRef(null);
  const canvasRef = useRef(null);
  const waveAnimRef = useRef(null);
  
  // Web Audio Refs
  const audioContextRef = useRef(null);
  const filtersRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('telugu_voice_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Clean up Web Audio Context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.error("Error closing AudioContext", err));
      }
      if (waveAnimRef.current) {
        cancelAnimationFrame(waveAnimRef.current);
      }
    };
  }, []);

  // Siri-style Canvas Waveform rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const renderWave = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw 3 layers of overlapping waves
      const waves = [
        { amplitude: isPlaying ? 22 : 2, frequency: 0.015, speed: 0.08, color: 'rgba(255, 179, 0, 0.5)' },
        { amplitude: isPlaying ? 14 : 1.5, frequency: 0.025, speed: -0.05, color: 'rgba(255, 202, 40, 0.45)' },
        { amplitude: isPlaying ? 8 : 1, frequency: 0.035, speed: 0.12, color: 'rgba(255, 111, 0, 0.35)' }
      ];

      waves.forEach(w => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 2.5;
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * w.frequency + phase * w.speed) * w.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      phase++;
      waveAnimRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (waveAnimRef.current) {
        cancelAnimationFrame(waveAnimRef.current);
      }
    };
  }, [isPlaying, activeTab]);

  // EQ preset applier helper
  const applyEQPreset = (presetName, filters = filtersRef.current) => {
    if (!filters) return;
    
    const ctx = audioContextRef.current;
    const ctxTime = ctx ? ctx.currentTime : 0;
    
    const setFreq = (node, freq) => {
      if (!node) return;
      try {
        if (ctx) node.frequency.setValueAtTime(freq, ctxTime);
        else node.frequency.value = freq;
      } catch (e) {
        node.frequency.value = freq;
      }
    };
    
    const setGain = (node, gainVal) => {
      if (!node) return;
      try {
        if (ctx) node.gain.setValueAtTime(gainVal, ctxTime);
        else node.gain.value = gainVal;
      } catch (e) {
        node.gain.value = gainVal;
      }
    };

    // Reset to flat default state
    setFreq(filters.hp, 20); // flat highpass
    setGain(filters.warmth, 0);
    setGain(filters.boxiness, 0);
    setGain(filters.nasal, 0);
    setGain(filters.presence, 0);
    setGain(filters.sibilance, 0);
    setGain(filters.air, 0);
    
    if (presetName === 'studio') {
      // Studio Clarity Boost (Audible Professional Settings)
      setFreq(filters.hp, 80);
      setGain(filters.warmth, 4.0);     // Boost fundamental thickness (+4dB)
      setGain(filters.boxiness, -6.0);  // Cut boxy room resonance (-6dB)
      setGain(filters.nasal, -3.0);     // Cut telephonic honk (-3dB)
      setGain(filters.presence, 7.0);    // Strong intelligibility boost (+7dB)
      setGain(filters.sibilance, -5.0); // Smooth harsh sibilants (-5dB)
      setGain(filters.air, 6.0);        // Premium air high-shelf (+6dB)
    } else if (presetName === 'podcast') {
      // Warm Podcast Tone
      setFreq(filters.hp, 80);
      setGain(filters.warmth, 8.0);     // Rich fundamental body (+8dB)
      setGain(filters.boxiness, -8.0);  // Deep cut on room muddiness (-8dB)
      setGain(filters.presence, 4.0);    // Presence boost (+4dB)
      setGain(filters.air, 3.5);        // Clean air shelf (+3.5dB)
    } else if (presetName === 'mobile') {
      // Mobile Speaker Optimizer
      setFreq(filters.hp, 180);         // Cut low frequencies to avoid driver distortion
      setGain(filters.boxiness, -6.0);  // Clean muddy boxiness
      setGain(filters.presence, 9.0);    // Piercing intelligibility boost (+9dB)
      setGain(filters.sibilance, -6.0); // Cut harsh high frequency sibilants
      setGain(filters.air, 2.0);
    }
  };

  // Synchronize EQ Preset changes
  useEffect(() => {
    if (filtersRef.current) {
      applyEQPreset(eqPreset);
    }
  }, [eqPreset]);

  // DSP Routing Engine Builder
  const initAudioEngine = () => {
    if (audioContextRef.current) return;
    if (!audioRef.current) return;
    
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 20;
      
      const warmth = ctx.createBiquadFilter();
      warmth.type = 'peaking';
      warmth.frequency.value = 150;
      warmth.Q.value = 1.0;
      warmth.gain.value = 0;
      
      const boxiness = ctx.createBiquadFilter();
      boxiness.type = 'peaking';
      boxiness.frequency.value = 450;
      boxiness.Q.value = 2.0;
      boxiness.gain.value = 0;
      
      const nasal = ctx.createBiquadFilter();
      nasal.type = 'peaking';
      nasal.frequency.value = 1000;
      nasal.Q.value = 1.0;
      nasal.gain.value = 0;
      
      const presence = ctx.createBiquadFilter();
      presence.type = 'peaking';
      presence.frequency.value = 3000;
      presence.Q.value = 1.0;
      presence.gain.value = 0;
      
      const sibilance = ctx.createBiquadFilter();
      sibilance.type = 'peaking';
      sibilance.frequency.value = 6500;
      sibilance.Q.value = 1.5;
      sibilance.gain.value = 0;
      
      const air = ctx.createBiquadFilter();
      air.type = 'highshelf';
      air.frequency.value = 12000;
      air.gain.value = 0;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;
      
      source.connect(hp);
      hp.connect(warmth);
      warmth.connect(boxiness);
      boxiness.connect(nasal);
      nasal.connect(presence);
      presence.connect(sibilance);
      sibilance.connect(air);
      air.connect(ctx.destination);
      
      const filters = { hp, warmth, boxiness, nasal, presence, sibilance, air };
      filtersRef.current = filters;
      
      applyEQPreset(eqPreset, filters);
    } catch (e) {
      console.error("Failed to build Web Audio API routing graph:", e);
    }
  };

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Save history helper
  const saveToHistory = (newEntry) => {
    const updatedHistory = [newEntry, ...history.filter(item => item.id !== newEntry.id)].slice(0, 15);
    setHistory(updatedHistory);
    localStorage.setItem('telugu_voice_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('telugu_voice_history');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setSelectedVoice(lang === 'te-IN' ? 'te-IN-ShrutiNeural' : 'en-US-AriaNeural');
    // Clear audio when configuration changes
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
  };

  const handleInsertPause = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const pauseMarker = ' ... ';
    const newText = text.substring(0, start) + pauseMarker + text.substring(end);
    setText(newText);
    
    // Set cursor position after the inserted marker
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + pauseMarker.length;
    }, 50);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg('Please enter some text script to generate audio.');
      return;
    }
    
    setIsLoading(true);
    setStatusMsg('Connecting to free neural engine...');
    setErrorMsg('');
    setIsPlaying(false);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language_code: language,
          voice_id: selectedVoice,
          gender: selectedVoice.includes('Shruti') || selectedVoice.includes('Aria') || selectedVoice.includes('Ava') || selectedVoice.includes('Emma') || selectedVoice.includes('Jenny') || selectedVoice.includes('Neerja') || selectedVoice.includes('Vivienne') || selectedVoice.includes('Seraphina') || selectedVoice.includes('Thalita') ? 'FEMALE' : 'MALE',
          speed: speed,
          pitch: pitch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to synthesize audio');
      }

      setStatusMsg('Receiving audio stream...');
      const blob = await response.blob();
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl); // Free memory
      }
      
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      
      // Auto-load and play the audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }

      // Add to local history list
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEntry = {
        id: Date.now().toString(),
        text: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
        fullText: text,
        language,
        voice_id: selectedVoice,
        gender: selectedVoice.includes('Shruti') || selectedVoice.includes('Aria') || selectedVoice.includes('Ava') || selectedVoice.includes('Emma') || selectedVoice.includes('Jenny') || selectedVoice.includes('Neerja') ? 'FEMALE' : 'MALE',
        speed,
        pitch,
        timestamp
      };
      saveToHistory(newEntry);
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during audio generation. Please try again.');
    } finally {
      setIsLoading(false);
      setStatusMsg('');
    }
  };

  // Audio Ref Listeners
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;
    
    // Initialize Web Audio API routing
    initAudioEngine();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback failed", err);
      });
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const url = window.URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Extract first 3-4 words from text to form the filename
    const words = text.trim().split(/\s+/).filter(Boolean);
    const firstWords = words.slice(0, 4).join('_');
    // Sanitize characters: allow alphanumeric, Telugu unicode range (\u0C00-\u0C7F), and underscores
    let sanitized = firstWords.replace(/[^a-zA-Z0-9\u0C00-\u0C7F_]/g, '');
    
    if (sanitized.length > 80) {
      sanitized = sanitized.substring(0, 80);
    }
    
    a.download = `${sanitized || 'TeluguVoiceAI_Audio'}.mp3`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const loadHistoryItem = (item) => {
    setText(item.fullText);
    setLanguage(item.language);
    
    if (item.voice_id) {
      setSelectedVoice(item.voice_id);
    } else {
      if (item.language === 'te-IN') {
        setSelectedVoice(item.gender === 'MALE' ? 'te-IN-MohanNeural' : 'te-IN-ShrutiNeural');
      } else {
        setSelectedVoice(item.gender === 'MALE' ? 'en-US-GuyNeural' : 'en-US-AriaNeural');
      }
    }
    
    setSpeed(item.speed);
    setPitch(item.pitch !== undefined ? item.pitch : 0);
    
    // Clear audio player
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
  };

  // Oscillator Piano Synth Sound
  const playPianoTone = (freq, noteName) => {
    setActivePianoNote(noteName);
    setTimeout(() => setActivePianoNote(null), 300);
    
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error("Piano synth failed:", e);
    }
  };

  // Generate Parametric EQ Curve path dynamically based on preset
  const getEQCurvePath = () => {
    if (eqPreset === 'studio') {
      return "M 20 80 Q 50 80 80 80 T 150 72 T 220 80 T 320 88 T 420 80 T 520 62 T 620 66 L 700 66";
    }
    if (eqPreset === 'podcast') {
      return "M 20 80 Q 50 80 80 80 T 150 60 T 220 80 T 320 90 T 420 80 T 520 72 T 620 75 L 700 75";
    }
    if (eqPreset === 'mobile') {
      return "M 20 100 Q 50 100 80 100 T 150 100 T 220 82 T 320 80 T 420 80 T 520 54 T 620 76 L 700 76";
    }
    return "M 20 80 L 700 80";
  };

  // Generate API Key helper
  const handleGenerateApiKey = () => {
    setIsGeneratingKey(true);
    setTimeout(() => {
      const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setApiKey(`pdr_live_${randomHex}`);
      setIsGeneratingKey(false);
      setApiCopied(false);
    }, 1200);
  };

  const handleUnlock = () => {
    const trimmed = secretInput.trim();
    if (trimmed === 'admin5555' || trimmed === 'PDRTSO') {
      setIsApiUnlocked(true);
      localStorage.setItem('pdr_api_unlocked', 'true');
      setActiveTab('api');
      setShowUnlockInput(false);
      setSecretInput('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  const applyPreset = (gender, model) => {
    // Force Studio Clarity Boost
    setEqPreset('studio');
    // Ensure it matches Telugu script context
    setLanguage('te-IN');
    setActivePreset(`${gender}-${model}`);
    
    if (gender === 'female') {
      setSpeed(1.65);
      if (model === 'emma') {
        setSelectedVoice('en-US-EmmaMultilingualNeural');
        const pitches = [-4, -8, -15];
        const nextPitch = pitches[emmaPitchIndex];
        setPitch(nextPitch);
        setEmmaPitchIndex((emmaPitchIndex + 1) % pitches.length);
      } else if (model === 'vivienne') {
        setSelectedVoice('fr-FR-VivienneMultilingualNeural');
        const pitches = [-4, -8];
        const nextPitch = pitches[viviennePitchIndex];
        setPitch(nextPitch);
        setViviennePitchIndex((viviennePitchIndex + 1) % pitches.length);
      } else if (model === 'seraphina') {
        setSelectedVoice('de-DE-SeraphinaMultilingualNeural');
        const pitches = [-4, -8];
        const nextPitch = pitches[seraphinaPitchIndex];
        setPitch(nextPitch);
        setSeraphinaPitchIndex((seraphinaPitchIndex + 1) % pitches.length);
      }
    } else if (gender === 'male') {
      setSpeed(1.65);
      if (model === 'brian') {
        setSelectedVoice('en-US-BrianMultilingualNeural');
        const pitches = [4, 8];
        const nextPitch = pitches[brianPitchIndex];
        setPitch(nextPitch);
        setBrianPitchIndex((brianPitchIndex + 1) % pitches.length);
      } else if (model === 'remy') {
        setSelectedVoice('fr-FR-RemyMultilingualNeural');
        const pitches = [4, 8];
        const nextPitch = pitches[remyPitchIndex];
        setPitch(nextPitch);
        setRemyPitchIndex((remyPitchIndex + 1) % pitches.length);
      } else if (model === 'giuseppe') {
        setSelectedVoice('it-IT-GiuseppeMultilingualNeural');
        const pitches = [4, 8];
        const nextPitch = pitches[giuseppePitchIndex];
        setPitch(nextPitch);
        setGiuseppePitchIndex((giuseppePitchIndex + 1) % pitches.length);
      }
    }
  };

  const copyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setApiCopied(true);
    setTimeout(() => setApiCopied(false), 2000);
  };

  // Render Clips Tab Content
  const renderClipsTab = () => {
    const filteredHistory = history.filter(item => {
      const textMatch = item.fullText.toLowerCase().includes(searchQuery.toLowerCase());
      const langMatch = filterLang === 'all' || item.language === filterLang;
      return textMatch && langMatch;
    });

    return (
      <div className="clips-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Generated Clips Manager</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Search, preview, and download your previous TTS creations</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input 
                type="text" 
                placeholder="Search clips text..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '10px 12px 10px 38px', color: '#fff', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              style={{ width: '160px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px' }}
            >
              <option value="all">All Languages</option>
              <option value="te-IN">Telugu (te-IN)</option>
              <option value="en-US">English (en-US)</option>
            </select>

            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="template-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fda4af', borderColor: 'rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.05)' }}
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
            <Clock size={40} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
            <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '4px' }}>No generated audio clips found</h3>
            <p style={{ fontSize: '13px' }}>{searchQuery || filterLang !== 'all' ? 'Try adjusting your search queries or filters.' : 'Go to Speech Studio and generate your first lifetime free voice file!'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredHistory.map((item) => (
              <div key={item.id} className="glass-panel interactive-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', background: 'rgba(20,184,166,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    {item.language === 'te-IN' ? 'Telugu' : 'English'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.timestamp}</span>
                </div>
                
                <p style={{ fontSize: '14px', lineHeight: '1.5', height: '64px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  "{item.fullText}"
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    🎙️ {
                      (() => {
                        const allVoices = [...VOICES_DATA["te-IN"], ...VOICES_DATA["en-US"]];
                        const matched = allVoices.find(v => v.id === item.voice_id);
                        return matched ? matched.name.split(' ')[0] : (item.gender === 'MALE' ? 'Male' : 'Female');
                      })()
                    } ({item.speed}x, {item.pitch}Hz)
                  </span>

                  <button 
                    onClick={() => {
                      loadHistoryItem(item);
                      setActiveTab('studio');
                    }}
                    style={{
                      border: 'none', background: 'var(--primary)', color: '#fff', borderRadius: '6px', fontSize: '12px',
                      fontWeight: 700, padding: '6px 12px', cursor: 'pointer'
                    }}
                  >
                    Load in Studio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Acoustic Tab Content
  const renderAcousticTab = () => {
    return (
      <div className="studio-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SVG Parametric EQ Visualizer Card */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Parametric EQ Curve</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Visual response of the real-time DSP equalizers</p>
            </div>
            
            <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                <span>80Hz (Bass)</span>
                <span>450Hz (Boxiness)</span>
                <span>3kHz (Presence)</span>
                <span>12kHz (Air)</span>
              </div>
              <svg viewBox="0 0 720 160" style={{ width: '100%', height: '140px', overflow: 'visible' }}>
                <line x1="0" y1="80" x2="720" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <path d={getEQCurvePath()} fill="none" stroke="url(#eqGradient)" strokeWidth="4" style={{ transition: 'd 0.4s ease' }} />
                <defs>
                  <linearGradient id="eqGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="50%" stopColor="var(--secondary)" />
                    <stop offset="100%" stopColor="var(--accent)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              <button 
                onClick={() => setEqPreset('studio')}
                className="template-btn" 
                style={{ borderColor: eqPreset === 'studio' ? 'var(--accent)' : 'rgba(255,255,255,0.06)', background: eqPreset === 'studio' ? 'rgba(20,184,166,0.1)' : 'transparent', color: eqPreset === 'studio' ? '#fff' : 'var(--text-secondary)' }}
              >
                ✨ Studio Boost
              </button>
              <button 
                onClick={() => setEqPreset('podcast')}
                className="template-btn" 
                style={{ borderColor: eqPreset === 'podcast' ? 'var(--primary)' : 'rgba(255,255,255,0.06)', background: eqPreset === 'podcast' ? 'rgba(99,102,241,0.1)' : 'transparent', color: eqPreset === 'podcast' ? '#fff' : 'var(--text-secondary)' }}
              >
                🎙️ Podcast Tone
              </button>
              <button 
                onClick={() => setEqPreset('mobile')}
                className="template-btn" 
                style={{ borderColor: eqPreset === 'mobile' ? 'var(--secondary)' : 'rgba(255,255,255,0.06)', background: eqPreset === 'mobile' ? 'rgba(168,85,247,0.1)' : 'transparent', color: eqPreset === 'mobile' ? '#fff' : 'var(--text-secondary)' }}
              >
                📱 Mobile Optimizer
              </button>
              <button 
                onClick={() => setEqPreset('flat')}
                className="template-btn" 
                style={{ borderColor: eqPreset === 'flat' ? '#fff' : 'rgba(255,255,255,0.06)', background: eqPreset === 'flat' ? 'rgba(255,255,255,0.08)' : 'transparent', color: eqPreset === 'flat' ? '#fff' : 'var(--text-secondary)' }}
              >
                Flat / Bypass
              </button>
            </div>
          </div>

          {/* Interactive Synthesizer Piano Scale Keyboard */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Vocal Scale Synthesizer</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Click or hover notes to synthesise and preview frequency fundamentals</p>
            </div>
            
            <div className="piano-scroll-wrapper">
              <div className="piano-keyboard">
                {PIANO_NOTES.map((n, idx) => {
                  const isActive = activePianoNote === n.note;
                  if (n.color === "white") {
                    return (
                      <div 
                        key={idx}
                        className={`piano-white-key ${isActive ? 'active-note' : ''}`}
                        onMouseDown={() => playPianoTone(n.freq, n.note)}
                      >
                        {n.note}
                      </div>
                    );
                  } else {
                    return (
                      <div 
                        key={idx}
                        className={`piano-black-key ${isActive ? 'active-note' : ''}`}
                        style={{ left: n.leftOffset }}
                        onMouseDown={() => playPianoTone(n.freq, n.note)}
                      >
                        {n.note}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--primary)" />
              Acoustic Equalizer Matrix
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Our Web Audio API equalizer automatically structures voice output according to standard audio production rules:
            </p>
            
            <div className="eq-matrix-grid">
              <div className="eq-matrix-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary)' }}>Rumble (20-80Hz)</span>
                  <span style={{ color: '#ef4444' }}>Cut</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Blocks sub-bass floor vibrations that distort speakers.</span>
              </div>
              <div className="eq-matrix-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary)' }}>Warmth (100-250Hz)</span>
                  <span style={{ color: 'var(--accent)' }}>Boost</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Increases chest harmonics to enrich thin, speaking voices.</span>
              </div>
              <div className="eq-matrix-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary)' }}>Boxiness (350-600Hz)</span>
                  <span style={{ color: '#ef4444' }}>Notch Cut</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cleans room acoustics that sound like recording in a closet.</span>
              </div>
              <div className="eq-matrix-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary)' }}>Presence (2-4kHz)</span>
                  <span style={{ color: 'var(--accent)' }}>Boost</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Brings phrasing, consonants, and clarity forward.</span>
              </div>
              <div className="eq-matrix-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: 'var(--primary)' }}>Air (10-20kHz)</span>
                  <span style={{ color: 'var(--accent)' }}>Boost</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Adds shimmering studio breath polish to final audios.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Developer API Tab Content
  const renderApiTab = () => {
    const pythonCode = `import requests

url = "https://teluguvoice-ai.vercel.app/api/generate"
payload = {
    "text": "${text || 'నమస్కారం! తెలుగు వాయిస్ ఏఐ కి స్వాగతం.'}",
    "voice_id": "${selectedVoice}",
    "speed": ${speed},
    "pitch": ${pitch}
}
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}"
}

response = requests.post(url, json=payload, headers=headers)
if response.status_code == 200:
    with open("generated_speech.mp3", "wb") as f:
        f.write(response.content)
    print("Audio saved successfully!")
else:
    print(f"Error: {response.json().get('detail')}")`;

    const curlCode = `curl -X POST "https://teluguvoice-ai.vercel.app/api/generate" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -d '{
    "text": "${text || 'నమస్కారం! తెలుగు వాయిస్ ఏఐ కి స్వాగతం.'}",
    "voice_id": "${selectedVoice}",
    "speed": ${speed},
    "pitch": ${pitch}
  }' \\
  --output speech.mp3`;

    return (
      <div className="studio-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Key Generator Card */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Developer API Portal</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Generate API keys to integrate free Edge TTS speech synthesis into your apps</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="text" 
                readOnly
                placeholder="Click generate to create API key..."
                value={apiKey}
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '12px', color: apiKey ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'monospace', fontSize: '14px', outline: 'none'
                }}
              />
              {apiKey && (
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="template-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '46px', borderColor: apiCopied ? 'var(--accent)' : 'rgba(255,255,255,0.06)' }}
                >
                  {apiCopied ? <Check size={14} color="var(--accent)" /> : <Copy size={14} />}
                  {apiCopied ? 'Copied' : 'Copy'}
                </button>
              )}
              <button
                onClick={handleGenerateApiKey}
                disabled={isGeneratingKey}
                style={{
                  border: 'none', background: 'var(--primary)', color: '#fff', padding: '0 20px',
                  borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', height: '46px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {isGeneratingKey ? 'Generating...' : 'Generate API Key'}
              </button>
            </div>
          </div>

          {/* Code Documentation & Snippets */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="var(--primary)" /> Code Integration Snippets
              </h2>
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '6px' }}>
                <button 
                  onClick={() => setApiLangCode('python')}
                  className="template-btn" 
                  style={{ padding: '4px 10px', fontSize: '11px', border: 'none', background: apiLangCode === 'python' ? 'var(--primary)' : 'transparent', color: apiLangCode === 'python' ? '#fff' : 'var(--text-secondary)' }}
                >
                  Python
                </button>
                <button 
                  onClick={() => setApiLangCode('curl')}
                  className="template-btn" 
                  style={{ padding: '4px 10px', fontSize: '11px', border: 'none', background: apiLangCode === 'curl' ? 'var(--primary)' : 'transparent', color: apiLangCode === 'curl' ? '#fff' : 'var(--text-secondary)' }}
                >
                  cURL / bash
                </button>
              </div>
            </div>

            <pre style={{
              background: '#090a11', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px',
              padding: '16px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto',
              lineHeight: '1.5', margin: 0
            }}>
              {apiLangCode === 'python' ? pythonCode : curlCode}
            </pre>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} color="var(--primary)" /> API Usage Volume (Daily Requests)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {[
                { day: "Mon", count: 125, pct: 40 },
                { day: "Tue", count: 242, pct: 75 },
                { day: "Wed", count: 320, pct: 98 },
                { day: "Thu", count: 180, pct: 55 },
                { day: "Fri", count: 298, pct: 90 },
                { day: "Sat", count: 85, pct: 25 },
                { day: "Sun", count: 62, pct: 18 }
              ].map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                    <span>{stat.day}</span>
                    <span style={{ color: 'var(--accent)' }}>{stat.count} requests</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px' }}>
                    <div style={{ width: `${stat.pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Speech Studio Tab Content
  const renderStudioTab = () => {
    return (
      <div className="studio-grid">
        
        <div className="editor-section">
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="settings-grid">
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <Languages size={15} color="var(--primary)" />
                  Script Language
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
                  <button 
                    onClick={() => handleLanguageChange('te-IN')}
                    style={{
                      border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                      background: language === 'te-IN' ? 'var(--primary)' : 'transparent',
                      color: language === 'te-IN' ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    తెలుగు (te-IN)
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('en-US')}
                    style={{
                      border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                      background: language === 'en-US' ? 'var(--primary)' : 'transparent',
                      color: language === 'en-US' ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    English (en-US)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <User size={15} color="var(--primary)" />
                  Voice Model (Real Name)
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', height: '44px', marginTop: '4px' }}
                >
                  {VOICES_DATA[language]?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.style})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Content Script</span>
                <span style={{ fontSize: '12px', color: text.length > 4500 ? '#f43f5e' : 'var(--text-muted)', fontWeight: 500 }}>
                  {text.length} / 5000 characters
                </span>
              </div>
              
              <div className="templates-row">
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.youtube)}>📺 YouTube Intro</button>
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.commercial)}>📢 Commercial Ad</button>
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.meditation)}>🧘 Meditation</button>
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.audiobook)}>📖 Audiobook Intro</button>
              </div>
              
              <div style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 5000))}
                  placeholder="Paste or write your script content here..."
                  className="script-textarea"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />

                <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleInsertPause}
                    type="button"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', 
                      background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '6px', color: '#a5b4fc', fontSize: '12px', fontWeight: 600, 
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
                    title="Inserts an ellipsis '...' to cause a natural pause in the voice reading."
                  >
                    <Plus size={14} />
                    Insert Natural Pause (Ellipsis)
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Gauge size={15} color="var(--primary)" />
                  Speaking Pace (Speed)
                </label>
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  style={{ marginTop: '4px' }}
                >
                  {Array.from({ length: 31 }, (_, i) => {
                    const val = parseFloat((0.5 + i * 0.05).toFixed(2));
                    let label = `${val.toFixed(2)}x`;
                    if (val === 1.0) label += " (Normal)";
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <RotateCcw size={15} color="var(--primary)" />
                  Voice Tone Profile (Pitch)
                </label>
                <select 
                  value={pitch} 
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  style={{ marginTop: '4px' }}
                >
                  <option value="-15">Deep & Authoritative (Bass) [-15Hz]</option>
                  <option value="-8">Warm & Mature (Baritone) [-8Hz]</option>
                  <option value="-4">Calm & Gentle [-4Hz]</option>
                  <option value="0">Normal Voice Pitch [0Hz]</option>
                  <option value="4">Bright & Clear [+4Hz]</option>
                  <option value="8">Youthful & Energetic (Tenor) [+8Hz]</option>
                  <option value="15">Expressive & Sharp [+15Hz]</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 8px 24px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(99, 102, 241, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.35)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>{statusMsg || 'Generating Audio...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Lifetime Free Audio</span>
                </>
              )}
            </button>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>

          </div>

          <div className="glass-panel" style={{ opacity: audioUrl ? 1 : 0.65, pointerEvents: audioUrl ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Music size={15} color="var(--accent)" />
                  Voice Preview Player
                </span>
                
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Real-Time Playback</span>
              </div>

              <div style={{ width: '100%', height: '60px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                <canvas 
                  ref={canvasRef} 
                  width="700" 
                  height="60" 
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color="var(--accent)" />
                    Vocal Clarity Optimizer
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>Real-Time DSP</span>
                </div>
                <select
                  value={eqPreset}
                  onChange={(e) => {
                    setEqPreset(e.target.value);
                  }}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    fontSize: '13px',
                    padding: '8px 10px',
                    border: '1px solid rgba(20, 184, 166, 0.15)'
                  }}
                >
                  <option value="flat">Flat / Direct Stream (Unprocessed)</option>
                  <option value="studio">✨ Studio Clarity Boost (Premium Air & Intelligibility)</option>
                  <option value="podcast">🎙️ Warm Podcast Tone (Body Warmth & Boxiness Cut)</option>
                  <option value="mobile">📱 Mobile Speaker Optimizer (High Pass & Presence Boost)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent)',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="audio-controls-row">
                
                <div className="volume-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    style={{ height: '4px', accentColor: 'var(--primary)' }}
                  />
                </div>

                <button
                  onClick={handlePlayPause}
                  className="play-pause-btn"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(20, 184, 166, 0.4)',
                    transition: 'all 0.2s',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(20, 184, 166, 0.55)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(20, 184, 166, 0.4)';
                  }}
                >
                  {isPlaying ? <Pause size={24} fill="#ffffff" /> : <Play size={24} fill="#ffffff" style={{ marginLeft: '4px' }} />}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!audioBlob}
                  className="download-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <Download size={15} />
                  Download MP3
                </button>

              </div>
            </div>
          </div>

        </div>

        <div className="sidebar-section">
          
          {/* Creator Promoter Card */}
          <div className="glass-panel promoter-card" style={{ overflow: 'hidden', padding: 0, border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div className="promoter-image-wrapper">
              <img src="/promoter.jpg" alt="TTS Music Lover Promoter" className="promoter-image" />
              <div className="promoter-image-overlay">
                <span className="reveal-badge">✨ Hover to Reveal Creator</span>
              </div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pro Creator
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--secondary)' }}>Next-Gen Content Creation</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                "With studio-grade neural voice fidelity and the Parametric EQ Clarity Optimizer, TeluguVoice AI is the ultimate game changer for modern creators. It makes my voice recordings sound incredibly rich and natural."
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff' }}>DR</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Dhanunjay Reddy</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Lead Content Engineer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="var(--primary)" />
              How it is Lifetime Free
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              TeluguVoice AI connects to high-quality Microsoft Cognitive Speech servers. It utilizes advanced <strong>Neural models</strong> natively, providing ultra-realistic natural human tones.
            </p>
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.06)', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0' }}>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>No API Keys or configuration required</li>
                <li>Unlimited characters & lifetime free use</li>
                <li>Punctuation marks (like <code>...</code>) create natural speaking pauses</li>
              </ul>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} color="var(--primary)" />
                Recent Studio Clips ({history.length})
              </h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={13} />
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', color: 'var(--text-muted)', gap: '8px' }}>
                <Clock size={20} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>No scripts generated yet</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                {history.slice(0, 5).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="interactive-card"
                    style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                      {item.text}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <span style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', padding: '1px 5px', borderRadius: '4px' }}>
                        {item.language === 'te-IN' ? 'Telugu' : 'English'} • {
                          (() => {
                            const allVoices = [...VOICES_DATA["te-IN"], ...VOICES_DATA["en-US"]];
                            const matched = allVoices.find(v => v.id === item.voice_id);
                            return matched ? matched.name.split(' ')[0] : (item.gender === 'MALE' ? 'Male' : 'Female');
                          })()
                        }
                      </span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    );
  };

  // Render Preset Speech Studio Tab Content
  const renderPresetsTab = () => {
    return (
      <div className="studio-grid">
        
        <div className="editor-section">
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Pro Preset Audio Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 className="preset-section-header">
                  <Sparkles size={16} color="var(--accent)" />
                  👩 Female Pro Voice Models
                </h3>
                <div className="presets-flex-row">
                  <button 
                    className={`preset-card-btn ${activePreset === 'female-emma' ? 'active' : ''}`}
                    onClick={() => applyPreset('female', 'emma')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="preset-badge">FM1</span>
                      <span className="preset-status-dot"></span>
                    </div>
                    <span className="preset-name">Emma (Super)</span>
                    <div className="preset-meta">
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Voice Model</span>
                        <span className="preset-meta-val">Emma Neural</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pace (Speed)</span>
                        <span className="preset-meta-val">1.65x (Fast)</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pitch Profile</span>
                        <span className="preset-meta-val">-4 / -8 / -15 Hz</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Clarity DSP</span>
                        <span className="preset-meta-val" style={{ color: 'var(--accent)' }}>Studio Boost</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className={`preset-card-btn ${activePreset === 'female-vivienne' ? 'active' : ''}`}
                    onClick={() => applyPreset('female', 'vivienne')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="preset-badge">FM2</span>
                      <span className="preset-status-dot"></span>
                    </div>
                    <span className="preset-name">Vivienne</span>
                    <div className="preset-meta">
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Voice Model</span>
                        <span className="preset-meta-val">Vivienne Neural</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pace (Speed)</span>
                        <span className="preset-meta-val">1.65x (Fast)</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pitch Profile</span>
                        <span className="preset-meta-val">-4 / -8 Hz</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-val" style={{ color: 'var(--accent)' }}>Studio Boost</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className={`preset-card-btn ${activePreset === 'female-seraphina' ? 'active' : ''}`}
                    onClick={() => applyPreset('female', 'seraphina')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="preset-badge">FM3</span>
                      <span className="preset-status-dot"></span>
                    </div>
                    <span className="preset-name">Seraphina</span>
                    <div className="preset-meta">
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Voice Model</span>
                        <span className="preset-meta-val">Seraphina Neural</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pace (Speed)</span>
                        <span className="preset-meta-val">1.65x (Fast)</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pitch Profile</span>
                        <span className="preset-meta-val">-4 / -8 Hz</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-val" style={{ color: 'var(--accent)' }}>Studio Boost</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="preset-section-header">
                  <Sparkles size={16} color="var(--accent)" />
                  👨 Male Pro Voice Models
                </h3>
                <div className="presets-flex-row">
                  <button 
                    className={`preset-card-btn ${activePreset === 'male-brian' ? 'active' : ''}`}
                    onClick={() => applyPreset('male', 'brian')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="preset-badge">MV1</span>
                      <span className="preset-status-dot"></span>
                    </div>
                    <span className="preset-name">Brian</span>
                    <div className="preset-meta">
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Voice Model</span>
                        <span className="preset-meta-val">Brian Neural</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pace (Speed)</span>
                        <span className="preset-meta-val">1.65x (Fast)</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pitch Profile</span>
                        <span className="preset-meta-val">+4 / +8 Hz</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Clarity DSP</span>
                        <span className="preset-meta-val" style={{ color: 'var(--accent)' }}>Studio Boost</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className={`preset-card-btn ${activePreset === 'male-remy' ? 'active' : ''}`}
                    onClick={() => applyPreset('male', 'remy')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="preset-badge">MV2</span>
                      <span className="preset-status-dot"></span>
                    </div>
                    <span className="preset-name">Remy (Super Good)</span>
                    <div className="preset-meta">
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Voice Model</span>
                        <span className="preset-meta-val">Remy Neural</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pace (Speed)</span>
                        <span className="preset-meta-val">1.65x (Fast)</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pitch Profile</span>
                        <span className="preset-meta-val">+4 / +8 Hz</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Clarity DSP</span>
                        <span className="preset-meta-val" style={{ color: 'var(--accent)' }}>Studio Boost</span>
                      </div>
                    </div>
                  </button>

                  <button 
                    className={`preset-card-btn ${activePreset === 'male-giuseppe' ? 'active' : ''}`}
                    onClick={() => applyPreset('male', 'giuseppe')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="preset-badge">MV3</span>
                      <span className="preset-status-dot"></span>
                    </div>
                    <span className="preset-name">Giuseppe</span>
                    <div className="preset-meta">
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Voice Model</span>
                        <span className="preset-meta-val">Giuseppe Neural</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pace (Speed)</span>
                        <span className="preset-meta-val">1.65x (Fast)</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Pitch Profile</span>
                        <span className="preset-meta-val">+4 / +8 Hz</span>
                      </div>
                      <div className="preset-meta-item">
                        <span className="preset-meta-label">Clarity DSP</span>
                        <span className="preset-meta-val" style={{ color: 'var(--accent)' }}>Studio Boost</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Content Script</span>
                <span style={{ fontSize: '12px', color: text.length > 4500 ? '#f43f5e' : 'var(--text-muted)', fontWeight: 500 }}>
                  {text.length} / 5000 characters
                </span>
              </div>
              
              <div className="templates-row">
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.youtube)}>📺 YouTube Intro</button>
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.commercial)}>📢 Commercial Ad</button>
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.meditation)}>🧘 Meditation</button>
                <button className="template-btn" onClick={() => setText(SCRIPT_TEMPLATES.audiobook)}>📖 Audiobook Intro</button>
              </div>
              
              <div style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 5000))}
                  placeholder="Paste or write your script content here..."
                  className="script-textarea"
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255, 111, 0, 0.4)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />

                <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleInsertPause}
                    type="button"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', 
                      background: 'rgba(255, 111, 0, 0.15)', border: '1px solid rgba(255, 111, 0, 0.3)',
                      borderRadius: '6px', color: '#ffedd5', fontSize: '12px', fontWeight: 600, 
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 111, 0, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 111, 0, 0.15)'}
                    title="Inserts an ellipsis '...' to cause a natural pause in the voice reading."
                  >
                    <Plus size={14} />
                    Insert Natural Pause (Ellipsis)
                  </button>
                </div>
              </div>
            </div>

            {/* Display configuration and values automatically preset */}
            <div style={{ background: 'rgba(255, 111, 0, 0.03)', border: '1px solid rgba(255, 111, 0, 0.15)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                🛠️ Active Preset Configuration (Auto-Applied)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Neural Voice ID</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{selectedVoice}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Speaking Speed (Pace)</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{speed.toFixed(2)}x</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Voice Pitch</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{pitch > 0 ? `+${pitch}` : pitch}Hz</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vocal Clarity Optimizer</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>✨ Studio Boost</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 8px 24px rgba(255, 111, 0, 0.35)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(255, 111, 0, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 111, 0, 0.35)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>{statusMsg || 'Generating Audio...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Preset Audio</span>
                </>
              )}
            </button>

          </div>

          <div className="glass-panel" style={{ opacity: audioUrl ? 1 : 0.65, pointerEvents: audioUrl ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Music size={15} color="var(--accent)" />
                  Voice Preview Player
                </span>
                
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Real-Time Playback</span>
              </div>

              <div style={{ width: '100%', height: '60px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                <canvas 
                  ref={canvasRef} 
                  width="700" 
                  height="60" 
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color="var(--accent)" />
                    Vocal Clarity Optimizer
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>Real-Time DSP</span>
                </div>
                <select
                  disabled
                  value="studio"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    fontSize: '13px',
                    padding: '8px 10px',
                    border: '1px solid rgba(20, 184, 166, 0.15)',
                    opacity: 0.8,
                    cursor: 'not-allowed'
                  }}
                >
                  <option value="studio">✨ Studio Clarity Boost (Premium Air & Intelligibility) [LOCKED]</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent)',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="audio-controls-row">
                
                <div className="volume-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} color="var(--text-secondary)" /> : <Volume2 size={16} color="var(--text-secondary)" />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    style={{ width: '100%', accentColor: 'var(--text-secondary)' }}
                  />
                </div>

                <button 
                  className="play-pause-btn"
                  onClick={handlePlayPause}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--accent)',
                    border: 'none',
                    color: '#000000',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px var(--accent-glow)',
                    transition: 'all 0.2s'
                  }}
                >
                  {isPlaying ? <Pause size={18} fill="#000000" /> : <Play size={18} fill="#000000" style={{ transform: 'translateX(1px)' }} />}
                </button>

                <button 
                  className="download-btn"
                  onClick={handleDownload}
                  disabled={!audioBlob}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  <Download size={14} />
                  Download
                </button>
              </div>

            </div>
          </div>

        </div>

        <div className="sidebar-section">
          
          {/* Creator Promoter Card */}
          <div className="glass-panel promoter-card" style={{ overflow: 'hidden', padding: 0, border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div className="promoter-image-wrapper">
              <img src="/promoter.jpg" alt="TTS Music Lover Promoter" className="promoter-image" />
              <div className="promoter-image-overlay">
                <span className="reveal-badge">✨ Hover to Reveal Creator</span>
              </div>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pro Creator
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--secondary)' }}>Next-Gen Content Creation</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                "With studio-grade neural voice fidelity and the Parametric EQ Clarity Optimizer, TeluguVoice AI is the ultimate game changer for modern creators. It makes my voice recordings sound incredibly rich and natural."
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff' }}>DR</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>Dhanunjay Reddy</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Lead Content Engineer</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="var(--primary)" />
              How it is Lifetime Free
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              TeluguVoice AI connects to high-quality Microsoft Cognitive Speech servers. It utilizes advanced <strong>Neural models</strong> natively, providing ultra-realistic natural human tones.
            </p>
            <div style={{ padding: '12px', background: 'rgba(255, 111, 0, 0.06)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0' }}>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>No API Keys or configuration required</li>
                <li>Unlimited characters & lifetime free use</li>
                <li>Punctuation marks (like <code>...</code>) create natural speaking pauses</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <button 
          className="hamburger-btn"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div className="mobile-logo-section">
          <div className="mobile-logo-container">
            <img src="/logo.png" alt="Official Logo" className="mobile-logo-image" />
          </div>
          <span className="mobile-logo-text text-gradient-primary">Telugu States AI</span>
        </div>
      </div>

      {/* Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        {/* Mobile Close Button */}
        <button 
          className="sidebar-close-btn"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <div className="logo-section">
          <div className="logo-container">
            <img src="/logo.png" alt="Telugu States Official Logo" className="logo-image" />
          </div>
          <div className="logo-title">
            <span className="text-gradient-primary">Telugu States</span>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Studio</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('studio');
              setIsMobileSidebarOpen(false);
            }}
          >
            🎙️ Speech Studio
          </button>
          <button 
            className={`nav-item ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('presets');
              setIsMobileSidebarOpen(false);
              applyPreset('female', 'emma');
            }}
          >
            🔊 Preset Audio Models
          </button>
          <button 
            className={`nav-item ${activeTab === 'clips' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('clips');
              setIsMobileSidebarOpen(false);
            }}
          >
            📁 Clips Manager
          </button>
          <button 
            className={`nav-item ${activeTab === 'acoustic' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('acoustic');
              setIsMobileSidebarOpen(false);
            }}
          >
            📊 Acoustic Analytics
          </button>
          {isApiUnlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <button 
                className={`nav-item ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('api');
                  setIsMobileSidebarOpen(false);
                }}
                style={{ flex: 1 }}
              >
                ⚙️ Developer API
              </button>
              <button
                onClick={() => {
                  setIsApiUnlocked(false);
                  localStorage.removeItem('pdr_api_unlocked');
                  if (activeTab === 'api') {
                    setActiveTab('studio');
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
                title="Lock Developer Tab"
              >
                🔒
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {!showUnlockInput ? (
                <button 
                  className="nav-item"
                  onClick={() => setShowUnlockInput(true)}
                  style={{ color: 'var(--text-muted)', opacity: 0.6 }}
                >
                  🔒 Unlock Developer API
                </button>
              ) : (
                <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Enter Developer Secret Key</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={secretInput}
                      onChange={(e) => {
                        setSecretInput(e.target.value);
                        setUnlockError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUnlock();
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        border: unlockError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        minWidth: '0'
                      }}
                    />
                    <button
                      onClick={handleUnlock}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Verify
                    </button>
                  </div>
                  {unlockError && (
                    <span style={{ fontSize: '10px', color: '#fda4af' }}>Invalid secret key!</span>
                  )}
                  <button
                    onClick={() => {
                      setShowUnlockInput(false);
                      setSecretInput('');
                      setUnlockError(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(255, 111, 0, 0.04)', borderRadius: '12px', border: '1px solid rgba(255, 111, 0, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>System Status</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Edge Neural Engine Online</span>
        </div>
      </aside>

      <main className="dashboard-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {activeTab === 'studio' && '🎙️ Neural Speech Studio'}
              {activeTab === 'presets' && '🔊 Preset Audio Models'}
              {activeTab === 'clips' && '📁 Clips Manager & Vault'}
              {activeTab === 'acoustic' && '📊 Acoustic Analytics & Reference'}
              {activeTab === 'api' && '⚙️ Developer API Portal'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeTab === 'studio' && 'Synthesize free high-fidelity custom Telugu and English scripts'}
              {activeTab === 'presets' && 'Generate voice with expert-tuned premium voice presets'}
              {activeTab === 'clips' && 'Preview, filters, and manage your local voice archives'}
              {activeTab === 'acoustic' && 'Learn note scales, frequencies, and parametric curves'}
              {activeTab === 'api' && 'Integrate free cognitive Edge TTS directly into your applications'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255, 111, 0, 0.08)', borderRadius: '999px', border: '1px solid rgba(255, 111, 0, 0.2)' }}>
            <Sparkles size={14} color="var(--primary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>PDR Power Mode</span>
          </div>
        </header>

        {activeTab === 'studio' && renderStudioTab()}
        {activeTab === 'presets' && renderPresetsTab()}
        {activeTab === 'clips' && renderClipsTab()}
        {activeTab === 'acoustic' && renderAcousticTab()}
        {activeTab === 'api' && renderApiTab()}
        
        <audio 
          ref={audioRef} 
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onAudioEnded}
          crossOrigin="anonymous"
          style={{ display: 'none' }}
        />
        
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 0', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>© {new Date().getFullYear()} Telugu States Official AI. All rights reserved.</span>
          <span>Powered by Microsoft Neural Speech Technology</span>
        </footer>
      </main>
    </div>
  );
}
