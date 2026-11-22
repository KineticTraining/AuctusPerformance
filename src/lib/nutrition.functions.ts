import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import type { NewsletterIssue, NutritionEntry } from "./mock-seed";

export const listNutritionEntries = createServerFn({ method: "GET" }).handler(
  async (): Promise<NutritionEntry[]> => {
    const { getCmsState } = await import("./cms-store.server");
    const state = getCmsState();
    return [...state.nutrition].sort((a, b) => a.sortOrder - b.sortOrder);
  },
);

export const listNewsletters = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsletterIssue[]> => {
    const { getCmsState } = await import("./cms-store.server");
    const state = getCmsState();
    return [...state.newsletters].sort((a, b) => b.issue_number - a.issue_number);
  },
);

export const nutritionListQuery = () =>
  queryOptions({ queryKey: ["nutrition-library"], queryFn: () => listNutritionEntries() });

export const newslettersQuery = () =>
  queryOptions({ queryKey: ["newsletters"], queryFn: () => listNewsletters() });
