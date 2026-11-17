import { i as __toESM } from "../_runtime.mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-COeeM7GY.mjs";
import { l as LoaderCircle, s as MailCheck } from "../_libs/lucide-react.mjs";
import { n as LEVELS, r as SPORTS } from "./sports-CAn-tFZL.mjs";
import { t as supabase } from "./client-SAOWSTXM.mjs";
import { n as Route, r as useAuth } from "./auth-CkB-b9RD.mjs";
import { n as Label, t as Input } from "./label-B7oQAA24.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-C5DAXwu8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		...opts,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
var basketball_shooting_form_jpg_asset_default = {
	version: 1,
	asset_id: "1918eb47-918f-479c-83d7-081eabb87bd1",
	project_id: "b3be083d-636f-4fbe-954c-b78318cc6a65",
	url: "/__l5e/assets-v1/1918eb47-918f-479c-83d7-081eabb87bd1/basketball-shooting-form.jpg",
	r2_key: "a/v1/b3be083d-636f-4fbe-954c-b78318cc6a65/1918eb47-918f-479c-83d7-081eabb87bd1/basketball-shooting-form.jpg",
	original_filename: "basketball-shooting-form.jpg",
	size: 527882,
	content_type: "image/jpeg",
	created_at: "2026-11-15T23:23:26Z"
};
var signUpSchema = objectType({
	displayName: stringType().trim().min(1, "Enter your name").max(80),
	sport: stringType().min(1, "Pick your sport"),
	level: stringType().min(1, "Pick your level"),
	email: stringType().trim().email("Enter a valid email").max(255),
	password: stringType().min(8, "Password must be at least 8 characters").max(72)
});
var signInSchema = objectType({
	email: stringType().trim().email("Enter a valid email").max(255),
	password: stringType().min(1, "Enter your password")
});
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		width: "18",
		height: "18",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
			})
		]
	});
}
function AuthPage() {
	const { mode = "signin" } = Route.useSearch();
	const navigate = useNavigate();
	const { session, ready } = useAuth();
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [checkEmail, setCheckEmail] = (0, import_react.useState)(null);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [sport, setSport] = (0, import_react.useState)("");
	const [level, setLevel] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (ready && session) navigate({
			to: "/dashboard",
			replace: true
		});
	}, [
		ready,
		session,
		navigate
	]);
	function setMode(m) {
		setErrors({});
		setCheckEmail(null);
		navigate({
			to: "/auth",
			search: { mode: m === "signin" ? void 0 : m },
			replace: true
		});
	}
	async function onSubmit(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const raw = Object.fromEntries(fd.entries());
		setErrors({});
		if (mode === "forgot") {
			const parsed = stringType().trim().email().safeParse(raw["email"]);
			if (!parsed.success) return setErrors({ email: "Enter a valid email" });
			setLoading(true);
			const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${window.location.origin}/reset-password` });
			setLoading(false);
			if (error) return toast.error(error.message);
			setCheckEmail(parsed.data);
			return;
		}
		if (mode === "signup") {
			const parsed = signUpSchema.safeParse({
				...raw,
				sport,
				level
			});
			if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
			setLoading(true);
			const { data, error } = await supabase.auth.signUp({
				email: parsed.data.email,
				password: parsed.data.password,
				options: {
					emailRedirectTo: window.location.origin,
					data: {
						display_name: parsed.data.displayName,
						sport: parsed.data.sport,
						level: parsed.data.level
					}
				}
			});
			setLoading(false);
			if (error) return toast.error(error.message);
			if (!data.session) setCheckEmail(parsed.data.email);
			return;
		}
		const parsed = signInSchema.safeParse(raw);
		if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword(parsed.data);
		setLoading(false);
		if (error) return toast.error(error.message === "Invalid login credentials" ? "Wrong email or password" : error.message);
		navigate({ to: "/dashboard" });
	}
	async function oauth(provider) {
		const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
		if (result.error) return toast.error("Sign-in didn't complete. Please try again.");
		if (result.redirected) return;
		navigate({ to: "/dashboard" });
	}
	const title = mode === "signup" ? "Join the lab" : mode === "forgot" ? "Reset password" : "Welcome back";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-h-[calc(100vh-4rem)] lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative hidden overflow-hidden lg:block",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: basketball_shooting_form_jpg_asset_default.url,
					alt: "Basketball player practicing his shooting form on an indoor court",
					width: 1400,
					height: 2100,
					className: "absolute inset-0 h-full w-full object-cover object-top"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-fade-up" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute bottom-12 left-12 right-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Members train with intent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-display mt-3 text-6xl",
						children: [
							"Every rep counts.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Make it count right."
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center px-5 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-display text-5xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted-foreground",
						children: mode === "signup" ? "Create your athlete profile to unlock the library and AI video review." : mode === "forgot" ? "We'll email you a link to set a new password." : "Sign in to your training dashboard."
					}),
					checkEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 rounded-2xl border border-border bg-surface p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailCheck, { className: "size-8 stroke-1 text-brand-blue" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 font-medium",
								children: "Check your inbox"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"We sent a link to ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground",
										children: checkEmail
									}),
									".",
									" ",
									mode === "forgot" ? "Open it to choose a new password." : "Confirm your email to activate your membership."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "link",
								className: "mt-2 px-0",
								onClick: () => setMode("signin"),
								children: "Back to sign in"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 grid gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									size: "xl",
									onClick: () => oauth("google"),
									className: "border-[#8E918F] bg-[#131314] text-[#E3E3E3] hover:bg-[#131314]/90 hover:text-[#E3E3E3]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), " Continue with Google"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "lovable-auth-button",
									onClick: () => oauth("lovable"),
									children: "Continue with Lovable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "my-3 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
										" or with email ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit,
							className: mode === "forgot" ? "mt-8 space-y-5" : "space-y-5",
							noValidate: true,
							children: [
								mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Full name",
									error: errors["displayName"],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										name: "displayName",
										autoComplete: "name",
										placeholder: "Jordan Ellis",
										maxLength: 80
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Primary sport",
										error: errors["sport"],
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: sport,
											onValueChange: setSport,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"aria-label": "Primary sport",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SPORTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: s,
												children: s
											}, s)) })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Level",
										error: errors["level"],
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: level,
											onValueChange: setLevel,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"aria-label": "Level",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LEVELS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: s,
												children: s
											}, s)) })]
										})
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email",
									error: errors["email"],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										name: "email",
										type: "email",
										autoComplete: "email",
										placeholder: "you@example.com",
										maxLength: 255
									})
								}),
								mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Password",
									error: errors["password"],
									action: mode === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMode("forgot"),
										className: "text-xs text-foreground underline-offset-4 hover:underline",
										children: "Forgot password?"
									}) : void 0,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										name: "password",
										type: "password",
										autoComplete: mode === "signup" ? "new-password" : "current-password",
										placeholder: mode === "signup" ? "At least 8 characters" : "••••••••"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									variant: "hero",
									size: "xl",
									className: "w-full",
									disabled: loading,
									children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-center text-sm text-muted-foreground",
							children: mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Already a member? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-foreground underline underline-offset-4 hover:text-brand-blue",
								onClick: () => setMode("signin"),
								children: "Sign in"
							})] }) : mode === "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-foreground underline underline-offset-4 hover:text-brand-blue",
								onClick: () => setMode("signin"),
								children: "Back to sign in"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["New to Kinetic? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-foreground underline underline-offset-4 hover:text-brand-blue",
								onClick: () => setMode("signup"),
								children: "Create an account"
							})] })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "hover:text-foreground",
							children: "← Back to home"
						})
					})
				]
			})
		})]
	});
}
function Field({ label, error, action, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "font-mono text-[0.68rem] font-normal uppercase tracking-[0.16em] text-muted-foreground",
					children: label
				}), action]
			}),
			children,
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { AuthPage as component };
