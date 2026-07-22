import fs from 'fs';
import path from 'path';

// --- In-memory tracking of Groq API Keys and Quotas ---
let apiKeysCached = null;
let keyStatuses = [];

function initKeysIfNeeded() {
  if (apiKeysCached) return;
  try {
    const keys = getApiKeyPool();
    apiKeysCached = keys;
    keyStatuses = keys.map((key, i) => {
      // mask the key: keep first 7 chars and last 5 chars, replace middle with ...
      const masked = key.length > 12 
        ? `${key.slice(0, 7)}...${key.slice(-5)}`
        : 'Invalid Key';
      return {
        index: i + 1,
        keyMasked: masked,
        status: 'Active', // 'Active' or 'Exhausted'
        exhaustedModels: [], // array of model strings
        lastUsed: null,
        lastError: null
      };
    });
  } catch (err) {
    console.error('[AI Helper] failed to init key pool:', err.message);
  }
}

export function getGroqStatus() {
  initKeysIfNeeded();
  return keyStatuses;
}

export function resetGroqStatus() {
  initKeysIfNeeded();
  keyStatuses.forEach(k => {
    k.status = 'Active';
    k.exhaustedModels = [];
    k.lastError = null;
  });
  return keyStatuses;
}

/**
 * Multi-key pool — loads all GROQ_API_KEY_* env vars in order.
 * Falls back to GROQ_API_KEY (single key) if no numbered keys are set.
 * Keys are tried in sequence; exhausted/rate-limited keys are skipped automatically.
 */
function getApiKeyPool() {
  const keys = [];

  // Primary key
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    keys.push(process.env.GROQ_API_KEY.trim());
  }

  // Additional numbered keys: GROQ_API_KEY_2, GROQ_API_KEY_3, ... GROQ_API_KEY_10
  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k && k.trim()) {
      keys.push(k.trim());
    }
  }

  if (keys.length === 0) {
    throw new Error('No Groq API keys configured. Set GROQ_API_KEY (and optionally GROQ_API_KEY_2 ... GROQ_API_KEY_6) in backend .env');
  }

  return keys;
}

/**
 * Helper: determine if an HTTP status code is a retryable quota/capacity error.
 */
function isRetryableStatus(status) {
  return status === 429 || status === 503 || status === 529;
}

/**
 * Call Groq Vision API to perform OCR extraction from the image.
 * Automatically rotates through all available API keys on quota errors.
 */
async function performGroqOCR(imagePath, mimeType) {
  initKeysIfNeeded();
  const keys = getApiKeyPool();
  const imageBase64 = Buffer.from(fs.readFileSync(imagePath)).toString('base64');
  const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;
  const modelName = 'qwen/qwen3.6-27b';

  const requestBody = {
    model: modelName,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image and perform complete OCR extraction. Return all text content, headlines, tables, dates, numbers, and key metadata you find in the image. Be extremely precise.'
          },
          {
            type: 'image_url',
            image_url: { url: imageDataUrl }
          }
        ]
      }
    ],
    temperature: 0.1
  };

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[AI Helper] OCR — trying key ${i + 1}/${keys.length} (index ${i})`);
    if (keyStatuses[i]) {
      keyStatuses[i].lastUsed = new Date().toISOString();
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`[AI Helper] OCR succeeded with key ${i + 1}`);
      if (keyStatuses[i]) {
        keyStatuses[i].status = 'Active';
        keyStatuses[i].exhaustedModels = keyStatuses[i].exhaustedModels.filter(m => m !== modelName);
        keyStatuses[i].lastError = null;
      }
      return { text: result.choices[0].message.content, keyIndex: i + 1, model: requestBody.model };
    }

    const errorText = await response.text();
    console.warn(`[AI Helper] OCR key ${i + 1} failed — HTTP ${response.status}: ${errorText.slice(0, 200)}`);

    if (keyStatuses[i]) {
      keyStatuses[i].lastError = `${response.status}: ${errorText.slice(0, 150)}`;
      if (isRetryableStatus(response.status)) {
        keyStatuses[i].status = 'Exhausted';
        if (!keyStatuses[i].exhaustedModels.includes(modelName)) {
          keyStatuses[i].exhaustedModels.push(modelName);
        }
      }
    }

    if (isRetryableStatus(response.status)) {
      // Quota/capacity error — try next key
      lastError = new Error(`Groq Vision API error (key ${i + 1}): ${response.status} - ${errorText}`);
      continue;
    }

    // Non-retryable error (e.g. 400 bad request, 401 invalid key) — throw immediately
    throw new Error(`Groq Vision API error: ${response.status} - ${errorText}`);
  }

  // All keys exhausted
  throw new Error(
    `All ${keys.length} Groq API key(s) are over capacity or rate-limited for OCR. ` +
    `Last error: ${lastError?.message}`
  );
}

/**
 * Call Groq Chat API to refine OCR and generate the structured scripts.
 * Automatically rotates through all available API keys on quota errors.
 */
async function generateGroqScript(ocrText, duration) {
  initKeysIfNeeded();
  const keys = getApiKeyPool();
  const prompt = getScriptPrompt(ocrText, duration);
  const modelName = 'llama-3.3-70b-versatile';

  const requestBody = {
    model: modelName,
    messages: [
      {
        role: 'system',
        content: 'You are a professional Telugu news writer and voiceover script designer. You output strictly valid JSON matching the requested schema.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  };

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[AI Helper] Script Gen — trying key ${i + 1}/${keys.length} (index ${i})`);
    if (keyStatuses[i]) {
      keyStatuses[i].lastUsed = new Date().toISOString();
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      const content = result.choices[0].message.content;
      const parsed = JSON.parse(content);

      // Safeguard: Ensure autoFilename is always populated
      if (!parsed.autoFilename) {
        const baseText = parsed.tenglishScript || ocrText || 'rendered_video';
        const cleaned = baseText
          .toLowerCase()
          .replace(/[^a-z0-9\s-_]/g, '')
          .trim()
          .replace(/[\s-_]+/g, '_')
          .split('_')
          .slice(0, 10)
          .join('_');
        parsed.autoFilename = cleaned || 'rendered_video';
      }

      console.log(`[AI Helper] Script Gen succeeded with key ${i + 1}`);
      if (keyStatuses[i]) {
        keyStatuses[i].status = 'Active';
        keyStatuses[i].exhaustedModels = keyStatuses[i].exhaustedModels.filter(m => m !== modelName);
        keyStatuses[i].lastError = null;
      }
      return { data: parsed, keyIndex: i + 1, model: requestBody.model };
    }

    const errorText = await response.text();
    console.warn(`[AI Helper] Script key ${i + 1} failed — HTTP ${response.status}: ${errorText.slice(0, 200)}`);

    if (keyStatuses[i]) {
      keyStatuses[i].lastError = `${response.status}: ${errorText.slice(0, 150)}`;
      if (isRetryableStatus(response.status)) {
        keyStatuses[i].status = 'Exhausted';
        if (!keyStatuses[i].exhaustedModels.includes(modelName)) {
          keyStatuses[i].exhaustedModels.push(modelName);
        }
      }
    }

    if (isRetryableStatus(response.status)) {
      lastError = new Error(`Groq Chat API error (key ${i + 1}): ${response.status} - ${errorText}`);
      continue;
    }

    throw new Error(`Groq Chat API error: ${response.status} - ${errorText}`);
  }

  throw new Error(
    `All ${keys.length} Groq API key(s) are over capacity or rate-limited for Script Generation. ` +
    `Last error: ${lastError?.message}`
  );
}

/**
 * System prompt to enforce the user's template and rules.
 */
function getScriptPrompt(ocrText, duration) {
  // Average speaking pace is ~2.5 - 3 words per second.
  const targetWords = Math.round(duration * 2.5);

  return `Based on the extracted text content/image data${ocrText ? `: "${ocrText}"` : ''}, generate a professional informative audio voiceover script in Telugu and its exact transliterated Tenglish counterpart.

CRITICAL RULES:
1. **Total Duration**: The script MUST take exactly ${duration} seconds when spoken. For ${duration} seconds, keep the script to approximately ${targetWords} words total. Keep it extremely crisp and remove fluff.
2. **Fixed Template Format**:
   - Section 1: Intro about main headline/topic.
   - Section 2: Important points and data (dates, numbers, budgets, qualifications) combined into two clean sentences.
   - Section 3: Supporting details or beneficiary information.
   - Section 4: A fixed Call-To-Action (CTA) at the very end.
3. **Breathing Spaces**: Insert exactly three ellipsis "..." to separate the four sections (Section 1 ... Section 2 ... Section 3 ... Section 4).
4. **No Starting Hooks**: DO NOT use introductory hype hooks like "ఒరేయ్ తొందరగా తెలుసుకో", "గుడ్ న్యూస్", "బ్యాడ్ న్యూస్", "త్వరపడండి", "హాయ్ ఫ్రెండ్స్". Start directly with the informative headline.
5. **No Rhyming/Punches**: Rhyming phrases or poetic punches are strictly forbidden. Keep it direct and professional.
6. **Fixed CTA Content**:
   - Telugu: "[Topic Category in Telugu] తాజా అధికారిక అప్డేట్స్ కోసం... మన ఛానెల్ని ఇప్పుడే సబ్స్క్రైబ్ చేయండి!"
   - Tenglish: "[Topic Category in English/Tenglish] thaaja official updates kosam... mana channel-ni ippude subscribe cheyandi!"
   - (For example, use "ఉద్యోగ" / "udyoga" or "పథకాల" / "pathakaala" as the category depending on context).
7. **Tenglish Alignment**: The Tenglish script must be an exact 1-to-1 transliterated version of the Telugu script, matching line-by-line and section-by-section.
8. **Voice Recommendation**: Do not suggest a voice gender randomly or statically. Instead, analyze who would deliver the post context best based on the text contents, tone, word density, and breathing spaces:
   - Recommend **Male** if the topic is highly formal, very dense in data (large numbers, detailed tables, fast pacing), requires an authoritative announcement style, or requires speaking a lot of text in a short duration.
   - Recommend **Female** if the script tone is informative yet clear, conversational, advisory, announcements like crypto-updates, schemes, or welfare topics where conversational clarity, rhythmic breathing gaps, and detailed voiceover cadence work best.
   - Select either 'Male' or 'Female' based strictly on this content delivery assessment.
9. **Auto Filename**: Based on the post's text content, create an auto-generated filename of about 10 words. It must be a clean statement summarizing the post, using only lowercase letters, numbers, and underscores (e.g. 'telangana_government_announces_new_welfare_scheme_for_farmers'). Do not include any file extension.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "teluguScript": "The complete Telugu script including ... pauses",
  "tenglishScript": "The complete matching Tenglish script including ... pauses",
  "recommendedVoiceGender": "Male" or "Female",
  "autoFilename": "slugified_10_word_filename_here"
}`;
}

/**
 * Main entry point function for script generation.
 * Uses automatic API key rotation across all configured GROQ_API_KEY_* keys.
 * Returns script data + apiStatus for live status display on the frontend.
 */
export async function generateScriptFromImage(imagePath, mimeType, duration) {
  const keys = getApiKeyPool(); // validates at least one key is set
  const totalKeys = keys.length;
  console.log(`[AI Helper] Running Groq Pipeline with ${totalKeys} key(s) available...`);

  // Step 1: OCR Extraction (with auto key rotation)
  const ocrResult = await performGroqOCR(imagePath, mimeType);

  // Step 2: Script Generation (with auto key rotation)
  const scriptResult = await generateGroqScript(ocrResult.text, duration);

  return {
    ...scriptResult.data,
    // API status metadata for live status display on frontend
    apiStatus: {
      ocrModel: ocrResult.model,
      ocrKeyIndex: ocrResult.keyIndex,
      scriptModel: scriptResult.model,
      scriptKeyIndex: scriptResult.keyIndex,
      totalKeys,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * PDR Script Generator for 125-150s Shorts/Reels
 */
/**
 * PDR Script Generator for 125-150s Shorts/Reels based on user's exact instructions
 */
export async function generatePDRScript(inputData, duration = 150) {
  initKeysIfNeeded();
  const keys = getApiKeyPool();
  const modelName = 'llama-3.3-70b-versatile';

  const prompt = `Act as a professional viral content writer for Instagram Reels / Short Videos (${duration} Seconds). 

Generate an engaging, natural-sounding audio script based on the following topic or information:
"${inputData}"

Strictly follow these rules:
1. Output format: Provide the script in both TELUGU (తెలుగు) and TENGLISH (English alphabet with Telugu words).
2. Exact Line-by-Line Match: Telugu and Tenglish scripts must match 100% word-for-word and sentence-by-sentence.
3. Natural Human Pauses: Use "..." between phrases to indicate short breaks for realistic human voiceover recording.
4. Hook Style: Create an engaging, modern hook without using repetitive phrases like "ఆగు ఆగు" (Agu Agu). Make it curious, direct, or problem-solving.
5. Content Quality: Correct Telugu grammar and spelling with zero errors. Reword the input text slightly for maximum clarity, flow, relaxed explanation cadence, and high viral engagement.
6. Call to Action (CTA): End naturally with a follow call-to-action like:
   - Telugu: "ఇలాంటి ఆసక్తికరమైన అప్డేట్స్ కోసం ఇప్పుడే Telugu States Official ను ఫాలో అవ్వండి!"
   - Tenglish: "Ilaanti aasakthikaramaina updates kosam ippude Telugu States Official ni Follow Avvandi!"

You MUST respond strictly with a valid JSON object matching this schema:
{
  "teluguScript": "Full Telugu script including ... pauses",
  "tenglishScript": "Full matching Tenglish script including ... pauses",
  "recommendedVoiceGender": "Male",
  "autoFilename": "slugified_10_word_filename_here"
}`;

  const requestBody = {
    model: modelName,
    messages: [
      {
        role: 'system',
        content: 'You are a professional Telugu content writer for viral YouTube Shorts and Instagram Reels. Output strictly valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  };

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[AI Helper] PDR Script Gen — trying key ${i + 1}/${keys.length} (index ${i})`);
    if (keyStatuses[i]) {
      keyStatuses[i].lastUsed = new Date().toISOString();
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      const content = result.choices[0].message.content;
      const parsed = JSON.parse(content);

      if (!parsed.autoFilename) {
        const baseText = parsed.tenglishScript || inputData || 'pdr_video';
        const cleaned = baseText
          .toLowerCase()
          .replace(/[^a-z0-9\s-_]/g, '')
          .trim()
          .replace(/[\s-_]+/g, '_')
          .split('_')
          .slice(0, 10)
          .join('_');
        parsed.autoFilename = cleaned || 'pdr_video';
      }

      console.log(`[AI Helper] PDR Script Gen succeeded with key ${i + 1}`);
      if (keyStatuses[i]) {
        keyStatuses[i].status = 'Active';
        keyStatuses[i].exhaustedModels = keyStatuses[i].exhaustedModels.filter(m => m !== modelName);
        keyStatuses[i].lastError = null;
      }
      return {
        ...parsed,
        apiStatus: {
          scriptModel: modelName,
          scriptKeyIndex: i + 1,
          totalKeys: keys.length,
          timestamp: new Date().toISOString()
        }
      };
    }

    const errorText = await response.text();
    console.warn(`[AI Helper] PDR Script key ${i + 1} failed — HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    if (isRetryableStatus(response.status)) {
      lastError = new Error(`Groq Chat API error (key ${i + 1}): ${response.status} - ${errorText}`);
      continue;
    }
    throw new Error(`Groq Chat API error: ${response.status} - ${errorText}`);
  }

  throw new Error(`All ${keys.length} Groq API key(s) failed for PDR Script Generation: ${lastError?.message}`);
}