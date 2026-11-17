import { i as __toESM } from "../_runtime.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatDate } from "./format-CBApI5FQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as articlesQuery } from "./articles.functions-DQ1YInXE.mjs";
import { u as Clock, v as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { t as SportFilter } from "./sport-filter-hj8GUdgh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles.index-DufjuaWt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArticlesPage() {
	const { data: articles } = useSuspenseQuery(articlesQuery());
	const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];
	const [cat, setCat] = (0, import_react.useState)("All");
	const [sportFilters, setSportFilters] = (0, import_react.useState)([]);
	const featured = articles.find((a) => a.featured) ?? articles[0];
	const isFiltered = cat !== "All" || sportFilters.length > 0;
	const matches = (a) => (cat === "All" || a.category === cat) && (sportFilters.length === 0 || a.sports.some((s) => sportFilters.includes(s)));
	const gridArticles = articles.filter((a) => matches(a) && (isFiltered || a.slug !== featured?.slug));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "The Lab Journal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-display mt-4 text-6xl md:text-8xl",
				children: "Sports science"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-lg text-muted-foreground",
				children: "The research behind better training — translated into what to actually do on Monday."
			}),
			featured && !isFiltered && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/articles/$slug",
				params: { slug: featured.slug },
				className: "group mt-14 grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[1.3fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-8 md:p-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex rounded-full border border-brand-red/60 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-red",
							children: ["Featured · ", featured.category]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-display mt-6 text-4xl md:text-6xl",
							children: featured.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: featured.excerpt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Byline, { a: featured })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative hidden items-end justify-end bg-grid p-8 md:flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-16 stroke-1 text-brand-blue transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14 flex flex-wrap gap-2",
				children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setCat(c),
					className: cn("rounded-full border px-4 py-1.5 text-sm font-normal transition-colors", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
					children: c
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SportFilter, {
					selected: sportFilters,
					onChange: setSportFilters
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3",
				children: [gridArticles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground md:col-span-2 lg:col-span-3",
					children: "No articles match these filters yet."
				}), gridArticles.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/articles/$slug",
					params: { slug: a.slug },
					className: "group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-foreground/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: a.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-display mt-4 text-2xl",
							children: a.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground",
							children: a.excerpt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Byline, { a })
					]
				}, a.slug))]
			})
		]
	});
}
function Byline({ a }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 flex items-center gap-4 text-xs text-muted-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: a.author
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(a.published_at) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
					" ",
					a.read_minutes,
					" min"
				]
			})
		]
	});
}
//#endregion
export { ArticlesPage as component };
