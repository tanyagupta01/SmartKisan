import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Get market data for nearby mandis
router.post('/market-data', async (req, res) => {
  const { lat, lon, searchRadius = 50, selectedCrop = 'wheat' } = req.body;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const prompt = `Find agricultural mandis within ${searchRadius}km of ${lat}, ${lon} in India. For each mandi, provide current prices for ${selectedCrop}. Return only JSON format:
{
  "mandis": [
    {
      "name": "Mandi Name",
      "distance": "X km",
      "crops": {
        "wheat": {"price": "₹X,XXX/quintal", "change": "+/-X.X%", "trend": "up/down", "lastUpdated": "X hours ago"},
        "rice": {"price": "₹X,XXX/quintal", "change": "+/-X.X%", "trend": "up/down", "lastUpdated": "X hours ago"}
      }
    }
  ]
}
Provide 3-5 mandis with realistic Indian market prices.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
    });

    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Clean and parse JSON response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const marketData = JSON.parse(cleanedResponse);

    res.json(marketData);

  } catch (error) {
    console.error('Error in /api/market-data:', error);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});



export default router;