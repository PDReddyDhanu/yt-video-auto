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
  console.log("Render Success. Drive Link:", data1.driveLink);
  console.log(`Output Duration: ${data1.duration}s (Expected: ~5s)`);
  
  if (Math.abs(data1.duration - 5) > 0.5) {
    throw new Error(`Scenario B failed: Video duration is ${data1.duration}s instead of ~5s`);
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
  console.log("Render Success. Drive Link:", data2.driveLink);
  console.log(`Output Duration: ${data2.duration}s (Expected: ~18s)`);

  if (Math.abs(data2.duration - 18) > 0.5) {
    throw new Error(`Scenario A failed: Video duration is ${data2.duration}s instead of ~18s`);
  }
  console.log("Scenario A: Loop works perfectly!");
  
  // Verification C: Instagram Mode (should produce a video of exactly 10s using uploaded audio and custom filename)
  console.log("\n--- VERIFYING SCENARIO C: Instagram mode 10-second cap with custom filename ---");
  const form3 = new FormData();
  form3.append('bgId', selectedBg.id);
  form3.append('image', new Blob([fs.readFileSync(MOCK_IMAGE)]), 'mock_image.png');
  form3.append('audio', new Blob([fs.readFileSync(MOCK_AUDIO_LONG)]), 'mock_audio_long.mp3');
  form3.append('mode', 'instagram');
  form3.append('customFilename', 'VerifyCustomReel');

  const res3 = await fetch(generateUrl, { method: 'POST', body: form3 });
  if (!res3.ok) {
    const err = await res3.json();
    throw new Error(`Scenario C render failed: ${err.error || JSON.stringify(err)}`);
  }

  const data3 = await res3.json();
  console.log("Render Success. Drive Link:", data3.driveLink);
  console.log("Output Filename:", data3.videoFilename);
  console.log(`Output Duration: ${data3.duration}s (Expected: 10s)`);

  if (Math.abs(data3.duration - 10) > 0.5) {
    throw new Error(`Scenario C failed: Video duration is ${data3.duration}s instead of ~10s`);
  }
  if (data3.videoFilename !== 'VerifyCustomReel.mp4') {
    throw new Error(`Scenario C failed: Video filename is "${data3.videoFilename}" instead of "VerifyCustomReel.mp4"`);
  }
  console.log("Scenario C: Instagram mode works perfectly!");
  
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
