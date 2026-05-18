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
          "Extract practical lead details for a clinic owner. Use unknown when the message does not clearly provide a value, and do not invent a service. Classify booking_readiness as booking_ready only when there are concrete booking-related signals: the customer asks to book an appointment, asks for availability, mentions timing like today/tomorrow/this week/next week, mentions a specific service and asks for next steps, asks for quote/pricing about a specific service, or provides enough context for staff to take a concrete booking-related action. A vague call request alone is not booking_ready. If the message is only like 'Can someone call me?' with no service, timing, or booking intent, set booking_readiness to needs_review, booking_readiness_reason to 'Asked for a call but did not mention a service, timing, or booking intent.', service_requested to unknown, and recommended_next_action to call and clarify what service they are interested in. Keep genuine call requests with service or timing as booking_ready, for example 'I want to book a skin consultation next week. Can someone call me?'. Use interested when they ask about a service without clear booking intent. Use low_intent for vague, very general, price-shopping only without a specific service, or unclear potential booking messages. Use needs_review when unsure. Keep summaries, reasons, and next actions concise."
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
