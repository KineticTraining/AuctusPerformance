import { i as __toESM } from "../_runtime.mjs";
import {
  _ as createFileRoute,
  g as lazyRouteComponent,
  x as useRouter,
} from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as supabase } from "./client-PQVVhYgw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BHwl4JgK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/hooks/use-auth.tsx";
var AuthContext = (0, import_react.createContext)({
  session: null,
  ready: false,
});
/** Single app-wide auth subscriber: keeps session state fresh and refreshes route/query data on identity changes. */
function AuthProvider({ children }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = (0, import_react.useState)({
    session: null,
    ready: false,
  });
  (0, import_react.useEffect)(() => {
    supabase.auth.getSession().then(({ data }) =>
      setState({
        session: data.session,
        ready: true,
      }),
    );
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        session,
        ready: true,
      });
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    AuthContext.Provider,
    {
      value: state,
      children,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 10,
    },
    this,
  );
}
function useAuth() {
  return (0, import_react.useContext)(AuthContext);
}
var $$splitComponentImporter = () => import("./auth-lOWCo7ME.mjs");
var Route = createFileRoute("/auth")({
  validateSearch: (s) => ({
    mode: s["mode"] === "signup" || s["mode"] === "forgot" ? s["mode"] : void 0,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or join — Kinetic" },
      {
        name: "description",
        content: "Sign in to your Kinetic membership or create an account to start training.",
      },
      {
        property: "og:title",
        content: "Sign in or join — Kinetic",
      },
      {
        property: "og:description",
        content: "Access your training dashboard, video library and AI technique review.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
//#endregion
export { Route as n, useAuth as r, AuthProvider as t };
