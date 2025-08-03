import express from 'express';
import { GoogleGenAI, createUserContent } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

router.post('/analyze-image', async (req, res) => {
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
      a brief description and treatment steps(maximum 4)
      in JSON:
      {
        "crop": string,
        "disease": string,
        "description": string,
        "treatment": [string],
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

export default router;