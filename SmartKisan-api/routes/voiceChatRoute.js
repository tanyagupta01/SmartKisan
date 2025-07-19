import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

router.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // Text generation
    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: "Answer in no more than 3 sentences:\n" }] },
        { role: 'user', parts: [{ text: message }] }
      ],
    });
    
    const replyText = textResp.candidates?.[0]?.content?.parts?.[0]?.text
                       || "Sorry, I didn't get a response.";

    res.json({ reply: replyText });

  } catch (err) {
    console.error('Error in /api/ask:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

export default router;