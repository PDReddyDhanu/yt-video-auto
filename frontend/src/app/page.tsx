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
  LogOut
} from 'lucide-react';

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
  const [enableMovable, setEnableMovable] = useState<boolean>(true);
  const [movableFile, setMovableFile] = useState<File | null>(null);
  const [movableUrl, setMovableUrl] = useState<string>('http://localhost:3001/uploads/Watermark-movable.png');
  const [movableX, setMovableX] = useState<number>(15); // initial X percentage (15%)
  const [movableY, setMovableY] = useState<number>(15); // initial Y percentage (15%)
  const [movableScale, setMovableScale] = useState<number>(20); // initial width scale (20%)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'tl' | 'tr' | 'bl' | 'br' | null

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

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

  // Refs for Synced Playback
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const BACKEND_URL = 'http://localhost:3001';

  // Fetch templates, watermark config, and Drive status on load
  useEffect(() => {
    fetchBackgrounds();
    fetchWatermark();
    checkGoogleAuth();
  }, []);

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

  // Movable Watermark Dragging Logic
  const handleMovableMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left: (movableX / 100) * rect.width,
        top: (movableY / 100) * rect.height
      };
    }
  };

  const handleMovableTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        left: (movableX / 100) * rect.width,
        top: (movableY / 100) * rect.height
      };
    }
  };

  // Movable Watermark Resizing Logic
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(corner);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left: (movableScale / 100) * rect.width, // start width
        top: (movableX / 100) * rect.width // start position X
      };
    }
  };

  const handleResizeTouchStart = (e: React.TouchEvent, corner: string) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    e.stopPropagation();
    setIsResizing(corner);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        left: (movableScale / 100) * rect.width, // start width
        top: (movableX / 100) * rect.width // start position X
      };
    }
  };

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

        newX = Math.max(0, Math.min(100 - movableScale, newX));
        newY = Math.max(0, Math.min(100 - (movableScale * (1920/1080) * 0.5), newY));

        setMovableX(newX);
        setMovableY(newY);
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x;
        let newWidth = dragStart.current.left;

        if (isResizing === 'br' || isResizing === 'tr') {
          newWidth = dragStart.current.left + deltaX;
        } else if (isResizing === 'bl' || isResizing === 'tl') {
          newWidth = dragStart.current.left - deltaX;
          let newX = ((dragStart.current.top + deltaX) / rect.width) * 100;
          setMovableX(Math.max(0, Math.min(100 - movableScale, newX)));
        }

        let newScale = (newWidth / rect.width) * 100;
        newScale = Math.max(10, Math.min(80, newScale));
        setMovableScale(newScale);
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

        newX = Math.max(0, Math.min(100 - movableScale, newX));
        newY = Math.max(0, Math.min(100 - (movableScale * (1920/1080) * 0.5), newY));

        setMovableX(newX);
        setMovableY(newY);
      } else if (isResizing) {
        const deltaX = touch.clientX - dragStart.current.x;
        let newWidth = dragStart.current.left;

        if (isResizing === 'br' || isResizing === 'tr') {
          newWidth = dragStart.current.left + deltaX;
        } else if (isResizing === 'bl' || isResizing === 'tl') {
          newWidth = dragStart.current.left - deltaX;
          let newX = ((dragStart.current.top + deltaX) / rect.width) * 100;
          setMovableX(Math.max(0, Math.min(100 - movableScale, newX)));
        }

        let newScale = (newWidth / rect.width) * 100;
        newScale = Math.max(10, Math.min(80, newScale));
        setMovableScale(newScale);
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
  }, [isDragging, isResizing, movableScale, movableX, movableY]);

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
    }
  };

  const handleAudioEnded = () => {
    pausePreview();
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPreviewCurrentTime(0);
    setPreviewProgress(0);
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

    if (enableMovable && movableFile) {
      formData.append('movableWatermark', movableFile);
      formData.append('showMovable', 'true');
      formData.append('movableX', movableX.toString());
      formData.append('movableY', movableY.toString());
      formData.append('movableScale', movableScale.toString());
    } else {
      formData.append('showMovable', 'false');
    }

    formData.append('imageScale', imageScale.toString());

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
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">Validating system authentication...</p>
      </div>
    );
  }

  if (!driveConfig.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 relative flex items-center justify-center overflow-hidden px-4">
        {/* Background gradient glow blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md relative z-10 flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
            <Sparkles className="h-6 w-6" />
          </div>

          <h1 className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl text-center">
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
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
        <div className="space-y-6 lg:col-span-7">
          {/* Step 1: Background Template */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold text-sm border border-indigo-500/20">
                1
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Select Background Video</h2>
            </div>
            
            {backgrounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 p-8 text-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
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
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500'
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold text-sm border border-indigo-500/20">
                2
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Upload Center Image</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="flex flex-col items-center justify-center aspect-square rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-700 cursor-pointer transition-all group">
                  <div className="flex flex-col items-center justify-center p-5 text-center">
                    <ImageIcon className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2.5" />
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

          {/* Step 3: Sound Track */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold text-sm border border-indigo-500/20">
                3
              </div>
              <h2 className="text-lg font-semibold text-slate-200">Upload Soundtrack</h2>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-700 cursor-pointer transition-all p-6 text-center group">
                <AudioIcon className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
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

          {/* Step 4: Movable Watermark (Optional) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-semibold text-sm border border-indigo-500/20">
                  4
                </div>
                <h2 className="text-lg font-semibold text-slate-200">Movable Watermark (Optional)</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableMovable}
                  onChange={(e) => setEnableMovable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                <span className="ml-2 text-xs font-medium text-slate-400">Enable</span>
              </label>
            </div>

            {enableMovable && (
              <div className="space-y-4 pt-2 border-t border-slate-850 animate-[fadeIn_0.2s_ease-out]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="flex flex-col items-center justify-center aspect-[2/1] sm:aspect-square rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-700 cursor-pointer transition-all group">
                      <div className="flex flex-col items-center justify-center p-3 text-center">
                        <Upload className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 transition-colors mb-1.5" />
                        <span className="text-xs font-semibold text-slate-300">Choose Watermark</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMovableChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {movableFile ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col items-center justify-center aspect-square relative group">
                      <img
                        src={movableUrl}
                        alt="Movable preview"
                        className="max-h-[85%] max-w-[85%] object-contain rounded"
                      />
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => {
                            setMovableFile(null);
                            setMovableUrl('');
                            setEnableMovable(false);
                          }}
                          className="rounded-lg bg-red-500/20 p-2 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 right-2 text-[10px] text-slate-500 truncate text-center font-mono">
                        {movableFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border border-dashed border-slate-800 rounded-xl aspect-square bg-slate-950/10 text-slate-500 text-xs text-center p-4">
                      Upload an image to place it on the screen. Drag it to reposition.
                    </div>
                  )}
                </div>

                {movableFile && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                        <span>Watermark Size (Width)</span>
                        <span>{movableScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
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
                          setMovableX(15);
                          setMovableY(15);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                      >
                        Reset Position
                      </button>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                      💡 <strong>Tip:</strong> Drag the logo layer directly on the Live Output Simulation player to place it anywhere (e.g., top-left, top-right, or on top of the center image).
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Simulation Preview & Export (Right side) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col items-center">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 self-start flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
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

              {/* Watermark Logo overlay */}
              {watermark.filename && (
                <img
                  src={`${BACKEND_URL}/uploads/${watermark.filename}`}
                  alt="Watermark"
                  style={getWatermarkPositionStyle()}
                />
              )}

              {/* Movable Watermark overlay */}
              {enableMovable && movableUrl && (
                <div
                  onMouseDown={handleMovableMouseDown}
                  onTouchStart={handleMovableTouchStart}
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
                    border: '1.5px dashed #4f46e5',
                    padding: '2px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    transition: (isDragging || isResizing) ? 'none' : 'left 0.1s ease, top 0.1s ease, width 0.1s ease'
                  }}
                  className="group/watermark"
                >
                  <img
                    src={movableUrl}
                    alt="Movable Watermark"
                    className="w-full h-auto pointer-events-none"
                  />
                  
                  {/* Corner Resize Handles */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'tl')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'tl')}
                    className="w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full absolute -top-1.75 -left-1.75 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'tr')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'tr')}
                    className="w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full absolute -top-1.75 -right-1.75 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'bl')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'bl')}
                    className="w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full absolute -bottom-1.75 -left-1.75 cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'br')}
                    onTouchStart={(e) => handleResizeTouchStart(e, 'br')}
                    className="w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full absolute -bottom-1.75 -right-1.75 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                  />
                </div>
              )}

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
                        className="h-full bg-indigo-500 rounded-full transition-all duration-100 ease-linear"
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
                          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
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
                              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
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
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 disabled:from-slate-800 disabled:via-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
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
                  <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {generationStatus === 'uploading' ? 'Uploading Media files...' : 'Rendering portrait video...'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {generationStatus === 'processing' ? 'Running FFmpeg on backend. Looping background, layering watermarks and audio...' : 'Saving temporary buffer...'}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-[pulse_1.5s_infinite] w-[75%]" />
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
