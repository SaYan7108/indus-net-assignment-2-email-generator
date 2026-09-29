import Groq from "groq-sdk";
import { performance } from "node:perf_hooks";

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

if (!apiKey) {
  console.warn("WARNING: GROQ_API_KEY is not configured. Add it to .env before making AI requests.");
}

const groq = new Groq({ apiKey });

function buildPrompt({ purpose, recipientName, tone }) {
  return `
You are an expert professional email writer.

Generate a short, customer-friendly email template using these inputs:
- Purpose: ${purpose}
- Recipient name: ${recipientName}
- Tone: ${tone}

Rules:
1. Write a concise, natural and professional email.
2. Address the recipient by name.
3. Do not invent company names, dates, prices, links, promises, or facts.
4. Use placeholders such as [Your Name] when sender information is not provided.
5. Return ONLY valid JSON with exactly two string fields:
   {"subject":"...","body":"..."}
6. Do not wrap the JSON in Markdown code fences.
`.trim();
}

function parseModelResponse(content) {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.subject === "string" && typeof parsed.body === "string") {
      return {
        subject: parsed.subject.trim(),
        body: parsed.body.trim()
      };
    }
  } catch {
    // Fall back to extracting a JSON object if the model added extra text.
  }

  const match = content.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed.subject === "string" && typeof parsed.body === "string") {
        return {
          subject: parsed.subject.trim(),
          body: parsed.body.trim()
        };
      }
    } catch {
      // Continue to plain-text fallback below.
    }
  }

  return {
    subject: "Email",
    body: content.trim()
  };
}

export async function generateEmailTemplate(input) {
  const start = performance.now();

  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  const completion = await groq.chat.completions.create({
    model,
    temperature: 0.4,
    max_completion_tokens: 400,
    messages: [
      {
        role: "system",
        content: "You generate concise customer-friendly email templates."
      },
      {
        role: "user",
        content: buildPrompt(input)
      }
    ]
  });

  const content = completion.choices?.[0]?.message?.content?.trim();

  if (!content) {
    const error = new Error("Groq returned an empty response");
    error.statusCode = 502;
    throw error;
  }

  const responseTimeMs = Math.round(performance.now() - start);
  console.log(
    `[AI] model=${model} response_time_ms=${responseTimeMs} timestamp=${new Date().toISOString()}`
  );

  return {
    ...parseModelResponse(content),
    model,
    responseTimeMs
  };
}