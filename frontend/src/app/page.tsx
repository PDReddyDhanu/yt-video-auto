'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Type,
  Lock,
  Unlock,
  Clipboard
} from 'lucide-react';

import { logoDataUri } from '@/components/LogoData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const translations = {
  en: {
    title: "PDR's Automated Video Studio",
    subtitle: "Generate high-quality short-form videos with custom watermarks, AI voice generation, and automated Google Drive uploads.",
    step1: "Select Background Video",
    step2: "Select Platform / Video Type",
    step3: "Upload Center Image",
    step4: "Soundtrack",
    step5: "Bottom Banner / Watermark",
    step6: "Dynamic Captions (Optional)",
    youtubeShorts: "YouTube Shorts",
    youtubeShortsDesc: "AI Telugu voiceover, Tenglish subtitles, and automatic duration sync.",
    instagram: "Instagram Reels",
    instagramDesc: "6-second looped background video with background music from library.",
    chooseImage: "Choose Image",
    centerImageScale: "Center Image Scale (Width)",
    centerImageScaleDesc: "Slide to adjust the center image width scale from 40% to 100% of the video canvas.",
    noImageSelected: "No image selected yet. Center image overlays above the background.",
    aiVoiceStudio: "AI Voice Studio (Microsoft Edge TTS)",
    freeUnlimited: "Free · Unlimited",
    teluguScript: "Telugu Script (for generating voice)",
    tenglishScript: "Tenglish Script (for generating captions)",
    femaleVoices: "♀ Female Pro Voices",
    maleVoices: "♂ Male Pro Voices",
    voicePitch: "Voice Pitch (Speed/Style)",
    generateAudio: "Generate AI Audio",
    generatingAudio: "Generating Voice...",
    audioGenerated: "Audio voice generated successfully!",
    manualAudioUpload: "Or manually upload your own MP3/WAV audio",
    manualUploadLabel: "Upload Audio File",
    searchSongs: "Search music files...",
    selectMusic: "Select Background Music",
    trimAudio: "Select 6-Second Music Trim Segment",
    trimStart: "Start Position",
    noMusicFiles: "No music files found in backend/music folder.",
    bottomBanner: "Bottom Banner / Watermark",
    compulsoryBanner: "Compulsory Bottom Banner (Watermark-movable)",
    uploadBanner: "Upload custom bottom banner PNG to overwrite",
    bannerPositioning: "Banner Positioning & Cropping Controls",
    bannerScale: "Watermark Scale (Width)",
    bannerX: "Watermark X Position",
    bannerY: "Watermark Y Position",
    topCrop: "Top Crop",
    bottomCrop: "Bottom Crop",
    leftCrop: "Left Crop",
    rightCrop: "Right Crop",
    movableWatermark2: "Movable Watermark 2 (Optional corner / logo)",
    enableMovable2: "Enable Movable Watermark 2",
    watermark2Positioning: "Watermark 2 Positioning & Cropping Controls",
    watermark2Scale: "Watermark 2 Scale (Width)",
    watermark2X: "Watermark 2 X Position",
    watermark2Y: "Watermark 2 Y Position",
    captionStyleAndColor: "Caption Style & Color Settings",
    generateVideo: "Generate Video",
    videoConsole: "Video Generation Console",
    googleDriveRequired: "Google Drive Connection Required",
    googleDriveRequiredDesc: "Since generated videos are sent directly to Google Drive and are not stored locally, you must link your Google Account first.",
    connectGoogleDrive: "Connect Google Drive",
    selectDriveFolder: "Select Google Drive Destination Folder",
    disconnectGoogle: "Disconnect Google Account",
    activeFolder: "Active Destination Folder",
    generateVideoBtn: "Generate Video",
    generatingVideoBtn: "Generating video on server...",
    videoDone: "Video generation completed successfully!",
    driveUploadDone: "Uploaded and saved to Google Drive!",
    driveUploadBtn: "Upload & Save to Google Drive",
    viewOnDrive: "View on Google Drive",
    downloadVideo: "Download Video File",
    errorOccurred: "An error occurred:",
    previewWorkspace: "Live Preview Workspace",
    noTemplateSelected: "No template selected. Choose a background video from Step 1.",
    loadingProgress: "Loading template...",
    signOut: "Sign Out",
  },
  te: {
    title: "PDR ఆటోమేటెడ్ వీడియో స్టూడియో",
    subtitle: "అనుకూల వాటర్‌మార్క్‌లు, AI వాయిస్ జనరేషన్ మరియు ఆటోమేటెడ్ Google డ్రైవ్ అప్‌లోడ్‌లతో ఆటోమేటిక్‌గా షార్ట్-ఫార్మ్ వీడియోలను సృష్టించండి.",
    step1: "నేపథ్య వీడియోను ఎంచుకోండి",
    step2: "ప్లాట్‌ఫారమ్ / వీడియో రకాన్ని ఎంచుకోండి",
    step3: "మధ్య చిత్రాన్ని అప్‌లోడ్ చేయండి",
    step4: "సౌండ్‌ట్రాక్ (ఆడియో)",
    step5: "దిగువ బ్యానర్ / వాటర్‌మార్క్",
    step6: "డైనమిక్ శీర్షికలు (ఐచ్ఛికం)",
    youtubeShorts: "యూట్యూబ్ షార్ట్స్",
    youtubeShortsDesc: "AI తెలుగు వాయిస్ ఓవర్, టెంగ్లీష్ శీర్షికలు మరియు ఆటోమేటిక్ డ్యూరేషన్ సమకాలీకరణ.",
    instagram: "ఇన్‌స్టాగ్రామ్ రీల్స్",
    instagramDesc: "లైబ్రరీ నుండి నేపథ్య సంగీతంతో కూడిన 6-సెకన్ల లూప్ నేపథ్య వీడియో.",
    chooseImage: "చిత్రాన్ని ఎంచుకోండి",
    centerImageScale: "మధ్య చిత్రం స్కేల్ (వెడల్పు)",
    centerImageScaleDesc: "మధ్య చిత్రం వెడల్పును వీడియో కాన్వాస్ యొక్క 40% నుండి 100% కి సర్దుబాటు చేయడానికి స్లైడ్ చేయండి.",
    noImageSelected: "ఇంకా ఏ చిత్రం ఎంచబడలేదు. మధ్య చిత్రం నేపథ్యంపై కనిపిస్తుంది.",
    aiVoiceStudio: "AI వాయిస్ స్టూడియో (Microsoft Edge TTS)",
    freeUnlimited: "ఉచితం • అపరిమితం",
    teluguScript: "తెలుగు స్క్రిప్ట్ (వాయిస్ జనరేషన్ కొరకు)",
    tenglishScript: "టెంగ్లీష్ స్క్రిప్ట్ (శీర్షికల జనరేషన్ కొరకు)",
    femaleVoices: "♀ స్త్రీ ప్రొఫెషనల్ వాయిస్‌లు",
    maleVoices: "♂ పురుష ప్రొఫెషనల్ వాయిస్‌లు",
    voicePitch: "వాయిస్ పిచ్ (వేగం/శైలి)",
    generateAudio: "AI ఆడియోను సృష్టించండి",
    generatingAudio: "వాయిస్ సృష్టించబడుతోంది...",
    audioGenerated: "ఆడియో వాయిస్ విజయవంతంగా సృష్టించబడింది!",
    manualAudioUpload: "లేదా మీ స్వంత MP3/WAV ఆడియోను అప్‌లోడ్ చేయండి",
    manualUploadLabel: "ఆడియో ఫైల్‌ను అప్‌లోడ్ చేయండి",
    searchSongs: "పాటలను శోధించండి...",
    selectMusic: "నేపథ్య సంగీతాన్ని ఎంచుకోండి",
    trimAudio: "6-సెకన్ల మ్యూజిక్ ట్రిమ్ భాగాన్ని ఎంచుకోండి",
    trimStart: "ప్రారంభ స్థానం",
    noMusicFiles: "backend/music ఫోల్డర్‌లో ఎటువంటి సంగీత ఫైల్‌లు కనుగొనబడలేదు.",
    bottomBanner: "దిగువ బ్యానర్ / వాటర్‌మార్క్",
    compulsoryBanner: "తప్పనిసరి దిగువ బ్యానర్ (వాటర్‌మార్క్-కదిలేది)",
    uploadBanner: "భర్తీ చేయడానికి అనుకూల దిగువ బ్యానర్ PNGని అప్‌లోడ్ చేయండి",
    bannerPositioning: "బ్యానర్ పొజిషనింగ్ & క్రాపింగ్ నియంత్రణలు",
    bannerScale: "వాటర్‌మార్క్ స్కేల్ (వెడల్పు)",
    bannerX: "వాటర్‌మార్క్ X స్థానం",
    bannerY: "వాటర్‌మార్క్ Y స్థానం",
    topCrop: "పై క్రాప్ (Top Crop)",
    bottomCrop: "క్రింది క్రాప్ (Bottom Crop)",
    leftCrop: "ఎడమ క్రాప్ (Left Crop)",
    rightCrop: "కుడి క్రాప్ (Right Crop)",
    movableWatermark2: "కదిలే వాటర్‌మార్క్ 2 (ఐచ్ఛిక మూలల్లో / లోగో)",
    enableMovable2: "కదిలే వాటర్‌మార్క్ 2 ని ప్రారంభించండి",
    watermark2Positioning: "వాటర్‌మార్క్ 2 పొజిషనింగ్ & క్రాపింగ్ నియంత్రణలు",
    watermark2Scale: "వాటర్‌మార్క్ 2 స్కేల్ (వెడల్పు)",
    watermark2X: "వాటర్‌మార్క్ 2 X స్థానం",
    watermark2Y: "వాటర్‌మార్క్ 2 Y స్థానం",
    captionStyleAndColor: "శీర్షిక శైలి & రంగు సెట్టింగులు",
    generateVideo: "వీడియోను సృష్టించండి",
    videoConsole: "వీడియో జనరేషన్ కన్సోల్",
    googleDriveRequired: "Google డ్రైవ్ అనుసంధానం అవసరం",
    googleDriveRequiredDesc: "సృష్టించబడిన వీడియోలు నేరుగా Google డ్రైవ్‌కు పంపబడతాయి మరియు స్థానికంగా నిల్వ చేయబడవు కాబట్టి, ముందుగా మీ Google ఖాతాను అనుసంధానించాలి.",
    connectGoogleDrive: "Google డ్రైవ్‌ను కనెక్ట్ చేయండి",
    selectDriveFolder: "Google డ్రైవ్ గమ్యస్థాన ఫోల్డర్‌ను ఎంచుకోండి",
    disconnectGoogle: "Google ఖాతాను డిస్‌కనెక్ట్ చేయండి",
    activeFolder: "సక్రియ గమ్యస్థాన ఫోల్డర్",
    generateVideoBtn: "ఆటోమేటిక్ వీడియో సృష్టి",
    generatingVideoBtn: "సర్వర్‌లో వీడియో సృష్టించబడుతోంది...",
    videoDone: "వీడియో జనరేషన్ విజయవంతంగా పూర్తయింది!",
    driveUploadDone: "అప్‌లోడ్ చేయబడింది మరియు Google డ్రైవ్‌లో సేవ్ చేయబడింది!",
    driveUploadBtn: "అప్‌లోడ్ చేసి Google డ్రైవ్‌లో సేవ్ చేయండి",
    viewOnDrive: "Google డ్రైవ్‌లో చూడండి",
    downloadVideo: "వీడియో ఫైల్‌ను డౌన్‌లోడ్ చేయండి",
    errorOccurred: "ఒక లోపం సంభవించింది:",
    previewWorkspace: "లైవ్ ప్రివ్యూ వర్క్‌స్పేస్",
    noTemplateSelected: "టెంప్లేట్ ఎంచుకోబడలేదు. దశ 1 నుండి నేపథ్య వీడియోను ఎంచుకోండి.",
    loadingProgress: "టెంప్లేట్ లోడ్ అవుతోంది...",
    signOut: "సైన్ అవుట్",
  }
};

export default function StudioPage({ initialPlatform = 'youtube' }: { initialPlatform?: 'youtube' | 'instagram' }) {
  const t = (key: keyof typeof translations.en) => {
    return translations.en[key];
  };

  // Platform and Audio Library state
  const [videoPlatform, setVideoPlatform] = useState<'youtube' | 'instagram'>(initialPlatform);
  const [musicFiles, setMusicFiles] = useState<any[]>([]);
  const [selectedMusicFile, setSelectedMusicFile] = useState<string>('');
  const [musicTrimStart, setMusicTrimStart] = useState<number>(0);
  const [musicSearchQuery, setMusicSearchQuery] = useState<string>('');
  const [musicDuration, setMusicDuration] = useState<number>(0);

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
  const [customFilename, setCustomFilename] = useState<string>('');
  const [scriptDuration, setScriptDuration] = useState<number>(20);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [recommendedVoice, setRecommendedVoice] = useState<string>('');
  const [scriptError, setScriptError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<{
    ocrModel?: string; ocrKeyIndex?: number;
    scriptModel?: string; scriptKeyIndex?: number;
    totalKeys?: number; timestamp?: string;
  } | null>(null);

  interface GroqKeyStatus {
    index: number;
    keyMasked: string;
    status: 'Active' | 'Exhausted';
    exhaustedModels: string[];
    lastUsed: string | null;
    lastError: string | null;
  }

  const [groqStatusPool, setGroqStatusPool] = useState<GroqKeyStatus[]>([]);

  // Movable Watermark State
  const [enableMovable, setEnableMovable] = useState<boolean>(true); // always true/compulsory
  const [movableFile, setMovableFile] = useState<File | null>(null);
  const [movableUrl, setMovableUrl] = useState<string>(`${BACKEND_URL}/uploads/ChatGPT%20Image%20Jun%2017,%202026,%2003_36_57%20AM.png`);
  const [movableX, setMovableX] = useState<number>(4); // initial X percentage
  const [movableY, setMovableY] = useState<number>(88); // initial Y percentage
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

  const [activeWatermark, setActiveWatermark] = useState<'wm1' | 'wm2' | 'avatar' | null>(null);
  const [isLockedWm1, setIsLockedWm1] = useState<boolean>(false);
  const [isLockedWm2, setIsLockedWm2] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'tl' | 'tr' | 'bl' | 'br' | null

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const dragTarget = useRef<'wm1' | 'wm2' | 'avatar'>('wm1');

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
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Avatar Character Overlay Layer State (Dummy Lip Sync Character)
  const [showAvatar, setShowAvatar] = useState<boolean>(true);
  const [avatarVideoFile, setAvatarVideoFile] = useState<File | null>(null);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string>(`${BACKEND_URL}/uploads/default_avatar.webm`);
  const [avatarX, setAvatarX] = useState<number>(0);      // X % (top left of poster)
  const [avatarY, setAvatarY] = useState<number>(0);     // Y %
  const [avatarScale, setAvatarScale] = useState<number>(28); // Width %
  const [cropAvatarTop, setCropAvatarTop] = useState<number>(0);
  const [cropAvatarBottom, setCropAvatarBottom] = useState<number>(0);
  const [cropAvatarLeft, setCropAvatarLeft] = useState<number>(0);
  const [cropAvatarRight, setCropAvatarRight] = useState<number>(0);
  const [avatarLayerPosition, setAvatarLayerPosition] = useState<'behind' | 'front'>('behind');
  const [captionPosition, setCaptionPosition] = useState<'top' | 'bottom'>('top');
  // ─── PDR-AUTO 1-CLICK AUTOMATED WORKFLOW ───────────────────────
  const [isPdrAutoRunning, setIsPdrAutoRunning] = useState<boolean>(false);
  const [pdrAutoStatus, setPdrAutoStatus] = useState<string>('');
  const [isPdrAutoMode, setIsPdrAutoMode] = useState<boolean>(true); // PDR-Auto ON by default

  const pdrAutoPitchRef = useRef<number>(4); // Alternates between +4Hz and +8Hz
  const pdrAutoDurationRef = useRef<number>(120); // Alternates between 120s (2 min) and 150s (2:30 min)

  const handlePdrAutoWorkflow = async (overrideFile?: File) => {
    const targetImg = overrideFile || imageFile;
    if (!targetImg) {
      alert("⚠️ Please paste or upload a Center Poster Image first, then click PDR-Auto!");
      return;
    }

    setIsPdrAutoRunning(true);
    setPdrAutoStatus("🚀 Starting PDR-Auto Workflow...");

    try {
      // Step 1: Alternate Target Script Duration (120s vs 150s). Default: 120s (2 mins)
      const targetDuration = pdrAutoDurationRef.current;
      setScriptDuration(targetDuration);
      pdrAutoDurationRef.current = targetDuration === 120 ? 150 : 120;
      setPdrAutoStatus(`⚡ Step 1/4: Target Duration set to ${targetDuration === 120 ? '2 mins (120s)' : '2:30 mins (150s)'}...`);

      // Step 2: Auto-select Destination Folder (1HKOpwOro1jxv09xBqbnhilhtCRb7V8yA)
      setSelectedFolderId('1HKOpwOro1jxv09xBqbnhilhtCRb7V8yA');

      // Step 3: Trigger OCR & AI Script Generation from Image
      setPdrAutoStatus(`🧠 Step 2/4: Generating AI Script from Image for ${targetDuration}s...`);
      setScriptError('');
      
      const formData = new FormData();
      formData.append('image', targetImg);
      formData.append('duration', targetDuration.toString());

      const scriptRes = await fetch(`${BACKEND_URL}/backend/generate-script-from-image`, {
        method: 'POST',
        body: formData
      });

      if (!scriptRes.ok) {
        const errData = await scriptRes.json();
        throw new Error(errData.error || 'AI script generation failed.');
      }

      const scriptData = await scriptRes.json();
      const generatedTeluguScript = scriptData.teluguScript || '';
      const generatedTenglishScript = scriptData.tenglishScript || '';

      setTtsScript(generatedTeluguScript);
      setTenglishScript(generatedTenglishScript);

      if (scriptData.autoFilename) {
        setCustomFilename(scriptData.autoFilename);
      } else {
        const slug = (generatedTenglishScript || 'auto_video')
          .toLowerCase()
          .replace(/[^a-z0-9\s-_]/g, '')
          .trim()
          .replace(/[\s-_]+/g, '_')
          .split('_')
          .slice(0, 10)
          .join('_');
        setCustomFilename(slug);
      }

      if (scriptData.apiStatus) {
        setApiStatus(scriptData.apiStatus);
      }

      // Step 4: Select Male Pro Voice MV1 (Brian) with alternate pitch (+4Hz / +8Hz)
      const currentPitch = pdrAutoPitchRef.current;
      setSelectedPresetId('MV1');
      setPitchCycleIndex(prev => ({ ...prev, MV1: currentPitch === 4 ? 0 : 1 }));
      pdrAutoPitchRef.current = currentPitch === 4 ? 8 : 4;
      
      setPdrAutoStatus(`🎙️ Step 3/4: Selected Male Voice MV1 (Brian) with Pitch +${currentPitch}Hz...`);

      // Pause briefly for state sync
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 5: Generate Audio & Auto-Fill Captions
      setPdrAutoStatus(`🔊 Step 4/4: Generating Audio & Auto-Filling Word-by-Word Captions...`);
      
      const ttsPayloadText = generatedTeluguScript.trim() || generatedTenglishScript.trim();
      if (!ttsPayloadText) {
        throw new Error("Generated script text was empty.");
      }

      const ttsRes = await fetch(`${BACKEND_URL}/backend/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsPayloadText,
          voice_id: 'en-US-BrianMultilingualNeural',
          speed: 1.65,
          pitch: currentPitch
        })
      });

      if (!ttsRes.ok) {
        const errData = await ttsRes.json();
        throw new Error(errData.error || 'TTS Audio generation failed.');
      }

      const ttsData = await ttsRes.json();
      const audioFetchRes = await fetch(`${BACKEND_URL}${ttsData.url}`);
      const audioBlob = await audioFetchRes.blob();
      const audioFileObj = new File([audioBlob], ttsData.filename, { type: 'audio/mpeg' });
      const audioObjUrl = URL.createObjectURL(audioBlob);

      setAudioFile(audioFileObj);
      setAudioUrl(audioObjUrl);

      const detectedAudioDur: number = await new Promise(resolve => {
        const tmp = new Audio(audioObjUrl);
        tmp.onloadedmetadata = () => resolve(tmp.duration);
        tmp.onerror = () => resolve(targetDuration);
      });
      setAudioDuration(detectedAudioDur);

      // Auto-align word-by-word timestamps for captions
      const words: WordTimestamp[] = ttsData.word_timestamps || [];
      const captionText = generatedTenglishScript.trim() || generatedTeluguScript.trim();
      const captionWords = captionText.split(/\s+/).map((w: string) => w.trim()).filter((w: string) => w.length > 0);

      let alignedWords: WordTimestamp[] = [];
      if (words.length > 0 && captionWords.length > 0) {
        if (words.length === captionWords.length) {
          alignedWords = captionWords.map((word: string, idx: number) => ({
            word,
            start: words[idx].start,
            end: words[idx].end
          }));
        } else {
          const numWords = captionWords.length;
          const totalDuration = words[words.length - 1].end || detectedAudioDur;
          const wordDur = totalDuration / numWords;
          alignedWords = captionWords.map((word: string, idx: number) => ({
            word,
            start: parseFloat((idx * wordDur).toFixed(2)),
            end: parseFloat(((idx + 1) * wordDur).toFixed(2))
          }));
        }
      }

      setWordTimestamps(alignedWords);

      // Convert word timestamps to segment captions for FFmpeg subtitle export
      if (alignedWords.length > 0) {
        const groupSize = 4;
        const newSegments: CaptionSegment[] = [];
        for (let i = 0; i < alignedWords.length; i += groupSize) {
          const group = alignedWords.slice(i, i + groupSize);
          newSegments.push({
            id: `auto-${Date.now()}-${i}`,
            start: group[0].start,
            end: group[group.length - 1].end,
            text: group.map(g => g.word).join(' ')
          });
        }
        setCaptions(newSegments);
      }

      setPdrAutoStatus(`✅ PDR-Auto Complete! Audio & Captions Ready. Destination: READY_TO_APPROVE (1HKOpwOro1jxv09xBqbnhilhtCRb7V8yA).`);
    } catch (err: any) {
      console.error("PDR-Auto Workflow Error:", err);
      setPdrAutoStatus(`❌ PDR-Auto Error: ${err.message || 'Workflow failed'}`);
    } finally {
      setIsPdrAutoRunning(false);
      fetchGroqStatus();
    }
  };

  const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false);
  const avatarDragStart = useRef({ x: 0, y: 0, avatarX: 0, avatarY: 0 });

  const handleAvatarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAvatar(true);
    avatarDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      avatarX: avatarX,
      avatarY: avatarY
    };
  };

  const handleAvatarTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingAvatar(true);
      avatarDragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        avatarX: avatarX,
        avatarY: avatarY
      };
    }
  };



  // Caption Styling & Font State
  const [captionStyle, setCaptionStyle] = useState<'blast' | 'green_box' | 'pink_yellow' | 'frost' | 'classic'>('blast');
  const [captionFont, setCaptionFont] = useState<string>('Arial Black');

  const CAPTION_STYLES = [
    {
      id: 'blast',
      label: 'BLAST',
      desc: 'Fire Neon Glow with Black Outline',
      badgeClass: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black uppercase tracking-wider'
    },
    {
      id: 'green_box',
      label: 'CAPCUT GREEN',
      desc: 'Electric Green Text in Dark Rounded Box',
      badgeClass: 'bg-slate-950 text-emerald-400 border border-emerald-500/60 font-black uppercase tracking-wider px-2 py-0.5 rounded'
    },
    {
      id: 'pink_yellow',
      label: 'PINK & YELLOW',
      desc: 'Pink Background Badge with Yellow Text',
      badgeClass: 'bg-pink-600 text-yellow-300 font-black uppercase tracking-wider px-2 py-0.5 rounded shadow'
    },
    {
      id: 'frost',
      label: 'FROST NEON',
      desc: 'Electric Cyan Glow with Soft Shadow',
      badgeClass: 'bg-slate-900 text-cyan-300 border border-cyan-400/50 font-black uppercase tracking-wider'
    },
    {
      id: 'classic',
      label: 'CLASSIC YELLOW',
      desc: 'High Contrast Bold Yellow Text',
      badgeClass: 'bg-slate-900 text-yellow-400 border border-yellow-500/40 font-extrabold uppercase tracking-wide'
    }
  ] as const;


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

  // TTS Pro Voice Presets (Microsoft Edge Neural —” te-IN context)
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
    fetchMusicFiles();
    fetchGroqStatus();
  }, []);

  // Poll Groq status pool every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGroqStatus();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Update dynamic audio duration and source based on selected audio file
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      const tempAudio = new Audio(url);
      tempAudio.addEventListener('loadedmetadata', () => {
        setAudioDuration(tempAudio.duration);
      });
    } else {
      setAudioUrl('');
      setAudioDuration(0);
    }
    pausePreview();
    setPreviewCurrentTime(0);
    setPreviewProgress(0);
  }, [audioFile, videoPlatform]);

  const fetchMusicFiles = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/backend/music`);
      if (res.ok) {
        const data = await res.json();
        setMusicFiles(data);
        if (data.length > 0) {
          setSelectedMusicFile(data[0].filename);
        }
      }
    } catch (e) {
      console.error('Failed to fetch library music files:', e);
    }
  };

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
      const res = await fetch(`${BACKEND_URL}/backend/backgrounds`);
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
      const res = await fetch(`${BACKEND_URL}/backend/watermark`);
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
      const res = await fetch(`${BACKEND_URL}/backend/tts/voices`);
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

  const fetchGroqStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/backend/groq-status`);
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setGroqStatusPool(data.status);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Groq API status:', err);
    }
  };

  const handleResetGroqStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/backend/groq-status/reset`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setGroqStatusPool(data.status);
        }
      }
    } catch (err) {
      console.error('Failed to reset Groq API status:', err);
    }
  };

  // Helper to generate options: multiples of 10s up to 10 minutes
  const generateDurationOptions = () => {
    const options = [];
    for (let s = 10; s <= 600; s += 10) {
      if (s < 60) {
        options.push({ value: s, label: `${s} seconds` });
      } else if (s === 60) {
        options.push({ value: s, label: `1 minute` });
      } else {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        if (secs === 0) {
          options.push({ value: s, label: `${mins} minutes` });
        } else {
          options.push({ value: s, label: `${mins} min ${secs} seconds` });
        }
      }
    }
    return options;
  };

  // Action handler to perform OCR and script generation using backend API
  const handleGetAIScript = async () => {
    if (!imageFile) {
      setScriptError('Please upload a center image in Step 2 first.');
      return;
    }

    setIsGeneratingScript(true);
    setScriptError('');
    setRecommendedVoice('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('duration', scriptDuration.toString());

      const res = await fetch(`${BACKEND_URL}/backend/generate-script-from-image`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate AI script.');
      }

      const data = await res.json();
      
      // Update textareas with Telugu and Tenglish scripts
      setTtsScript(data.teluguScript || '');
      setTenglishScript(data.tenglishScript || '');

      // Automatically set the custom filename if generated by AI
      if (data.autoFilename) {
        setCustomFilename(data.autoFilename);
      } else {
        const fallbackText = data.tenglishScript || 'rendered_video';
        const slug = fallbackText
          .toLowerCase()
          .replace(/[^a-z0-9\s-_]/g, '')
          .trim()
          .replace(/[\s-_]+/g, '_')
          .split('_')
          .slice(0, 10)
          .join('_');
        setCustomFilename(slug);
      }
      
      // Voice recommendation and auto-selection
      if (data.recommendedVoiceGender) {
        setRecommendedVoice(data.recommendedVoiceGender);
        const genderCode = data.recommendedVoiceGender === 'Male' ? 'M' : 'F';
        // Auto-select the first voice of matching gender
        const matchingPreset = TTS_PRESETS.find(p => p.gender === genderCode);
        if (matchingPreset) {
          setSelectedPresetId(matchingPreset.id);
        }
      }

      // Capture live API status (which key & model was used)
      if (data.apiStatus) {
        setApiStatus(data.apiStatus);
      }

    } catch (e: any) {
      console.error(e);
      setScriptError(e.message || 'An error occurred during AI script generation.');
    } finally {
      setIsGeneratingScript(false);
      fetchGroqStatus();
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
      const res = await fetch(`${BACKEND_URL}/backend/tts/generate`, {
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

      // â”€â”€ Word-level timestamps from TTS engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        console.warn('[TTS Caption] No word timestamps â€” using proportional fallback captions (word by word)');
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
      const res = await fetch(`${BACKEND_URL}/backend/syncstate`);
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
      const res = await fetch(`${BACKEND_URL}/backend/syncreset`, {
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
      const res = await fetch(`${BACKEND_URL}/backend/syncfolders`);
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
          if (isPdrAutoMode) {
            handlePdrAutoWorkflow(file);
          }

      // Reset play state
      pausePreview();
    }
  };

  // Clipboard paste handler â€” used by both the Paste button and Ctrl+V shortcut
  const handlePasteImage = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await clipboardItem.getType(imageType);
          const ext = imageType.split('/')[1] || 'png';
          const file = new File([blob], `pasted_image.${ext}`, { type: imageType });
          if (imageUrl) URL.revokeObjectURL(imageUrl);
          setImageFile(file);
          setImageUrl(URL.createObjectURL(file));
          pausePreview();
          return;
        }
      }
      // Nothing found
      alert('No image found in clipboard. Please copy an image first.');
    } catch {
      alert('Clipboard access was denied. Please allow clipboard access and try again, or use the file chooser.');
    }
  }, [imageUrl]);

  // Desktop Ctrl+V shortcut â€” listen globally but only when no text input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
        // Skip if user is typing in an input/textarea/select
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        handlePasteImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePasteImage]);

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
    e.stopPropagation();
    setActiveWatermark(target);
    const locked = target === 'wm1' ? isLockedWm1 : isLockedWm2;
    if (locked) return;

    e.preventDefault();
    dragTarget.current = target;
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = target === 'wm1' ? movableX : (target === 'wm2' ? movable2X : avatarX);
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
    e.stopPropagation();
    setActiveWatermark(target);
    const locked = target === 'wm1' ? isLockedWm1 : isLockedWm2;
    if (locked) return;

    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    dragTarget.current = target;
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = target === 'wm1' ? movableX : (target === 'wm2' ? movable2X : avatarX);
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
  const handleResizeStart = (e: React.MouseEvent, corner: string, target: 'wm1' | 'wm2' | 'avatar') => {
    e.stopPropagation();
    e.preventDefault();
    dragTarget.current = target;
    setIsResizing(corner);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentScale = target === 'wm1' ? movableScale : (target === 'wm2' ? movable2Scale : avatarScale);
      const currentX = target === 'wm1' ? movableX : movable2X;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        left: (currentScale / 100) * rect.width, // start width
        top: (currentX / 100) * rect.width // start position X
      };
    }
  };

  const handleResizeTouchStart = (e: React.TouchEvent, corner: string, target: 'wm1' | 'wm2' | 'avatar') => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    e.stopPropagation();
    dragTarget.current = target;
    setIsResizing(corner);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentScale = target === 'wm1' ? movableScale : (target === 'wm2' ? movable2Scale : avatarScale);
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

      if (isDraggingAvatar && containerRef.current) {
      const handleAvatarMove = (moveEvt: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
        const clientY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;
        
        const deltaX = clientX - avatarDragStart.current.x;
        const deltaY = clientY - avatarDragStart.current.y;
        
        const deltaXPct = (deltaX / rect.width) * 100;
        const deltaYPct = (deltaY / rect.height) * 100;

        const newX = Math.max(0, Math.min(80, Math.round(avatarDragStart.current.avatarX + deltaXPct)));
        const newY = Math.max(0, Math.min(80, Math.round(avatarDragStart.current.avatarY + deltaYPct)));

        setAvatarX(newX);
        setAvatarY(newY);
      };

      const handleAvatarEnd = () => {
        setIsDraggingAvatar(false);
      };

      window.addEventListener('mousemove', handleAvatarMove);
      window.addEventListener('mouseup', handleAvatarEnd);
      window.addEventListener('touchmove', handleAvatarMove);
      window.addEventListener('touchend', handleAvatarEnd);

      return () => {
        window.removeEventListener('mousemove', handleAvatarMove);
        window.removeEventListener('mouseup', handleAvatarEnd);
        window.removeEventListener('touchmove', handleAvatarMove);
        window.removeEventListener('touchend', handleAvatarEnd);
      };
    }

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

  // Click outside to deselect watermark layer (excluding control panel actions)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const isControl = (e.target as HTMLElement).closest('.wm-control-panel');
        if (!isControl) {
          setActiveWatermark(null);
        }
      }
    };
    const handleDocumentTouch = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const isControl = (e.target as HTMLElement).closest('.wm-control-panel');
        if (!isControl) {
          setActiveWatermark(null);
        }
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentTouch);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentTouch);
    };
  }, []);

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
    if (audioRef.current && audioUrl) {
      if (videoPlatform === 'instagram') {
        if (audioRef.current.currentTime < 0 || audioRef.current.currentTime > 10) {
          audioRef.current.currentTime = 0;
        }
      }
      audioRef.current.play().catch(err => console.warn(err));
    }
  };

  const pausePreview = () => {
    setIsPlaying(false);
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  // Video looping / end of audio handling
  const handleVideoEnded = () => {
    if (videoPlatform === 'instagram') {
      // Loop background video indefinitely for Instagram
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(err => console.warn(err));
      }
      return;
    }

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
      if (videoPlatform === 'instagram') {
        if (current < 0 || current > 10) {
          // Loop back to start
          audioRef.current.currentTime = 0;
          setPreviewCurrentTime(0);
          setPreviewProgress(0);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(err => console.warn(err));
          }
        } else {
          setPreviewCurrentTime(current);
          setPreviewProgress((current / 10) * 100);
          // Word-level sync: find which word is currently being spoken
          if (wordTimestamps.length > 0) {
            const idx = wordTimestamps.findIndex(w => current >= w.start && current < w.end);
            setCurrentWordIdx(idx);
          }
        }
      } else {
        setPreviewCurrentTime(current);
        setPreviewProgress((current / audioDuration) * 100);
        // Word-level sync: find which word is currently being spoken
        if (wordTimestamps.length > 0) {
          const idx = wordTimestamps.findIndex(w => current >= w.start && current < w.end);
          setCurrentWordIdx(idx);
        }
      }
    }
  };

  const handleAudioEnded = () => {
    pausePreview();
    if (videoRef.current) videoRef.current.currentTime = 0;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
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

      const res = await fetch(`${BACKEND_URL}/backend/transcribe`, {
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
    formData.append('mode', videoPlatform);
    formData.append('customFilename', customFilename);

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
    formData.append('captionStyle', captionStyle);
    formData.append('captionFont', captionFont);
    formData.append('showAvatar', showAvatar.toString());
    formData.append('avatarX', avatarX.toString());
    formData.append('avatarY', avatarY.toString());
    formData.append('avatarScale', avatarScale.toString());
    formData.append('cropAvatarTop', cropAvatarTop.toString());
    formData.append('cropAvatarBottom', cropAvatarBottom.toString());
    formData.append('cropAvatarLeft', cropAvatarLeft.toString());
    formData.append('cropAvatarRight', cropAvatarRight.toString());
    formData.append('avatarLayerPosition', avatarLayerPosition);
    formData.append('captionPosition', captionPosition);

    if (avatarVideoFile) {
      formData.append('avatarVideo', avatarVideoFile);
    }


    try {
      // Simulate transition to processing because large uploads are quick, then render takes time
      const uploadTimeout = setTimeout(() => {
        setGenerationStatus('processing');
      }, 1500);

      const res = await fetch(`${BACKEND_URL}/backend/generate`, {
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
      `${BACKEND_URL}/backend/syncstart`,
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
      const res = await fetch(`${BACKEND_URL}/backend/syncupload`, {
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

  /* No login gate — app is accessible to everyone */

  const activeCaption = captions.find(c => previewCurrentTime >= c.start && previewCurrentTime <= c.end);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-amber-100 via-orange-200 to-blue-200 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            PDR's Automated Video Studio
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
              <div className="flex flex-col gap-3">
                {/* File Upload Button */}
                <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-900/30 hover:border-slate-700 cursor-pointer transition-all group py-6 px-4 text-center">
                  <ImageIcon className="h-8 w-8 text-slate-500 group-hover:text-orange-400 transition-colors mb-2.5" />
                  <span className="text-xs font-semibold text-slate-300">Choose Image</span>
                  <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Paste from Clipboard Button */}
                <button
                  type="button"
                  onClick={handlePasteImage}
                  className="flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:bg-indigo-950/30 hover:border-indigo-500/50 transition-all py-4 px-4 group"
                >
                  <Clipboard className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300 transition-colors">
                      Paste from Clipboard
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                      Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[9px]">Ctrl+V</kbd> or tap this button
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 sm:hidden">
                      Tap to paste copied image
                    </p>
                  </div>
                </button>
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
                      type="button"
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
                  No image selected yet. Center image overlays above the background.
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

          {/* Step 3: Soundtrack */}
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

                {/* AI Script Generation Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 pb-3 border-b border-slate-800/60">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Target Script Duration</label>
                    <select
                      value={scriptDuration}
                      onChange={(e) => setScriptDuration(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors cursor-pointer"
                    >
                      {generateDurationOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleGetAIScript}
                      disabled={isGeneratingScript || !imageFile}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-650 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-xs py-2 transition-all border border-indigo-500/20 shadow-md"
                    >
                      {isGeneratingScript ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating AI Script...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5" />Get AI Script from Image</>
                      )}
                    </button>
                  </div>
                </div>

                {!imageFile && (
                  <p className="text-[10px] text-amber-400/90 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg leading-relaxed">
                    âš ï¸ <strong>Note:</strong> Upload a center image with text in Step 2 to generate script with AI.
                  </p>
                )}

                {scriptError && (
                  <p className="text-[10px] text-red-400 bg-red-950/20 border border-red-500/25 p-2.5 rounded-lg leading-relaxed">
                    âŒ {scriptError}
                  </p>
                )}

                {recommendedVoice && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Recommended Voice Category: <strong>{recommendedVoice === 'Male' ? 'Male Voice (M)' : 'Female Voice (F)'}</strong> - Auto-selected a preset.
                    </span>
                  </div>
                )}

                {/* Script textarea */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-orange-400">Telugu Script (for generating voice)</span>
                  <textarea
                    rows={4}
                    placeholder="Type your Telugu script here... (e.g.: à°¨à°®à°¸à±à°•à°¾à°°à°‚! à°¶à±à°­à±‹à°¦à°¯à°‚. à°ˆ à°µà±€à°¡à°¿à°¯à±‹ à°®à±€à°•à± à°¨à°šà±à°šà±à°¤à±à°‚à°¦à°¨à°¿ à°†à°¶à°¿à°¸à±à°¤à±à°¨à±à°¨à°¾à°¨à±.)"
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
                          <span className={`block text-[9px] mt-1 font-mono ${isActive ? 'text-sky-300' : 'text-slate-600'}`}>
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
                  <span className="text-[9px] text-slate-500 ml-auto">DSP: 7-band EQ · HP 80Hz Â· Locked</span>
                  <span className="text-[10px] font-mono text-orange-300 ml-2">1.65x</span>
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


          {/* Step 5: Bottom Banner / Watermark */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                  5
                </div>
                <h2 className="text-lg font-semibold text-slate-200">{t('step5')}</h2>
              </div>
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-850 animate-[fadeIn_0.2s_ease-out] wm-control-panel">
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsLockedWm1(!isLockedWm1)}
                      className={`flex items-center gap-1 font-semibold transition-colors ${
                        isLockedWm1 ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {isLockedWm1 ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      {isLockedWm1 ? 'Locked' : 'Lock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMovableX(4);
                        setMovableY(88);
                        setMovableScale(91.78571428571428);
                      }}
                      className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                    >
                      Reset Position
                    </button>
                  </div>
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
                  ðŸ’¡ <strong>Tip:</strong> Drag the banner layer directly on the Live Output Simulation player to place it anywhere (e.g. center at the bottom).
                </p>
              </div>

              {/* Watermark 2 settings card */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800 wm-control-panel">
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
                  <div className="space-y-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40 animate-[fadeIn_0.2s_ease-out] wm-control-panel">
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
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsLockedWm2(!isLockedWm2)}
                            className={`flex items-center gap-1 font-semibold transition-colors ${
                              isLockedWm2 ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            {isLockedWm2 ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {isLockedWm2 ? 'Locked' : 'Lock'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMovable2X(75);
                              setMovable2Y(5);
                              setMovable2Scale(20);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                          >
                            Reset Position
                          </button>
                        </div>
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

          
          {/* Step 5B: Avatar Character Overlay (Dummy Lip Sync) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                  5B
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">Avatar Character Layer (Dummy Lip Sync)</h2>
                  <p className="text-[10px] text-slate-400">Position speaker avatar at top-left of center poster. Muted video loops automatically for full audio length.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatar(!showAvatar)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showAvatar
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
              >
                {showAvatar ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {showAvatar && (
              <div className="space-y-4 pt-2">
                {/* Upload Custom Avatar Video */}
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                  <VideoIcon className="h-5 w-5 text-orange-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-300">Custom Avatar Video (Optional WebM/MP4)</p>
                    <p className="text-[10px] text-slate-500">Default avatar preset is loaded automatically. Upload custom video to overwrite.</p>
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="video/webm,video/mp4"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setAvatarVideoFile(file);
                          setAvatarVideoUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Avatar Position Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                  
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Avatar Layer Order</p>
                    <p className="text-[10px] text-slate-500">Tuck avatar behind center poster image or place in front.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAvatarLayerPosition('behind')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        avatarLayerPosition === 'behind'
                          ? 'border-orange-500 bg-orange-950/40 text-orange-400'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      Behind Center Poster (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarLayerPosition('front')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        avatarLayerPosition === 'front'
                          ? 'border-orange-500 bg-orange-950/40 text-orange-400'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      In Front of Poster
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Avatar Size (Width)</span>
                      <span>{avatarScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={avatarScale}
                      onChange={(e) => setAvatarScale(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Position X</span>
                      <span>{avatarX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={avatarX}
                      onChange={(e) => setAvatarX(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Position Y</span>
                      <span>{avatarY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={avatarY}
                      onChange={(e) => setAvatarY(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 6: Dynamic Captions (Optional) */}
          {(videoPlatform === 'youtube' || videoPlatform === 'instagram') && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 font-semibold text-sm border border-orange-500/20">
                    6
                  </div>
                  <h2 className="text-lg font-semibold text-slate-200">{t('step6')}</h2>
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
                    âš ï¸ <strong>Note:</strong> You must upload a soundtrack in Step 4 before using auto-transcription.
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
                      ðŸ’¡ <strong>Tip:</strong> Timestamps are in seconds. The simulator dynamically highlights the active caption during playback and bounces it with a CSS animation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Simulation Preview & Export (Right side) */}
        <div className="lg:col-span-5 space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">

          {/* â”€â”€â”€ Live API Key & Quota Status Panel â”€â”€â”€ */}
          {groqStatusPool.length > 0 && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Live API Key & Quota Status</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetGroqStatus}
                  className="text-[9px] font-bold text-orange-400 hover:text-orange-300 bg-slate-900 border border-orange-500/30 px-2 py-1 rounded transition-colors"
                >
                  Reset Quotas
                </button>
              </div>

              {/* List of keys and status */}
              <div className="space-y-2">
                {groqStatusPool.map((keyStatus) => (
                  <div key={keyStatus.index} className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-indigo-400">Key #{keyStatus.index}</span>
                        <span className="text-[10px] font-mono text-slate-450 bg-slate-900 px-1 py-0.5 rounded">
                          {keyStatus.keyMasked}
                        </span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        keyStatus.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                      }`}>
                        {keyStatus.status}
                      </span>
                    </div>

                    {/* Models exhausted list */}
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[9px] text-slate-500">Exhausted Models:</span>
                      {keyStatus.exhaustedModels.length > 0 ? (
                        keyStatus.exhaustedModels.map((model, midx) => (
                          <span key={midx} className="text-[8px] bg-red-950/45 text-red-300 border border-red-900/30 px-1 rounded font-mono">
                            {model.replace('meta-llama/', '').replace('llama-', '')}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] text-emerald-400 font-semibold">None</span>
                      )}
                    </div>

                    {keyStatus.lastError && (
                      <div className="text-[8px] text-rose-400 bg-rose-950/20 border border-rose-900/20 px-1.5 py-0.5 rounded font-mono truncate" title={keyStatus.lastError}>
                        Error: {keyStatus.lastError}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Display info of last successful query if available */}
              {apiStatus && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-2">
                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Last OCR Model</div>
                    <div className="text-[9px] font-mono text-sky-400 truncate mt-0.5" title={apiStatus.ocrModel}>
                      {apiStatus.ocrModel?.replace('meta-llama/', '') || 'â€”'}
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">Key #{apiStatus.ocrKeyIndex ?? '?'} used</div>
                  </div>
                  <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-2">
                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Last Script Model</div>
                    <div className="text-[9px] font-mono text-orange-400 truncate mt-0.5" title={apiStatus.scriptModel}>
                      {apiStatus.scriptModel?.replace('llama-', 'Llama-') || 'â€”'}
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">Key #{apiStatus.scriptKeyIndex ?? '?'} used</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col items-center">
            {pdrAutoStatus && (
              <div className="w-full mb-4 p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg backdrop-blur-sm animate-pop">
                <div className="flex items-center gap-2">
                  {isPdrAutoRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                  <span>{pdrAutoStatus}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPdrAutoStatus('')}
                  className="text-[10px] text-amber-400 hover:text-amber-200 underline font-mono"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="w-full flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                Live Output Simulation
              </h2>
            </div>

            {/* Player + Dual Quick Action Sidebars layout */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full justify-center items-center sm:items-start">

              {/* â”€â”€â”€ Left Quick Action Sidebar â”€â”€â”€ */}
              <div className="flex flex-col gap-2 w-[calc(50%-8px)] sm:w-[88px] flex-shrink-0 order-2 sm:order-1">
                {/* WM2 Toggle */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center leading-tight">WM2 Layer</span>
                  <button
                    type="button"
                    onClick={() => setShowMovable2(!showMovable2)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showMovable2 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showMovable2 ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Paste Image */}
                <button
                  type="button"
                  onClick={handlePasteImage}
                  title="Paste image from clipboard (Ctrl+V)"
                  className="rounded-xl border border-dashed border-slate-700 bg-slate-900/80 hover:bg-indigo-950/40 hover:border-indigo-500/50 transition-all p-2 flex flex-col items-center gap-1 group w-full"
                >
                  <Clipboard className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[8px] font-semibold text-slate-450 group-hover:text-indigo-300 text-center leading-tight">Paste Image</span>
                  <span className="text-[7px] text-slate-600 font-mono">Ctrl+V</span>
                </button>

                {/* Duration + Get AI Script */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 flex flex-col gap-1.5 w-full">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide text-center">Duration</span>
                  <select
                    value={scriptDuration}
                    onChange={(e) => setScriptDuration(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-1 py-1 text-[9px] text-slate-200 outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {generateDurationOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleGetAIScript}
                    disabled={isGeneratingScript || !imageFile}
                    className="w-full flex items-center justify-center gap-1 rounded-lg bg-indigo-700 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-[8px] py-1.5 transition-all"
                    title="Get AI Script from Image"
                  >
                    {isGeneratingScript ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <><Sparkles className="h-3 w-3" />AI Script</>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulating Portrait Player 9:16 */}
              <div ref={containerRef} className="relative aspect-[9/16] flex-shrink-0 w-[200px] sm:w-[240px] rounded-2xl overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80 order-1 sm:order-2">
              
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
                    cursor: isLockedWm1 ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                    userSelect: 'none',
                    touchAction: 'none',
                    zIndex: 40,
                    border: '1.5px dashed transparent',
                    borderColor: activeWatermark === 'wm1' ? '#FF9100' : 'transparent',
                    padding: '2px',
                    boxShadow: activeWatermark === 'wm1' ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
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
                  {activeWatermark === 'wm1' && !isLockedWm1 && (
                    <>
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
                    </>
                  )}
                </div>
              )}

              
              {/* Avatar Character Overlay Layer in Live Simulator */}
              {showAvatar && avatarVideoUrl && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${avatarX}%`,
                    top: `${avatarY}%`,
                    width: `${avatarScale}%`,
                    zIndex: avatarLayerPosition === 'behind' ? 15 : 35,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                  className="rounded-lg overflow-hidden shadow-lg"
                >
                  <video
                    key={avatarVideoUrl}
                    src={avatarVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain pointer-events-none"
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
                    cursor: isLockedWm2 ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                    userSelect: 'none',
                    touchAction: 'none',
                    zIndex: 40,
                    border: '1.5px dashed transparent',
                    borderColor: activeWatermark === 'wm2' ? '#039BE5' : 'transparent',
                    padding: '2px',
                    boxShadow: activeWatermark === 'wm2' ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
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
                  {activeWatermark === 'wm2' && !isLockedWm2 && (
                    <>
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
                    </>
                  )}
                </div>
              )}

              {/* Synced Audio Captions overlay — Dynamic Preset Styles */}
              {(() => {
                const getCaptionStyleCSS = (style: string, font: string) => {
                  const fontFam = font || 'Arial Black';
                  switch (style) {
                    case 'blast':
                      return {
                        fontFamily: fontFam,
                        color: '#FACC15',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1.5px solid rgba(249, 115, 22, 0.6)',
                        boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
                        textShadow: '0 0 12px #F97316, 0 0 24px #EA580C, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                        borderRadius: '8px',
                        padding: '6px 14px'
                      };
                    case 'green_box':
                      return {
                        fontFamily: fontFam,
                        color: '#10B981',
                        backgroundColor: '#090D16',
                        border: '2px solid #10B981',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      };
                    case 'pink_yellow':
                      return {
                        fontFamily: fontFam,
                        color: '#FDE047',
                        backgroundColor: '#DB2777',
                        borderRadius: '10px',
                        padding: '6px 14px',
                        boxShadow: '0 4px 18px rgba(219, 39, 119, 0.6)'
                      };
                    case 'frost':
                      return {
                        fontFamily: fontFam,
                        color: '#22D3EE',
                        backgroundColor: 'rgba(6, 182, 212, 0.2)',
                        border: '1.5px solid rgba(34, 211, 238, 0.6)',
                        textShadow: '0 0 14px #06B6D4, 0 0 28px #0891B2, 2px 2px 0 #000, -2px -2px 0 #000',
                        borderRadius: '8px',
                        padding: '6px 14px'
                      };
                    case 'classic':
                    default:
                      return {
                        fontFamily: fontFam,
                        color: '#FACC15',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                        borderRadius: '8px',
                        padding: '6px 14px'
                      };
                  }
                };

                const capPosClass = captionPosition === 'bottom' ? 'bottom-[12%] left-0 right-0 px-3' : 'top-[4.5%] left-[14%] right-2 px-2';
                const customStyle = getCaptionStyleCSS(captionStyle, captionFont);

                if (wordTimestamps.length > 0 && currentWordIdx >= 0) {
                  const currentWord = wordTimestamps[currentWordIdx];
                  return (
                    <div className={`absolute ${capPosClass} left-0 right-0 px-3 text-center pointer-events-none z-30 select-none`}>
                      <span
                        style={customStyle}
                        className="inline-block font-black text-xs sm:text-sm leading-snug tracking-wide backdrop-blur-[1px] animate-pop"
                      >
                        {currentWord.word}
                      </span>
                    </div>
                  );
                }
                if (activeCaption) {
                  return (
                    <div
                      key={activeCaption.id}
                      className={`absolute ${capPosClass} left-0 right-0 px-3 text-center pointer-events-none z-30 select-none animate-pop`}
                    >
                      <span
                        style={customStyle}
                        className="inline-block font-black text-xs sm:text-sm leading-snug tracking-wide backdrop-blur-[1px]"
                      >
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

            </div>

              {/* â”€â”€â”€ Right Quick Action Sidebar â”€â”€â”€ */}
              <div className="flex flex-col gap-2 w-[calc(50%-8px)] sm:w-[88px] flex-shrink-0 order-3 sm:order-3">
                {/* Voice Presets Mini */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 flex flex-col gap-1.5 w-full">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide text-center">Voice</span>
                  {/* Female */}
                  <div className="text-[7px] text-pink-400 font-semibold text-center">♀ F</div>
                  <div className="flex flex-col gap-1">
                    {TTS_PRESETS.filter(p => p.id === 'FM1').map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (selectedPresetId === preset.id) cyclePresetPitch(preset.id);
                          else setSelectedPresetId(preset.id);
                        }}
                        className={`relative rounded-md border px-1 py-0.5 text-[8px] font-bold transition-all ${
                          selectedPresetId === preset.id
                            ? 'border-pink-500/60 bg-pink-950/30 text-pink-300'
                            : 'border-slate-700 bg-slate-950/40 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {preset.id}
                        {selectedPresetId === preset.id && <span className="absolute top-0 right-0 h-1 w-1 rounded-full bg-pink-400 animate-pulse" />}
                      </button>
                    ))}
                  </div>
                  {/* Male */}
                  <div className="text-[7px] text-sky-400 font-semibold text-center mt-0.5">♂ M</div>
                  <div className="flex flex-col gap-1">
                    {TTS_PRESETS.filter(p => p.id === 'MV1' || p.id === 'MV2').map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (selectedPresetId === preset.id) cyclePresetPitch(preset.id);
                          else setSelectedPresetId(preset.id);
                        }}
                        className={`rounded-md border px-1 py-0.5 text-[8px] font-bold transition-all ${
                          selectedPresetId === preset.id
                            ? 'border-sky-500/60 bg-sky-950/30 text-sky-300'
                            : 'border-slate-700 bg-slate-950/40 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {preset.id}
                      </button>
                    ))}
                  </div>
                  {/* Active indicator */}
                  {selectedPresetId && (
                    <div className="text-[7px] text-center text-slate-500 mt-0.5 font-mono leading-tight truncate animate-pulse" title={TTS_PRESETS.find(p => p.id === selectedPresetId)?.label}>
                      {TTS_PRESETS.find(p => p.id === selectedPresetId)?.label}
                    </div>
                  )}
                </div>

                {/* Generate Audio */}
                <button
                  type="button"
                  onClick={handleGenerateTTS}
                  disabled={isGeneratingTTS || !ttsScript.trim()}
                  className="rounded-xl border border-orange-500/40 bg-orange-600/20 hover:bg-orange-600/40 disabled:bg-slate-900/80 disabled:border-slate-700 disabled:cursor-not-allowed transition-all p-2 flex flex-col items-center gap-1 group w-full"
                  title="Generate Audio & Auto-fill Captions"
                >
                  {isGeneratingTTS ? (
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                  ) : (
                    <Mic className="h-4 w-4 text-orange-400 group-disabled:text-slate-600" />
                  )}
                  <span className="text-[8px] font-bold text-orange-300 group-disabled:text-slate-600 text-center leading-tight">
                    {isGeneratingTTS ? 'Generating...' : 'Gen Audio'}
                  </span>
                </button>
              </div>
            </div>{/* end flex gap-3 */}

            {/* Dedicated Player Controls outside the frame */}
            <div className="w-full max-w-[280px] mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col gap-3">
              {/* Timeline slider */}
              {audioFile ? (
                <div className="w-full space-y-1">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${previewProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{previewCurrentTime.toFixed(1)}s</span>
                    <span>{videoPlatform === 'instagram' ? '10.0s' : `${audioDuration.toFixed(1)}s`}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 text-center py-1">No audio loaded for timeline</div>
              )}

              {/* Control Bar */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!selectedBg}
                  className="h-10 w-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-slate-950 font-bold" /> : <Play className="h-5 w-5 fill-slate-950 ml-0.5 font-bold" />}
                </button>
              </div>
            </div>

            {/* Generation Status Console */}
            <div className="w-full mt-6 space-y-4">
              {generationStatus === 'idle' && (
                <>
                  {!driveConfig.isAuthenticated ? (
                    <div className="w-full border border-slate-700/50 rounded-xl bg-slate-900/40 p-4 text-left space-y-3">
                      <div className="flex gap-2 text-slate-400 items-start">
                        <FolderOpen className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-300">Google Drive Upload (Optional)</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Connect your Google Account to automatically upload generated videos to Google Drive. Videos can also be downloaded directly.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleGoogleConnect}
                        className="w-full py-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Connect Google Drive
                      </button>
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

                      {/* Custom Filename Input */}
                      <div className="w-full border border-slate-800 rounded-xl bg-slate-950/40 p-4 text-left space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Custom Filename (Optional)</label>
                          <input
                            type="text"
                            placeholder="Enter filename (e.g. MyAmazingVideo)"
                            value={customFilename}
                            onChange={(e) => setCustomFilename(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors placeholder-slate-600"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateVideo}
                        disabled={!selectedBgId || !imageFile || !audioFile}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-orange-500/15 hover:opacity-95 disabled:from-slate-800 disabled:via-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                      >
                        <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        {t('generateVideoBtn')}
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







