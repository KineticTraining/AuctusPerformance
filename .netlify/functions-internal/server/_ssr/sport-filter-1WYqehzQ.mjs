import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { g as Check } from "../_libs/lucide-react.mjs";
import { t as FILTER_SPORTS } from "./sports-CAn-tFZL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sport-filter-1WYqehzQ.js
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/components/site/sport-filter.tsx";
function SportFilter({ selected, onChange }) {
	const toggle = (sport) => onChange(selected.includes(sport) ? selected.filter((s) => s !== sport) : [...selected, sport]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [FILTER_SPORTS.map((sport) => {
			const active = selected.includes(sport);
			return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				type: "button",
				"aria-pressed": active,
				onClick: () => toggle(sport),
				className: cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-normal transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: cn("grid size-4 place-items-center rounded-sm border transition-colors", active ? "border-primary-foreground bg-primary-foreground text-primary" : "border-muted-foreground/60"),
					"aria-hidden": "true",
					children: active && /* @__PURE__ */ (void 0)(Check, {
						className: "size-3",
						strokeWidth: 3
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 37,
						columnNumber: 26
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 30,
					columnNumber: 13
				}, this), sport]
			}, sport, true, {
				fileName: _jsxFileName,
				lineNumber: 20,
				columnNumber: 11
			}, this);
		}), selected.length > 0 && /* @__PURE__ */ (void 0)("button", {
			type: "button",
			onClick: () => onChange([]),
			className: "px-2 py-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
			children: "Clear"
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 44,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 16,
		columnNumber: 5
	}, this);
}
//#endregion
export { SportFilter as t };
