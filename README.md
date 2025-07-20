# SmartKisan
**AI-Powered, Multilingual Crop Advisory Platform for Indian Farmers**


GenAI SmartKisan: A multilingual PWA using vision and generative AI to provide India’s farmers with hyper-local, real-time crop advice — personalized, contextual, and delivered in their own language.

---

## 📖 Project Overview

SmartKisan is a Progressive Web App (PWA) built with React and Vite, coupled with an Express backend powered by Google GenAI’s Gemini models. It enables farmers across India to:

* **Snap photos** of crops for disease/pest detection
* **Speak or type** questions in regional languages
* **Receive** hyper-local, real-time advice in their own tongue

---

## 📁 Project Structure

```
SMARTKISAN/
├── SmartKisan-api/          # Express backend
│   ├── routes/             # API route handlers
│   │   ├── calendarRoute.js
│   │   ├── govtSchemesRoute.js
│   │   ├── imageRoute.js
│   │   ├── marketRoute.js
│   │   └── voiceChatRoute.js
│   ├── .env                # Environment variables for API keys
│   └── index.js            # Server entrypoint
│
├── public/                 # Static assets (favicon, index.html)
│
├── src/                    # Frontend source code
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-based page components
│   └── utils/              # Utility functions (e.g. image compression)
│
├── .env                    # Frontend environment variables
├── .gitignore
├── capacitor.config.ts     # Capacitor config for mobile builds
├── index.html              # PWA shell
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md               # This file
```

---

## ⚙️ Prerequisites

* **Node.js** v16+ and **npm** or **yarn**
* **Git** for cloning the repo
* **.env** file(s) with API keys (see next section)

---

## 🔐 Environment Variables

Create a `.env` in both the root and `SmartKisan-api/` folders with:

```dotenv
# Frontend (.env)
VITE_WEATHER_API_KEY=YOUR_WEATHER_API_KEY

# Backend (SmartKisan-api/.env)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note:** Replace placeholder values; do *not* commit your real keys.

---

## 🚀 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/smartkisan.git
   cd smartkisan
   ```

2. **Install dependencies**

   ```bash
   # Root (frontend)
   npm install

   # Backend
   cd SmartKisan-api
   npm install
   cd ..
   ```

3. **Run in development mode**

   ```bash
   # Start backend API
   cd SmartKisan-api && npm start

   # In a new terminal: frontend dev server
   cd ..
   npm run dev
   ```

4. **Open the PWA**
   Visit `http://localhost:5173` in your browser. The PWA supports offline caching, camera access, and voice I/O.

---

## 📦 Build & Deployment

* **Build frontend**: `npm run build` (outputs to `dist/`)
* **Preview production**: `npm run preview`
* **Deploy backend**: Ensure `SmartKisan-api/index.js` uses correct `.env` keys; host on Heroku/Vercel/AWS.
* **Serve static files**: Point your server or CDN to the `dist/` folder for the PWA.

---

## 🔌 API Endpoints

| Route                | Method | Description                            | Request Body                            |
| -------------------- | ------ | -------------------------------------- | --------------------------------------- |
| `/api/analyze-image` | POST   | Crop image disease analysis            | `{ imageBase64: string }`               |
| `/api/ask`           | POST   | Text/voice advisory conversation       | `{ message: string, language: string }` |
| `/api/govt-schemes`  | GET    | List government farming schemes        | *(none)*                                |
| `/api/market-data`   | GET    | Fetch local mandi price data           | `?crop=NAME&location=PINCODE`           |
| `/api/calendar`      | GET    | Seasonal crop calendar recommendations | `?crop=NAME`                            |

---

## 🛠️ Technology Stack & Decisions

* **Frontend:** React + Vite + Tailwind CSS for a lightweight, offline‑capable PWA
* **Image Compression:** Custom utilities to resize & compress photos before upload
* **Voice I/O:** Browser Web Speech API for in‑browser speech recognition & TTS
* **Backend:** Express.js + @google/genai SDK calling Gemini-2.5-flash for multimodal advice
* **Hosting:** Easily deployable to Vercel/Heroku; static PWA served from CDN

> **Why PWA?** Cross‑platform reach, no app store friction.

---

## ✅ Quick Commands

```bash
# Dev mode (frontend)
npm run dev

# Start backend API
cd SmartKisan-api && npm start

# Build for production
npm run build

# Lint code
enpm run lint
```

---

## 📄 License & Credits

* **License:** MIT
* **Acknowledgements:** OpenAI, Google GenAI, Farmonaut pilot data, PlantVillage dataset

---

*Prepared as an MVP hackathon submission — Building for Bharat with the power of GenAI.*
