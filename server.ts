import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
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

  // Serve static assets from the public folder directly
  app.use(express.static(path.join(process.cwd(), "public")));

  // Ground-level middleware to print request summary
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Check runtime switch
  let useDotnetActive = false;

  if (process.env.USE_DOTNET === "true" || process.env.USE_DOTNET === "1") {
    console.log("-------------------------------------------------------");
    console.log("[Node] USE_DOTNET is enabled! Trying to spawn C# SanskritQuestApi on port 5000...");
    console.log("-------------------------------------------------------");

    try {
      const { spawn } = await import("child_process");
      const dotnetProcess = spawn("dotnet", ["run", "--project", "SanskritQuestApi/SanskritQuestApi.csproj"], {
        stdio: "inherit",
        env: process.env
      });

      useDotnetActive = true;

      dotnetProcess.on("error", (err: any) => {
        console.log("[Node Warning] .NET SDK is not installed in this sandbox environment:", err.message);
        useDotnetActive = false;
        console.log("[Node Fallback] Quietly carrying on with local Express-native API registry.");
      });

      dotnetProcess.on("exit", (code) => {
        console.log(`[Node] Dotnet process exited with code ${code}`);
        useDotnetActive = false;
      });
    } catch (err: any) {
      console.error("[Node] Error spawning dotnet process block:", err.message);
      useDotnetActive = false;
    }
  }

  // Set up the custom reverse proxy to direct /api and /swagger requests to .NET Core
  const http = await import("http");
  app.all(["/api/*", "/swagger*", "/swagger"], (req, res, next) => {
    if (!useDotnetActive) {
      // Local fallback
      return next();
    }

    const options = {
      hostname: "127.0.0.1",
      port: 5000,
      path: req.originalUrl || req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: "127.0.0.1:5000"
      }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });

    proxyReq.on("error", (err: any) => {
      console.error("[Node Proxy Error] Cannot reach SanskritQuestApi Web API on port 5000:", err.message);
      if (req.path.startsWith("/api/")) {
        console.log("[Node Proxy Fallback] Forwarding request to local Express handlers...");
        next(); // Call local fallback handlers
      } else {
        res.status(502).json({
          error: "SanskritQuestApi Web API is booting or currently offline.",
          details: err.message
        });
      }
    });
  });

  // --- Express-native API Route Handlers (Backup / Standard Fallback Mode) ---

  // API Endpoint: Get popular scriptures
  app.get("/api/scriptures", (req, res) => {
    res.json(POPULAR_SCRIPTURES);
  });

  // API Endpoint: Get specialized scripture dictionary entries grouped by sacred category
  // Optional query parameter: ?word=...
  app.get("/api/dictionary", (req, res) => {
    const wordParam = req.query.word;

    if (wordParam && typeof wordParam === "string") {
      const cleanWord = wordParam.trim().toLowerCase();

      if (cleanWord === "all" || cleanWord === "al") {
        return res.json({
          Vedas: VEDAS_DICT,
          Upanishads: UPANISHADS_DICT,
          Gita: GITA_DICT,
          Ramayana: RAMAYANA_DICT,
          Puranas: PURANAS_DICT,
          all: SPECIALIZED_SCRIPTURE_DICT
        });
      }

      // Exact case-insensitive match on the keys
      const exactMatch = Object.entries(SPECIALIZED_SCRIPTURE_DICT).find(
        ([key]) => key.toLowerCase() === cleanWord
      );

      if (exactMatch) {
        return res.json({
          word: exactMatch[0],
          found: true,
          entry: exactMatch[1]
        });
      }

      // Partial case-insensitive matches (by key, english value, or hindi value)
      const partialMatches = Object.entries(SPECIALIZED_SCRIPTURE_DICT).filter(
        ([key, val]) => (
          key.toLowerCase().includes(cleanWord) ||
          val.eng.toLowerCase().includes(cleanWord) ||
          val.hin.toLowerCase().includes(cleanWord)
        )
      );

      if (partialMatches.length > 0) {
        return res.json({
          word: wordParam,
          found: true,
          message: `Specific term not found, but found ${partialMatches.length} matching entry/entries.`,
          matches: Object.fromEntries(partialMatches)
        });
      }

      return res.status(404).json({
        word: wordParam,
        found: false,
        message: `Word "${wordParam}" not found in our specialized scriptures dictionary. Try querying "all" to retrieve all entries.`,
        availableCategories: ["Vedas", "Upanishads", "Gita", "Ramayana", "Puranas"]
      });
    }

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
