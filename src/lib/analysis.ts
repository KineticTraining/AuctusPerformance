import { z } from "zod";

export const correctiveDrillSchema = z.object({
  target_area: z.string().default(""),
  cue: z.string(),
  drill: z.string(),
});

export const legacyImprovementSchema = z.object({
  issue: z.string(),
  cue: z.string(),
  drill: z.string(),
});

export const analysisSchema = z.object({
  video_reviewed: z.boolean(),
  overall_score: z.number().min(1).max(10),
  summary: z.string(),
  what_went_well: z.array(z.string()).optional(),
  areas_to_improve: z.array(z.string()).optional(),
  corrective_drills: z.array(correctiveDrillSchema).optional(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(legacyImprovementSchema).optional(),
  next_session: z.string(),
});

export type Analysis = z.infer<typeof analysisSchema>;

export interface NormalizedAnalysis {
  video_reviewed: boolean;
  overall_score: number;
  summary: string;
  what_went_well: string[];
  areas_to_improve: string[];
  corrective_drills: Array<{
    target_area: string;
    cue: string;
    drill: string;
  }>;
  next_session: string;
}

export function normalizeAnalysis(raw: unknown): NormalizedAnalysis | null {
  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) return null;
  const data = parsed.data;

  const whatWentWell =
    data.what_went_well && data.what_went_well.length > 0
      ? data.what_went_well
      : (data.strengths ?? []);

  const areasToImprove =
    data.areas_to_improve && data.areas_to_improve.length > 0
      ? data.areas_to_improve
      : (data.improvements ?? []).map((item) => item.issue);

  const correctiveDrills =
    data.corrective_drills && data.corrective_drills.length > 0
      ? data.corrective_drills.map((d) => ({
          target_area: d.target_area ?? "",
          cue: d.cue,
          drill: d.drill,
        }))
      : (data.improvements ?? []).map((item) => ({
          target_area: item.issue,
          cue: item.cue,
          drill: item.drill,
        }));

  return {
    video_reviewed: data.video_reviewed,
    overall_score: data.overall_score,
    summary: data.summary,
    what_went_well: whatWentWell,
    areas_to_improve: areasToImprove,
    corrective_drills: correctiveDrills,
    next_session: data.next_session,
  };
}
