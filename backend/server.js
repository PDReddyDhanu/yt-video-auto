import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { google } from 'googleapis';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const execPromise = promisify(exec);

// Helper to format ASS subtitle timestamps (H:MM:SS.CS)
function formatAssTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  
  const hrsStr = hrs.toString();
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');
  const csStr = cs.toString().padStart(2, '0');
  
  return `${hrsStr}:${minsStr}:${secsStr}.${csStr}`;
}

// Helper to construct ASS subtitle file content
function generateAssContent(captions) {
  const header = `[Script Info]
Title: AutoVideo Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,65,&H0047E0FD,&H000000FF,&H00000000,&H8C000000,-1,0,0,0,100,100,0,0,3,10,0,8,10,10,110,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  let events = '';
  for (const caption of captions) {
    const startStr = formatAssTime(caption.start || 0);
    const endStr = formatAssTime(caption.end || 0);
    const text = (caption.text || '').replace(/\r?\n/g, ' ');
    events += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${text}\n`;
  }

  return header + events;
}

function cleanOldTtsFiles() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    for (const file of files) {
      if (file.startsWith('tts-') && file.endsWith('.mp3')) {
        const filePath = path.join(UPLOADS_DIR, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old TTS file: ${file}`);
        } catch (err) {
          // ignore if locked
        }
      }
    }
  } catch (e) {
    console.warn("Could not clean old TTS files:", e);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ffmpegPath = ffmpegInstaller.path;
const ffprobePath = ffprobeInstaller.path;

// Ensure uploads, output, and music directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'output');
const MUSIC_DIR = path.join(__dirname, 'music');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(MUSIC_DIR)) fs.mkdirSync(MUSIC_DIR, { recursive: true });

// DB Helpers
const DB_FILE = path.join(__dirname, 'db.json');
function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    return {
      backgrounds: [],
      watermark: {
        filename: '1000429881-removebg-preview.png',
        position: 'bottom-right',
        size: 180,
        opacity: 1.0,
        margin: 40
      },
      googleDrive: {
        clientId: '',
        clientSecret: '',
        redirectUri: 'http://localhost:3001/api/auth/google/callback',
        tokens: null,
        targetFolderId: 'root'
      },
      history: []
    };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Write a default watermark if it doesn't exist
const defaultWatermarkPath = path.join(UPLOADS_DIR, 'default_watermark.png');
if (!fs.existsSync(defaultWatermarkPath)) {
  // Simple transparent 1x1 PNG or small base64 pixel we write directly
  // A simple 150x50 transparent PNG with text would be nice, but since we cannot compile canvas easily without node-canvas,
  // we can use a small 1x1 transparent PNG or write a base64 string of a pre-made PNG logo.
  // Let's write a simple base64 transparent PNG that has some opacity.
  // Alternatively, we can use FFmpeg to generate a text image and save it!
  // Let's call FFmpeg to generate our default watermark PNG.
  // We'll run it in server setup.
  const cmd = `"${ffmpegPath}" -y -f lavfi -i color=color=white@0.0:size=300x100,drawtext=text='AUTOVIDEO':fontcolor=white@0.8:fontsize=36:x=(w-tw)/2:y=(h-th)/2 -vframes 1 "${defaultWatermarkPath}"`;
  exec(cmd, (err) => {
    if (err) {
      console.warn("Could not generate text watermark with drawtext (might be missing font config). Writing a small placeholder PNG.");
      // Standard 1x1 transparent pixel png
      const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      fs.writeFileSync(defaultWatermarkPath, transparentPixel);
    } else {
      console.log("Successfully generated default text watermark PNG using FFmpeg!");
    }
  });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

// Serve static directories
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/output', express.static(OUTPUT_DIR));
app.use('/music', express.static(MUSIC_DIR));

// Helper: Get audio/video duration
async function getMediaDuration(filePath) {
  try {
    const cmd = `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const { stdout } = await execPromise(cmd);
    const duration = parseFloat(stdout.trim());
    return isNaN(duration) ? 0 : duration;
  } catch (err) {
    console.error("Error running ffprobe:", err);
    return 0;
  }
}

// ---------------- BACKGROUND TEMPLATES API ----------------

// Sync templates from uploads folder
async function syncBackgroundsFromFolder() {
  try {
    const db = readDb();
    let changed = false;

    if (!fs.existsSync(UPLOADS_DIR)) {
      return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'));
    const existingFilenames = db.backgrounds.map(b => b.filename);

    // Add new ones
    for (const filename of mp4Files) {
      if (!existingFilenames.includes(filename)) {
        const filePath = path.join(UPLOADS_DIR, filename);
        const duration = await getMediaDuration(filePath);
        
        let cleanName = filename.replace(/\.[^/.]+$/, "");
        cleanName = cleanName.replace(/_|-/g, " ");
        cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        
        db.backgrounds.push({
          id: 'bg-' + filename.split('.')[0] + '-' + Math.round(Math.random() * 1000),
          name: `${cleanName} (${duration.toFixed(0)}s)`,
          filename: filename,
          duration: duration || 10
        });
        changed = true;
      }
    }

    // Remove old ones that don't exist anymore
    const validBackgrounds = [];
    for (const bg of db.backgrounds) {
      const filePath = path.join(UPLOADS_DIR, bg.filename);
      if (fs.existsSync(filePath)) {
        validBackgrounds.push(bg);
      } else {
        changed = true;
      }
    }

    if (changed) {
      db.backgrounds = validBackgrounds;
      writeDb(db);
    }
  } catch (err) {
    console.error("Error syncing background folder:", err);
  }
}

app.get('/api/backgrounds', async (req, res) => {
  await syncBackgroundsFromFolder();
  const db = readDb();
  res.json(db.backgrounds || []);
});

app.get('/api/music', (req, res) => {
  try {
    if (!fs.existsSync(MUSIC_DIR)) {
      fs.mkdirSync(MUSIC_DIR, { recursive: true });
    }
    const files = fs.readdirSync(MUSIC_DIR);
    const musicFiles = files
      .filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ext === '.mp3' || ext === '.wav' || ext === '.m4a' || ext === '.ogg';
      })
      .map(f => {
        return {
          name: path.basename(f, path.extname(f)),
          filename: f,
          url: `/music/${f}`
        };
      });
    res.json(musicFiles);
  } catch (error) {
    console.error("Failed to list music files:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backgrounds', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    const duration = await getMediaDuration(req.file.path);
    const db = readDb();
    const newBg = {
      id: 'bg-' + Date.now(),
      name: req.body.name || req.file.originalname,
      filename: req.file.filename,
      duration: duration
    };
    db.backgrounds.push(newBg);
    writeDb(db);
    res.json(newBg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/backgrounds/:id', (req, res) => {
  const db = readDb();
  const index = db.backgrounds.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Background not found' });
  }
  const bg = db.backgrounds[index];
  const filePath = path.join(UPLOADS_DIR, bg.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  db.backgrounds.splice(index, 1);
  writeDb(db);
  res.json({ success: true });
});

// ---------------- WATERMARK SETTINGS API ----------------

app.get('/api/watermark', (req, res) => {
  const db = readDb();
  res.json(db.watermark);
});

app.post('/api/watermark', upload.single('watermarkImage'), (req, res) => {
  try {
    const db = readDb();
    if (req.file) {
      // Delete old watermark file if it's not the default
      if (db.watermark.filename && db.watermark.filename !== 'default_watermark.png') {
        const oldPath = path.join(UPLOADS_DIR, db.watermark.filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      db.watermark.filename = req.file.filename;
    }

    if (req.body.position) db.watermark.position = req.body.position;
    if (req.body.size) db.watermark.size = parseInt(req.body.size);
    if (req.body.opacity) db.watermark.opacity = parseFloat(req.body.opacity);
    if (req.body.margin) db.watermark.margin = parseInt(req.body.margin);

    writeDb(db);
    res.json(db.watermark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- TEXT-TO-SPEECH PROXY API ----------------

const TTS_API = process.env.TTS_API_URL || 'http://127.0.0.1:8001';

// Proxy: Get available voices from TTS server
app.get('/api/tts/voices', async (req, res) => {
  try {
    const response = await fetch(`${TTS_API}/api/voices`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(503).json({ error: 'TTS service unavailable. Please ensure the TTS server is running.' });
  }
});

// Proxy: Generate audio from text, save to uploads, return URL and filename
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voice_id, language_code, gender, speed, pitch } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const ttsPayload = {
      text: text.trim(),
      voice_id: voice_id || null,
      language_code: language_code || 'te-IN',
      gender: gender || 'FEMALE',
      speed: parseFloat(speed) || 1.65,
      pitch: parseInt(pitch) || 0
    };

    // Use the word-boundary endpoint for precise per-word timestamps
    const ttsRes = await fetch(`${TTS_API}/api/generate-with-words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsPayload)
    });

    if (!ttsRes.ok) {
      const errData = await ttsRes.json().catch(() => ({ detail: 'Unknown TTS error' }));
      return res.status(500).json({ error: errData.detail || 'TTS generation failed.' });
    }

    const ttsData = await ttsRes.json();
    const { audio_b64, word_timestamps } = ttsData;

    // Decode base64 audio and save to uploads/
    const audioFilename = `tts-${Date.now()}.mp3`;
    const audioSavePath = path.join(UPLOADS_DIR, audioFilename);
    fs.writeFileSync(audioSavePath, Buffer.from(audio_b64, 'base64'));

    console.log(`[TTS] Saved ${audioFilename} with ${word_timestamps?.length || 0} word timestamps`);

    res.json({
      url: `/uploads/${audioFilename}`,
      filename: audioFilename,
      word_timestamps: word_timestamps || []
    });
  } catch (err) {
    console.error('TTS proxy error:', err);
    res.status(503).json({ error: 'TTS service unavailable. Make sure the TTS server is running on port 8001.' });
  }
});

// ---------------- AUDIO TRANSCRIPTION API ----------------

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const audioPath = req.file.path;
    const pythonScript = path.join(__dirname, 'transcribe.py');
    const lang = req.body.language || 'te-IN'; // defaults to Telugu

    const ffmpegDir = path.dirname(ffmpegPath);
    const ffprobeDir = path.dirname(ffprobePath);
    const env = { ...process.env };
    const pathKey = Object.keys(env).find(k => k.toLowerCase() === 'path') || 'PATH';
    env[pathKey] = `${ffmpegDir}${path.delimiter}${ffprobeDir}${path.delimiter}${env[pathKey] || ''}`;

    console.log(`Running transcription script on ${audioPath} for language ${lang}...`);
    const child = spawn('python', ['-W', 'ignore', pythonScript, audioPath, lang], { env });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      // Cleanup temporary uploaded audio file
      try {
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      } catch (e) {
        console.warn("Could not delete temp transcription file:", e);
      }

      if (code === 0) {
        try {
          const parsed = JSON.parse(stdoutData.trim());
          if (parsed.error) {
            return res.status(500).json({ error: parsed.error });
          }
          res.json(parsed);
        } catch (err) {
          console.error("Failed to parse transcription script JSON output:", stdoutData);
          res.status(500).json({ error: 'Failed to parse transcription output.', details: stdoutData, raw: stdoutData });
        }
      } else {
        console.error("Transcription script exited with code:", code);
        console.error("Stderr logs:", stderrData);
        res.status(500).json({ error: 'Transcription failed.', details: stderrData });
      }
    });

  } catch (error) {
    console.error("Transcription route crash:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ error: error.message });
  }
});

// ---------------- VIDEO GENERATION API ----------------

app.post('/api/generate', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'movableWatermark', maxCount: 1 }
]), async (req, res) => {
  let progressState = 'Uploading';
  
  try {
    const { mode, musicFile, trimStart, bgId, showMovable, movableX, movableY, movableScale, cropTop, cropBottom, cropLeft, cropRight, showMovable2, movable2X, movable2Y, movable2Scale, crop2Top, crop2Bottom, crop2Left, crop2Right, imageScale, folderId, captions } = req.body;
    const files = req.files;

    const isInstagram = mode === 'instagram';

    // Parse captions and generate ASS subtitles if present (no subtitles for Instagram mode)
    const hasSubtitles = !isInstagram && captions && captions !== '[]';
    let assFilename = null;
    let assPath = null;
    if (hasSubtitles) {
      try {
        const parsedCaptions = JSON.parse(captions);
        if (Array.isArray(parsedCaptions) && parsedCaptions.length > 0) {
          const assContent = generateAssContent(parsedCaptions);
          assFilename = `subtitles-${Date.now()}.ass`;
          assPath = path.join(__dirname, assFilename);
          fs.writeFileSync(assPath, assContent, 'utf8');
          console.log("Written subtitles to:", assPath);
        }
      } catch (err) {
        console.error("Failed to parse or write subtitles:", err);
      }
    }

    if (!bgId) return res.status(400).json({ error: 'Missing background video ID (bgId)' });
    if (!files.image || !files.image[0]) return res.status(400).json({ error: 'Missing image file' });
    if (!isInstagram && (!files.audio || !files.audio[0])) return res.status(400).json({ error: 'Missing audio file' });
    if (isInstagram && !musicFile) return res.status(400).json({ error: 'Missing musicFile parameter for Instagram mode' });

    const db = readDb();
    const client = getOAuthClient(db);
    if (!client || !db.googleDrive.tokens || !db.googleDrive.tokens.access_token) {
      return res.status(401).json({ error: 'Google Drive is not authenticated. Please authorize Google Drive in the System Control Center first.' });
    }

    const bg = db.backgrounds.find(b => b.id === bgId);
    if (!bg) return res.status(400).json({ error: 'Invalid background ID' });

    const bgPath = path.join(UPLOADS_DIR, bg.filename);
    const imgPath = files.image[0].path;
    
    let audioPath = '';
    let duration = 6;

    if (isInstagram) {
      audioPath = path.join(MUSIC_DIR, musicFile);
      if (!fs.existsSync(audioPath)) {
        return res.status(400).json({ error: `Music file "${musicFile}" not found in music folder` });
      }
      duration = 6;
    } else {
      audioPath = files.audio[0].path;
      progressState = 'Analyzing Duration';
      const audioDuration = await getMediaDuration(audioPath);
      if (audioDuration <= 0) {
        return res.status(400).json({ error: 'Could not determine audio duration' });
      }
      duration = audioDuration;
    }

    const watermarkPath = path.join(UPLOADS_DIR, db.watermark.filename || 'default_watermark.png');

    progressState = 'Processing Video';
    const outputFilename = `render-${Date.now()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    // Calculate watermark position overlay strings for FFmpeg
    const wm = db.watermark;
    let overlayCoords = `W-w-${wm.margin}:H-h-${wm.margin}`; // bottom-right default
    if (wm.position === 'top-left') {
      overlayCoords = `${wm.margin}:${wm.margin}`;
    } else if (wm.position === 'top-right') {
      overlayCoords = `W-w-${wm.margin}:${wm.margin}`;
    } else if (wm.position === 'bottom-left') {
      overlayCoords = `${wm.margin}:H-h-${wm.margin}`;
    }

    const isMovableEnabled = true; // compulsory mandatory bottom banner
    let movablePath = path.join(UPLOADS_DIR, 'ChatGPT Image Jun 17, 2026, 03_36_57 AM.png');
    if (files.movableWatermark && files.movableWatermark[0]) {
      movablePath = files.movableWatermark[0].path;
    } else if (!fs.existsSync(movablePath)) {
      movablePath = path.join(UPLOADS_DIR, 'Watermark-movable.png');
      if (!fs.existsSync(movablePath)) {
        movablePath = path.join(UPLOADS_DIR, 'default_watermark.png');
      }
    }

    let movable2Path = path.join(UPLOADS_DIR, 'watermark2p.png');
    if (!fs.existsSync(movable2Path)) {
      movable2Path = path.join(UPLOADS_DIR, 'default_watermark.png');
    }

    const imgScalePct = parseFloat(imageScale) || 90;
    const targetWidth = Math.round((imgScalePct / 100) * 1080);
    const targetHeight = Math.round((imgScalePct / 100) * 1760);

    // Construct filter complex parts dynamically
    // Overlay 0:v (background) with 1:v (center image)
    const filterComplexParts = [
      `[0:v]scale=w='iw*max(1080/iw,1920/ih)':h='ih*max(1080/iw,1920/ih)',crop=1080:1920[bg];`,
      `[1:v]scale='if(gt(ih/iw,${targetHeight}/${targetWidth}),-1,${targetWidth})':'if(gt(ih/iw,${targetHeight}/${targetWidth}),${targetHeight},-1)'[img];`,
      `[bg][img]overlay=(W-w)/2:(H-h)/2[bg_img];`
    ];

    const mwmScalePct = parseFloat(movableScale) || 91.78571428571428;
    const mwmXPct = parseFloat(movableX) || 4;
    const mwmYPct = parseFloat(movableY) || 83;
    
    const mwmWidth = Math.round((mwmScalePct / 100) * 1080);
    const mwmX = Math.round((mwmXPct / 100) * 1080);
    const mwmY = Math.round((mwmYPct / 100) * 1920);
    
    // Parse crop percentages (defaulting to 32% top, 30% bottom, 0 for left/right)
    const cropL = (cropLeft !== undefined && cropLeft !== null && cropLeft !== '') ? parseFloat(cropLeft) : 0;
    const cropR = (cropRight !== undefined && cropRight !== null && cropRight !== '') ? parseFloat(cropRight) : 0;
    const cropT = (cropTop !== undefined && cropTop !== null && cropTop !== '') ? parseFloat(cropTop) : 32;
    const cropB = (cropBottom !== undefined && cropBottom !== null && cropBottom !== '') ? parseFloat(cropBottom) : 30;
    
    // 2:v is the movable watermark bottom banner
    let mwmFilter = `[2:v]format=rgba`;
    if (cropL > 0 || cropR > 0 || cropT > 0 || cropB > 0) {
      mwmFilter += `,crop=iw*(1-(${cropL}+${cropR})/100):ih*(1-(${cropT}+${cropB})/100):iw*${cropL}/100:ih*${cropT}/100`;
    }
    mwmFilter += `,scale=${mwmWidth}:-1[mwm];`;
    filterComplexParts.push(mwmFilter);
    filterComplexParts.push(`[bg_img][mwm]overlay=${mwmX}:${mwmY}[bg_mwm];`);
    let lastLabel = '[bg_mwm]';

    // 3:v is the optional second movable watermark
    if (showMovable2 === 'true') {
      const mwm2ScalePct = parseFloat(movable2Scale) || 20;
      const mwm2XPct = parseFloat(movable2X) || 75;
      const mwm2YPct = parseFloat(movable2Y) || 5;

      const mwm2Width = Math.round((mwm2ScalePct / 100) * 1080);
      const mwm2X = Math.round((mwm2XPct / 100) * 1080);
      const mwm2Y = Math.round((mwm2YPct / 100) * 1920);

      const crop2L = parseFloat(crop2Left) || 0;
      const crop2R = parseFloat(crop2Right) || 0;
      const crop2T = parseFloat(crop2Top) || 0;
      const crop2B = parseFloat(crop2Bottom) || 0;

      let mwm2Filter = `[3:v]format=rgba`;
      if (crop2L > 0 || crop2R > 0 || crop2T > 0 || crop2B > 0) {
        mwm2Filter += `,crop=iw*(1-(${crop2L}+${crop2R})/100):ih*(1-(${crop2T}+${crop2B})/100):iw*${crop2L}/100:ih*${crop2T}/100`;
      }
      mwm2Filter += `,scale=${mwm2Width}:-1[mwm2];`;
      filterComplexParts.push(mwm2Filter);
      filterComplexParts.push(`[bg_mwm][mwm2]overlay=${mwm2X}:${mwm2Y}[bg_mwm2];`);
      lastLabel = '[bg_mwm2]';
    }

    // Burn subtitles into video if present, otherwise just pipe the stream
    if (assFilename) {
      filterComplexParts.push(`${lastLabel}subtitles='${assFilename}'[outv]`);
    } else {
      filterComplexParts.push(`${lastLabel}null[outv]`);
    }

    const filterComplex = filterComplexParts.join('');

    // Setup input lists and index tracking (no corner watermark logo)
    const ffmpegArgs = [
      '-y',
      '-stream_loop', '-1',
      '-i', bgPath,
      '-i', imgPath,
      '-i', movablePath,
      '-i', movable2Path
    ];

    if (isInstagram) {
      const tStart = parseFloat(trimStart) || 0;
      ffmpegArgs.push('-ss', tStart.toString(), '-t', '6', '-i', audioPath);
    } else {
      ffmpegArgs.push('-i', audioPath);
    }

    const audioInputIndex = 4;

    ffmpegArgs.push(
      '-t', duration.toString(),
      '-filter_complex', filterComplex,
      '-map', '[outv]',
      '-map', `${audioInputIndex}:a`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      outputPath
    );

    console.log("Running FFmpeg with arguments:", ffmpegArgs.join(' '));

    const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

    let stderrData = '';
    ffmpegProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    ffmpegProcess.on('close', async (code) => {
      // Clean up uploaded user temp files
      try {
        if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        if (!isInstagram && audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        if (files.movableWatermark && files.movableWatermark[0] && fs.existsSync(files.movableWatermark[0].path)) {
          fs.unlinkSync(files.movableWatermark[0].path);
        }
        if (assPath && fs.existsSync(assPath)) {
          fs.unlinkSync(assPath);
        }
        // Also delete any generated tts-*.mp3 files from uploads directory
        cleanOldTtsFiles();
      } catch (e) {
        console.warn("Could not clean up temporary upload files:", e);
      }

      if (code === 0) {
        // Direct Google Drive Upload
        try {
          const drive = google.drive({ version: 'v3', auth: client });
          
          // Use folderId from request, or targetFolderId from DB/env, or default to root
          const targetFolderId = folderId || db.googleDrive.targetFolderId || process.env.DRIVE_FOLDER_ID || 'root';
          
          const fileMetadata = {
            name: outputFilename,
            parents: targetFolderId && targetFolderId !== 'root' ? [targetFolderId] : []
          };

          const media = {
            mimeType: 'video/mp4',
            body: fs.createReadStream(outputPath)
          };

          const driveResponse = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
          });

          // Upload successful, delete local output file immediately!
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (unlinkErr) {
            console.warn("Failed to delete local rendered file:", unlinkErr);
          }

          res.json({
            success: true,
            driveFileId: driveResponse.data.id,
            driveLink: driveResponse.data.webViewLink,
            duration: duration,
            videoFilename: outputFilename,
            videoUrl: `/output/${outputFilename}`
          });
        } catch (driveErr) {
          console.error("Direct Google Drive upload failed:", driveErr);
          // Delete local file anyway to avoid storing on local
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (unlinkErr) {}
          
          res.status(500).json({ error: 'Video rendered successfully, but Google Drive upload failed: ' + driveErr.message });
        }
      } else {
        console.error("FFmpeg exited with error code:", code);
        console.error("FFmpeg stderr logs:", stderrData);
        res.status(500).json({ error: 'Video rendering failed', details: stderrData });
      }
    });

  } catch (error) {
    console.error("Video generation route crashed:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history', (req, res) => {
  const db = readDb();
  res.json(db.history || []);
});

app.delete('/api/history', (req, res) => {
  try {
    const db = readDb();
    db.history = [];
    writeDb(db);

    // Clean up any files remaining in output directory
    if (fs.existsSync(OUTPUT_DIR)) {
      const files = fs.readdirSync(OUTPUT_DIR);
      for (const file of files) {
        const filePath = path.join(OUTPUT_DIR, file);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn(`Could not delete file ${file}:`, err);
          }
        }
      }
    }

    res.json({ success: true, message: 'Render history and local output files cleared successfully.' });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- GOOGLE OAUTH & GOOGLE DRIVE INTEGRATION ----------------

// Helper: Get OAuth client based on current settings in DB and .env
function getOAuthClient(db) {
  const clientId = process.env.GOOGLE_CLIENT_ID || db.googleDrive.clientId;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || db.googleDrive.clientSecret;
  
  let redirectUri = process.env.GOOGLE_REDIRECT_URI || db.googleDrive.redirectUri;
  if (process.env.SPACE_HOST) {
    redirectUri = `https://${process.env.SPACE_HOST}/api/auth/google/callback`;
  }
  
  if (!clientId || !clientSecret) {
    return null;
  }
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  if (db.googleDrive.tokens) {
    client.setCredentials(db.googleDrive.tokens);
  }
  client.on('tokens', (newTokens) => {
    // Merge tokens and save to DB
    const freshDb = readDb();
    freshDb.googleDrive.tokens = { ...freshDb.googleDrive.tokens, ...newTokens };
    writeDb(freshDb);
  });
  return client;
}

// Update Google OAuth Client Settings
app.post('/api/drive/config', (req, res) => {
  const { clientId, clientSecret, redirectUri } = req.body;
  const db = readDb();
  db.googleDrive.clientId = clientId || db.googleDrive.clientId;
  db.googleDrive.clientSecret = clientSecret || db.googleDrive.clientSecret;
  db.googleDrive.redirectUri = redirectUri || db.googleDrive.redirectUri;
  writeDb(db);
  res.json({ success: true, config: {
    clientId: process.env.GOOGLE_CLIENT_ID || db.googleDrive.clientId,
    redirectUri: db.googleDrive.redirectUri,
    hasSecret: !!(process.env.GOOGLE_CLIENT_SECRET || db.googleDrive.clientSecret)
  }});
});

app.get('/api/drive/config', (req, res) => {
  const db = readDb();
  const clientId = process.env.GOOGLE_CLIENT_ID || db.googleDrive.clientId;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || db.googleDrive.clientSecret;
  res.json({
    clientId: clientId,
    redirectUri: db.googleDrive.redirectUri,
    hasSecret: !!clientSecret
  });
});

// Get Authorization URL
app.get('/api/auth/google/url', (req, res) => {
  const db = readDb();
  const client = getOAuthClient(db);
  if (!client) {
    return res.status(400).json({ error: 'Google OAuth client is not configured in Admin Settings.' });
  }

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly', 'email', 'profile'],
    prompt: 'consent'
  });
  res.json({ url });
});

// Direct Redirect Login Endpoint
app.get('/api/auth/google/login', (req, res) => {
  const db = readDb();
  const client = getOAuthClient(db);
  if (!client) {
    return res.status(400).send('<h1>Error: Google OAuth client is not configured in Admin Settings.</h1>');
  }

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly', 'email', 'profile'],
    prompt: 'consent'
  });
  res.redirect(url);
});

// OAuth Callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.send('<h1>Error: No authorization code received.</h1>');
  }

  try {
    const db = readDb();
    const client = getOAuthClient(db);
    if (!client) {
      return res.send('<h1>Error: OAuth client not initialized.</h1>');
    }

    const { tokens } = await client.getToken(code.toString());
    db.googleDrive.tokens = tokens;
    writeDb(db);

    // HTML response that informs user and closes OAuth popup/window
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 100px; background: #0f172a; color: #f8fafc;">
          <h1 style="color: #10b981;">Authentication Successful!</h1>
          <p>You can close this window now. Returning to the application...</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 1500);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth Exchange Error:", error);
    res.send(`<h1>Authentication failed</h1><pre>${error.message}</pre>`);
  }
});

// Authentication Status
app.get('/api/auth/status', (req, res) => {
  const db = readDb();
  const clientId = process.env.GOOGLE_CLIENT_ID || db.googleDrive.clientId;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || db.googleDrive.clientSecret;
  const isConfigured = !!(clientId && clientSecret);
  const isAuthenticated = !!(db.googleDrive.tokens && db.googleDrive.tokens.access_token);
  res.json({ isConfigured, isAuthenticated });
});

// Revoke Authentication
app.post('/api/auth/logout', (req, res) => {
  const db = readDb();
  db.googleDrive.tokens = null;
  writeDb(db);
  res.json({ success: true });
});

// Get Google Drive Folders
app.get('/api/drive/folders', async (req, res) => {
  try {
    const db = readDb();
    const client = getOAuthClient(db);
    if (!client) {
      return res.status(401).json({ error: 'Google OAuth client not configured.' });
    }

    const drive = google.drive({ version: 'v3', auth: client });
    const response = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 100
    });

    res.json(response.data.files || []);
  } catch (error) {
    console.error("List folders error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload Video to Google Drive
app.post('/api/drive/upload', async (req, res) => {
  try {
    const { filename, folderId } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'No filename provided' });
    }

    const filePath = path.join(OUTPUT_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Rendered video file not found' });
    }

    const db = readDb();
    const client = getOAuthClient(db);
    if (!client) {
      return res.status(401).json({ error: 'Google Drive client not authenticated.' });
    }

    // Update target folder ID selection
    if (folderId) {
      db.googleDrive.targetFolderId = folderId;
      writeDb(db);
    }

    const drive = google.drive({ version: 'v3', auth: client });
    const fileMetadata = {
      name: filename,
      parents: folderId && folderId !== 'root' ? [folderId] : []
    };

    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    res.json({
      success: true,
      fileId: response.data.id,
      link: response.data.webViewLink
    });
  } catch (error) {
    console.error("Drive upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Default backgrounds generator script inside the server
async function checkAndGenerateDefaultBackgrounds() {
  // Disabled as per user request to remove default backgrounds
}

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  try {
    await checkAndGenerateDefaultBackgrounds();
    await syncBackgroundsFromFolder();
  } catch (e) {
    console.warn("Could not generate default backgrounds on startup:", e);
  }
});
