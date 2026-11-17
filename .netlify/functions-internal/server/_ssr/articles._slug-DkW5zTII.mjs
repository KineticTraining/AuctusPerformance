import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatDate } from "./format-CBApI5FQ.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-COeeM7GY.mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { t as articleQuery } from "./articles.functions-DQ1YInXE.mjs";
import { t as Route } from "./articles._slug-CNP5NQIW.mjs";
import { b as ArrowLeft, u as Clock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles._slug-DkW5zTII.js
var import_jsx_runtime = require_jsx_runtime();
function ArticlePage() {
	const { slug } = Route.useParams();
	const { data: a } = useSuspenseQuery(articleQuery(slug));
	if (!a) return null;
	const blocks = a.body.split(/\n\s*\n/);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto max-w-3xl px-5 py-16 md:py-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/articles",
				className: "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " All articles"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow mt-10",
				children: a.category
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-display mt-4 text-5xl md:text-7xl",
				children: a.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xl text-muted-foreground",
				children: a.excerpt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: a.author
						}),
						" · ",
						a.author_role
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(a.published_at) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }),
							" ",
							a.read_minutes,
							" min read"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 space-y-6 text-lg leading-relaxed text-foreground/85",
				children: blocks.map((b, i) => {
					if (b.startsWith("## ")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-display pt-6 text-2xl text-foreground",
						children: b.slice(3)
					}, i);
					const lines = b.split("\n");
					if (lines.every((l) => l.startsWith("- "))) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: lines.map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-red" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l.slice(2) })]
						}, j))
					}, i);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: b }, i);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 rounded-2xl border border-border bg-surface p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-display text-2xl",
						children: "Put it into practice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: "Members get follow-along sessions and AI feedback on their technique."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "hero",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							children: "Go to your training"
						})
					})
				]
			})
		]
	});
}
//#endregion
export { ArticlePage as component };
