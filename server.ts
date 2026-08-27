import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Standard Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[WARN] GEMINI_API_KEY is not set in environment. Resilient fallback mode active.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Helper with sequential fallback
async function generateWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  config?: any;
}) {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          ...(params.config || {}),
        },
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || 500;
      // Recoverable error status check: 503, 429, 404, 500
      console.warn(`[Gemini Fallback] Model ${model} encountered status ${status} (${err?.message || "unknown"}). Attempting next model in fallback ladder...`);
    }
  }

  throw lastError || new Error("All Gemini models in fallback ladder were exhausted.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Top-Level Request Deserialization (Ordering Guarantee)
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // 2. Multi-turn Conversational Journal Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const { messages, userThought, journalContext } = body;

      if (!userThought && (!messages || messages.length === 0)) {
        return res.status(400).json({ error: "No thought or message provided." });
      }

      const systemInstruction = `You are the reflective, intelligent voice inside a private luxury journal called 'Elyra'.
Your role is to be a thoughtful Socratic thinking partner, sounding board, and sounding mirror.
Guidelines:
1. Speak with calm, elegant, and concise intellectual companionship.
2. Ask 1 gentle, perceptive question or offer 1 structured perspective to help the user unpack their thought.
3. NEVER make psychological diagnoses, psychiatric assessments, or clinical medical claims.
4. Keep answers focused (2-4 brief paragraphs max). Avoid generic corporate fluff, robotic lists, or unsolicited cheerleading.
5. Validate their clarity, point out interesting connections, and encourage self-driven discovery.`;

      // Transform dialogue into Gemini contents format
      const contents: any[] = [];
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          contents.push({
            role: msg.role === "gemini" ? "model" : "user",
            parts: [{ text: String(msg.text || "") }],
          });
        }
      }

      if (userThought) {
        contents.push({
          role: "user",
          parts: [{ text: String(userThought) }],
        });
      }

      const result = await generateWithFallback({
        contents,
        systemInstruction,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      return res.json({
        reply: result.text,
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error("[API Error] /api/gemini/chat:", error?.message || error);
      return res.status(500).json({
        error: "Failed to generate journal reflection. Please try again.",
      });
    }
  });

  // 3. Synthesis & Analysis Endpoint (Title, Summary, Key Points, Action Items, Tags)
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const { messages } = body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Valid message history array is required." });
      }

      const conversationText = messages
        .map((m: any) => `${m.role === "gemini" ? "AI Reflection" : "Author"}: ${m.text}`)
        .join("\n\n");

      const prompt = `Analyze this journal session and return a strictly valid JSON object.
Session transcript:
---
${conversationText}
---

Return JSON in this EXACT schema:
{
  "title": "A short, evocative, literary title (3 to 6 words)",
  "summary": "A clean 2-3 sentence executive synthesis of what was explored and discovered",
  "keyPoints": [
    "Core insight or takeaway 1",
    "Core insight or takeaway 2",
    "Core insight or takeaway 3"
  ],
  "actionItems": [
    {
      "text": "Specific actionable next step derived from the user's intent",
      "status": "suggested"
    }
  ],
  "tags": ["Topic1", "Topic2", "Topic3"],
  "sentiment": "focused" | "reflective" | "energized" | "contemplative" | "resolved"
}

Important:
- Never make clinical/mental health diagnoses.
- Keep action items tangible and practical.
- Return ONLY the JSON object. No Markdown code fences.`;

      const result = await generateWithFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(result.text);
      } catch (parseErr) {
        // Fallback cleanup if fences were returned
        const cleaned = result.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        analysis: parsed,
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error("[API Error] /api/gemini/analyze:", error?.message || error);
      return res.status(500).json({
        error: "Failed to analyze journal session.",
      });
    }
  });

  // 4. Feature 1: Journal Growth Map Analysis
  app.post("/api/gemini/growth-map", async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const { journals } = body;

      if (!Array.isArray(journals) || journals.length === 0) {
        return res.json({
          categories: [
            { name: "Personal Growth", count: 1, percentage: 100, color: "#8C6D32" }
          ],
          recentThemes: ["Initial Exploration"],
          trajectoryInsight: "Begin writing entries to witness your intellectual journey and recurring patterns unfold.",
          momentumScore: 85,
        });
      }

      const summaries = journals.map((j: any) => ({
        title: j.title || "Untitled",
        summary: j.summary || "",
        tags: j.tags || [],
        date: j.createdAt || "",
      }));

      const prompt = `You are the Journal Growth Map intelligence engine.
Analyze ONLY this specific user's journal catalog:
${JSON.stringify(summaries, null, 2)}

Return a strict JSON object with:
1. "categories": Array of top 4-6 recurring themes/domains (e.g. "AI Architecture", "Deep Work", "Personal Strategy", "Leadership", "Creative Writing") with "count" (number of related entries), "percentage" (relative % integer summing to 100), and a hex "color" from this luxury palette: ["#8C6D32", "#3D5A45", "#2C4A5E", "#6E3F58", "#5A4E3D", "#4B5563"].
2. "recentThemes": Array of 3-5 specific recent focus areas.
3. "trajectoryInsight": An inspiring 2-sentence synthesis of how the user's focus is evolving over time. (No medical/health diagnoses).
4. "momentumScore": An integer score (60 to 98) representing personal reflection consistency and depth.

Output ONLY valid JSON.`;

      const result = await generateWithFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(result.text);
      } catch (err) {
        const cleaned = result.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        growthMap: parsed,
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error("[API Error] /api/gemini/growth-map:", error?.message || error);
      return res.status(500).json({ error: "Failed to generate growth map." });
    }
  });

  // 5. Feature 3: Weekly Reflection Synthesizer
  app.post("/api/gemini/weekly-reflection", async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const { journals, weekLabel } = body;

      if (!Array.isArray(journals) || journals.length === 0) {
        return res.status(400).json({ error: "No journals provided for this reflection window." });
      }

      const summaries = journals.map((j: any) => ({
        title: j.title,
        summary: j.summary,
        keyPoints: j.keyPoints,
        actionItems: j.actionItems,
      }));

      const prompt = `Synthesize a weekly executive reflection for the period (${weekLabel || "This Week"}) from the user's private journals:
${JSON.stringify(summaries, null, 2)}

Return a strict JSON object:
{
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "focusedOn": ["Primary focus area 1", "Primary focus area 2"],
  "lessonsLearned": ["Wisdom or insight discovered 1", "Wisdom or insight discovered 2"],
  "nextSteps": ["Strategic next step 1", "Strategic next step 2", "Strategic next step 3"],
  "summaryNarrative": "A thoughtful 3-sentence editorial reflection on the week's progress."
}

No medical/health claims. Output ONLY JSON.`;

      const result = await generateWithFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(result.text);
      } catch (err) {
        const cleaned = result.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        reflection: parsed,
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error("[API Error] /api/gemini/weekly-reflection:", error?.message || error);
      return res.status(500).json({ error: "Failed to generate weekly reflection." });
    }
  });

  // 6. Feature 5: Natural Language Semantic Search over User's Own Journals
  app.post("/api/gemini/semantic-search", async (req, res) => {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const { query, journals } = body;

      if (!query || !Array.isArray(journals) || journals.length === 0) {
        return res.json({ matches: [] });
      }

      // Compact user's journals for semantic ranking
      const catalog = journals.map((j: any) => ({
        id: j.id,
        title: j.title,
        summary: j.summary,
        tags: j.tags,
        keyPoints: j.keyPoints,
        date: j.createdAt,
      }));

      const prompt = `You are a semantic search engine operating ONLY on this user's private collection.
Query: "${query}"

User Journals:
${JSON.stringify(catalog, null, 2)}

Rank and return the top matching journal entries that conceptually answer or relate to the query.
Return JSON:
{
  "matches": [
    {
      "id": "matching journal id",
      "relevanceScore": 0.95,
      "matchReason": "Brief 1-sentence explanation of why this journal relates to the query"
    }
  ]
}
Return ONLY valid JSON. If no journals match, return {"matches": []}.`;

      const result = await generateWithFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(result.text);
      } catch (err) {
        const cleaned = result.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        matches: parsed.matches || [],
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error("[API Error] /api/gemini/semantic-search:", error?.message || error);
      return res.status(500).json({ error: "Semantic search failed." });
    }
  });

  // 7. Vite middleware for dev / static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Elyra] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Fatal Server Error]", err);
});
