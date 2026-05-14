import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const LeadExtractionSchema = z.object({
  service_requested: z.string(),
  urgency: z.enum(["low", "medium", "high", "unknown"]),
  intent: z.enum(["booking", "pricing", "question", "complaint", "other"]),
  ai_summary: z.string(),
  lead_quality: z.enum(["low", "medium", "high", "unknown"]),
  booking_readiness: z.enum([
    "booking_ready",
    "interested",
    "low_intent",
    "needs_review"
  ]),
  booking_readiness_reason: z.string(),
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
          "Extract practical lead details for a clinic owner. Use unknown when the message does not clearly provide a value. Classify booking_readiness as booking_ready when the customer appears ready to take action soon, asks to book, asks for availability, mentions timing like today/tomorrow/this week/next week, asks for a call back, or provides a phone number and asks for next steps. Use interested when they ask about a service without clear booking intent. Use low_intent for vague, very general, price-shopping only, or unclear potential booking messages. Use needs_review when unsure. Keep summaries, reasons, and next actions concise."
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
