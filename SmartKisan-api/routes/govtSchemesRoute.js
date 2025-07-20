import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Get government schemes for farmers
router.post('/government-schemes', async (req, res) => {
  const { lat, lon, selectedCategory = '', selectedState = '' } = req.body;

  try {
    // Build location context based on state or coordinates
    let locationContext = '';
    if (selectedState) {
      locationContext = `in ${selectedState}, India`;
    } else if (lat && lon) {
      locationContext = `near coordinates ${lat}, ${lon} in India`;
    } else {
      locationContext = 'in India';
    }

    const categoryFilter = selectedCategory ? ` focusing on ${selectedCategory} schemes` : '';

    const prompt = `Find current government agricultural schemes for farmers ${locationContext}${categoryFilter}. Include both central and state government schemes. Return only JSON format:

{
  "schemes": [
    {
      "id": 1,
      "name": "Scheme Name",
      "benefits": "What benefits farmers get (amount/percentage/coverage)(maximum 1 sentence)",
      "eligibility": "Who can apply and eligibility criteria (maximum 1 sentence)",
      "applicationDeadline": "Deadline or 'Open throughout the year'",
      "status": "active|deadline-approaching|closed",
      "documents": ["Document 1", "Document 2", "Document 3"],
      "lastUpdated": "YYYY-MM-DD"
    }
  ]
}

Include 2-3 relevant schemes with:
- Central schemes like PM-KISAN, PMFBY, KCC, Soil Health Card
- State-specific schemes if state is provided
- Mix of financial support, insurance, credit, technical assistance schemes
- Current 2025-2026 scheme details and benefits
- Realistic eligibility criteria and application processes`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // Extract and clean text
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error('No response from Gemini API');

    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();

    // Parse JSON
    let schemesData;
    try {
      schemesData = JSON.parse(cleaned);
    } catch (err) {
      console.error('JSON Parse Error:', err);
      schemesData = getFallbackSchemes(selectedCategory, selectedState);
    }

    // Validate structure
    if (!schemesData?.schemes || !Array.isArray(schemesData.schemes)) {
      schemesData = getFallbackSchemes(selectedCategory, selectedState);
    }

    res.json(schemesData);

  } catch (error) {
    console.error('Error in /api/government-schemes:', error);
    const fallback = getFallbackSchemes(selectedCategory, selectedState);
    res.json({
      ...fallback,
      error: error.message || 'Internal Server Error',
      fallback: true
    });
  }
});

// Fallback function with sample schemes
function getFallbackSchemes(category = '', state = '') {
  const central = [
    {
      id: 1,
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      category: 'financial',
      benefits: '₹6,000 per year in three installments',
      eligibility: 'Small and marginal farmers with cultivable land up to 2 hectares',
      applicationDeadline: 'Open throughout the year',
      status: 'active',
      authority: 'Ministry of Agriculture & Farmers Welfare',
      applicationType: 'online',
      documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
      lastUpdated: '2025-01-10'
    },
    {
      id: 2,
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'insurance',
      benefits: 'Up to 100% sum insured for crop loss',
      eligibility: 'All farmers including sharecroppers and tenant farmers',
      applicationDeadline: 'Before sowing season',
      status: 'active',
      authority: 'Ministry of Agriculture & Farmers Welfare',
      applicationType: 'online',
      documents: ['Land Records', 'Sowing Certificate', 'Bank Account Details', 'Aadhaar Card'],
      lastUpdated: '2025-02-15'
    },
  ];

  // Optionally include state-specific schemes
  const stateSchemesMap = {
    Punjab: [
      {
        id: 101,
        name: 'Punjab Crop Diversification Scheme',
        benefits: '₹17,500 per acre for crop diversification',
        eligibility: 'Punjab farmers shifting from paddy',
        applicationDeadline: 'Before Kharif season',
        status: 'active',
        authority: 'Punjab Department of Agriculture',
        applicationType: 'offline',
        documents: ['Land Records', 'Previous Crop Details', 'Bank Account'],
        lastUpdated: '2025-01-22'
      }
    ],
    Maharashtra: [
      {
        id: 102,
        name: 'Jalyukt Shivar Abhiyan',
        benefits: 'Infrastructure for water conservation',
        eligibility: 'All farmers in Maharashtra',
        applicationDeadline: 'Open throughout the year',
        status: 'active',
        authority: 'Maharashtra Water Conservation Department',
        applicationType: 'offline',
        documents: ['Land Records', 'Village Committee Approval'],
        lastUpdated: '2025-01-19'
      }
    ],
    'Uttar Pradesh': [
      {
        id: 103,
        name: 'UP Kisan Karj Rahat Yojana',
        benefits: 'Waiver of crop loans up to ₹1 lakh',
        eligibility: 'Small and marginal farmers with land up to 2 hectares',
        applicationDeadline: 'Registration ongoing',
        status: 'active',
        authority: 'UP Department of Agriculture',
        applicationType: 'online',
        documents: ['Aadhaar Card', 'Land Records', 'Loan Documents'],
        lastUpdated: '2025-01-17'
      }
    ]
  };

  let schemes = central;
  if (category) schemes = schemes.filter(s => s.category === category);
  if (state && stateSchemesMap[state]) {
    schemes = schemes.concat(stateSchemesMap[state].filter(s => !category || s.category === category));
  }

  return { schemes: schemes.slice(0, 8) };
}

export default router;

