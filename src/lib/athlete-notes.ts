import { supabase } from "@/integrations/supabase/client";

export type FocusArea = "Training" | "Nutrition" | "Recovery";

export type FocusStatus =
  "Building Base" | "Heavy Accumulation" | "In-Season Maintenance" | "Return to Play" | "Peaking";

export interface WorkingOnFocus {
  area: FocusArea;
  status: FocusStatus;
  goal: string;
  updatedAt: string;
}

export type PreviewTier = "free" | "pro_preview";

export const FOCUS_AREAS: FocusArea[] = ["Training", "Nutrition", "Recovery"];

export const FOCUS_STATUSES: FocusStatus[] = [
  "Building Base",
  "Heavy Accumulation",
  "In-Season Maintenance",
  "Return to Play",
  "Peaking",
];

const FOCUS_STORAGE_KEY = "auctus_working_on_focus_v1";
const EXERCISE_NOTES_STORAGE_KEY = "auctus_private_exercise_notes_v1";
const PREVIEW_TIER_STORAGE_KEY = "auctus_preview_tier_v1";
export const AUCTUS_STATE_EVENT = "auctus:athlete-state-change";

export const DEFAULT_WORKING_ON: WorkingOnFocus = {
  area: "Training",
  status: "Building Base",
  goal: "",
  updatedAt: "",
};

function notifyStateChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUCTUS_STATE_EVENT));
  }
}

export function loadLocalWorkingOnFocus(): WorkingOnFocus {
  if (typeof window === "undefined") return DEFAULT_WORKING_ON;
  try {
    const raw = window.localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return DEFAULT_WORKING_ON;
    const parsed = JSON.parse(raw) as Partial<WorkingOnFocus>;
    const area: FocusArea = FOCUS_AREAS.includes(parsed.area as FocusArea)
      ? (parsed.area as FocusArea)
      : "Training";
    const status: FocusStatus = FOCUS_STATUSES.includes(parsed.status as FocusStatus)
      ? (parsed.status as FocusStatus)
      : "Building Base";
    return {
      area,
      status,
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return DEFAULT_WORKING_ON;
  }
}

export async function saveWorkingOnFocus(
  focus: WorkingOnFocus,
  isAuthenticated: boolean,
): Promise<{ ok: boolean; syncedRemote: boolean }> {
  const clean: WorkingOnFocus = {
    area: FOCUS_AREAS.includes(focus.area) ? focus.area : "Training",
    status: FOCUS_STATUSES.includes(focus.status) ? focus.status : "Building Base",
    goal: focus.goal.trim().slice(0, 400),
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // Ignore storage quota errors
    }
  }

  let syncedRemote = false;
  if (isAuthenticated) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { auctus_focus: clean },
      });
      if (!error) syncedRemote = true;
    } catch {
      // Local persistence already succeeded; avoid throwing UI crashes
    }
  }

  notifyStateChange();
  return { ok: true, syncedRemote };
}

export function loadLocalExerciseNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(EXERCISE_NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "string" && v.trim()) {
        clean[k] = v.slice(0, 500);
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export async function savePrivateExerciseNote(
  exerciseId: string,
  note: string,
  isAuthenticated: boolean,
): Promise<Record<string, string>> {
  const existing = loadLocalExerciseNotes();
  const next = { ...existing };
  const trimmed = note.slice(0, 500);
  if (trimmed.trim()) {
    next[exerciseId] = trimmed;
  } else {
    delete next[exerciseId];
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(EXERCISE_NOTES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  if (isAuthenticated) {
    try {
      await supabase.auth.updateUser({
        data: { auctus_exercise_notes: next },
      });
    } catch {
      // Keep local note safely if offline
    }
  }

  return next;
}

export function loadPreviewTier(): PreviewTier {
  if (typeof window === "undefined") return "free";
  try {
    const val = window.localStorage.getItem(PREVIEW_TIER_STORAGE_KEY);
    return val === "pro_preview" ? "pro_preview" : "free";
  } catch {
    return "free";
  }
}

export function savePreviewTier(tier: PreviewTier): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREVIEW_TIER_STORAGE_KEY, tier);
  } catch {
    // Ignore storage quota errors
  }
  notifyStateChange();
}
