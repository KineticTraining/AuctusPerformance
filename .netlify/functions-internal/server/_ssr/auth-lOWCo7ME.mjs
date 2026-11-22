import { i as __toESM } from "../_runtime.mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as Button } from "./button-Dup41fMn.mjs";
import { l as LoaderCircle, s as MailCheck } from "../_libs/lucide-react.mjs";
import { n as LEVELS, r as SPORTS } from "./sports-CAn-tFZL.mjs";
import { t as supabase } from "./client-PQVVhYgw.mjs";
import { n as Route, r as useAuth } from "./auth-BHwl4JgK.mjs";
import { n as Label, t as Input } from "./label-DtY__edU.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-2jkrRSx7.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-lOWCo7ME.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
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
var _jsxFileName = "/app/applet/src/routes/auth.tsx?tsr-split=component";
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
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		viewBox: "0 0 24 24",
		width: "18",
		height: "18",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#4285F4",
				d: "M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 31,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#34A853",
				d: "M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 32,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#FBBC05",
				d: "M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 33,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("path", {
				fill: "#EA4335",
				d: "M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 34,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 30,
		columnNumber: 10
	}, this);
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
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "grid min-h-[calc(100vh-4rem)] lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "relative hidden overflow-hidden lg:block",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", {
					src: basketball_shooting_form_jpg_asset_default.url,
					alt: "Basketball player practicing his shooting form on an indoor court",
					width: 1400,
					height: 2100,
					className: "absolute inset-0 h-full w-full object-cover object-top"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 147,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "absolute inset-0 bg-fade-up" }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 148,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "absolute bottom-12 left-12 right-12",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "eyebrow",
						children: "Members train with intent"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 150,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-display mt-3 text-6xl",
						children: [
							"Every rep counts.",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 151,
								columnNumber: 70
							}, this),
							"Make it count right."
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 151,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 149,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 146,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center justify-center px-5 py-16",
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", {
						className: "text-display text-5xl",
						children: title
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 157,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-2 text-muted-foreground",
						children: mode === "signup" ? "Create your athlete profile to unlock the library and AI video review." : mode === "forgot" ? "We'll email you a link to set a new password." : "Sign in to your training dashboard."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 158,
						columnNumber: 11
					}, this),
					checkEmail ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-10 rounded-2xl border border-border bg-surface p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MailCheck, { className: "size-8 stroke-1 text-brand-blue" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 163,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-4 font-medium",
								children: "Check your inbox"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 164,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"We sent a link to ",
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-foreground",
										children: checkEmail
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 166,
										columnNumber: 35
									}, this),
									".",
									" ",
									mode === "forgot" ? "Open it to choose a new password." : "Confirm your email to activate your membership."
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 165,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								variant: "link",
								className: "mt-2 px-0",
								onClick: () => setMode("signin"),
								children: "Back to sign in"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 169,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 162,
						columnNumber: 25
					}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
						mode !== "forgot" && /* @__PURE__ */ (void 0)("div", {
							className: "mt-8 grid gap-3",
							children: [
								/* @__PURE__ */ (void 0)(Button, {
									type: "button",
									variant: "outline",
									size: "xl",
									onClick: () => oauth("google"),
									className: "border-[#8E918F] bg-[#131314] text-[#E3E3E3] hover:bg-[#131314]/90 hover:text-[#E3E3E3]",
									children: [/* @__PURE__ */ (void 0)(GoogleIcon, {}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 175,
										columnNumber: 21
									}, this), " Continue with Google"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 174,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (void 0)("button", {
									type: "button",
									className: "lovable-auth-button",
									onClick: () => oauth("lovable"),
									children: "Continue with Lovable"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 177,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (void 0)("div", {
									className: "my-3 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground",
									children: [
										/* @__PURE__ */ (void 0)("span", { className: "h-px flex-1 bg-border" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 181,
											columnNumber: 21
										}, this),
										" or with email ",
										/* @__PURE__ */ (void 0)("span", { className: "h-px flex-1 bg-border" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 181,
											columnNumber: 78
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 180,
									columnNumber: 19
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 173,
							columnNumber: 37
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
							onSubmit,
							className: mode === "forgot" ? "mt-8 space-y-5" : "space-y-5",
							noValidate: true,
							children: [
								mode === "signup" && /* @__PURE__ */ (void 0)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (void 0)(Field, {
									label: "Full name",
									error: errors["displayName"],
									children: /* @__PURE__ */ (void 0)(Input, {
										name: "displayName",
										autoComplete: "name",
										placeholder: "Jordan Ellis",
										maxLength: 80
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 188,
										columnNumber: 23
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 187,
									columnNumber: 21
								}, this), /* @__PURE__ */ (void 0)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (void 0)(Field, {
										label: "Primary sport",
										error: errors["sport"],
										children: /* @__PURE__ */ (void 0)(Select, {
											value: sport,
											onValueChange: setSport,
											children: [/* @__PURE__ */ (void 0)(SelectTrigger, {
												"aria-label": "Primary sport",
												children: /* @__PURE__ */ (void 0)(SelectValue, { placeholder: "Select" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 193,
													columnNumber: 69
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 193,
												columnNumber: 27
											}, this), /* @__PURE__ */ (void 0)(SelectContent, { children: SPORTS.map((s) => /* @__PURE__ */ (void 0)(SelectItem, {
												value: s,
												children: s
											}, s, false, {
												fileName: _jsxFileName,
												lineNumber: 195,
												columnNumber: 46
											}, this)) }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 194,
												columnNumber: 27
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 192,
											columnNumber: 25
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 191,
										columnNumber: 23
									}, this), /* @__PURE__ */ (void 0)(Field, {
										label: "Level",
										error: errors["level"],
										children: /* @__PURE__ */ (void 0)(Select, {
											value: level,
											onValueChange: setLevel,
											children: [/* @__PURE__ */ (void 0)(SelectTrigger, {
												"aria-label": "Level",
												children: /* @__PURE__ */ (void 0)(SelectValue, { placeholder: "Select" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 201,
													columnNumber: 61
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 201,
												columnNumber: 27
											}, this), /* @__PURE__ */ (void 0)(SelectContent, { children: LEVELS.map((s) => /* @__PURE__ */ (void 0)(SelectItem, {
												value: s,
												children: s
											}, s, false, {
												fileName: _jsxFileName,
												lineNumber: 203,
												columnNumber: 46
											}, this)) }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 202,
												columnNumber: 27
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 200,
											columnNumber: 25
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 199,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 190,
									columnNumber: 21
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 186,
									columnNumber: 39
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Field, {
									label: "Email",
									error: errors["email"],
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
										name: "email",
										type: "email",
										autoComplete: "email",
										placeholder: "you@example.com",
										maxLength: 255
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 210,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 209,
									columnNumber: 17
								}, this),
								mode !== "forgot" && /* @__PURE__ */ (void 0)(Field, {
									label: "Password",
									error: errors["password"],
									action: mode === "signin" ? /* @__PURE__ */ (void 0)("button", {
										type: "button",
										onClick: () => setMode("forgot"),
										className: "text-xs text-foreground underline-offset-4 hover:underline",
										children: "Forgot password?"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 212,
										columnNumber: 118
									}, this) : void 0,
									children: /* @__PURE__ */ (void 0)(Input, {
										name: "password",
										type: "password",
										autoComplete: mode === "signup" ? "new-password" : "current-password",
										placeholder: mode === "signup" ? "At least 8 characters" : "••••••••"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 215,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 212,
									columnNumber: 39
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "submit",
									variant: "hero",
									size: "xl",
									className: "w-full",
									disabled: loading,
									children: [loading && /* @__PURE__ */ (void 0)(LoaderCircle, { className: "animate-spin" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 218,
										columnNumber: 31
									}, this), mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 217,
									columnNumber: 17
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 185,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "mt-8 text-center text-sm text-muted-foreground",
							children: mode === "signup" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: ["Already a member? ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								className: "text-foreground underline underline-offset-4 hover:text-brand-blue",
								onClick: () => setMode("signin"),
								children: "Sign in"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 224,
								columnNumber: 58
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 224,
								columnNumber: 38
							}, this) : mode === "forgot" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								className: "text-foreground underline underline-offset-4 hover:text-brand-blue",
								onClick: () => setMode("signin"),
								children: "Back to sign in"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 224,
								columnNumber: 221
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: ["New to Kinetic? ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								className: "text-foreground underline underline-offset-4 hover:text-brand-blue",
								onClick: () => setMode("signup"),
								children: "Create an account"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 224,
								columnNumber: 387
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 224,
								columnNumber: 369
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 223,
							columnNumber: 15
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 172,
						columnNumber: 22
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-6 text-center text-xs text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, {
							to: "/",
							className: "hover:text-foreground",
							children: "← Back to home"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 228,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 227,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 156,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 155,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 145,
		columnNumber: 10
	}, this);
}
function Field({ label, error, action, children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
					className: "font-mono text-[0.68rem] font-normal uppercase tracking-[0.16em] text-muted-foreground",
					children: label
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 247,
					columnNumber: 9
				}, this), action]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 246,
				columnNumber: 7
			}, this),
			children,
			error && /* @__PURE__ */ (void 0)("p", {
				className: "text-xs font-medium text-destructive",
				children: error
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 251,
				columnNumber: 17
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 245,
		columnNumber: 10
	}, this);
}
//#endregion
export { AuthPage as component };
