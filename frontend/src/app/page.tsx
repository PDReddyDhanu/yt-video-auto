'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Loader2, 
  Sparkles, 
  FolderOpen, 
  RefreshCw,
  Image as ImageIcon,
  Music as AudioIcon,
  Video as VideoIcon,
  Download,
  ExternalLink,
  LogOut,
  Plus,
  Mic,
  Type
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function StudioPage() {
  // Config & Data
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [watermark, setWatermark] = useState<any>({
    filename: 'default_watermark.png',
    position: 'bottom-right',
    size: 180,
    opacity: 0.6,
    margin: 40
  });

  // User Selections
  const [selectedBgId, setSelectedBgId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageScale, setImageScale] = useState<number>(90); // default 90% width scale
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Movable Watermark State
  const [enableMovable, setEnableMovable] = useState<boolean>(true); // always true/compulsory
  const [movableFile, setMovableFile] = useState<File | null>(null);
  const [movableUrl, setMovableUrl] = useState<string>(`${BACKEND_URL}/uploads/ChatGPT%20Image%20Jun%2017,%202026,%2003_36_57%20AM.png`);
  const [movableX, setMovableX] = useState<number>(4); // initial X percentage
  const [movableY, setMovableY] = useState<number>(83); // initial Y percentage
  const [movableScale, setMovableScale] = useState<number>(91.78571428571428); // initial width scale
  const [cropTop, setCropTop] = useState<number>(32); // default crop values
  const [cropBottom, setCropBottom] = useState<number>(30); // default crop values
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [movableAspectRatio, setMovableAspectRatio] = useState<number>(5.3); // default banner is ~5.32 aspect ratio
  
  // Movable Watermark 2 State (Optional / Toggleable)
  const [showMovable2, setShowMovable2] = useState<boolean>(false);
  const [movable2Url, setMovable2Url] = useState<string>(`${BACKEND_URL}/uploads/watermark2p.png`);
  const [movable2X, setMovable2X] = useState<number>(75); // initial X percentage (top right corner)
  const [movable2Y, setMovable2Y] = useState<number>(5); // initial Y percentage
  const [movable2Scale, setMovable2Scale] = useState<number>(20); // initial width scale (20%)
  const [crop2Top, setCrop2Top] = useState<number>(0);
  const [crop2Bottom, setCrop2Bottom] = useState<number>(0);
  const [crop2Left, setCrop2Left] = useState<number>(0);
  const [crop2Right, setCrop2Right] = useState<number>(0);
  const [movable2AspectRatio, setMovable2AspectRatio] = useState<number>(1.0); // loaded dynamically

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'tl' | 'tr' | 'bl' | 'br' | null

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const dragTarget = useRef<'wm1' | 'wm2'>('wm1');

  // Preview Synced Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [previewProgress, setPreviewProgress] = useState<number>(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);

  // Render & Export State
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  const [generationError, setGenerationError] = useState<string>('');
  const [outputVideoUrl, setOutputVideoUrl] = useState<string>('');
  const [outputVideoFilename, setOutputVideoFilename] = useState<string>('');

  // Google Drive State
  const [driveConfig, setDriveConfig] = useState<any>({ isConfigured: false, isAuthenticated: false });
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
  const [driveUploadStatus, setDriveUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'failed'>('idle');
  const [driveUploadLink, setDriveUploadLink] = useState<string>('');
  const [driveError, setDriveError] = useState<string>('');
  const [driveFileId, setDriveFileId] = useState<string>('');
  const [driveLink, setDriveLink] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Caption/Subtitle State
  interface CaptionSegment {
    id: string;
    start: number;
    end: number;
    text: string;
  }
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionError, setTranscriptionError] = useState<string>('');

  // TTS Pro Voice Presets (Microsoft Edge Neural — te-IN context)
  const TTS_PRESETS = [
    { id: 'FM1', label: 'Emma', tag: 'Super', gender: 'F', voiceId: 'en-US-EmmaMultilingualNeural',   pitchCycles: [-4, -8, -15] },
    { id: 'FM2', label: 'Vivienne', tag: '',  gender: 'F', voiceId: 'fr-FR-VivienneMultilingualNeural', pitchCycles: [-4, -8] },
    { id: 'FM3', label: 'Seraphina', tag: '', gender: 'F', voiceId: 'de-DE-SeraphinaMultilingualNeural', pitchCycles: [-4, -8] },
    { id: 'MV1', label: 'Brian',     tag: '',          gender: 'M', voiceId: 'en-US-BrianMultilingualNeural',   pitchCycles: [4, 8] },
    { id: 'MV2', label: 'Remy',      tag: 'Super Good', gender: 'M', voiceId: 'fr-FR-RemyMultilingualNeural',   pitchCycles: [4, 8] },
    { id: 'MV3', label: 'Giuseppe',  tag: '',          gender: 'M', voiceId: 'it-IT-GiuseppeMultilingualNeural', pitchCycles: [4, 8] },
  ] as const;
  const TTS_FIXED_SPEED = 1.65;

  // TTS (Text-to-Speech) State
  const [ttsScript, setTtsScript] = useState<string>('');
  const [tenglishScript, setTenglishScript] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('FM1');
  const [pitchCycleIndex, setPitchCycleIndex] = useState<Record<string, number>>({});
  const [isGeneratingTTS, setIsGeneratingTTS] = useState<boolean>(false);
  const [ttsError, setTtsError] = useState<string>('');

  // Word-level sync captions
  interface WordTimestamp { word: string; start: number; end: number; }
  const [wordTimestamps, setWordTimestamps] = useState<WordTimestamp[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(-1);

  // Helpers
  const [, setTtsVoices] = useState<any[]>([]); // fetchTTSVoices compat (voices embedded as presets above)
  const selectedVoiceId = TTS_PRESETS.find(p => p.id === selectedPresetId)?.voiceId ?? 'en-US-EmmaMultilingualNeural';
  const ttsSpeed = TTS_FIXED_SPEED;
  const getCurrentPitch = (presetId: string) => {
    const preset = TTS_PRESETS.find(p => p.id === presetId);
    if (!preset) return 0;
    const idx = pitchCycleIndex[presetId] ?? 0;
    return preset.pitchCycles[idx % preset.pitchCycles.length];
  };
  const cyclePresetPitch = (presetId: string) => {
    const preset = TTS_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const idx = (pitchCycleIndex[presetId] ?? 0);
    setPitchCycleIndex(prev => ({ ...prev, [presetId]: (idx + 1) % preset.pitchCycles.length }));
  };

  // Refs for Synced Playback
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch templates, watermark config, and Drive status on load
  useEffect(() => {
    fetchBackgrounds();
    fetchWatermark();
    checkGoogleAuth();
    fetchTTSVoices();
  }, []);

  // Update movable watermark aspect ratio when image URL changes
  useEffect(() => {
    if (!movableUrl) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setMovableAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = movableUrl;
  }, [movableUrl]);

  // Update second movable watermark aspect ratio when image URL changes
  useEffect(() => {
    if (!movable2Url) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setMovable2AspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = movable2Url;
  }, [movable2Url]);

  const fetchBackgrounds = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/backgrounds`);
      if (res.ok) {
        const data = await res.json();
        setBackgrounds(data);
        if (data.length > 0) {
          setSelectedBgId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch background templates:', e);
    }
  };

  const fetchWatermark = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/watermark`);
      if (res.ok) {
        const data = await res.json();
        setWatermark(data);
      }
    } catch (e) {
      console.error('Failed to fetch watermark config:', e);
    }
  };

  const fetchTTSVoices = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tts/voices`);
      if (res.ok) {
        const data = await res.json();
        // Merge all voice lists (te-IN + en-US)
        const allVoices: any[] = [...(data['te-IN'] || []), ...(data['en-US'] || [])];
        setTtsVoices(allVoices);
      }
    } catch (e) {
      console.error('Failed to fetch TTS voices:', e);
    }
  };

  const handleGenerateTTS = async () => {
    if (!ttsScript.trim()) {
      setTtsError('Please type a script to generate audio.');
      return;
    }
    setIsGeneratingTTS(true);
    setTtsError('');
    const currentPitch = getCurrentPitch(selectedPresetId);
    try {
      const res = await fetch(`${BACKEND_URL}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsScript.trim(),
          voice_id: selectedVoiceId,
          speed: ttsSpeed,
          pitch: currentPitch
        })
      });
      // Advance pitch cycle for next click
      cyclePresetPitch(selectedPresetId);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'TTS generation failed.');
      }
      const data = await res.json();

      // Fetch the generated audio and create an object URL
      const audioRes = await fetch(`${BACKEND_URL}${data.url}`);
      const blob = await audioRes.blob();
      const generatedFile = new File([blob], data.filename, { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(blob);

      // Auto-load into audio state
      setAudioFile(generatedFile);
      setAudioUrl(objectUrl);

      // Get real audio duration
      const audioDurationValue: number = await new Promise(resolve => {
        const tmp = new Audio(objectUrl);
        tmp.onloadedmetadata = () => resolve(tmp.duration);
        tmp.onerror = () => resolve(30); // fallback 30s
      });
      setAudioDuration(audioDurationValue);

      // ── Word-level timestamps from TTS engine ──────────────────────────
      const words: WordTimestamp[] = data.word_timestamps || [];
      console.log(`[TTS Caption] word_timestamps received: ${words.length} words`, words.slice(0, 5));

      const captionText = tenglishScript.trim() || ttsScript.trim();
      const captionWords = captionText
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);

      let alignedWords: WordTimestamp[] = [];
      if (words.length > 0 && captionWords.length > 0) {
        const numSource = words.length;
        const numDest = captionWords.length;
        if (numSource === numDest) {
          alignedWords = captionWords.map((word, idx) => ({
            word,
            start: words[idx].start,
            end: words[idx].end
          }));
        } else {
          alignedWords = captionWords.map((word, idx) => {
            const srcIdx = numDest > 1 ? Math.min(numSource - 1, Math.round(idx * (numSource - 1) / (numDest - 1))) : 0;
            return {
              word,
              start: words[srcIdx].start,
              end: words[srcIdx].end
            };
          });
        }
      } else if (captionWords.length > 0) {
        console.warn('[TTS Caption] No word timestamps — using proportional fallback captions (word by word)');
        const totalChars = captionWords.reduce((acc, w) => acc + w.length, 0) || 1;
        let elapsed = 0;
        alignedWords = captionWords.map((word) => {
          const ratio = word.length / totalChars;
          const dur = ratio * audioDurationValue;
          const start = parseFloat(elapsed.toFixed(3));
          elapsed += dur;
          const end = parseFloat(elapsed.toFixed(3));
          return { word, start, end };
        });
      }

      setWordTimestamps(alignedWords);
      setCurrentWordIdx(-1);

      // Build caption segments from alignedWords
      const newCaptions = alignedWords.map((w, idx) => ({
        id: `cap-tts-${Date.now()}-${idx}`,
        start: w.start,
        end: w.end,
        text: w.word
      }));
      setCaptions(newCaptions);
      console.log(`[TTS Caption] Built ${newCaptions.length} word-by-word captions`);
    } catch (err: any) {
      console.error('[TTS]', err);
      setTtsError(err.message || 'TTS generation failed.');
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const checkGoogleAuth = async () => {
    try {
      setIsAuthLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/auth/status`);
      if (res.ok) {
        const data = await res.json();
        setDriveConfig(data);
        if (data.isAuthenticated) {
          await fetchFolders();
        }
      }
    } catch (e) {
      console.error('Failed to check Google auth status:', e);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST'
      });
      if (res.ok) {
        setDriveConfig((prev: any) => ({ ...prev, isAuthenticated: false }));
      }
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/drive/folders`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (e) {
      console.error('Failed to fetch Google Drive folders:', e);
    }
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl(URL.createObjectURL(file));
      // Reset play state
      pausePreview();
    }
  };

  // Audio Upload handler + duration probing
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Load audio in temp element to get duration
      const tempAudio = new Audio(url);
      tempAudio.addEventListener('loadedmetadata', () => {
        setAudioDuration(tempAudio.duration);
      });
      // Reset play state
      pausePreview();
    }
  };

  // Movable Watermark Image Upload Handler
  const handleMovableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMovableFile(file);
      if (movableUrl) URL.revokeObjectURL(movableUrl);
      setMovableUrl(URL.createObjectURL(file));
      setEnableMovable(true); // Auto-enable when uploaded
    }
  };

  // Movable Watermark Dragging Logic (Supports wm1 and wm2)
  const handleMovableMouseDown = (e: React.MouseEvent<HTMLDivElement>, target: 'wm1' | 'wm2') => {
    e.preventDefault();
    dragTarget.current = target;
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = target === 'wm1' ? movableX : movable2X;
      const currentY = target === 'wm1' ? movableY : movable2Y;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left: (currentX / 100) * rect.width,
        top: (currentY / 100) * rect.height
      };
    }
  };

  const handleMovableTouchStart = (e: React.TouchEvent<HTMLDivElement>, target: 'wm1' | 'wm2') => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    dragTarget.current = target;
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = target === 'wm1' ? movableX : movable2X;
      const currentY = target === 'wm1' ? movableY : movable2Y;
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        left: (currentX / 100) * rect.width,
        top: (currentY / 100) * rect.height
      };
    }
  };

  // Movable Watermark Resizing Logic (Supports wm1 and wm2)
  const handleResizeStart = (e: React.MouseEvent, corner: string, target: 'wm1' | 'wm2') => {
    e.stopPropagation();
    e.preventDefault();
    dragTarget.current = target;
    setIsResizing(corner);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentScale = target === 'wm1' ? movableScale : movable2Scale;
      const currentX = target === 'wm1' ? movableX : movable2X;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left: (currentScale / 100) * rect.width, // start width
        top: (currentX / 100) * rect.width // start position X
      };
    }
  };

  const handleResizeTouchStart = (e: React.TouchEvent, corner: string, target: 'wm1' | 'wm2') => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    e.stopPropagation();
    dragTarget.current = target;
    setIsResizing(corner);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentScale = target === 'wm1' ? movableScale : movable2Scale;
      const currentX = target === 'wm1' ? movableX : movable2X;
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        left: (currentScale / 100) * rect.width, // start width
        top: (currentX / 100) * rect.width // start position X
      };
    }
  };

  // Dynamic layout calculations for movable watermark 1 cropping
  const scaleX = 1 - (cropLeft + cropRight) / 100;
  const scaleY = 1 - (cropTop + cropBottom) / 100;
  const croppedAspectRatio = movableAspectRatio * (scaleX / Math.max(0.01, scaleY));
  const movableHeightPct = (1080 / 1920) * movableScale / croppedAspectRatio;

  // Dynamic layout calculations for movable watermark 2 cropping
  const scale2X = 1 - (crop2Left + crop2Right) / 100;
  const scale2Y = 1 - (crop2Top + crop2Bottom) / 100;
  const croppedAspectRatio2 = movable2AspectRatio * (scale2X / Math.max(0.01, scale2Y));
  const movable2HeightPct = (1080 / 1920) * movable2Scale / croppedAspectRatio2;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isDragging) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;

        let newLeft = dragStart.current.left + deltaX;
        let newTop = dragStart.current.top + deltaY;

        let newX = (newLeft / rect.width) * 100;
        let newY = (newTop / rect.height) * 100;

        if (dragTarget.current === 'wm1') {
          newX = Math.max(0, Math.min(100 - movableScale, newX));
          newY = Math.max(0, Math.min(100 - movableHeightPct, newY));
          setMovableX(newX);
          setMovableY(newY);
        } else {
          newX = Math.max(0, Math.min(100 - movable2Scale, newX));
          newY = Math.max(0, Math.min(100 - movable2HeightPct, newY));
          setMovable2X(newX);
          setMovable2Y(newY);
        }
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x;
        let newWidth = dragStart.current.left;

        if (isResizing === 'br' || isResizing === 'tr') {
          newWidth = dragStart.current.left + deltaX;
        } else if (isResizing === 'bl' || isResizing === 'tl') {
          newWidth = dragStart.current.left - deltaX;
          let newX = ((dragStart.current.top + deltaX) / rect.width) * 100;
          if (dragTarget.current === 'wm1') {
            setMovableX(Math.max(0, Math.min(100 - movableScale, newX)));
          } else {
            setMovable2X(Math.max(0, Math.min(100 - movable2Scale, newX)));
          }
        }

        let newScale = (newWidth / rect.width) * 100;
        newScale = Math.max(5, Math.min(100, newScale));
        if (dragTarget.current === 'wm1') {
          setMovableScale(newScale);
        } else {
          setMovable2Scale(newScale);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();

      if (isDragging) {
        const deltaX = touch.clientX - dragStart.current.x;
        const deltaY = touch.clientY - dragStart.current.y;

        let newLeft = dragStart.current.left + deltaX;
        let newTop = dragStart.current.top + deltaY;

        let newX = (newLeft / rect.width) * 100;
        let newY = (newTop / rect.height) * 100;

        if (dragTarget.current === 'wm1') {
          newX = Math.max(0, Math.min(100 - movableScale, newX));
          newY = Math.max(0, Math.min(100 - movableHeightPct, newY));
          setMovableX(newX);
          setMovableY(newY);
        } else {
          newX = Math.max(0, Math.min(100 - movable2Scale, newX));
          newY = Math.max(0, Math.min(100 - movable2HeightPct, newY));
          setMovable2X(newX);
          setMovable2Y(newY);
        }
      } else if (isResizing) {
        const deltaX = touch.clientX - dragStart.current.x;
        let newWidth = dragStart.current.left;

        if (isResizing === 'br' || isResizing === 'tr') {
          newWidth = dragStart.current.left + deltaX;
        } else if (isResizing === 'bl' || isResizing === 'tl') {
          newWidth = dragStart.current.left - deltaX;
          let newX = ((dragStart.current.top + deltaX) / rect.width) * 100;
          if (dragTarget.current === 'wm1') {
            setMovableX(Math.max(0, Math.min(100 - movableScale, newX)));
          } else {
            setMovable2X(Math.max(0, Math.min(100 - movable2Scale, newX)));
          }
        }

        let newScale = (newWidth / rect.width) * 100;
        newScale = Math.max(5, Math.min(100, newScale));
        if (dragTarget.current === 'wm1') {
          setMovableScale(newScale);
        } else {
          setMovable2Scale(newScale);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, movableScale, movableX, movableY, movableHeightPct, movable2Scale, movable2X, movable2Y, movable2HeightPct]);

  // Synchronized Preview Controls
  const togglePlay = () => {
    if (isPlaying) {
      pausePreview();
    } else {
      playPreview();
    }
  };

  const playPreview = () => {
    setIsPlaying(true);
    if (videoRef.current) videoRef.current.play().catch(err => console.warn(err));
    if (audioRef.current && audioUrl) audioRef.current.play().catch(err => console.warn(err));
  };

  const pausePreview = () => {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  // Video looping / end of audio handling
  const handleVideoEnded = () => {
    if (!audioFile) {
      // Loop background video indefinitely if no audio is uploaded
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => console.warn(err));
      }
      return;
    }

    const currentAudioTime = audioRef.current ? audioRef.current.currentTime : 0;
    if (currentAudioTime < audioDuration) {
      // Audio is still playing, loop background video
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => console.warn(err));
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setPreviewCurrentTime(current);
      setPreviewProgress((current / audioDuration) * 100);
      // Word-level sync: find which word is currently being spoken
      if (wordTimestamps.length > 0) {
        const idx = wordTimestamps.findIndex(w => current >= w.start && current < w.end);
        setCurrentWordIdx(idx);
      }
    }
  };

  const handleAudioEnded = () => {
    pausePreview();
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPreviewCurrentTime(0);
    setPreviewProgress(0);
  };

  // Audio Transcription and Caption Editing Methods
  const handleAutoTranscribe = async () => {
    if (!audioFile) {
      setTranscriptionError('Please upload an audio file in Step 3 first.');
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const res = await fetch(`${BACKEND_URL}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to transcribe audio.');
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        const wordLevelSegments: any[] = [];
        data.forEach((seg: any, sIdx: number) => {
          const start = typeof seg.start === 'number' ? seg.start : parseFloat(seg.start) || 0;
          const end = typeof seg.end === 'number' ? seg.end : parseFloat(seg.end) || 0;
          const text = (seg.text || '').trim();
          const words = text.split(/\s+/).map((w: string) => w.trim()).filter((w: string) => w.length > 0);
          
          if (words.length === 0) return;
          
          const segmentDuration = end - start;
          const totalChars = words.reduce((acc: number, w: string) => acc + w.length, 0) || 1;
          
          let elapsed = start;
          words.forEach((word: string, wIdx: number) => {
            const ratio = word.length / totalChars;
            const dur = ratio * segmentDuration;
            const wStart = parseFloat(elapsed.toFixed(3));
            elapsed += dur;
            const wEnd = parseFloat(elapsed.toFixed(3));
            wordLevelSegments.push({
              id: `cap-${Date.now()}-${sIdx}-${wIdx}-${Math.round(Math.random() * 1000)}`,
              start: wStart,
              end: wEnd,
              text: word
            });
          });
        });
        setCaptions(wordLevelSegments);
        
        // Also populate wordTimestamps so timing works consistently for single word preview
        const transWordTimestamps = wordLevelSegments.map(c => ({
          word: c.text,
          start: c.start,
          end: c.end
        }));
        setWordTimestamps(transWordTimestamps);
      } else {
        throw new Error('Invalid transcription response format.');
      }
    } catch (err: any) {
      console.error(err);
      setTranscriptionError(err.message || 'An error occurred during transcription.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAddCaptionSegment = () => {
    let start = 0;
    if (captions.length > 0) {
      start = captions[captions.length - 1].end;
    } else {
      start = previewCurrentTime;
    }
    const newSeg = {
      id: `cap-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      start: parseFloat(start.toFixed(2)),
      end: parseFloat((start + 2.5).toFixed(2)),
      text: 'New Caption'
    };
    setCaptions([...captions, newSeg].sort((a, b) => a.start - b.start));
  };

  const handleUpdateCaptionSegment = (id: string, field: string, value: any) => {
    setCaptions(prev => prev.map(c => {
      if (c.id === id) {
        let parsedVal = value;
        if (field === 'start' || field === 'end') {
          parsedVal = parseFloat(value);
          if (isNaN(parsedVal)) parsedVal = 0;
        }
        return { ...c, [field]: parsedVal };
      }
      return c;
    }).sort((a, b) => a.start - b.start));
  };

  const handleDeleteCaptionSegment = (id: string) => {
    setCaptions(prev => prev.filter(c => c.id !== id));
  };

  const handleClearAllCaptions = () => {
    setCaptions([]);
  };

  // Video Generation Form Submission
  const handleGenerateVideo = async () => {
    if (!selectedBgId || !imageFile || !audioFile) return;

    setGenerationStatus('uploading');
    setGenerationError('');
    setDriveFileId('');
    setDriveLink('');

    const formData = new FormData();
    formData.append('bgId', selectedBgId);
    formData.append('image', imageFile);
    formData.append('audio', audioFile);
    formData.append('folderId', selectedFolderId);

    // Movable watermark is compulsory mandatory and uses the permanent default image
    formData.append('showMovable', 'true');
    formData.append('movableX', movableX.toString());
    formData.append('movableY', movableY.toString());
    formData.append('movableScale', movableScale.toString());
    formData.append('cropTop', cropTop.toString());
    formData.append('cropBottom', cropBottom.toString());
    formData.append('cropLeft', cropLeft.toString());
    formData.append('cropRight', cropRight.toString());
    if (movableFile) {
      formData.append('movableWatermark', movableFile);
    }

    // Movable watermark 2 (Optional)
    formData.append('showMovable2', showMovable2.toString());
    formData.append('movable2X', movable2X.toString());
    formData.append('movable2Y', movable2Y.toString());
    formData.append('movable2Scale', movable2Scale.toString());
    formData.append('crop2Top', crop2Top.toString());
    formData.append('crop2Bottom', crop2Bottom.toString());
    formData.append('crop2Left', crop2Left.toString());
    formData.append('crop2Right', crop2Right.toString());

    formData.append('imageScale', imageScale.toString());
    formData.append('captions', JSON.stringify(captions));

    try {
      // Simulate transition to processing because large uploads are quick, then render takes time
      const uploadTimeout = setTimeout(() => {
        setGenerationStatus('processing');
      }, 1500);

      const res = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        body: formData
      });

      clearTimeout(uploadTimeout);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Rendering failed');
      }

      const data = await res.json();
      setDriveFileId(data.driveFileId);
      setDriveLink(data.driveLink);
      setGenerationStatus('completed');
    } catch (e: any) {
      console.error(e);
      setGenerationError(e.message || 'An error occurred during video generation.');
      setGenerationStatus('failed');
    }
  };

  // Google OAuth Popup Authentication
  const handleGoogleConnect = () => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `${BACKEND_URL}/api/auth/google/login`,
      'GoogleAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0`
    );

    const checkPopupClosed = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(checkPopupClosed);
        // Popup closed, check authentication status
        await checkGoogleAuth();
      }
    }, 1000);
  };

  // Upload final video to Google Drive
  const handleSaveToDrive = async () => {
    if (!outputVideoFilename) return;

    setDriveUploadStatus('uploading');
    setDriveError('');
    setDriveUploadLink('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/drive/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: outputVideoFilename,
          folderId: selectedFolderId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload file');
      }

      const data = await res.json();
      setDriveUploadLink(data.link);
      setDriveUploadStatus('completed');
    } catch (e: any) {
      console.error(e);
      setDriveError(e.message || 'Google Drive upload failed.');
      setDriveUploadStatus('failed');
    }
  };

  // Get watermark overlay coordinates style for simulation preview
  const getWatermarkPositionStyle = () => {
    const margin = `${(watermark.margin / 1080) * 100}%`; // scale margin percentage relative to standard portrait frame
    const width = `${(watermark.size / 1080) * 100}%`; // scale size relative to standard portrait frame

    const base = {
      position: 'absolute' as const,
      width: width,
      opacity: watermark.opacity,
      transition: 'all 0.2s ease',
      pointerEvents: 'none' as const
    };

    switch (watermark.position) {
      case 'top-left':
        return { ...base, top: margin, left: margin };
      case 'top-right':
        return { ...base, top: margin, right: margin };
      case 'bottom-left':
        return { ...base, bottom: margin, left: margin };
      case 'bottom-right':
      default:
        return { ...base, bottom: margin, right: margin };
    }
  };

  const selectedBg = backgrounds.find(b => b.id === selectedBgId);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">Validating system authentication...</p>
      </div>
    );
  }

  if (!driveConfig.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 relative flex items-center justify-center overflow-hidden px-4">
        {/* Background gradient glow blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md relative z-10 flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-6">
            <Sparkles className="h-6 w-6" />
          </div>

          <h1 className="bg-gradient-to-r from-amber-100 via-orange-200 to-blue-200 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl text-center">
            AutoVideo Studio
          </h1>
          <p className="mt-2.5 text-slate-400 text-xs text-center leading-relaxed max-w-[280px]">
            Please sign in with your Google account to access the video editing workspace and templates.
          </p>

          <div className="w-full my-8 border-t border-slate-850" />

          {driveConfig.isConfigured ? (
            <button
              onClick={handleGoogleConnect}
              className="w-full py-3 px-4 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              {/* Google icon representation */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          ) : (
            <div className="w-full p-4 border border-amber-500/20 rounded-xl bg-amber-950/10 flex flex-col items-center text-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-400 shrink-0" />
              <p className="text-xs font-semibold text-amber-400">Google OAuth Credentials Missing</p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Please contact the system administrator to configure the API credentials in the backend `.env` file first.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const activeCaption = captions.find(c => previewCurrentTime >= c.start && previewCurrentTime <= c.end);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-amber-100 via-orange-200 to-blue-200 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Automated Video Studio
          </h1>
          <p className="mt-2 text-slate-400">
            Combine templates, images, and audio into professional portrait MP4s instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin"
            className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            System Control Center
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-xs font-semibold text-red-400 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Workspace Controls (Left side) */}
        <div className="space-y-6 lg:col-span-7 order-2 lg:order-1">
          {/* Step 1: Background Template */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                1
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Select Background Video</h2>
            </div>
            
            {backgrounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-8 text-center">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
                <p className="text-slate-400 text-sm">Generating default background templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setSelectedBgId(bg.id);
                      pausePreview();
                    }}
                    className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                      selectedBgId === bg.id
                        ? 'border-orange-500 bg-indigo-950/20 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="aspect-[9/16] w-full bg-slate-950 relative">
                      <video
                        src={`${BACKEND_URL}/uploads/${bg.filename}`}
                        muted
                        playsInline
                        className="h-full w-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-80" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <p className="text-xs font-semibold text-slate-100 truncate">{bg.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Duration: {bg.duration.toFixed(0)}s</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Overlay Image */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                2
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Upload Center Image</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="flex flex-col items-center justify-center aspect-square rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-700 cursor-pointer transition-all group">
                  <div className="flex flex-col items-center justify-center p-5 text-center">
                    <ImageIcon className="h-8 w-8 text-slate-500 group-hover:text-orange-400 transition-colors mb-2.5" />
                    <span className="text-xs font-semibold text-slate-300">Choose Image</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG, WEBP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imageFile ? (
                <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col items-center justify-center aspect-square overflow-hidden group">
                  <img
                    src={imageUrl}
                    alt="Main overlay"
                    className="max-h-[80%] max-w-[80%] object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImageUrl('');
                      }}
                      className="rounded-lg bg-red-500/20 p-2 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 right-2 text-[10px] text-slate-400 truncate text-center">
                    {imageFile.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed border-slate-800 rounded-xl aspect-square bg-slate-950/10 text-slate-600 text-xs text-center p-4">
                  No image selected yet. Center image is overlays above the background.
                </div>
              )}
            </div>

            {imageFile && (
              <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Center Image Scale (Width)</span>
                  <span>{imageScale}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="1"
                  value={imageScale}
                  onChange={(e) => setImageScale(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Slide to adjust the center image width scale from 40% to 100% of the video canvas.
                </p>
              </div>
            )}
          </div>

          {/* Step 3: Soundtrack — TTS Studio or Manual Upload */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                3
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Soundtrack</h2>
            </div>

            <div className="space-y-5">
              {/* === TTS Script Studio === */}
              <div className="rounded-xl border border-orange-500/20 bg-indigo-950/10 p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-300">AI Voice Studio (Microsoft Edge TTS)</span>
                  <span className="ml-auto text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Free · Unlimited</span>
                </div>

                {/* Script textarea */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-orange-400">Telugu Script (for generating voice)</span>
                  <textarea
                    rows={4}
                    placeholder="Type your Telugu script here... (e.g.: నమస్కారం! శుభోదయం. ఈ వీడియో మీకు నచ్చుతుందని ఆశిస్తున్నాను.)"
                    value={ttsScript}
                    onChange={(e) => setTtsScript(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Tenglish Script textarea */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-orange-400">Tenglish Text box (for generating captions)</span>
                  <textarea
                    rows={4}
                    placeholder="Type your Tenglish captions script here... (e.g.: Namaskaram! Shubhodhayam. Ee video meeku nachutundhani aashistunnanu.)"
                    value={tenglishScript}
                    onChange={(e) => setTenglishScript(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Pro Voice Preset Cards */}
                <div className="space-y-2">
                  {/* Female Presets */}
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">♀ Female Pro Voices</div>
                  <div className="grid grid-cols-3 gap-2">
                    {TTS_PRESETS.filter(p => p.gender === 'F').map(preset => {
                      const isActive = selectedPresetId === preset.id;
                      const pitch = getCurrentPitch(preset.id);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            if (isActive) cyclePresetPitch(preset.id);
                            else setSelectedPresetId(preset.id);
                          }}
                          className={`relative rounded-lg border p-2.5 text-left transition-all group ${
                            isActive
                              ? 'border-pink-500/60 bg-pink-950/20 shadow-[0_0_12px_rgba(236,72,153,0.15)]'
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          }`}
                        >
                          <span className={`block text-[10px] font-bold font-mono ${isActive ? 'text-pink-300' : 'text-slate-500'}`}>{preset.id}</span>
                          <span className={`block text-xs font-semibold mt-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>{preset.label}</span>
                          {preset.tag && <span className="block text-[9px] text-amber-400 font-semibold mt-0.5">★ {preset.tag}</span>}
                          <span className={`block text-[9px] mt-1 font-mono ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                            Pitch: {pitch > 0 ? '+' : ''}{pitch}Hz
                          </span>
                          {isActive && (
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Male Presets */}
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">♂ Male Pro Voices</div>
                  <div className="grid grid-cols-3 gap-2">
                    {TTS_PRESETS.filter(p => p.gender === 'M').map(preset => {
                      const isActive = selectedPresetId === preset.id;
                      const pitch = getCurrentPitch(preset.id);
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            if (isActive) cyclePresetPitch(preset.id);
                            else setSelectedPresetId(preset.id);
                          }}
                          className={`relative rounded-lg border p-2.5 text-left transition-all group ${
                            isActive
                              ? 'border-sky-500/60 bg-sky-950/20 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                          }`}
                        >
                          <span className={`block text-[10px] font-bold font-mono ${isActive ? 'text-sky-300' : 'text-slate-500'}`}>{preset.id}</span>
                          <span className={`block text-xs font-semibold mt-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>{preset.label}</span>
                          {preset.tag && <span className="block text-[9px] text-amber-400 font-semibold mt-0.5">★ {preset.tag}</span>}
                          <span className={`block text-[9px] mt-1 font-mono ${isActive ? 'text-sky-400' : 'text-slate-600'}`}>
                            Pitch: {pitch > 0 ? '+' : ''}{pitch}Hz
                          </span>
                          {isActive && (
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DSP Badge + Speed info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[10px] text-emerald-400 font-semibold">Studio Clarity Boost</span>
                  <span className="text-[9px] text-slate-500 ml-auto">DSP: 7-band EQ · HP 80Hz · Locked</span>
                  <span className="text-[10px] font-mono text-orange-300 ml-2">1.65×</span>
                </div>

                <p className="text-[9px] text-slate-600 text-center">
                  Tap a preset to select · Tap again to cycle pitch variant
                </p>

                {ttsError && (
                  <p className="text-[11px] text-red-400 bg-red-950/20 border border-red-500/20 p-2 rounded-lg flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{ttsError}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTTS || !ttsScript.trim()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 transition-colors"
                >
                  {isGeneratingTTS ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Generating Audio + Captions...</>
                  ) : (
                    <><Mic className="h-4 w-4" />Generate Audio & Auto-Fill Captions</>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  💡 The script is automatically split into caption segments and synced with the generated audio.
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] font-semibold text-slate-500">OR UPLOAD MANUALLY</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Manual Upload */}
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-700 cursor-pointer transition-all p-5 text-center group">
                <AudioIcon className="h-7 w-7 text-slate-500 group-hover:text-orange-400 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-300">Choose Audio File</span>
                <span className="text-[10px] text-slate-500 mt-1">MP3, WAV, AAC (Determines final video duration)</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                />
              </label>

              {audioFile && (
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-3 truncate">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-orange-400">
                      <AudioIcon className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">{audioFile.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Duration: {audioDuration.toFixed(1)}s (timeline master)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAudioFile(null);
                      setAudioUrl('');
                      setAudioDuration(0);
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-900 hover:text-red-400 transition-colors border border-transparent hover:border-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Step 4: Bottom Banner / Watermark */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                  4
                </div>
                <h2 className="text-lg font-semibold text-slate-200">Bottom Banner / Watermark</h2>
              </div>
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-850 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 relative">
                <img
                  src={movableUrl}
                  alt="Movable preview"
                  className="max-h-[120px] object-contain rounded"
                />
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  ChatGPT Image Jun 17, 2026, 03_36_57 AM.png (Default Banner)
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                    <span>Banner Size (Width)</span>
                    <span>{movableScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={movableScale}
                    onChange={(e) => setMovableScale(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>Coordinates: X: {movableX.toFixed(0)}% • Y: {movableY.toFixed(0)}%</span>
                  <button
                    onClick={() => {
                      setMovableX(4);
                      setMovableY(83);
                    }}
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                  >
                    Reset Position
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/60 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-300 block">Crop Watermark Margins</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Crop Top</span>
                        <span>{cropTop}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={cropTop}
                        onChange={(e) => setCropTop(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Crop Bottom</span>
                        <span>{cropBottom}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={cropBottom}
                        onChange={(e) => setCropBottom(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Crop Left</span>
                        <span>{cropLeft}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={cropLeft}
                        onChange={(e) => setCropLeft(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Crop Right</span>
                        <span>{cropRight}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="1"
                        value={cropRight}
                        onChange={(e) => setCropRight(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500">Crop out white space to make positioning easier</span>
                    <button
                      onClick={() => {
                        setCropTop(0);
                        setCropBottom(0);
                        setCropLeft(0);
                        setCropRight(0);
                      }}
                      className="text-[10px] text-slate-400 hover:text-orange-400 underline font-medium transition-colors"
                    >
                      Reset Crop
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                  💡 <strong>Tip:</strong> Drag the banner layer directly on the Live Output Simulation player to place it anywhere (e.g. center at the bottom).
                </p>
              </div>

              {/* Watermark 2 settings card */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enableMovable2"
                      checked={showMovable2}
                      onChange={(e) => setShowMovable2(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="enableMovable2" className="text-xs font-bold text-slate-200 cursor-pointer select-none">
                      Enable Watermark Layer 2 (watermark2p.png)
                    </label>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${showMovable2 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-transparent'}`}>
                    {showMovable2 ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                {showMovable2 && (
                  <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4 relative">
                      <img
                        src={movable2Url}
                        alt="Watermark 2 Preview"
                        className="max-h-[120px] object-contain rounded"
                      />
                      <span className="text-[10px] text-slate-500 mt-2 font-mono">
                        watermark2p.png (Default Watermark 2)
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                          <span>Watermark 2 Size (Width)</span>
                          <span>{movable2Scale}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="1"
                          value={movable2Scale}
                          onChange={(e) => setMovable2Scale(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>Coordinates: X: {movable2X.toFixed(0)}% • Y: {movable2Y.toFixed(0)}%</span>
                        <button
                          onClick={() => {
                            setMovable2X(75);
                            setMovable2Y(5);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                        >
                          Reset Position
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 space-y-2.5">
                        <span className="text-[11px] font-bold text-slate-300 block">Crop Watermark 2 Margins</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Crop Top</span>
                              <span>{crop2Top}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="80"
                              step="1"
                              value={crop2Top}
                              onChange={(e) => setCrop2Top(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Crop Bottom</span>
                              <span>{crop2Bottom}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="80"
                              step="1"
                              value={crop2Bottom}
                              onChange={(e) => setCrop2Bottom(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Crop Left</span>
                              <span>{crop2Left}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="80"
                              step="1"
                              value={crop2Left}
                              onChange={(e) => setCrop2Left(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Crop Right</span>
                              <span>{crop2Right}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="80"
                              step="1"
                              value={crop2Right}
                              onChange={(e) => setCrop2Right(parseInt(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 font-medium">Position Watermark 2 freely anywhere</span>
                          <button
                            onClick={() => {
                              setCrop2Top(0);
                              setCrop2Bottom(0);
                              setCrop2Left(0);
                              setCrop2Right(0);
                            }}
                            className="text-[10px] text-slate-400 hover:text-emerald-400 underline font-medium transition-colors"
                          >
                            Reset Crop
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 5: Dynamic Captions (Optional) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                  5
                </div>
                <h2 className="text-lg font-semibold text-slate-200">Dynamic Captions (Optional)</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleAutoTranscribe}
                  disabled={isTranscribing || !audioFile}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-orange-500/30 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Transcribing Audio...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Auto-Transcribe with Gemini
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAddCaptionSegment}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Caption
                </button>

                {captions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllCaptions}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 font-semibold text-xs transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {!audioFile && (
                <p className="text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg">
                  ⚠️ <strong>Note:</strong> You must upload a soundtrack in Step 3 before using auto-transcription.
                </p>
              )}

              {transcriptionError && (
                <p className="text-[11px] text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg flex items-start gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{transcriptionError}</span>
                </p>
              )}

              {captions.length > 0 && (
                <div className="space-y-2.5">
                  <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/50 p-2 space-y-2 custom-scrollbar">
                    {captions.map((caption, idx) => (
                      <div
                        key={caption.id}
                        className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-slate-500">Start:</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={caption.start}
                                onChange={(e) => handleUpdateCaptionSegment(caption.id, 'start', e.target.value)}
                                className="w-14 rounded border border-slate-800 bg-slate-950 px-1 py-0.5 text-[10px] font-mono text-slate-300 focus:border-orange-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-slate-500">End:</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={caption.end}
                                onChange={(e) => handleUpdateCaptionSegment(caption.id, 'end', e.target.value)}
                                className="w-14 rounded border border-slate-800 bg-slate-950 px-1 py-0.5 text-[10px] font-mono text-slate-300 focus:border-orange-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCaptionSegment(caption.id)}
                              className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          value={caption.text}
                          onChange={(e) => handleUpdateCaptionSegment(caption.id, 'text', e.target.value)}
                          placeholder="Caption text..."
                          className="w-full rounded border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                    💡 <strong>Tip:</strong> Timestamps are in seconds. The simulator dynamically highlights the active caption during playback and bounces it with a CSS animation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Simulation Preview & Export (Right side) */}
        <div className="lg:col-span-5 space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col items-center">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 self-start flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400" />
              Live Output Simulation
            </h2>

            {/* Simulating Portrait Player 9:16 */}
            <div ref={containerRef} className="relative aspect-[9/16] w-full max-w-[280px] rounded-2xl overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80">
              
              {/* Background Video */}
              {selectedBg ? (
                <video
                  ref={videoRef}
                  src={`${BACKEND_URL}/uploads/${selectedBg.filename}`}
                  muted
                  playsInline
                  onEnded={handleVideoEnded}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-slate-950 flex items-center justify-center text-slate-600 text-xs">
                  Select background
                </div>
              )}

              {/* Centered Main Image overlay */}
              {imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={imageUrl}
                    alt="Simulation main layer"
                    style={{
                      maxWidth: `${imageScale}%`,
                      maxHeight: `${imageScale * (1760/1080)}%`,
                      objectFit: 'contain'
                    }}
                    className="rounded shadow-lg"
                  />
                </div>
              )}

              {/* Movable Watermark overlay */}
              {enableMovable && movableUrl && (
                <div
                  onMouseDown={(e) => handleMovableMouseDown(e, 'wm1')}
                  onTouchStart={(e) => handleMovableTouchStart(e, 'wm1')}
                  style={{
                    position: 'absolute',
                    left: `${movableX}%`,
                    top: `${movableY}%`,
                    width: `${movableScale}%`,
                    opacity: 0.9,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                    zIndex: 40,
                    border: '1.5px dashed #FF9100',
                    padding: '2px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    transition: (isDragging || isResizing) ? 'none' : 'left 0.1s ease, top 0.1s ease, width 0.1s ease'
                  }}
                  className="group/watermark"
                >
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', aspectRatio: croppedAspectRatio }}>
                    <img
                      src={movableUrl}
                      alt="Movable Watermark"
                      style={{
                        position: 'absolute',
                        width: `${100 / Math.max(0.01, scaleX)}%`,
                        height: `${100 / Math.max(0.01, scaleY)}%`,
                        left: `-${cropLeft / Math.max(0.01, scaleX)}%`,
                        top: `-${cropTop / Math.max(0.01, scaleY)}%`,
                        maxWidth: 'none',
                        maxHeight: 'none',
                        objectFit: 'fill',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  
                  {/* Corner Resize Handles */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'tl', 'wm1')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'tl', 'wm1')}
                    className="w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full absolute -top-1.75 -left-1.75 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'tr', 'wm1')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'tr', 'wm1')}
                    className="w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full absolute -top-1.75 -right-1.75 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'bl', 'wm1')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'bl', 'wm1')}
                    className="w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full absolute -bottom-1.75 -left-1.75 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'br', 'wm1')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'br', 'wm1')}
                    className="w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full absolute -bottom-1.75 -right-1.75 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                </div>
              )}

              {/* Movable Watermark 2 overlay */}
              {showMovable2 && movable2Url && (
                <div
                  onMouseDown={(e) => handleMovableMouseDown(e, 'wm2')}
                  onTouchStart={(e) => handleMovableTouchStart(e, 'wm2')}
                  style={{
                    position: 'absolute',
                    left: `${movable2X}%`,
                    top: `${movable2Y}%`,
                    width: `${movable2Scale}%`,
                    aspectRatio: movable2AspectRatio ? `${movable2AspectRatio * (1 - (crop2Left + crop2Right) / 100) / Math.max(0.01, 1 - (crop2Top + crop2Bottom) / 100)}` : 'auto',
                    overflow: 'hidden',
                    opacity: 0.9,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                    zIndex: 40,
                    border: '1.5px dashed #039BE5',
                    padding: '2px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    transition: (isDragging || isResizing) ? 'none' : 'left 0.1s ease, top 0.1s ease, width 0.1s ease, aspect-ratio 0.1s ease'
                  }}
                  className="group/watermark2"
                >
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', aspectRatio: croppedAspectRatio2 }}>
                    <img
                      src={movable2Url}
                      alt="Watermark 2"
                      style={{
                        position: 'absolute',
                        width: `${100 / Math.max(0.01, scale2X)}%`,
                        height: `${100 / Math.max(0.01, scale2Y)}%`,
                        left: `-${crop2Left / Math.max(0.01, scale2X)}%`,
                        top: `-${crop2Top / Math.max(0.01, scale2Y)}%`,
                        maxWidth: 'none',
                        maxHeight: 'none',
                        objectFit: 'fill',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                  
                  {/* Corner Resize Handles */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'tl', 'wm2')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'tl', 'wm2')}
                    className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-full absolute -top-1.75 -left-1.75 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'tr', 'wm2')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'tr', 'wm2')}
                    className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-full absolute -top-1.75 -right-1.75 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'bl', 'wm2')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'bl', 'wm2')}
                    className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-full absolute -bottom-1.75 -left-1.75 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'br', 'wm2')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'br', 'wm2')}
                    className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-full absolute -bottom-1.75 -right-1.75 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                </div>
              )}

              {/* Synced Audio Captions overlay — Word-by-Word Single Word Display */}
              {(() => {
                // If we have word-level timestamps, show single word highlighted
                if (wordTimestamps.length > 0 && currentWordIdx >= 0) {
                  const currentWord = wordTimestamps[currentWordIdx];
                  return (
                    <div className="absolute top-[4.5%] left-0 right-0 px-4 text-center pointer-events-none z-30 select-none">
                      <span
                        style={{
                          textShadow: '0px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                        }}
                        className="inline-block bg-black/45 px-2.5 py-1 rounded-md text-yellow-300 font-bold text-xs leading-snug tracking-wide border border-white/10 backdrop-blur-[1px] animate-pop"
                      >
                        {currentWord.word}
                      </span>
                    </div>
                  );
                }
                // Fallback: segment-level caption (manual upload / before TTS)
                if (activeCaption) {
                  return (
                    <div
                      key={activeCaption.id}
                      className="absolute top-[4.5%] left-0 right-0 px-4 text-center pointer-events-none z-30 select-none animate-pop"
                      style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
                    >
                      <span className="inline-block bg-black/45 px-2.5 py-1 rounded-md text-white font-bold text-xs leading-snug tracking-wide border border-white/10 backdrop-blur-[1px]">
                        {activeCaption.text}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Audio playback hidden element */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />
              )}

              {/* Interactive Player Controls inside screen */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent p-4 flex flex-col gap-2">
                
                {/* Timeline slider */}
                {audioFile && (
                  <div className="w-full space-y-1">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${previewProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                      <span>{previewCurrentTime.toFixed(1)}s</span>
                      <span>{audioDuration.toFixed(1)}s</span>
                    </div>
                  </div>
                )}

                {/* Control Bar */}
                <div className="flex justify-center">
                  <button
                    onClick={togglePlay}
                    disabled={!selectedBg}
                    className="h-9 w-9 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 fill-slate-950" /> : <Play className="h-4 w-4 fill-slate-950 ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Generation Status Console */}
            <div className="w-full mt-6 space-y-4">
              {generationStatus === 'idle' && (
                <>
                  {!driveConfig.isAuthenticated ? (
                    <div className="w-full border border-amber-500/20 rounded-xl bg-amber-950/10 p-4 text-left space-y-3">
                      <div className="flex gap-2 text-amber-400 items-start">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold">Google Drive Connection Required</p>
                          <p className="text-[10px] text-amber-400/80 mt-1 leading-relaxed">
                            Since generated videos are sent directly to Google Drive and are not stored locally, you must link your Google Account first.
                          </p>
                        </div>
                      </div>
                      {!driveConfig.isConfigured ? (
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Please configure OAuth Credentials first in the System Control Center.
                        </p>
                      ) : (
                        <button
                          onClick={handleGoogleConnect}
                          className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="h-3.5 w-3.5 animate-pulse" />
                          Connect Google Account
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Destination Folder Selector */}
                      <div className="w-full border border-slate-800 rounded-xl bg-slate-950/40 p-4 text-left space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Destination Folder</label>
                            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
                              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                              Connected
                            </span>
                          </div>
                          <div className="relative">
                            <FolderOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
                            <select
                              value={selectedFolderId}
                              onChange={(e) => setSelectedFolderId(e.target.value)}
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                            >
                              <option value="root">My Drive (Root)</option>
                              {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                  {folder.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateVideo}
                        disabled={!selectedBgId || !imageFile || !audioFile}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/15 hover:opacity-95 disabled:from-slate-800 disabled:via-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                      >
                        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Generate Video
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Rendering status indicator */}
              {(generationStatus === 'uploading' || generationStatus === 'processing') && (
                <div className="w-full border border-slate-800 rounded-xl bg-slate-950/40 p-4 text-center space-y-3">
                  <Loader2 className="h-6 w-6 text-orange-400 animate-spin mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {generationStatus === 'uploading' ? 'Uploading Media files...' : 'Rendering portrait video...'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {generationStatus === 'processing' ? 'Running FFmpeg on backend. Looping background, layering watermarks and audio...' : 'Saving temporary buffer...'}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full animate-[pulse_1.5s_infinite] w-[75%]" />
                  </div>
                </div>
              )}

              {/* Failure */}
              {generationStatus === 'failed' && (
                <div className="w-full border border-red-500/20 rounded-xl bg-red-950/10 p-4 text-left">
                  <div className="flex gap-2 text-red-400 items-start mb-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Render Failed</p>
                      <p className="text-[10px] text-red-400/80 mt-1 line-clamp-3 leading-relaxed">
                        {generationError}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateVideo}
                    className="w-full mt-2 py-2 text-xs font-medium rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Retry Render
                  </button>
                </div>
              )}

              {/* Render Completed Successfully */}
              {generationStatus === 'completed' && driveLink && (
                <div className="w-full space-y-4">
                  <div className="border border-emerald-500/20 rounded-xl bg-emerald-950/10 p-4 flex gap-3 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Video Generated & Stored on Drive!</p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5">
                        Duration: {audioDuration.toFixed(1)}s • MP4 H.264 Portrait
                      </p>
                    </div>
                  </div>

                  {/* Rendered output player inside Google Drive preview iframe */}
                  {driveFileId && (
                    <div className="border border-slate-800 rounded-xl bg-slate-950 p-2 overflow-hidden">
                      <iframe
                        src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                        className="w-full rounded-lg aspect-[9/16] bg-slate-900 max-h-[400px] border-0"
                        allow="autoplay"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      View on Google Drive
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => setGenerationStatus('idle')}
                      className="w-full py-2.5 rounded-lg border border-slate-850 bg-slate-950/30 hover:bg-slate-900 text-slate-400 text-xs font-medium transition-colors"
                    >
                      Create Another Video
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
