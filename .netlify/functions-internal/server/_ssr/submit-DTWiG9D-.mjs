import { i as __toESM } from "../_runtime.mjs";
import { Bt as isRedirect, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { n as analysisSchema, r as requireSupabaseAuth } from "./analysis-M8RQht2q.mjs";
import { t as formatDate } from "./format-CBApI5FQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as Button } from "./button-Dup41fMn.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DGZhyp5_.mjs";
import { i as useQueryClient, n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { i as RotateCw, l as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as supabase } from "./client-PQVVhYgw.mjs";
import { n as Label, t as Input } from "./label-DtY__edU.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-2jkrRSx7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as submitQuery } from "./submit-C7Hli_5m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/submit-DTWiG9D-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var _jsxFileName$1 = "/app/applet/src/components/ui/textarea.tsx";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	}, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 8,
		columnNumber: 7
	}, void 0);
});
Textarea.displayName = "Textarea";
/** Runs AI technique review for one of the caller's submissions and stores the result. */
var analyzeSubmission = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ submissionId: stringType().uuid() }).parse(input)).handler(createSsrRpc("516ba94b5e12f6a9809063bf1f06eb4d946fcaaa3f7fd24a334dda9e868332c7"));
var _jsxFileName = "/app/applet/src/routes/_authenticated/submit.tsx?tsr-split=component";
var formSchema = objectType({
	title: stringType().trim().min(1, "Give it a title").max(120),
	video_url: stringType().trim().url("Enter a valid link").max(500),
	notes: stringType().trim().max(2e3)
});
function SubmitPage() {
	const { data } = useSuspenseQuery(submitQuery());
	const queryClient = useQueryClient();
	const analyze = useServerFn(analyzeSubmission);
	const [techniqueId, setTechniqueId] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	async function runAnalysis(id) {
		setBusy(id);
		try {
			if ((await analyze({ data: { submissionId: id } })).status === "complete") toast.success("Your AI review is ready");
			else toast.error("The review didn't finish. You can retry.");
		} catch {
			toast.error("The review didn't finish. You can retry.");
		}
		setBusy(null);
		queryClient.invalidateQueries({ queryKey: ["submissions"] });
		queryClient.invalidateQueries({ queryKey: ["dashboard"] });
	}
	async function onSubmit(e) {
		e.preventDefault();
		const form = e.currentTarget;
		const parsed = formSchema.safeParse(Object.fromEntries(new FormData(form).entries()));
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Check the form");
			return;
		}
		const { data: row, error } = await supabase.from("submissions").insert({
			...parsed.data,
			technique_id: techniqueId || null
		}).select("id").single();
		if (error || !row) {
			toast.error("Couldn't save your submission");
			return;
		}
		form.reset();
		setTechniqueId("");
		await queryClient.invalidateQueries({ queryKey: ["submissions"] });
		await runAnalysis(row.id);
	}
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_1.3fr]",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "eyebrow",
				children: "AI technique review"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 78,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
				className: "text-display mt-3 text-5xl md:text-6xl",
				children: "Submit a rep"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 79,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-3 text-muted-foreground",
				children: "Paste a public YouTube link. The AI watches the clip and compares it to our technique database. Other links get a notes-only review."
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 80,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
				onSubmit,
				className: "mt-8 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							htmlFor: "title",
							children: "Title"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 84,
							columnNumber: 38
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							id: "title",
							name: "title",
							maxLength: 120,
							placeholder: "Free throws — Tuesday"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 84,
							columnNumber: 74
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 84,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							htmlFor: "video_url",
							children: "Video link"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 85,
							columnNumber: 38
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							id: "video_url",
							name: "video_url",
							maxLength: 500,
							placeholder: "https://youtube.com/watch?v=…"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 85,
							columnNumber: 83
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 85,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Technique" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 87,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Select, {
							value: techniqueId,
							onValueChange: setTechniqueId,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SelectTrigger, {
								"aria-label": "Technique",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SelectValue, { placeholder: "Choose a technique" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 89,
									columnNumber: 53
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 89,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SelectContent, { children: data.techniques.map((t) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SelectItem, {
								value: t.id,
								children: [
									t.sport,
									" — ",
									t.name
								]
							}, t.id, true, {
								fileName: _jsxFileName,
								lineNumber: 91,
								columnNumber: 43
							}, this)) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 90,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 88,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 86,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							htmlFor: "notes",
							children: "Notes for the coach"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 95,
							columnNumber: 38
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Textarea, {
							id: "notes",
							name: "notes",
							maxLength: 2e3,
							rows: 5,
							placeholder: "What do you feel? What do you want fixed?"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 95,
							columnNumber: 88
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 95,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						type: "submit",
						variant: "hero",
						size: "xl",
						className: "w-full",
						disabled: !!busy,
						children: [busy && /* @__PURE__ */ (void 0)(LoaderCircle, { className: "animate-spin" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 97,
							columnNumber: 22
						}, this), " Submit for review"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 96,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 83,
				columnNumber: 9
			}, this)
		] }, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 77,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
					className: "text-display text-4xl",
					children: "Your reviews"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 103,
					columnNumber: 9
				}, this),
				data.submissions.length === 0 && /* @__PURE__ */ (void 0)("p", {
					className: "text-muted-foreground",
					children: "No submissions yet."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 104,
					columnNumber: 43
				}, this),
				data.submissions.map((s) => {
					const a = analysisSchema.safeParse(s.analysis);
					const running = busy === s.id || s.status === "analyzing";
					return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
						className: "rounded-2xl border border-border bg-surface p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
									className: "text-lg font-normal",
									children: s.title
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 111,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "text-xs text-muted-foreground",
									children: [s.technique ? `${s.technique.sport} — ${s.technique.name} · ` : "", formatDate(s.created_at)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 112,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 110,
									columnNumber: 17
								}, this), a.success && /* @__PURE__ */ (void 0)("span", {
									className: "text-display text-4xl font-extralight text-brand-blue",
									children: [a.data.overall_score, "/10"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 116,
									columnNumber: 31
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 109,
								columnNumber: 15
							}, this),
							running && /* @__PURE__ */ (void 0)("p", {
								className: "mt-4 flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (void 0)(LoaderCircle, { className: "size-4 animate-spin" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 118,
									columnNumber: 101
								}, this), " AI is reviewing your rep…"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 118,
								columnNumber: 27
							}, this),
							!running && s.status !== "complete" && /* @__PURE__ */ (void 0)("div", {
								className: "mt-4 flex items-center gap-3 text-sm text-muted-foreground",
								children: [s.error ?? "Waiting for review.", /* @__PURE__ */ (void 0)(Button, {
									size: "sm",
									variant: "glass",
									onClick: () => runAnalysis(s.id),
									children: [/* @__PURE__ */ (void 0)(RotateCw, {}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 121,
										columnNumber: 87
									}, this), " Retry"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 121,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 119,
								columnNumber: 55
							}, this),
							a.success && !running && /* @__PURE__ */ (void 0)("div", {
								className: "mt-4 space-y-4 text-sm",
								children: [
									!a.data.video_reviewed && /* @__PURE__ */ (void 0)("p", {
										className: "text-xs text-warning",
										children: "Video couldn't be watched — feedback is based on your notes."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 124,
										columnNumber: 46
									}, this),
									/* @__PURE__ */ (void 0)("p", { children: a.data.summary }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 125,
										columnNumber: 19
									}, this),
									a.data.strengths.length > 0 && /* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("p", {
										className: "eyebrow",
										children: "Strengths"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 126,
										columnNumber: 56
									}, this), /* @__PURE__ */ (void 0)("ul", {
										className: "mt-2 list-disc space-y-1 pl-5 text-muted-foreground",
										children: a.data.strengths.map((x, i) => /* @__PURE__ */ (void 0)("li", { children: x }, i, false, {
											fileName: _jsxFileName,
											lineNumber: 126,
											columnNumber: 192
										}, this))
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 126,
										columnNumber: 92
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 126,
										columnNumber: 51
									}, this),
									a.data.improvements.map((imp, i) => /* @__PURE__ */ (void 0)("div", {
										className: "rounded-xl border border-border bg-background/50 p-4",
										children: [
											/* @__PURE__ */ (void 0)("p", {
												className: "font-medium",
												children: imp.issue
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 128,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (void 0)("p", {
												className: "mt-1 text-muted-foreground",
												children: [
													/* @__PURE__ */ (void 0)("span", {
														className: "text-brand-red",
														children: "Cue:"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 129,
														columnNumber: 65
													}, this),
													" ",
													imp.cue
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 129,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ (void 0)("p", {
												className: "mt-1 text-muted-foreground",
												children: [
													/* @__PURE__ */ (void 0)("span", {
														className: "text-brand-blue",
														children: "Drill:"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 130,
														columnNumber: 65
													}, this),
													" ",
													imp.drill
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 130,
												columnNumber: 23
											}, this)
										]
									}, i, true, {
										fileName: _jsxFileName,
										lineNumber: 127,
										columnNumber: 56
									}, this)),
									/* @__PURE__ */ (void 0)("p", { children: [
										/* @__PURE__ */ (void 0)("span", {
											className: "eyebrow",
											children: "Next session"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 132,
											columnNumber: 22
										}, this),
										/* @__PURE__ */ (void 0)("br", {}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 132,
											columnNumber: 67
										}, this),
										a.data.next_session
									] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 132,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 123,
								columnNumber: 41
							}, this)
						]
					}, s.id, true, {
						fileName: _jsxFileName,
						lineNumber: 108,
						columnNumber: 16
					}, this);
				})
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 102,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 76,
		columnNumber: 10
	}, this);
}
//#endregion
export { SubmitPage as component };
