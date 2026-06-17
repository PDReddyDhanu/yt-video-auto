'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  FileVideo, 
  Image as ImageIcon,
  Key,
  FolderOpen,
  Film,
  Download,
  Info,
  Sparkles,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function AdminPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // State Management
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [watermark, setWatermark] = useState<any>({
    filename: '',
    position: 'bottom-right',
    size: 180,
    opacity: 0.6,
    margin: 40
  });
  const [driveConfig, setDriveConfig] = useState<any>({
    clientId: '',
    clientSecret: '',
    redirectUri: `${BACKEND_URL}/api/auth/google/callback`,
    hasSecret: false
  });
  const [history, setHistory] = useState<any[]>([]);

  // Submissions state
  const [loadingBgs, setLoadingBgs] = useState(false);
  const [loadingWatermark, setLoadingWatermark] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState(false);
  
  const [bgUploadFile, setBgUploadFile] = useState<File | null>(null);
  const [bgName, setBgName] = useState('');
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState('');

  // Alerts
  const [bgAlert, setBgAlert] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [watermarkAlert, setWatermarkAlert] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [driveAlert, setDriveAlert] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const checkGoogleAuth = async () => {
    try {
      setIsAuthLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/auth/status`);
      if (res.ok) {
        const data = await res.json();
        setDriveConfig((prev: any) => ({ 
          ...prev, 
          isConfigured: data.isConfigured, 
          isAuthenticated: data.isAuthenticated 
        }));
      }
    } catch (e) {
      console.error(e);
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
        await checkGoogleAuth();
      }
    }, 1000);
  };

  useEffect(() => {
    checkGoogleAuth();
    fetchBackgrounds();
    fetchWatermark();
    fetchDriveConfig();
    fetchHistory();
  }, []);

  const fetchBackgrounds = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/backgrounds`);
      if (res.ok) setBackgrounds(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWatermark = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/watermark`);
      if (res.ok) {
        const data = await res.json();
        setWatermark(data);
        if (data.filename) {
          setWatermarkPreviewUrl(`${BACKEND_URL}/uploads/${data.filename}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDriveConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/drive/config`);
      if (res.ok) setDriveConfig(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/history`);
      if (res.ok) setHistory(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all render history and delete all rendered files from local storage?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/history`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Background Video Upload
  const handleBgUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgUploadFile) return;

    setLoadingBgs(true);
    setBgAlert(null);

    const formData = new FormData();
    formData.append('video', bgUploadFile);
    formData.append('name', bgName);

    try {
      const res = await fetch(`${BACKEND_URL}/api/backgrounds`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      setBgAlert({ type: 'success', text: 'Background video uploaded successfully!' });
      setBgName('');
      setBgUploadFile(null);
      // Reset input element
      const fileInput = document.getElementById('bg-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchBackgrounds();
    } catch (error: any) {
      setBgAlert({ type: 'error', text: error.message || 'Failed to upload background video.' });
    } finally {
      setLoadingBgs(false);
    }
  };

  // Background Video Delete
  const handleBgDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this background template?')) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/backgrounds/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchBackgrounds();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Watermark Settings Update
  const handleWatermarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingWatermark(true);
    setWatermarkAlert(null);

    const formData = new FormData();
    if (watermarkFile) {
      formData.append('watermarkImage', watermarkFile);
    }
    formData.append('position', watermark.position);
    formData.append('size', watermark.size.toString());
    formData.append('opacity', watermark.opacity.toString());
    formData.append('margin', watermark.margin.toString());

    try {
      const res = await fetch(`${BACKEND_URL}/api/watermark`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to update watermark configuration');

      const data = await res.json();
      setWatermark(data);
      if (data.filename) {
        setWatermarkPreviewUrl(`${BACKEND_URL}/uploads/${data.filename}`);
      }
      setWatermarkFile(null);
      const fileInput = document.getElementById('watermark-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setWatermarkAlert({ type: 'success', text: 'Watermark configuration updated!' });
    } catch (error: any) {
      setWatermarkAlert({ type: 'error', text: error.message || 'Failed to save watermark configuration.' });
    } finally {
      setLoadingWatermark(false);
    }
  };

  // Watermark image input handler
  const handleWatermarkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWatermarkFile(file);
      if (watermarkPreviewUrl && watermarkPreviewUrl !== `${BACKEND_URL}/uploads/default_watermark.png`) {
        URL.revokeObjectURL(watermarkPreviewUrl);
      }
      setWatermarkPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Google Drive Config Update
  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDrive(true);
    setDriveAlert(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/drive/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: driveConfig.clientId,
          clientSecret: driveConfig.clientSecret,
          redirectUri: driveConfig.redirectUri
        })
      });

      if (!res.ok) throw new Error('Failed to save config');

      const data = await res.json();
      setDriveConfig(data.config);
      setDriveAlert({ type: 'success', text: 'Google Drive credentials updated!' });
    } catch (error: any) {
      setDriveAlert({ type: 'error', text: error.message || 'Failed to save settings.' });
    } finally {
      setLoadingDrive(false);
    }
  };

  // Watermark simulator coordinates
  const getWatermarkPositionStyle = () => {
    const margin = `${(watermark.margin / 1080) * 100}%`;
    const width = `${(watermark.size / 1080) * 100}%`;

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
            AutoVideo Control Center
          </h1>
          <p className="mt-2.5 text-slate-400 text-xs text-center leading-relaxed max-w-[280px]">
            Please sign in with your Google account to access system control panels and configurations.
          </p>

          <div className="w-full my-8 border-t border-slate-850" />

          {driveConfig.clientId && driveConfig.hasSecret ? (
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
                Please configure the API credentials in the backend `.env` file first.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            System Control Center
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Manage system configurations, template background videos, watermark overlays, and OAuth settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            Back to Studio
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Video templates & OAuth */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Background Video Management */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Film className="h-5 w-5 text-indigo-400" />
              Manage Background Videos
            </h2>

            {/* List current templates */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Templates</h3>
              {backgrounds.length === 0 ? (
                <div className="text-center p-6 border border-slate-850 rounded-xl bg-slate-950/20 text-slate-500 text-xs">
                  No backgrounds templates configured. Generate or upload one below.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backgrounds.map((bg) => (
                    <div 
                      key={bg.id}
                      className="flex gap-3 items-center p-3 rounded-xl border border-slate-800 bg-slate-950/40 relative group"
                    >
                      <div className="relative h-16 w-12 rounded-lg overflow-hidden shrink-0 bg-slate-950">
                        <video
                          src={`${BACKEND_URL}/uploads/${bg.filename}`}
                          muted
                          playsInline
                          className="h-full w-full object-cover opacity-60"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{bg.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Duration: {bg.duration.toFixed(1)}s</p>
                        <p className="text-[9px] text-slate-600 font-mono mt-0.5 truncate">{bg.filename}</p>
                      </div>
                      <button
                        onClick={() => handleBgDelete(bg.id)}
                        className="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload form */}
            <form onSubmit={handleBgUpload} className="space-y-4 pt-4 border-t border-slate-850">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload New Template</h3>

              {bgAlert && (
                <div className={`p-3 rounded-lg border text-xs flex gap-2 items-start ${
                  bgAlert.type === 'success' 
                    ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400' 
                    : 'border-red-500/20 bg-red-950/10 text-red-400'
                }`}>
                  {bgAlert.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{bgAlert.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">Template Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber City Drive"
                    value={bgName}
                    onChange={(e) => setBgName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">MP4 Video File</label>
                  <input
                    id="bg-file-input"
                    type="file"
                    required
                    accept="video/mp4"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBgUploadFile(e.target.files[0]);
                        if (!bgName) setBgName(e.target.files[0].name.split('.')[0]);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-1.5 text-xs text-slate-400 file:bg-slate-800 file:text-slate-200 file:border-none file:text-[10px] file:font-semibold file:px-2.5 file:py-1 file:rounded-md file:cursor-pointer file:hover:bg-slate-700 transition-colors file:mr-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingBgs || !bgUploadFile}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {loadingBgs ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading template video...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Upload Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Google Drive credentials config */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-400" />
              Google Drive API Credentials
            </h2>

            <form onSubmit={handleDriveSubmit} className="space-y-4">
              {driveAlert && (
                <div className={`p-3 rounded-lg border text-xs flex gap-2 items-start ${
                  driveAlert.type === 'success' 
                    ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400' 
                    : 'border-red-500/20 bg-red-950/10 text-red-400'
                }`}>
                  {driveAlert.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{driveAlert.text}</span>
                </div>
              )}

              <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-950/5 flex gap-3 text-xs text-blue-300 leading-relaxed">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">OAuth Instructions</p>
                  <p className="text-[11px] text-blue-300/80">
                    To connect Google Drive, make sure to add this redirect URI to your Google Developer Console OAuth 2.0 Credentials list:
                  </p>
                  <code className="block bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] select-all font-mono text-slate-200 mt-1">
                    {driveConfig.redirectUri}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">OAuth Client ID</label>
                  <input
                    type="text"
                    required
                    value={driveConfig.clientId}
                    onChange={(e) => setDriveConfig({ ...driveConfig, clientId: e.target.value })}
                    placeholder="Enter Google Client ID"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">
                    OAuth Client Secret {driveConfig.hasSecret && '(configured)'}
                  </label>
                  <input
                    type="password"
                    placeholder={driveConfig.hasSecret ? '••••••••••••••••••••' : 'Enter Google Client Secret'}
                    onChange={(e) => setDriveConfig({ ...driveConfig, clientSecret: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingDrive}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {loadingDrive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save API Credentials'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Watermark overlays */}
        <div className="space-y-8">
          
          {/* Watermark Config */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              Watermark Brand
            </h2>

            {/* Realtime visual preview box */}
            <div className="mb-6 space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Dynamic Preview</label>
              <div className="relative aspect-[9/16] w-full max-w-[170px] mx-auto rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 flex items-center justify-center text-slate-800 text-[10px]">
                {/* Background mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/15 via-slate-950 to-slate-950" />
                <span className="text-[10px] text-slate-700 pointer-events-none select-none">Portrait Layout Mock</span>
                
                {/* Watermark image overlay */}
                {watermarkPreviewUrl && (
                  <img
                    src={watermarkPreviewUrl}
                    alt="Watermark Brand"
                    style={getWatermarkPositionStyle()}
                  />
                )}
              </div>
            </div>

            {/* Update form */}
            <form onSubmit={handleWatermarkSubmit} className="space-y-4">
              {watermarkAlert && (
                <div className={`p-3 rounded-lg border text-xs flex gap-2 items-start ${
                  watermarkAlert.type === 'success' 
                    ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400' 
                    : 'border-red-500/20 bg-red-950/10 text-red-400'
                }`}>
                  {watermarkAlert.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                  <span>{watermarkAlert.text}</span>
                </div>
              )}

              {/* File input */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400">Logo Image File</label>
                <input
                  id="watermark-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkFileChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-1.5 text-xs text-slate-400 file:bg-slate-800 file:text-slate-200 file:border-none file:text-[10px] file:font-semibold file:px-2.5 file:py-1 file:rounded-md file:cursor-pointer file:hover:bg-slate-700 transition-colors file:mr-3"
                />
              </div>

              {/* Watermark position */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400">Position Placement</label>
                <select
                  value={watermark.position}
                  onChange={(e) => setWatermark({ ...watermark, position: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="top-left">Top Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                  <option value="bottom-right">Bottom Right Corner</option>
                </select>
              </div>

              {/* Opacity slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Transparency (Opacity)</span>
                  <span>{Math.round(watermark.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={watermark.opacity}
                  onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Size and margin inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">Scale Width (px)</label>
                  <input
                    type="number"
                    min="50"
                    max="500"
                    required
                    value={watermark.size}
                    onChange={(e) => setWatermark({ ...watermark, size: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400">Margins Padding (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    required
                    value={watermark.margin}
                    onChange={(e) => setWatermark({ ...watermark, margin: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingWatermark}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {loadingWatermark ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Branding Config'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Generation History */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-indigo-400" />
            Render History
          </h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 border border-slate-850 rounded-xl bg-slate-950/20 text-slate-500 text-xs">
            No videos generated yet. Head over to the Studio to render your first video.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                  <th className="py-3 px-4">Video ID</th>
                  <th className="py-3 px-4">Background template</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Render Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{item.backgroundName}</td>
                    <td className="py-3 px-4">{item.duration.toFixed(1)}s</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`${BACKEND_URL}/output/${item.filename}`}
                        download={item.filename}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-900 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
