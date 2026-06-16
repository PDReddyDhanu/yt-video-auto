import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const execPromise = promisify(exec);
const ffmpegPath = ffmpegInstaller.path;
const ffprobePath = ffprobeInstaller.path;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOCK_IMAGE = path.join(__dirname, 'mock_image.png');
const MOCK_AUDIO_SHORT = path.join(__dirname, 'mock_audio_short.mp3'); // 5 seconds
const MOCK_AUDIO_LONG = path.join(__dirname, 'mock_audio_long.mp3');   // 18 seconds

// Helper to probe duration of output files
async function getMediaDuration(filePath) {
  const cmd = `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
  const { stdout } = await execPromise(cmd);
  return parseFloat(stdout.trim());
}

async function getMediaResolution(filePath) {
  const cmd = `"${ffprobePath}" -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`;
  const { stdout } = await execPromise(cmd);
  return stdout.trim();
}

async function runVerification() {
  console.log("=== AUTOMATED END-TO-END FFMEG ENGINE VERIFICATION ===");
  console.log("Working Directory:", __dirname);

  // 1. Generate Mock Image (200x200 Red Square)
  console.log("Generating mock image...");
  await execPromise(`"${ffmpegPath}" -y -f lavfi -i color=c=red:s=200x200 -vframes 1 "${MOCK_IMAGE}"`);

  // 2. Generate 5-second short audio (Sine Wave)
  console.log("Generating 5-second mock audio...");
  await execPromise(`"${ffmpegPath}" -y -f lavfi -i sine=frequency=440:duration=5 -c:a libmp3lame -b:a 128k "${MOCK_AUDIO_SHORT}"`);

  // 3. Generate 18-second long audio (Sine Wave)
  console.log("Generating 18-second mock audio...");
  await execPromise(`"${ffmpegPath}" -y -f lavfi -i sine=frequency=220:duration=18 -c:a libmp3lame -b:a 128k "${MOCK_AUDIO_LONG}"`);

  console.log("Mock files ready.");

  const bgUrl = 'http://localhost:3001/api/backgrounds';
  const generateUrl = 'http://localhost:3001/api/generate';

  // Fetch backgrounds list first
  console.log("Fetching background list from server...");
  const bgRes = await fetch(bgUrl);
  const backgrounds = await bgRes.json();
  console.log("Backgrounds available on server:", backgrounds.map(b => b.name));

  if (backgrounds.length === 0) {
    throw new Error("No backgrounds available on the server. Make sure the server has completed its startup generation.");
  }

  const selectedBg = backgrounds[0];
  console.log(`Using background: ${selectedBg.name} (${selectedBg.duration}s, file: ${selectedBg.filename})`);

  // Verification A: Trim (audio 5s is shorter than background 10s)
  console.log("\n--- VERIFYING SCENARIO B: Trimming background to 5 seconds ---");
  const form1 = new FormData();
  form1.append('bgId', selectedBg.id);
  form1.append('image', new Blob([fs.readFileSync(MOCK_IMAGE)]), 'mock_image.png');
  form1.append('audio', new Blob([fs.readFileSync(MOCK_AUDIO_SHORT)]), 'mock_audio_short.mp3');

  const res1 = await fetch(generateUrl, { method: 'POST', body: form1 });
  if (!res1.ok) {
    const err = await res1.json();
    throw new Error(`Scenario B render failed: ${err.error || JSON.stringify(err)}`);
  }

  const data1 = await res1.json();
  console.log("Render Success. Output:", data1.videoUrl);
  
  const outPath1 = path.join(__dirname, 'output', data1.videoFilename);
  const duration1 = await getMediaDuration(outPath1);
  const resolution1 = await getMediaResolution(outPath1);
  console.log(`Output Duration: ${duration1}s (Expected: ~5s)`);
  console.log(`Output Resolution: ${resolution1} (Expected: 1080x1920)`);
  
  if (Math.abs(duration1 - 5) > 0.5) {
    throw new Error(`Scenario B failed: Video duration is ${duration1}s instead of ~5s`);
  }
  if (resolution1 !== "1080x1920") {
    throw new Error(`Scenario B failed: Video resolution is ${resolution1} instead of 1080x1920`);
  }
  console.log("Scenario B: Trim works perfectly!");

  // Verification B: Loop (audio 18s is longer than background 10s)
  console.log("\n--- VERIFYING SCENARIO A: Looping background to 18 seconds ---");
  const form2 = new FormData();
  form2.append('bgId', selectedBg.id);
  form2.append('image', new Blob([fs.readFileSync(MOCK_IMAGE)]), 'mock_image.png');
  form2.append('audio', new Blob([fs.readFileSync(MOCK_AUDIO_LONG)]), 'mock_audio_long.mp3');

  const res2 = await fetch(generateUrl, { method: 'POST', body: form2 });
  if (!res2.ok) {
    const err = await res2.json();
    throw new Error(`Scenario A render failed: ${err.error || JSON.stringify(err)}`);
  }

  const data2 = await res2.json();
  console.log("Render Success. Output:", data2.videoUrl);

  const outPath2 = path.join(__dirname, 'output', data2.videoFilename);
  const duration2 = await getMediaDuration(outPath2);
  const resolution2 = await getMediaResolution(outPath2);
  console.log(`Output Duration: ${duration2}s (Expected: ~18s)`);
  console.log(`Output Resolution: ${resolution2} (Expected: 1080x1920)`);

  if (Math.abs(duration2 - 18) > 0.5) {
    throw new Error(`Scenario A failed: Video duration is ${duration2}s instead of ~18s`);
  }
  if (resolution2 !== "1080x1920") {
    throw new Error(`Scenario A failed: Video resolution is ${resolution2} instead of 1080x1920`);
  }
  console.log("Scenario A: Loop works perfectly!");
  
  // Clean up mock files
  try {
    fs.unlinkSync(MOCK_IMAGE);
    fs.unlinkSync(MOCK_AUDIO_SHORT);
    fs.unlinkSync(MOCK_AUDIO_LONG);
  } catch (e) {}

  console.log("\n=== ALL VIDEO PROCESSOR VERIFICATIONS PASSED SUCCESSFULLY ===");
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
