import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, createUserContent } from '@google/genai';
import wav from 'wav';        

dotenv.config({ path: './.env' });

const app  = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
// bump limit so large base64 images don’t 413
app.use(express.json({ limit: '50mb' }));

// ── Voice Chat Route ───────────────────────────────────────────────
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function saveWaveFile(filename, pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8
    });
    writer.on('finish', resolve);
    writer.on('error', reject);
    writer.write(pcmData);
    writer.end();
  });
}

app.post('/api/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // 1) Text generation
    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: message }] }],
    });
    const replyText = textResp.candidates?.[0]?.content?.parts?.[0]?.text
                       || 'Sorry, I didn’t get a response.';

    // 2) TTS preview (AUDIO only)
    const ttsResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: replyText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });

    const audioBase64 = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) throw new Error('No audio data received');

    // save out.wav for local debugging
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    await saveWaveFile('out.wav', audioBuffer);

    // 3) Return both text and audio
    res.json({
      reply:       replyText,
      audioContent: audioBase64
    });

  } catch (err) {
    console.error('Error in /api/ask:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// ── Image Analysis Route (added) ───────────────────────────────────────────────
const VISION_MODEL = 'gemini-2.5-flash';
const BASE_URL     = 'https://generativelanguage.googleapis.com/v1beta/models';
const API_KEY      = process.env.GEMINI_API_KEY;

app.post('/api/analyze-image', async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    // Strip data URI prefix and extract mime type
    const raw = imageBase64.split(',').pop();
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const prompt = `You are an expert plant pathologist.
      Detect any disease signs on this crop image, name the disease,
      give severity, a brief description, treatment steps
      and the nearby mandis with top returns in JSON:
      {
        "crop": string,
        "disease": string,
        "description": string,
        "treatment": [string],
        "mandi": [string]
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: raw,
          },
        },
      ]),
    });

    let jsonStr = response.text;
    if (!jsonStr) throw new Error('Empty response from model');

    // Strip markdown fences if present
    jsonStr = jsonStr.replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonStr);

    res.json({ result });

  } catch (err) {
    console.error('Image route error:', err.message);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
