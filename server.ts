import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { translateText, transliterateText, analyzeScripture } from "./server/translator.ts";
import { POPULAR_SCRIPTURES } from "./src/data/scriptures.ts";
import { SPECIALIZED_SCRIPTURE_DICT, VEDAS_DICT, UPANISHADS_DICT, GITA_DICT, RAMAYANA_DICT, PURANAS_DICT } from "./server/dictionaries.ts";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Ground-level middleware to print request summary
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Endpoint: Get popular scriptures
  app.get("/api/scriptures", (req, res) => {
    res.json(POPULAR_SCRIPTURES);
  });

  // API Endpoint: Get specialized scripture dictionary entries grouped by sacred category
  app.get("/api/dictionary", (req, res) => {
    res.json({
      Vedas: VEDAS_DICT,
      Upanishads: UPANISHADS_DICT,
      Gita: GITA_DICT,
      Ramayana: RAMAYANA_DICT,
      Puranas: PURANAS_DICT,
      all: SPECIALIZED_SCRIPTURE_DICT
    });
  });

  // API Endpoint: Translate text between Sanskrit, Hindi, English
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang, targetLang, scriptureContext } = req.body;
      
      if (!text || !targetLang) {
        return res.status(400).json({ error: "Required fields 'text' and 'targetLang' are missing." });
      }

      const result = await translateText(text, sourceLang || 'auto', targetLang, scriptureContext);
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/translate:", error);
      res.status(500).json({ 
        error: error.message || "An internal server error occurred while translating. Ensure your GEMINI_API_KEY is configured in Settings." 
      });
    }
  });

  // API Endpoint: Transliterate Sanskrit scripts (Devanagari, IAST, ITRANS, English Phonetic)
  app.post("/api/transliterate", async (req, res) => {
    try {
      const { text, sourceScript, targetScript } = req.body;

      if (!text || !sourceScript || !targetScript) {
        return res.status(400).json({ error: "Required fields 'text', 'sourceScript', and 'targetScript' are missing." });
      }

      const result = await transliterateText(text, sourceScript, targetScript);
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/transliterate:", error);
      res.status(500).json({ 
        error: error.message || "An internal server error occurred while transliterating. Ensure your GEMINI_API_KEY is configured in Settings." 
      });
    }
  });

  // API Endpoint: Detailed analytical parser for verse breakdowns (Padapatha & Meter representation)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text, sourceContext } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Required field 'text' is missing." });
      }

      const result = await analyzeScripture(text, sourceContext);
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/analyze:", error);
      res.status(500).json({ 
        error: error.message || "An internal server error occurred while analyzing the verse. Ensure your GEMINI_API_KEY is configured in Settings." 
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Scripture Translator Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to boot server:", err);
});
