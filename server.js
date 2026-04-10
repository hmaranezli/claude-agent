import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const apiKey = process.env.ANTHROPIC_API_KEY;

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    app: "claude-agent",
    message: "Server is running."
  });
});

app.post("/generate", async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "ANTHROPIC_API_KEY is missing."
      });
    }

    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        ok: false,
        error: "A string prompt is required."
      });
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      system: \`You are an execution-focused AI assistant for Hasan.
Be practical, concise, and output directly usable results.\`,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const text = response.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("\\n");

    res.json({
      ok: true,
      result: text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Unknown error"
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(\`claude-agent listening on port \${port}\`);
});
