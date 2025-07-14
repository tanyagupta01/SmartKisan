// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import axios from 'axios';

// dotenv.config({ path: '../.env' });

// const app = express();
// const PORT = process.env.PORT || 5050;

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
// }));
// app.use(express.json());

// console.log('ENV KEY:', process.env.GEMINI_API_KEY);

// app.post('/api/ask', async (req, res) => {
//   const { message } = req.body;
//   if (!message) {
//     return res.status(400).json({ error: 'Message is required' });
//   }

//   try {
//     // Call the model that supports "generateContent"
//     const aiRes = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [{ text: message }]
//           }
//         ]
//       },
//       { headers: { 'Content-Type': 'application/json' } }
//     );

//     // extract the generated text
//     const reply =
//       aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text
//       || 'Sorry, I didn’t get a response.';

//     res.json({ reply });

//   } catch (err) {
//     console.error('AI error:', err.response?.data || err.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import wav from 'wav';
import fs from 'fs/promises';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// init SDK
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// optional: write out.wav for debug
async function saveWaveFile(filename, pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, { channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
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
    // ── 1) Text generation ───────────────────────────────────────────────────────
    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: message }] }],
    });
    const replyText = textResp.candidates?.[0]?.content?.parts?.[0]?.text
                       || 'Sorry, I didn’t get a response.';

    // ── 2) TTS preview (AUDIO only) ─────────────────────────────────────────────
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

    // optional: save out.wav so you can inspect the file locally
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    await saveWaveFile('out.wav', audioBuffer);

    // ── 3) Return both text and audio ────────────────────────────────────────────
    res.json({
      reply: replyText,
      audioContent: audioBase64  // browser: new Audio(`data:audio/wav;base64,${audioContent}`).play()
    });

  } catch (err) {
    console.error('Error in /api/ask:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
