import { i as __toESM } from "../_runtime.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as Button } from "./button-Dup41fMn.mjs";
import { l as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as supabase } from "./client-PQVVhYgw.mjs";
import { n as Label, t as Input } from "./label-DtY__edU.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-DwDqg--m.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/routes/reset-password.tsx?tsr-split=component";
function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: "flex min-h-[70vh] items-center justify-center px-5 py-16",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        "form",
        {
          onSubmit,
          className: "w-full max-w-md space-y-5",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "h1",
              {
                className: "text-display text-5xl",
                children: "New password",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 36,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "p",
              {
                className: "text-muted-foreground",
                children:
                  "Open this page from the link in your reset email, then choose a new password.",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 37,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "div",
              {
                className: "space-y-2",
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    Label,
                    {
                      htmlFor: "password",
                      children: "New password",
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 39,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    Input,
                    {
                      id: "password",
                      name: "password",
                      type: "password",
                      autoComplete: "new-password",
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 40,
                      columnNumber: 11,
                    },
                    this,
                  ),
                ],
              },
              void 0,
              true,
              {
                fileName: _jsxFileName,
                lineNumber: 38,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "div",
              {
                className: "space-y-2",
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    Label,
                    {
                      htmlFor: "confirm",
                      children: "Confirm password",
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 43,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    Input,
                    {
                      id: "confirm",
                      name: "confirm",
                      type: "password",
                      autoComplete: "new-password",
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 44,
                      columnNumber: 11,
                    },
                    this,
                  ),
                ],
              },
              void 0,
              true,
              {
                fileName: _jsxFileName,
                lineNumber: 42,
                columnNumber: 9,
              },
              this,
            ),
            error &&
              /* @__PURE__ */ (void 0)(
                "p",
                {
                  className: "text-sm text-destructive",
                  children: error,
                },
                void 0,
                false,
                {
                  fileName: _jsxFileName,
                  lineNumber: 46,
                  columnNumber: 19,
                },
                this,
              ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              Button,
              {
                type: "submit",
                variant: "hero",
                size: "xl",
                className: "w-full",
                disabled: loading,
                children: [
                  loading &&
                    /* @__PURE__ */ (void 0)(
                      LoaderCircle,
                      { className: "animate-spin" },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName,
                        lineNumber: 48,
                        columnNumber: 23,
                      },
                      this,
                    ),
                  " Update password",
                ],
              },
              void 0,
              true,
              {
                fileName: _jsxFileName,
                lineNumber: 47,
                columnNumber: 9,
              },
              this,
            ),
          ],
        },
        void 0,
        true,
        {
          fileName: _jsxFileName,
          lineNumber: 35,
          columnNumber: 7,
        },
        this,
      ),
    },
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 34,
      columnNumber: 10,
    },
    this,
  );
}
//#endregion
export { ResetPassword as component };
