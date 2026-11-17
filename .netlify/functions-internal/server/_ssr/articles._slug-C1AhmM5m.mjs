import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-COeeM7GY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles._slug-C1AhmM5m.js
var import_jsx_runtime = require_jsx_runtime();
var SplitNotFoundComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "mx-auto max-w-2xl px-5 py-32 text-center",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-display text-5xl",
		children: "Article not found"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "hero",
		className: "mt-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/articles",
			children: "All articles"
		})
	})]
});
//#endregion
export { SplitNotFoundComponent as notFoundComponent };
