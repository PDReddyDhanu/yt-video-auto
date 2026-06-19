import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Converts a local file to a Google GenAI inline data part.
 */
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

/**
 * Call Groq Vision API to perform OCR extraction from the image.
 */
async function performGroqOCR(imagePath, mimeType, apiKey) {
  const imageBase64 = Buffer.from(fs.readFileSync(imagePath)).toString("base64");
  const imageUrl = `data:${mimeType};base64,${imageBase64}`;

  const requestBody = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image and perform complete OCR extraction. Return all text content, headlines, tables, dates, numbers, and key metadata you find in the image. Be extremely precise."
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ],
    temperature: 0.1
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq Vision API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

/**
 * Call Groq Chat API to refine OCR and generate the structured scripts.
 */
async function generateGroqScript(ocrText, duration, apiKey) {
  const prompt = getScriptPrompt(ocrText, duration);

  const requestBody = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a professional Telugu news writer and voiceover script designer. You output strictly valid JSON matching the requested schema."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq Chat API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  return JSON.parse(content);
}

/**
 * Fallback / Primary pipeline using Gemini
 */
async function runGeminiPipeline(imagePath, mimeType, duration, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const imagePart = fileToGenerativePart(imagePath, mimeType);
  const ocrPrompt = `Analyze this image. First, perform complete OCR text extraction (Step 1). Then, correct spelling/grammar errors (Step 2). Finally, generate structured video scripts based on this prompt:\n\n${getScriptPrompt("", duration)}`;

  const result = await model.generateContent([ocrPrompt, imagePart]);
  const text = result.response.text();

  // Parse JSON from markdown block if present
  let jsonString = text.trim();
  if (jsonString.includes("```")) {
    const match = jsonString.match(/```(?:json)?([\s\S]*?)```/);
    if (match) jsonString = match[1].trim();
  }

  return JSON.parse(jsonString);
}

/**
 * System prompt to enforce the user's template and rules.
 */
function getScriptPrompt(ocrText, duration) {
  // Average speaking pace is ~2.5 - 3 words per second.
  const targetWords = Math.round(duration * 2.5);

  return `Based on the extracted text content/image data${ocrText ? `: "${ocrText}"` : ""}, generate a professional informative audio voiceover script in Telugu and its exact transliterated Tenglish counterpart.

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
8. **Voice Recommendation**: Recommend a voice gender ("Male" or "Female") based on the script's topic. Government alerts, career guides, schemes, and informative news should recommend "Male". Soft topics, tutorials, or lifestyle should recommend "Female".

You MUST respond strictly with a valid JSON object matching this schema:
{
  "teluguScript": "The complete Telugu script including ... pauses",
  "tenglishScript": "The complete matching Tenglish script including ... pauses",
  "recommendedVoiceGender": "Male" or "Female"
}`;
}

/**
 * Main entry point function for script generation.
 */
export async function generateScriptFromImage(imagePath, mimeType, duration) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (groqApiKey && groqApiKey.trim()) {
    try {
      console.log("[AI Helper] Running Groq Pipeline...");
      // Step 1 & 2: OCR Extraction
      const ocrText = await performGroqOCR(imagePath, mimeType, groqApiKey);
      // Step 3: Script Generation
      const scriptData = await generateGroqScript(ocrText, duration, groqApiKey);
      return scriptData;
    } catch (err) {
      console.warn("[AI Helper] Groq Pipeline failed. Falling back to Gemini...", err.message);
    }
  }

  // Fallback to Gemini
  if (geminiApiKey && geminiApiKey.trim()) {
    console.log("[AI Helper] Running Gemini Pipeline...");
    return await runGeminiPipeline(imagePath, mimeType, duration, geminiApiKey);
  }

  throw new Error("No API keys found for script generation (configure GEMINI_API_KEY or GROQ_API_KEY).");
}
