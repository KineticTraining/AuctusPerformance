//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-oInyAezv.js
var manifest = {
  "36857d6a82c1e7e5b9e2536fed0747f3206ab853ebd40de19651ad9f63f78ef1": {
    functionName: "listArticles_createServerFn_handler",
    importer: () => import("./_ssr/articles.functions-Cg1xI-gZ.mjs"),
  },
  "516ba94b5e12f6a9809063bf1f06eb4d946fcaaa3f7fd24a334dda9e868332c7": {
    functionName: "analyzeSubmission_createServerFn_handler",
    importer: () => import("./_ssr/analysis.functions-CoyOSEhD.mjs"),
  },
  "83fa4ea5f9a041867d702ea96b964a7fd04098a6aaf9da96a15bb55fa2e2f79e": {
    functionName: "getArticle_createServerFn_handler",
    importer: () => import("./_ssr/articles.functions-Cg1xI-gZ.mjs"),
  },
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) throw new Error("Server function info not found for " + id);
  const fnModule = (serverFnInfo.module ??= await serverFnInfo.importer());
  if (!fnModule) throw new Error("Server function module not resolved for " + id);
  const action = fnModule[serverFnInfo.functionName];
  if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
  return action;
}
//#endregion
export { getServerFnById as t };
