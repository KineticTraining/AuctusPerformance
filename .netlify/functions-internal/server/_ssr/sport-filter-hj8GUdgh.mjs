import { t as cn } from "./utils-C_uf36nf.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { g as Check } from "../_libs/lucide-react.mjs";
import { t as FILTER_SPORTS } from "./sports-CAn-tFZL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sport-filter-hj8GUdgh.js
var import_jsx_runtime = require_jsx_runtime();
function SportFilter({ selected, onChange }) {
	const toggle = (sport) => onChange(selected.includes(sport) ? selected.filter((s) => s !== sport) : [...selected, sport]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [FILTER_SPORTS.map((sport) => {
			const active = selected.includes(sport);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-pressed": active,
				onClick: () => toggle(sport),
				className: cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-normal transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("grid size-4 place-items-center rounded-sm border transition-colors", active ? "border-primary-foreground bg-primary-foreground text-primary" : "border-muted-foreground/60"),
					"aria-hidden": "true",
					children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-3",
						strokeWidth: 3
					})
				}), sport]
			}, sport);
		}), selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange([]),
			className: "px-2 py-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
			children: "Clear"
		})]
	});
}
//#endregion
export { SportFilter as t };
