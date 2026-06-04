# Sanskrit & Vedic Scripture Translator & Analyzer 🕉️

A scholarly Sanskrit and Hindu scripture translator, transliterator, and analytical parser. This full-stack application allows users to delve into ancient scriptures, understand their grammatical breakdowns, and explore their deep philosophical significance.

Powered by **React 19**, **Express**, and **Gemini 3.5 Flash**, the system includes a robust rules-based offline fallback engine to guarantee uninterrupted service during rate limit rests.

---

## 🛠️ Technology Stack

The application is built using a modern full-stack TypeScript framework designed for speed, safety, and beautiful presentation:

### 1. Frontend
- **React 19**: Powered by functional components, custom hooks, and modern state management.
- **Vite 6**: Extrinsically fast dev server and optimized production bundler.
- **Tailwind CSS v4**: Utility-first CSS styling leveraging smooth layout variables.
- **Framer Motion (`motion/react`)**: High-fidelity UI transitions, hover feedback, and staggered list appearances.
- **Lucide React**: Crisp, modern, and accessible interface icons.

### 2. Backend
- **Express (Node.js)**: Clean RESTful controller endpoints for routing api payloads.
- **tsx**: Direct TypeScript runner backing development mode execution.
- **esbuild**: Produces a bundled CommonJS (`dist/server.cjs`) distribution at build time, optimizing startup speeds.

### 3. AI & Cognition Layer
- **Google Gen AI SDK (`@google/genai`)**: Interacts directly with the `gemini-3.5-flash` model using system instructions and structured JSON response schemas.
- **Offline Sanskrit Engine**: Includes rule-based transliterators and a preloaded dictionary of classical verses (Gita, Rigveda, Upanishads) for fallback processing.

---

## 🎨 Design Philosophy & Themes

This app is designed with a premium, focused, editorial look inspired by traditional Sanskrit manuscripts and modern study spaces:

- **Palette**: "Vedic Gold & Sand" — rich warm ivory backgrounds (`#FDFBF7`), subtle gold borders (`#D97706`), deep charcoal text (`#1C1917`), and spacious card frames.
- **Typography**: Paired serif headings for Sanskrit verses (evoking ancient manuscripts) with clean, readable sans-serif labels for modern commentary and monospaced text for API payloads.
- **Transitions**: Smooth micro-animations on interactive tabs, copies, and dropdown select boxes, ensuring a meditative, premium browsing experience.

---

## 📡 API Documentation

Developers can interact with the backing Express JSON APIs directly. All endpoints are hosted locally under `/api/*`.

### 1. Get Preloaded Scriptures
Retrieves a list of pre-configured classical scriptures, standard translations, and default metadata.

- **Endpoint**: `GET /api/scriptures`
- **Headers**: `Accept: application/json`
- **Output**:
  ```json
  [
    {
      "id": "gita-2-47",
      "title": "Nishkama Karma (Selfless Action)",
      "source": "Bhagavad Gita 2.47",
      "category": "Gita",
      "verse": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन...",
      "transliterationDefault": "karmaṇy-evādhikāras te...",
      "translationDefaultEnglish": "You have a right to perform your prescribed duty...",
      "translationDefaultHindi": "तुम्हारा अधिकार केवल कर्म करने पर ही है..."
    }
  ]
  ```

### 2. Live Translation
Translates Sanskrit or Hindi texts into target languages while extracting custom grammatically analyzed Padapatha breakdowns.

- **Endpoint**: `POST /api/translate`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "text": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    "sourceLang": "auto",
    "targetLang": "english",
    "scriptureContext": "Bhagavad Gita"
  }
  ```
- **Output**:
  ```json
  {
    "sourceLang": "sanskrit",
    "targetLang": "english",
    "translatedText": "You have a right to perform your duty, but not to its fruits...",
    "explanation": "This verse establishes Nishkama Karma...",
    "wordBreakdown": [
      {
        "word": "कर्मणि",
        "grammar": "Locative Singular",
        "meaningEnglish": "in action",
        "meaningHindi": "कर्म में"
      }
    ]
  }
  ```

### 3. Character Transliteration
Orthographically and phonetically converts Indic characters across systems without translating content meaning.

- **Endpoint**: `POST /api/transliterate`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "text": "त्र्यम्बकं यजामहे",
    "sourceScript": "devanagari",
    "targetScript": "iast"
  }
  ```
- **Supported Scripts**: `devanagari`, `iast` (diacritics), `itrans` (ASCII), `english_phonetic` (chant-friendly), `slp1` (Sanskrit Library Phonetic)
- **Output**:
  ```json
  {
    "sourceScript": "devanagari",
    "targetScript": "iast",
    "transliteratedText": "tryambakaṁ yajāmahe"
  }
  ```

### 4. Deep Verse Analysis
Dissects Sanskrit verses, reconstructing fragments, identifying metric meters, and outputting case-declined word-by-word sandhi divisions.

- **Endpoint**: `POST /api/analyze`
- **Headers**: `Content-Type: application/json`
- **Payload**:
  ```json
  {
    "text": "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।",
    "sourceContext": "Gita Chapter 4"
  }
  ```
- **Output**:
  ```json
  {
    "verse": "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।",
    "identifiedSource": "Bhagavad Gita 4.7",
    "transliterationIAST": "yadā yadā hi dharmasya glānir bhavati bhārata ।",
    "transliterationPhonetic": "Yada yada hi dharmasya, glanir bhavati bharata.",
    "translationEnglish": "Whenever there is a decline in righteousness...",
    "translationHindi": "जब-जब धर्म की हानि और अधर्म का उत्थान होता है...",
    "spiritualSignificance": "Promotes hope and moral cosmic order...",
    "poeticMeter": "Anustubh",
    "wordBreakdown": [...]
  }
  ```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm package manager

### Steps
1. Clone the project and navigate into the folder:
   ```bash
   cd scripture-translator
   ```
2. Install the node dependencies:
   ```bash
   npm install
   ```
3. Set your Gemini API key:
   - Create a `.env` file in the root directory:
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
4. Start the application in development mode:
   ```bash
   npm run dev
   ```
5. Build the application for production:
   ```bash
   npm run build
   ```
6. Start the production server:
   ```bash
   npm run start
   ```

---

## 🌐 Publishing to your GitHub Account

To export this app and make it available on your personal GitHub, follow these simple steps:

### Option A: Direct Sync via Google AI Studio
1. Open the **Settings Menu** in Google AI Studio Build.
2. Select **Export to GitHub** (if enabled/prompted).
3. Connect your GitHub account and authorize access.
4. Name your new repository and click **Push**.

### Option B: Manual Export & Git Setup
If you are exporting the code via a downloaded ZIP:
1. Select **Download ZIP** from the Settings menu.
2. Extract the archive into a folder on your local computer.
3. Open your terminal inside the folder and initialize git:
   ```bash
   git init
   git add .
   git commit -m "Initialize Scripture Translator App"
   ```
4. Create a new repository on your GitHub account (leave it empty without ticking README initialization).
5. Link your local project to GitHub and push your codebase:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Option C: Configuring Repository Secrets on GitHub
To host or deploy your application in a hosting environment like Vercel, Render, or Cloud Run while protecting your Gemini key:
1. Navigate to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add a new repository secret named `GEMINI_API_KEY` with your actual key value.
3. This ensures secrets are kept entirely secure and never exposed publicly inline in your code!
