import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

console.log('ENV KEY:', process.env.GEMINI_API_KEY);

app.post('/api/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Call the model that supports "generateContent"
    const aiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // extract the generated text
    const reply =
      aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Sorry, I didn’t get a response.';

    res.json({ reply });

  } catch (err) {
    console.error('AI error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
