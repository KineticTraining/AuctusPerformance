import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { t as createServerRpc } from "./createServerRpc-CxD4EZ5P.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles.functions-Cg1xI-gZ.js
var listArticles_createServerFn_handler = createServerRpc(
  {
    id: "36857d6a82c1e7e5b9e2536fed0747f3206ab853ebd40de19651ad9f63f78ef1",
    name: "listArticles",
    filename: "src/lib/articles.functions.ts",
  },
  (opts) => listArticles.__executeServer(opts),
);
var listArticles = createServerFn({ method: "GET" }).handler(
  listArticles_createServerFn_handler,
  async () => {
    const { createPublicSupabase } = await import("./public-supabase.server-Cc2kW9YE.mjs");
    const { data, error } = await createPublicSupabase()
      .from("articles")
      .select(
        "slug, title, excerpt, category, author, author_role, read_minutes, featured, published_at, sports",
      )
      .order("published_at", { ascending: false });
    if (error) throw new Error("Could not load articles");
    return data ?? [];
  },
);
var getArticle_createServerFn_handler = createServerRpc(
  {
    id: "83fa4ea5f9a041867d702ea96b964a7fd04098a6aaf9da96a15bb55fa2e2f79e",
    name: "getArticle",
    filename: "src/lib/articles.functions.ts",
  },
  (opts) => getArticle.__executeServer(opts),
);
var getArticle = createServerFn({ method: "GET" })
  .inputValidator((input) => objectType({ slug: stringType().min(1).max(120) }).parse(input))
  .handler(getArticle_createServerFn_handler, async ({ data }) => {
    const { createPublicSupabase } = await import("./public-supabase.server-Cc2kW9YE.mjs");
    const { data: row, error } = await createPublicSupabase()
      .from("articles")
      .select(
        "slug, title, excerpt, body, category, author, author_role, read_minutes, featured, published_at, sports",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error("Could not load article");
    return row;
  });
//#endregion
export { getArticle_createServerFn_handler, listArticles_createServerFn_handler };
