import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateCramMaterial, generateMoreMaterial, parseSyllabusOrNotes, generateVideoInteractive, generateChatResponse } from "./server/cram.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));

  // API Endpoints FIRST
  app.post("/api/cram", async (req, res) => {
    try {
      const { topic, simplified } = req.body;
      if (!topic || typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "Topic is required and must be a non-empty string." });
      }
      
      const isSimplified = !!simplified;
      console.log(`Generating cram material for topic: "${topic}" (Simplified Mode: ${isSimplified})...`);
      const data = await generateCramMaterial(topic, isSimplified);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/cram endpoint:", error);
      res.status(500).json({ error: error.message || "Failed to generate material. Please try again." });
    }
  });

  app.post("/api/cram/parse", async (req, res) => {
    try {
      const { sourceText, simplified } = req.body;
      if (!sourceText || typeof sourceText !== "string" || !sourceText.trim()) {
        return res.status(400).json({ error: "Syllabus or notes text is required." });
      }
      
      const isSimplified = !!simplified;
      console.log(`Parsing custom syllabus/notes (Length: ${sourceText.length}, Simplified: ${isSimplified})...`);
      const data = await parseSyllabusOrNotes(sourceText, isSimplified);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/cram/parse endpoint:", error);
      res.status(500).json({ error: error.message || "Failed to parse notes. Please check details and try again." });
    }
  });

  app.post("/api/cram/more", async (req, res) => {
    try {
      const { topic, type, simplified } = req.body;
      if (!topic || typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "Topic is required." });
      }
      if (!type || !["summary", "flashcards", "quiz"].includes(type)) {
        return res.status(400).json({ error: "Type must be one of: 'summary', 'flashcards', 'quiz'." });
      }

      const isSimplified = !!simplified;
      console.log(`Generating MORE cram material (${type}) for topic: "${topic}"...`);
      const data = await generateMoreMaterial(topic, type, isSimplified);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/cram/more endpoint:", error);
      res.status(500).json({ error: error.message || "Failed to generate more material. Please try again." });
    }
  });

  app.post("/api/cram/video-interactive", async (req, res) => {
    try {
      const { topic, videoTitle, searchQuery, type } = req.body;
      if (!topic || !videoTitle || !type || !["notes", "flashcards", "quiz", "coding"].includes(type)) {
        return res.status(400).json({ error: "Missing required fields or invalid type." });
      }

      console.log(`Generating video interactive material of type "${type}" for "${videoTitle}"...`);
      const data = await generateVideoInteractive(topic, videoTitle, searchQuery || "", type);
      res.json(data);
    } catch (error: any) {
      console.error("Error in /api/cram/video-interactive endpoint:", error);
      res.status(500).json({ error: error.message || "Failed to generate video material." });
    }
  });

  app.post("/api/cram/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required." });
      }
      
      const responseText = await generateChatResponse(message, history || [], context || "");
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error in /api/cram/chat endpoint:", error);
      res.status(500).json({ error: error.message || "Failed to generate chat response." });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // Vite development middleware vs Static Production files serving
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
