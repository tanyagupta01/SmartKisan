import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Generate farming calendar using Gemini AI
router.post('/generate', async (req, res) => {
  const { crop, location, prompt } = req.body;
  
  if (!crop || !location) {
    return res.status(400).json({ error: 'Crop and location are required' });
  }

  try {
    const enhancedPrompt = `
    You are an expert agricultural advisor. Generate a farming calendar for ${crop} in ${location}, India in JSON format only (no additional text):
    {
      "crop": "${crop}",
      "location": "${location}",
      "season": "season name",
      "activities": [
        {
          "month": "Month Year",
          "tasks": [
            {"date": "Date range", "activity": "Activity", "description": "description of the activity"}
          ]
        }
      ]
    }

    Requirements:
    1. Include ALL major farming activities: land preparation, seed treatment, sowing, irrigation, fertilization, pest control, disease management, weeding, pruning (if applicable), and harvesting
    2. Consider the specific climate and soil conditions of ${location}
    3. Provide at least 5-8 months of farming schedule
    4. Provide practical, actionable advice for each farming activity

    Include 6 months: land prep, sowing, irrigation, fertilization, pest control, harvesting. Keep descriptions under 20 words.`;

    // Call Gemini AI
    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { 
          role: 'user', 
          parts: [{ text: enhancedPrompt }] 
        }
      ],
      generationConfig: {
        temperature: 0.3,        // Reduced from 0.7
        maxOutputTokens: 4096,   // Reduced from 4096
        topP: 0.8,              // Add this
        topK: 40,               // Add this
      }
    });

    const replyText = textResp.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't generate the calendar.";

    // Try to extract JSON from the response
    let calendarData;
    try {
      // Remove any markdown formatting or extra text
      const cleanedResponse = replyText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Try to find JSON in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        calendarData = JSON.parse(jsonMatch[0]);
      } else {
        calendarData = JSON.parse(cleanedResponse);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON from Gemini response:', parseError);
      // Return raw response for frontend to handle
      calendarData = replyText;
    }

    res.json({ 
      calendar: typeof calendarData === 'object' ? JSON.stringify(calendarData) : calendarData,
      rawResponse: replyText 
    });

  } catch (err) {
    console.error('Error in /api/calendar/generate:', err);
    res.status(500).json({ 
      error: err.message || 'Internal Server Error',
      details: 'Failed to generate farming calendar using AI'
    });
  }
});

// Get calendar suggestions based on location and season
router.post('/suggestions', async (req, res) => {
  const { location, season } = req.body;
  
  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  try {
    const prompt = `
Suggest the best crops to grow in ${location}, India during ${season || 'the current season'}. 
Provide a brief response (2-3 sentences) with 3-5 crop recommendations and why they're suitable for this location and season.
Focus on crops that are economically viable and climatically suitable.`;

    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const suggestions = textResp.candidates?.[0]?.content?.parts?.[0]?.text
      || "Unable to provide crop suggestions at this time.";

    res.json({ suggestions });

  } catch (err) {
    console.error('Error in /api/calendar/suggestions:', err);
    res.status(500).json({ 
      error: err.message || 'Internal Server Error',
      details: 'Failed to get crop suggestions'
    });
  }
});

// Get weather-based farming advice
router.post('/weather-advice', async (req, res) => {
  const { crop, location, weatherCondition } = req.body;
  
  if (!crop || !location || !weatherCondition) {
    return res.status(400).json({ error: 'Crop, location, and weather condition are required' });
  }

  try {
    const prompt = `
Given the current weather condition "${weatherCondition}" in ${location}, provide specific farming advice for ${crop} cultivation.
What immediate actions should a farmer take? Keep the response concise (2-3 sentences) and actionable.`;

    const textResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    const advice = textResp.candidates?.[0]?.content?.parts?.[0]?.text
      || "Unable to provide weather-based advice at this time.";

    res.json({ advice });

  } catch (err) {
    console.error('Error in /api/calendar/weather-advice:', err);
    res.status(500).json({ 
      error: err.message || 'Internal Server Error',
      details: 'Failed to get weather-based farming advice'
    });
  }
});

export default router;