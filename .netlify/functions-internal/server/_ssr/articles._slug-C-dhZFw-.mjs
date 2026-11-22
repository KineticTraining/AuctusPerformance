import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatDate } from "./format-CBApI5FQ.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as Button } from "./button-Dup41fMn.mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { t as articleQuery } from "./articles.functions-DQ1YInXE.mjs";
import { t as Route } from "./articles._slug-PPgLTvmb.mjs";
import { b as ArrowLeft, u as Clock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles._slug-C-dhZFw-.js
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/routes/articles.$slug.tsx?tsr-split=component";
function ArticlePage() {
	const { slug } = Route.useParams();
	const { data: a } = useSuspenseQuery(articleQuery(slug));
	if (!a) return null;
	const blocks = a.body.split(/\n\s*\n/);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
		className: "mx-auto max-w-3xl px-5 py-16 md:py-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
				to: "/articles",
				className: "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowLeft, { className: "size-4" }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 19,
					columnNumber: 9
				}, this), " All articles"]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 18,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "eyebrow mt-10",
				children: a.category
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 21,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
				className: "text-display mt-4 text-5xl md:text-7xl",
				children: a.title
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 22,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-6 text-xl text-muted-foreground",
				children: a.excerpt
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 23,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "font-medium text-foreground",
							children: a.author
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 26,
							columnNumber: 11
						}, this),
						" · ",
						a.author_role
					] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 25,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: formatDate(a.published_at) }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 28,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { className: "size-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 30,
								columnNumber: 11
							}, this),
							" ",
							a.read_minutes,
							" min read"
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 29,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 24,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-10 space-y-6 text-lg leading-relaxed text-foreground/85",
				children: blocks.map((b, i) => {
					if (b.startsWith("## ")) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "text-display pt-6 text-2xl text-foreground",
						children: b.slice(3)
					}, i, false, {
						fileName: _jsxFileName,
						lineNumber: 35,
						columnNumber: 41
					}, this);
					const lines = b.split("\n");
					if (lines.every((l) => l.startsWith("- "))) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
						className: "space-y-3",
						children: lines.map((l, j) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-red" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 40,
								columnNumber: 21
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: l.slice(2) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 41,
								columnNumber: 21
							}, this)]
						}, j, true, {
							fileName: _jsxFileName,
							lineNumber: 39,
							columnNumber: 38
						}, this))
					}, i, false, {
						fileName: _jsxFileName,
						lineNumber: 38,
						columnNumber: 18
					}, this);
					return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: b }, i, false, {
						fileName: _jsxFileName,
						lineNumber: 45,
						columnNumber: 16
					}, this);
				})
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 33,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-16 rounded-2xl border border-border bg-surface p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-display text-2xl",
						children: "Put it into practice"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 49,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-2 text-muted-foreground",
						children: "Members get follow-along sessions and AI feedback on their technique."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 50,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						asChild: true,
						variant: "hero",
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/dashboard",
							children: "Go to your training"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 52,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 51,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 48,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 17,
		columnNumber: 10
	}, this);
}
//#endregion
export { ArticlePage as component };
