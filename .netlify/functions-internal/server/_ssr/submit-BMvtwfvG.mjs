import { i as __toESM } from "../_runtime.mjs";
import { Bt as isRedirect, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { n as analysisSchema, r as requireSupabaseAuth } from "./analysis-M8RQht2q.mjs";
import { t as formatDate } from "./format-CBApI5FQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-COeeM7GY.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DGZhyp5_.mjs";
import { i as useQueryClient, n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { i as RotateCw, l as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as supabase } from "./client-SAOWSTXM.mjs";
import { n as Label, t as Input } from "./label-B7oQAA24.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as submitQuery } from "./submit-BALVR1oF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/submit-BMvtwfvG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
/** Runs AI technique review for one of the caller's submissions and stores the result. */
var analyzeSubmission = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ submissionId: stringType().uuid() }).parse(input)).handler(createSsrRpc("516ba94b5e12f6a9809063bf1f06eb4d946fcaaa3f7fd24a334dda9e868332c7"));
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[1fr_1.3fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "AI technique review"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-display mt-3 text-5xl md:text-6xl",
				children: "Submit a rep"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: "Paste a public YouTube link. The AI watches the clip and compares it to our technique database. Other links get a notes-only review."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "mt-8 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "title",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "title",
							name: "title",
							maxLength: 120,
							placeholder: "Free throws — Tuesday"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "video_url",
							children: "Video link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "video_url",
							name: "video_url",
							maxLength: 500,
							placeholder: "https://youtube.com/watch?v=…"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Technique" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: techniqueId,
							onValueChange: setTechniqueId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								"aria-label": "Technique",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a technique" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: data.techniques.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: t.id,
								children: [
									t.sport,
									" — ",
									t.name
								]
							}, t.id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "notes",
							children: "Notes for the coach"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "notes",
							name: "notes",
							maxLength: 2e3,
							rows: 5,
							placeholder: "What do you feel? What do you want fixed?"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						variant: "hero",
						size: "xl",
						className: "w-full",
						disabled: !!busy,
						children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), " Submit for review"]
					})
				]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-display text-4xl",
					children: "Your reviews"
				}),
				data.submissions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "No submissions yet."
				}),
				data.submissions.map((s) => {
					const a = analysisSchema.safeParse(s.analysis);
					const running = busy === s.id || s.status === "analyzing";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-border bg-surface p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-normal",
									children: s.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [s.technique ? `${s.technique.sport} — ${s.technique.name} · ` : "", formatDate(s.created_at)]
								})] }), a.success && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-display text-4xl font-extralight text-brand-blue",
									children: [a.data.overall_score, "/10"]
								})]
							}),
							running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " AI is reviewing your rep…"]
							}),
							!running && s.status !== "complete" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-3 text-sm text-muted-foreground",
								children: [s.error ?? "Waiting for review.", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "glass",
									onClick: () => runAnalysis(s.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {}), " Retry"]
								})]
							}),
							a.success && !running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 space-y-4 text-sm",
								children: [
									!a.data.video_reviewed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-warning",
										children: "Video couldn't be watched — feedback is based on your notes."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: a.data.summary }),
									a.data.strengths.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow",
										children: "Strengths"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 list-disc space-y-1 pl-5 text-muted-foreground",
										children: a.data.strengths.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, i))
									})] }),
									a.data.improvements.map((imp, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border bg-background/50 p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: imp.issue
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-brand-red",
														children: "Cue:"
													}),
													" ",
													imp.cue
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-brand-blue",
														children: "Drill:"
													}),
													" ",
													imp.drill
												]
											})
										]
									}, i)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "eyebrow",
											children: "Next session"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										a.data.next_session
									] })
								]
							})
						]
					}, s.id);
				})
			]
		})]
	});
}
//#endregion
export { SubmitPage as component };
