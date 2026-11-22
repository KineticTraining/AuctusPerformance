import { i as __toESM } from "../_runtime.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as Button } from "./button-Dup41fMn.mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Play, t as X, y as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as SportFilter } from "./sport-filter-1WYqehzQ.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as dashboardQuery } from "./dashboard-BoYvSkz_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BP2n7T4s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName$1 = "/app/applet/src/components/ui/dialog.tsx";
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$1,
	lineNumber: 21,
	columnNumber: 3
}, void 0));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogOverlay, {}, void 0, false, {
	fileName: _jsxFileName$1,
	lineNumber: 37,
	columnNumber: 5
}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
			fileName: _jsxFileName$1,
			lineNumber: 48,
			columnNumber: 9
		}, void 0), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "sr-only",
			children: "Close"
		}, void 0, false, {
			fileName: _jsxFileName$1,
			lineNumber: 49,
			columnNumber: 9
		}, void 0)]
	}, void 0, true, {
		fileName: _jsxFileName$1,
		lineNumber: 47,
		columnNumber: 7
	}, void 0)]
}, void 0, true, {
	fileName: _jsxFileName$1,
	lineNumber: 38,
	columnNumber: 5
}, void 0)] }, void 0, true, {
	fileName: _jsxFileName$1,
	lineNumber: 36,
	columnNumber: 3
}, void 0));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$1,
	lineNumber: 57,
	columnNumber: 3
}, void 0);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$1,
	lineNumber: 62,
	columnNumber: 3
}, void 0);
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$1,
	lineNumber: 73,
	columnNumber: 3
}, void 0));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$1,
	lineNumber: 85,
	columnNumber: 3
}, void 0));
DialogDescription.displayName = DialogDescription$1.displayName;
var _jsxFileName = "/app/applet/src/routes/_authenticated/dashboard.tsx?tsr-split=component";
var SECTIONS = [
	"Strength & Power",
	"Speed & Agility",
	"Mobility & Recovery",
	"Sport Skills",
	"Mindset"
];
function Dashboard() {
	const { data } = useSuspenseQuery(dashboardQuery());
	const [section, setSection] = (0, import_react.useState)(SECTIONS[0]);
	const [playing, setPlaying] = (0, import_react.useState)(null);
	const [sportFilters, setSportFilters] = (0, import_react.useState)([]);
	const videos = data.videos.filter((v) => v.section === section && (sportFilters.length === 0 || v.sports.some((s) => sportFilters.includes(s))));
	const name = data.profile?.display_name?.split(" ")[0] || "Athlete";
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "eyebrow",
					children: [data.profile?.sport, data.profile?.level].filter(Boolean).join(" · ") || "Member"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 26,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
					className: "text-display mt-3 text-5xl md:text-7xl",
					children: [
						"Let's work, ",
						name,
						"."
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 27,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 25,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					asChild: true,
					variant: "hero",
					size: "xl",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
						to: "/submit",
						children: ["Submit a video ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowRight, {}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 30,
							columnNumber: 45
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 30,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 29,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 24,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-10 grid gap-4 sm:grid-cols-3",
				children: [
					["Videos in library", data.videos.length],
					["Your submissions", data.submissions.length],
					["AI reviews ready", data.submissions.filter((s) => s.status === "complete").length]
				].map(([label, n]) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "rounded-2xl border border-border bg-surface p-6",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-display text-5xl font-extralight",
						children: n
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 36,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: label
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 37,
						columnNumber: 13
					}, this)]
				}, label, true, {
					fileName: _jsxFileName,
					lineNumber: 35,
					columnNumber: 205
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 34,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
				className: "text-display mt-16 text-4xl",
				children: "Video library"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 41,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: SECTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					onClick: () => setSection(s),
					className: cn("rounded-full border px-4 py-1.5 text-sm font-normal transition-colors", section === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
					children: s
				}, s, false, {
					fileName: _jsxFileName,
					lineNumber: 43,
					columnNumber: 28
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 42,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SportFilter, {
					selected: sportFilters,
					onChange: setSportFilters
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 48,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 47,
				columnNumber: 7
			}, this),
			videos.length === 0 && /* @__PURE__ */ (void 0)("p", {
				className: "mt-10 text-sm text-muted-foreground",
				children: "No videos match these filters in this section yet."
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 50,
				columnNumber: 31
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: videos.map((v) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					onClick: () => setPlaying(v),
					className: "group overflow-hidden rounded-2xl border border-border bg-surface text-left transition-colors hover:border-foreground/30",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "relative aspect-video overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
								src: `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`,
								alt: "",
								loading: "lazy",
								className: "h-full w-full object-cover transition-transform group-hover:scale-105"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 54,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "absolute inset-0 grid place-items-center bg-background/30",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "grid size-14 place-items-center rounded-full bg-foreground text-background",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "size-6" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 56,
										columnNumber: 110
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 56,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 55,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 font-mono text-[0.68rem]",
								children: v.duration_label
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 58,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 53,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-blue",
								children: [
									v.sport,
									" · ",
									v.level
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 61,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
								className: "mt-2 text-base font-normal",
								children: v.title
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 62,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
								children: v.description
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 63,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-3 text-xs text-muted-foreground",
								children: v.coach
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 64,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 60,
						columnNumber: 13
					}, this)]
				}, v.id, true, {
					fileName: _jsxFileName,
					lineNumber: 52,
					columnNumber: 26
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 51,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
				open: !!playing,
				onOpenChange: (o) => !o && setPlaying(null),
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
					className: "max-w-4xl p-0",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
						className: "sr-only",
						children: playing?.title
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 71,
						columnNumber: 11
					}, this), playing && /* @__PURE__ */ (void 0)("iframe", {
						className: "aspect-video w-full rounded-lg",
						src: `https://www.youtube-nocookie.com/embed/${playing.youtube_id}?autoplay=1`,
						title: playing.title,
						allow: "autoplay; encrypted-media; picture-in-picture",
						allowFullScreen: true
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 72,
						columnNumber: 23
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 70,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 69,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 23,
		columnNumber: 10
	}, this);
}
//#endregion
export { Dashboard as component };
