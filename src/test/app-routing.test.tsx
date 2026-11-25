import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { SEED_NUTRIENTS } from "@/lib/nutrition-data";
import { matchesAgeFilter, NUTRITION_GROUPS } from "@/lib/sports";
import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches core public pages instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    for (const path of [
      "/",
      "/about",
      "/training",
      "/nutrition",
      "/articles",
      "/submit",
      "/pricing",
      "/contact",
      "/admin",
      "/auth",
      "/auth/callback",
      "/reset-password",
      "/terms",
      "/privacy",
    ]) {
      const matches = router.matchRoutes(path);
      const last = matches.at(-1);
      expect(last?.routeId).not.toBe(rootRouteId);
      expect(last?.status).not.toBe("notFound");
    }
  });
});

describe("Nutrition 26-nutrient dataset", () => {
  it("contains all 26 nutrients organized into the 4 groups with summarized and in-depth data", () => {
    expect(SEED_NUTRIENTS).toHaveLength(26);

    const byGroup = Object.fromEntries(
      NUTRITION_GROUPS.map((g) => [g, SEED_NUTRIENTS.filter((n) => n.group === g)]),
    );
    expect(byGroup["Macronutrients"]).toHaveLength(3);
    expect(byGroup["Vitamins"]).toHaveLength(13);
    expect(byGroup["Macrominerals"]).toHaveLength(7);
    expect(byGroup["Trace Minerals"]).toHaveLength(3);

    const copper = SEED_NUTRIENTS.find((n) => n.slug === "copper");
    expect(copper).toBeDefined();
    expect(copper?.name).toBe("Copper (Cu)");
    expect(copper?.group).toBe("Trace Minerals");
    expect(copper?.inDepth.biochemicalFunction).toContain("cytochrome c oxidase");

    for (const nutrient of SEED_NUTRIENTS) {
      expect(nutrient.performanceOneLiner.length).toBeGreaterThan(10);
      expect(nutrient.summarized.whatItDoes.length).toBeGreaterThan(5);
      expect(nutrient.summarized.threeFoods.length).toBeGreaterThan(3);
      expect(nutrient.summarized.bodyNeeds.length).toBeGreaterThan(3);
      expect(nutrient.summarized.averageAmericanGets.length).toBeGreaterThan(3);
      expect(nutrient.inDepth.biochemicalFunction.length).toBeGreaterThan(20);
      expect(nutrient.inDepth.whereLocatedInFood.length).toBeGreaterThan(10);
    }

    expect(matchesAgeFilter(["Older Adult / Masters (45+)"], "Older Adult / Masters (45+)")).toBe(
      true,
    );
    expect(matchesAgeFilter(["Masters (45+)"], "Older Adult / Masters (45+)")).toBe(true);
  });
});
