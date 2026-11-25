import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { PageOutline } from "@/components/site/page-outline";
import { ExerciseVisual } from "@/components/training/exercise-visual";
import {
  addArticleComment,
  getArticleFeedback,
  getArticleFeedbackSummaryMap,
  submitArticleRating,
} from "@/lib/article-feedback.server";
import {
  DEFAULT_WORKING_ON,
  FOCUS_AREAS,
  FOCUS_STATUSES,
  loadLocalExerciseNotes,
  loadLocalWorkingOnFocus,
  loadPreviewTier,
  savePreviewTier,
  savePrivateExerciseNote,
  saveWorkingOnFocus,
} from "@/lib/athlete-notes";
import { sanitizeCmsArticles, sanitizeCmsNewsletters } from "@/lib/cms-store.server";
import { SEED_ARTICLES, SEED_NEWSLETTERS } from "@/lib/mock-seed";
import { getNutrientPriority, SEED_NUTRIENTS } from "@/lib/nutrition-data";
import {
  ARTICLE_CATEGORIES,
  matchesScienceSportFilter,
  normalizeArticleCategory,
} from "@/lib/sports";
import { EXERCISE_CATEGORIES } from "@/lib/training";
import { handleVideoApiRequest, upsertUserSubmission } from "@/lib/video-submissions.server";

describe("Auctus Performance core features & data integrity", () => {
  const feedbackFile = resolve(process.cwd(), ".data", "article-feedback.json");
  const submissionsFile = resolve(process.cwd(), ".data", "video-submissions.json");

  afterEach(() => {
    cleanup();
    const g = globalThis as unknown as Record<string, unknown>;
    delete g["__auctus_article_feedback_store__"];
    delete g["__auctus_video_submissions__"];
    for (const file of [feedbackFile, submissionsFile]) {
      if (existsSync(file)) {
        try {
          unlinkSync(file);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  });

  it("contains zero fabricated articles or newsletters in seed exports", () => {
    expect(SEED_ARTICLES).toEqual([]);
    expect(SEED_NEWSLETTERS).toEqual([]);
  });

  it("purges legacy fabricated articles and newsletters while normalizing real CMS articles", () => {
    const cleaned = sanitizeCmsArticles([
      {
        id: "legacy-sleep-id",
        slug: "sleep-the-performance-drug",
        title: "Fake Sleep Study",
        excerpt: "Fake",
        body: "Fake",
        category: "Recovery",
        author: "Dr. Maya Okafor",
        author_role: "Fake",
        read_minutes: 5,
        featured: true,
        published_at: "2026-11-01",
        sports: ["Basketball"],
        age_groups: [],
        experience_levels: [],
        sources: [],
        data_conclusion: "",
      },
      {
        id: "custom-tendon-id",
        slug: "custom-tendon-load-study",
        title: "Tendon Load Progression",
        excerpt: "Real custom article",
        body: "Body copy",
        category: "Training Science",
        author: "Auctus Research",
        author_role: "Sports Science",
        read_minutes: 6,
        featured: false,
        published_at: "2026-11-24",
        sports: ["Track & Field"],
        age_groups: [],
        experience_levels: [],
        sources: [],
        data_conclusion: "Consistent tendon loading improves stiffness.",
      },
    ]);

    expect(cleaned).toHaveLength(1);
    expect(cleaned[0]?.slug).toBe("custom-tendon-load-study");
    expect(cleaned[0]?.category).toBe("Training");

    const cleanedNewsletters = sanitizeCmsNewsletters([
      {
        id: "nl-014",
        issue_number: 14,
        title: "Legacy Dispatch",
        published_at: "2026-11-01",
        summary: "Legacy",
        highlights: ["Item"],
        coach_note: "Note",
      },
    ]);
    expect(cleanedNewsletters).toEqual([]);
  });

  it("organizes Latest Science categories strictly into Training, Recovery, and Nutrition", () => {
    expect(ARTICLE_CATEGORIES).toEqual(["Training", "Recovery", "Nutrition"]);
    expect(normalizeArticleCategory("Injury Prevention")).toBe("Recovery");
    expect(normalizeArticleCategory("Fueling")).toBe("Nutrition");
    expect(normalizeArticleCategory("Biomechanics")).toBe("Training");

    expect(matchesScienceSportFilter(["Basketball", "Strength"], "Basketball")).toBe(true);
    expect(matchesScienceSportFilter(["Track & Field"], "Track & Sprint")).toBe(true);
    expect(matchesScienceSportFilter(["Soccer"], "Track & Sprint")).toBe(false);
    expect(matchesScienceSportFilter(["Swimming"], "General Gym")).toBe(true);
  });

  it("maps verified priority metadata for every entry in SEED_NUTRIENTS", () => {
    expect(SEED_NUTRIENTS).toHaveLength(26);
    for (const nutrient of SEED_NUTRIENTS) {
      const priority = getNutrientPriority(nutrient);
      expect(["high", "situational", "baseline"]).toContain(priority.tier);
      expect(priority.coverageScore).toBeGreaterThan(0);
      expect(priority.coverageScore).toBeLessThanOrEqual(100);
      expect(priority.priorityWhy.length).toBeGreaterThan(15);
    }
  });

  it("computes exact 5-star ratings and persists reader comments cleanly", () => {
    const slug = "test-sprint-mechanics-review";
    submitArticleRating({ slug, voterId: "voter_alpha", rating: 5 });
    submitArticleRating({ slug, voterId: "voter_beta", rating: 3 });
    // Updating existing voter's vote replaces rather than duplicating
    const updated = submitArticleRating({ slug, voterId: "voter_beta", rating: 4 });

    expect(updated.ratingCount).toBe(2);
    expect(updated.averageRating).toBe(4.5);
    expect(updated.userRating).toBe(4);

    addArticleComment({
      slug,
      authorName: "Alex Morgan",
      body: "Clear breakdown of shin angle progression.",
      voterId: "voter_alpha",
    });
    const afterSecondComment = addArticleComment({
      slug,
      authorName: "Jordan Lee",
      body: "Helpful cue for acceleration drills.",
      voterId: "voter_beta",
    });

    expect(afterSecondComment.comments).toHaveLength(2);
    expect(afterSecondComment.comments[0]?.authorName).toBe("Jordan Lee");

    const snap = getArticleFeedback(slug, "voter_alpha");
    expect(snap.userRating).toBe(5);
    const summaryMap = getArticleFeedbackSummaryMap([slug]);
    expect(summaryMap[slug]).toEqual({
      averageRating: 4.5,
      ratingCount: 2,
      commentCount: 2,
    });
  });

  it("persists focus, private exercise notes, and preview tier cleanly in browser storage", async () => {
    window.localStorage.clear();
    expect(FOCUS_AREAS).toEqual(["Training", "Nutrition", "Recovery"]);
    expect(FOCUS_STATUSES).toContain("Building Base");
    expect(DEFAULT_WORKING_ON.area).toBe("Training");

    expect(loadLocalWorkingOnFocus()).toEqual(DEFAULT_WORKING_ON);
    expect(loadLocalExerciseNotes()).toEqual({});
    expect(loadPreviewTier()).toBe("free");

    savePreviewTier("pro_preview");
    expect(loadPreviewTier()).toBe("pro_preview");

    const saved = await saveWorkingOnFocus(
      {
        area: "Recovery",
        status: "Return to Play",
        goal: "Hamstring eccentric strength progression",
        updatedAt: "",
      },
      false,
    );
    expect(saved.ok).toBe(true);
    expect(saved.syncedRemote).toBe(false);
    expect(loadLocalWorkingOnFocus()).toMatchObject({
      area: "Recovery",
      status: "Return to Play",
      goal: "Hamstring eccentric strength progression",
    });

    const notes = await savePrivateExerciseNote("nordic-curl", "Keep ribs stacked", false);
    expect(notes).toEqual({ "nordic-curl": "Keep ribs stacked" });
    expect(loadLocalExerciseNotes()).toEqual({ "nordic-curl": "Keep ribs stacked" });

    const cleared = await savePrivateExerciseNote("nordic-curl", "   ", false);
    expect(cleared).toEqual({});
    expect(loadLocalExerciseNotes()).toEqual({});
  });

  it("rejects unauthenticated video flag requests and stores flagged review fields cleanly", async () => {
    const req = new Request("http://localhost:3000/api/video/flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: "sub-1", flagFocus: "Form Breakdown" }),
    });
    const res = await handleVideoApiRequest(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);

    const stored = upsertUserSubmission({
      id: "sub-flag-test",
      user_id: "user-123",
      title: "Back Squat Set",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      source_type: "youtube",
      notes: "Checking bottom position",
      technique_id: null,
      technique: null,
      status: "complete",
      analysis: null,
      error: null,
      flagged: true,
      flag_focus: "Asymmetry Check",
      flag_note: "Left hip shift out of hole",
      flag_status: "pending_review",
      flagged_at: "2026-11-24T12:00:00.000Z",
      created_at: "2026-11-24T11:55:00.000Z",
      analyzed_at: "2026-11-24T11:56:00.000Z",
    });

    expect(stored.flagged).toBe(true);
    expect(stored.flag_status).toBe("pending_review");
    expect(stored.flag_focus).toBe("Asymmetry Check");
  });

  it("renders tailored geometric Form Diagrams for all 12 movement categories with safe image fallback", () => {
    expect(EXERCISE_CATEGORIES).toHaveLength(12);
    for (const category of EXERCISE_CATEGORIES) {
      const { container, unmount } = render(
        createElement(ExerciseVisual, {
          name: `Sample ${category}`,
          category,
          image: "https://example.com/broken-demo.jpg",
          primaryMuscles: ["Quads"],
        }),
      );
      expect(screen.getByText("Form Diagram")).toBeTruthy();
      expect(screen.getByText("Start")).toBeTruthy();
      expect(screen.getByText("Peak")).toBeTruthy();
      expect(container.querySelectorAll("svg path").length).toBeGreaterThanOrEqual(4);

      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      if (img) {
        fireEvent.error(img);
        expect(img.getAttribute("src")).toContain("data:image/svg+xml");
      }
      unmount();
    }
  });

  it("renders PageOutline desktop links and mobile collapsible drawer cleanly", () => {
    render(
      createElement(PageOutline, {
        title: "Latest Science",
        sections: [
          { id: "training-science", label: "Training", accentTextClass: "text-brand-amber" },
          { id: "recovery-science", label: "Recovery", accentTextClass: "text-brand-indigo" },
          { id: "nutrition-science", label: "Nutrition", accentTextClass: "text-brand-orange" },
        ],
      }),
    );

    expect(screen.getByRole("link", { name: "Training" })).toHaveAttribute(
      "href",
      "#training-science",
    );
    expect(screen.getByRole("link", { name: "Recovery" })).toHaveAttribute(
      "href",
      "#recovery-science",
    );
    expect(screen.getByRole("link", { name: "Nutrition" })).toHaveAttribute(
      "href",
      "#nutrition-science",
    );

    const mobileToggle = screen.getByRole("button", { expanded: false });
    fireEvent.click(mobileToggle);
    expect(mobileToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: "Recovery" }).length).toBe(2);
  });
});
