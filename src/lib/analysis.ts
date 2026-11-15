import { z } from "zod";

export const analysisSchema = z.object({
  video_reviewed: z.boolean(),
  overall_score: z.number().min(1).max(10),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.object({ issue: z.string(), cue: z.string(), drill: z.string() })),
  next_session: z.string(),
});

export type Analysis = z.infer<typeof analysisSchema>;

export const analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["video_reviewed", "overall_score", "summary", "strengths", "improvements", "next_session"],
  properties: {
    video_reviewed: { type: "boolean", description: "true only if you actually watched the video content" },
    overall_score: { type: "integer", minimum: 1, maximum: 10, description: "Technique score vs the reference model" },
    summary: { type: "string", description: "2-3 sentence overview of the rep" },
    strengths: { type: "array", items: { type: "string" }, maxItems: 4 },
    improvements: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["issue", "cue", "drill"],
        properties: {
          issue: { type: "string", description: "What is off, referencing a fault from the database when it applies" },
          cue: { type: "string", description: "Short coaching cue to fix it" },
          drill: { type: "string", description: "A drill with sets/reps" },
        },
      },
    },
    next_session: { type: "string", description: "One concrete focus for the athlete's next session" },
  },
} as const;
