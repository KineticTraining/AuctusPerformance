import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DGZhyp5_.mjs";
import { t as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles.functions-DQ1YInXE.js
var listArticles = createServerFn({ method: "GET" }).handler(
  createSsrRpc("36857d6a82c1e7e5b9e2536fed0747f3206ab853ebd40de19651ad9f63f78ef1"),
);
var getArticle = createServerFn({ method: "GET" })
  .inputValidator((input) => objectType({ slug: stringType().min(1).max(120) }).parse(input))
  .handler(createSsrRpc("83fa4ea5f9a041867d702ea96b964a7fd04098a6aaf9da96a15bb55fa2e2f79e"));
var articlesQuery = () =>
  queryOptions({
    queryKey: ["articles"],
    queryFn: () => listArticles(),
  });
var articleQuery = (slug) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getArticle({ data: { slug } }),
  });
//#endregion
export { articlesQuery as n, articleQuery as t };
