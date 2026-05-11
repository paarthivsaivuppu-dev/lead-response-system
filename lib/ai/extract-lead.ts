import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const LeadExtractionSchema = z.object({
  service_requested: z.string(),
  urgency: z.enum(["low", "medium", "high", "unknown"]),
  intent: z.enum(["booking", "pricing", "question", "complaint", "other"]),
  ai_summary: z.string(),
  lead_quality: z.enum(["low", "medium", "high", "unknown"]),
  recommended_next_action: z.string(),
  confidence: z.number().min(0).max(1)
});

export type LeadExtraction = z.infer<typeof LeadExtractionSchema>;

export async function extractLeadDetails(originalMessage: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.responses.parse({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Extract practical lead details for a small business owner. Use unknown when the message does not clearly provide a value. Keep summaries and next actions concise."
      },
      {
        role: "user",
        content: originalMessage
      }
    ],
    text: {
      format: zodTextFormat(LeadExtractionSchema, "lead_extraction")
    }
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return parsed lead extraction data.");
  }

  return response.output_parsed;
}
