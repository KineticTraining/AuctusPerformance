import { i as __toESM } from "../_runtime.mjs";
import {
  Ht as redirect,
  _ as createFileRoute,
  b as useNavigate,
  d as Scripts,
  f as HeadContent,
  g as lazyRouteComponent,
  h as Outlet,
  m as createRouter,
  v as createRootRouteWithContext,
  x as useRouter,
  y as Link,
} from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { t as Button } from "./button-Dup41fMn.mjs";
import { i as useQueryClient, r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as articlesQuery } from "./articles.functions-DQ1YInXE.mjs";
import { t as Route$7 } from "./articles._slug-PPgLTvmb.mjs";
import {
  c as LogOut,
  d as Circle,
  g as Check,
  m as ChevronRight,
  n as User,
  o as Menu,
  t as X,
} from "../_libs/lucide-react.mjs";
import { t as supabase } from "./client-PQVVhYgw.mjs";
import { n as Route$8, r as useAuth, t as AuthProvider } from "./auth-BHwl4JgK.mjs";
import {
  a as DialogOverlay,
  c as DialogTrigger,
  i as DialogDescription,
  n as DialogClose,
  o as DialogPortal,
  r as DialogContent,
  s as DialogTitle,
  t as Dialog,
} from "../_libs/@radix-ui/react-dialog+[...].mjs";
import {
  a as DropdownMenuItemIndicator,
  c as DropdownMenuRadioItem$1,
  d as DropdownMenuSubTrigger$1,
  f as DropdownMenuTrigger$1,
  i as DropdownMenuItem$1,
  l as DropdownMenuSeparator$1,
  n as DropdownMenuCheckboxItem$1,
  o as DropdownMenuLabel$1,
  r as DropdownMenuContent$1,
  s as DropdownMenuPortal,
  t as DropdownMenu$1,
  u as DropdownMenuSubContent$1,
} from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as dashboardQuery } from "./dashboard-BoYvSkz_.mjs";
import { t as submitQuery } from "./submit-C7Hli_5m.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D_8qsS5e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var styles_default = "/assets/styles-CF-8oX_a.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
  const stack = error instanceof Error ? error.stack : void 0;
  window.__lovableReportRuntimeError?.({
    message: describeThrown(error),
    ...(stack !== void 0 && { stack }),
    filename: window.location.pathname,
  });
}
var MAX_SERIALIZED_LENGTH = 2e3;
function describeThrown(error) {
  if (error instanceof Response)
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  const { message } = error ?? {};
  if (typeof message === "string" && message.length > 0) return message;
  try {
    return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
  } catch {
    return String(error);
  }
}
var _jsxFileName$6 = "/app/applet/src/components/ui/sonner.tsx";
var Toaster$1 = ({ ...props }) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    Toaster,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      },
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$6,
      lineNumber: 7,
      columnNumber: 5,
    },
    void 0,
  );
};
var _jsxFileName$5 = "/app/applet/src/components/ui/dropdown-menu.tsx";
var DropdownMenu = DropdownMenu$1;
var DropdownMenuTrigger = DropdownMenuTrigger$1;
var DropdownMenuSubTrigger = import_react.forwardRef(
  ({ className, inset, children, ...props }, ref) =>
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
      DropdownMenuSubTrigger$1,
      {
        ref,
        className: cn(
          "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          inset && "pl-8",
          className,
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
            ChevronRight,
            { className: "ml-auto" },
            void 0,
            false,
            {
              fileName: _jsxFileName$5,
              lineNumber: 37,
              columnNumber: 5,
            },
            void 0,
          ),
        ],
      },
      void 0,
      true,
      {
        fileName: _jsxFileName$5,
        lineNumber: 27,
        columnNumber: 3,
      },
      void 0,
    ),
);
DropdownMenuSubTrigger.displayName = DropdownMenuSubTrigger$1.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuSubContent$1,
    {
      ref,
      className: cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      ),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$5,
      lineNumber: 46,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuSubContent.displayName = DropdownMenuSubContent$1.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuPortal,
    {
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        DropdownMenuContent$1,
        {
          ref,
          sideOffset,
          className: cn(
            "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
            className,
          ),
          ...props,
        },
        void 0,
        false,
        {
          fileName: _jsxFileName$5,
          lineNumber: 62,
          columnNumber: 5,
        },
        void 0,
      ),
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$5,
      lineNumber: 61,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuContent.displayName = DropdownMenuContent$1.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuItem$1,
    {
      ref,
      className: cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
        inset && "pl-8",
        className,
      ),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$5,
      lineNumber: 82,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuItem.displayName = DropdownMenuItem$1.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuCheckboxItem$1,
    {
      ref,
      className: cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      ),
      ...props,
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "span",
          {
            className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              DropdownMenuItemIndicator,
              {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                  Check,
                  { className: "h-4 w-4" },
                  void 0,
                  false,
                  {
                    fileName: _jsxFileName$5,
                    lineNumber: 108,
                    columnNumber: 9,
                  },
                  void 0,
                ),
              },
              void 0,
              false,
              {
                fileName: _jsxFileName$5,
                lineNumber: 107,
                columnNumber: 7,
              },
              void 0,
            ),
          },
          void 0,
          false,
          {
            fileName: _jsxFileName$5,
            lineNumber: 106,
            columnNumber: 5,
          },
          void 0,
        ),
        children,
      ],
    },
    void 0,
    true,
    {
      fileName: _jsxFileName$5,
      lineNumber: 98,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuCheckboxItem.displayName = DropdownMenuCheckboxItem$1.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuRadioItem$1,
    {
      ref,
      className: cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      ),
      ...props,
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "span",
          {
            className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              DropdownMenuItemIndicator,
              {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                  Circle,
                  { className: "h-2 w-2 fill-current" },
                  void 0,
                  false,
                  {
                    fileName: _jsxFileName$5,
                    lineNumber: 130,
                    columnNumber: 9,
                  },
                  void 0,
                ),
              },
              void 0,
              false,
              {
                fileName: _jsxFileName$5,
                lineNumber: 129,
                columnNumber: 7,
              },
              void 0,
            ),
          },
          void 0,
          false,
          {
            fileName: _jsxFileName$5,
            lineNumber: 128,
            columnNumber: 5,
          },
          void 0,
        ),
        children,
      ],
    },
    void 0,
    true,
    {
      fileName: _jsxFileName$5,
      lineNumber: 120,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuRadioItem.displayName = DropdownMenuRadioItem$1.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuLabel$1,
    {
      ref,
      className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$5,
      lineNumber: 144,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuLabel.displayName = DropdownMenuLabel$1.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DropdownMenuSeparator$1,
    {
      ref,
      className: cn("-mx-1 my-1 h-px bg-muted", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$5,
      lineNumber: 156,
      columnNumber: 3,
    },
    void 0,
  ),
);
DropdownMenuSeparator.displayName = DropdownMenuSeparator$1.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "span",
    {
      className: cn("ml-auto text-xs tracking-widest opacity-60", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$5,
      lineNumber: 166,
      columnNumber: 5,
    },
    void 0,
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var _jsxFileName$4 = "/app/applet/src/components/ui/sheet.tsx";
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DialogOverlay,
    {
      className: cn(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      ),
      ...props,
      ref,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$4,
      lineNumber: 22,
      columnNumber: 3,
    },
    void 0,
  ),
);
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
);
var SheetContent = import_react.forwardRef(
  ({ side = "right", className, children, ...props }, ref) =>
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
      SheetPortal,
      {
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
            SheetOverlay,
            {},
            void 0,
            false,
            {
              fileName: _jsxFileName$4,
              lineNumber: 62,
              columnNumber: 5,
            },
            void 0,
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
            DialogContent,
            {
              ref,
              className: cn(sheetVariants({ side }), className),
              ...props,
              children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                  DialogClose,
                  {
                    className:
                      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        X,
                        { className: "h-4 w-4" },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName$4,
                          lineNumber: 65,
                          columnNumber: 9,
                        },
                        void 0,
                      ),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        "span",
                        {
                          className: "sr-only",
                          children: "Close",
                        },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName$4,
                          lineNumber: 66,
                          columnNumber: 9,
                        },
                        void 0,
                      ),
                    ],
                  },
                  void 0,
                  true,
                  {
                    fileName: _jsxFileName$4,
                    lineNumber: 64,
                    columnNumber: 7,
                  },
                  void 0,
                ),
                children,
              ],
            },
            void 0,
            true,
            {
              fileName: _jsxFileName$4,
              lineNumber: 63,
              columnNumber: 5,
            },
            void 0,
          ),
        ],
      },
      void 0,
      true,
      {
        fileName: _jsxFileName$4,
        lineNumber: 61,
        columnNumber: 3,
      },
      void 0,
    ),
);
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$4,
      lineNumber: 75,
      columnNumber: 3,
    },
    void 0,
  );
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$4,
      lineNumber: 80,
      columnNumber: 3,
    },
    void 0,
  );
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DialogTitle,
    {
      ref,
      className: cn("text-lg font-semibold text-foreground", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$4,
      lineNumber: 91,
      columnNumber: 3,
    },
    void 0,
  ),
);
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) =>
  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    DialogDescription,
    {
      ref,
      className: cn("text-sm text-muted-foreground", className),
      ...props,
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$4,
      lineNumber: 103,
      columnNumber: 3,
    },
    void 0,
  ),
);
SheetDescription.displayName = DialogDescription.displayName;
var _jsxFileName$3 = "/app/applet/src/components/site/logo.tsx";
function LogoMark({ className = "size-7" }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "svg",
    {
      viewBox: "0 0 64 64",
      className,
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "rect",
          {
            width: "64",
            height: "64",
            rx: "14",
            className: "fill-foreground",
          },
          void 0,
          false,
          {
            fileName: _jsxFileName$3,
            lineNumber: 6,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "path",
          {
            d: "M18 14h10l-4 16 16-16h12L34 32l12 18H34l-8-12-3 12H13z",
            className: "fill-background",
          },
          void 0,
          false,
          {
            fileName: _jsxFileName$3,
            lineNumber: 7,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    true,
    {
      fileName: _jsxFileName$3,
      lineNumber: 5,
      columnNumber: 5,
    },
    this,
  );
}
function Logo() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    Link,
    {
      to: "/",
      className: "group flex items-center gap-2.5",
      "aria-label": "Kinetic home",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          LogoMark,
          {},
          void 0,
          false,
          {
            fileName: _jsxFileName$3,
            lineNumber: 15,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "span",
          {
            className: "text-lg font-light uppercase tracking-[0.32em]",
            children: [
              "Kinetic",
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                "span",
                {
                  className: "text-brand-red",
                  children: ".",
                },
                void 0,
                false,
                {
                  fileName: _jsxFileName$3,
                  lineNumber: 17,
                  columnNumber: 16,
                },
                this,
              ),
            ],
          },
          void 0,
          true,
          {
            fileName: _jsxFileName$3,
            lineNumber: 16,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    true,
    {
      fileName: _jsxFileName$3,
      lineNumber: 14,
      columnNumber: 5,
    },
    this,
  );
}
var _jsxFileName$2 = "/app/applet/src/components/site/site-header.tsx";
var navLinkClass =
  "text-sm font-normal text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground";
function SiteHeader() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = (0, import_react.useState)(false);
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({
      to: "/auth",
      replace: true,
    });
  }
  const links = /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    import_jsx_dev_runtime.Fragment,
    {
      children: [
        session &&
          /* @__PURE__ */ (void 0)(
            Link,
            {
              to: "/dashboard",
              className: navLinkClass,
              onClick: () => setOpen(false),
              children: "Dashboard",
            },
            void 0,
            false,
            {
              fileName: _jsxFileName$2,
              lineNumber: 39,
              columnNumber: 9,
            },
            this,
          ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          Link,
          {
            to: "/articles",
            className: navLinkClass,
            onClick: () => setOpen(false),
            children: "Sports Science",
          },
          void 0,
          false,
          {
            fileName: _jsxFileName$2,
            lineNumber: 43,
            columnNumber: 7,
          },
          this,
        ),
        session &&
          /* @__PURE__ */ (void 0)(
            Link,
            {
              to: "/submit",
              className: navLinkClass,
              onClick: () => setOpen(false),
              children: "Video Review",
            },
            void 0,
            false,
            {
              fileName: _jsxFileName$2,
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
      fileName: _jsxFileName$2,
      lineNumber: 37,
      columnNumber: 5,
    },
    this,
  );
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "header",
    {
      className: "sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        "div",
        {
          className: "mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              Logo,
              {},
              void 0,
              false,
              {
                fileName: _jsxFileName$2,
                lineNumber: 57,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "nav",
              {
                className: "hidden items-center gap-8 md:flex",
                children: links,
              },
              void 0,
              false,
              {
                fileName: _jsxFileName$2,
                lineNumber: 58,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "div",
              {
                className: "flex items-center gap-2",
                children: [
                  !ready
                    ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        "div",
                        { className: "h-9 w-24" },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName$2,
                          lineNumber: 61,
                          columnNumber: 13,
                        },
                        this,
                      )
                    : session
                      ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                          DropdownMenu,
                          {
                            children: [
                              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                DropdownMenuTrigger,
                                {
                                  asChild: true,
                                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                    Button,
                                    {
                                      variant: "glass",
                                      size: "sm",
                                      className: "gap-2",
                                      children: [
                                        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                          User,
                                          {},
                                          void 0,
                                          false,
                                          {
                                            fileName: _jsxFileName$2,
                                            lineNumber: 66,
                                            columnNumber: 19,
                                          },
                                          this,
                                        ),
                                        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                          "span",
                                          {
                                            className: "hidden max-w-[10rem] truncate sm:inline",
                                            children:
                                              session.user.user_metadata?.["display_name"] ??
                                              session.user.email,
                                          },
                                          void 0,
                                          false,
                                          {
                                            fileName: _jsxFileName$2,
                                            lineNumber: 67,
                                            columnNumber: 19,
                                          },
                                          this,
                                        ),
                                      ],
                                    },
                                    void 0,
                                    true,
                                    {
                                      fileName: _jsxFileName$2,
                                      lineNumber: 65,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                },
                                void 0,
                                false,
                                {
                                  fileName: _jsxFileName$2,
                                  lineNumber: 64,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                DropdownMenuContent,
                                {
                                  align: "end",
                                  className: "w-56",
                                  children: [
                                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                      DropdownMenuLabel,
                                      {
                                        className:
                                          "truncate text-xs font-medium text-muted-foreground",
                                        children: session.user.email,
                                      },
                                      void 0,
                                      false,
                                      {
                                        fileName: _jsxFileName$2,
                                        lineNumber: 73,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                      DropdownMenuSeparator,
                                      {},
                                      void 0,
                                      false,
                                      {
                                        fileName: _jsxFileName$2,
                                        lineNumber: 76,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                      DropdownMenuItem,
                                      {
                                        onSelect: () => navigate({ to: "/dashboard" }),
                                        children: "Dashboard",
                                      },
                                      void 0,
                                      false,
                                      {
                                        fileName: _jsxFileName$2,
                                        lineNumber: 77,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                      DropdownMenuItem,
                                      {
                                        onSelect: () => navigate({ to: "/submit" }),
                                        children: "Video review",
                                      },
                                      void 0,
                                      false,
                                      {
                                        fileName: _jsxFileName$2,
                                        lineNumber: 78,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                      DropdownMenuSeparator,
                                      {},
                                      void 0,
                                      false,
                                      {
                                        fileName: _jsxFileName$2,
                                        lineNumber: 79,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                      DropdownMenuItem,
                                      {
                                        onSelect: signOut,
                                        children: [
                                          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                            LogOut,
                                            { className: "size-4" },
                                            void 0,
                                            false,
                                            {
                                              fileName: _jsxFileName$2,
                                              lineNumber: 81,
                                              columnNumber: 19,
                                            },
                                            this,
                                          ),
                                          " Sign out",
                                        ],
                                      },
                                      void 0,
                                      true,
                                      {
                                        fileName: _jsxFileName$2,
                                        lineNumber: 80,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                  ],
                                },
                                void 0,
                                true,
                                {
                                  fileName: _jsxFileName$2,
                                  lineNumber: 72,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                            ],
                          },
                          void 0,
                          true,
                          {
                            fileName: _jsxFileName$2,
                            lineNumber: 63,
                            columnNumber: 13,
                          },
                          this,
                        )
                      : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                          import_jsx_dev_runtime.Fragment,
                          {
                            children: [
                              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                Button,
                                {
                                  asChild: true,
                                  variant: "ghost",
                                  size: "sm",
                                  className: "hidden sm:inline-flex",
                                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                    Link,
                                    {
                                      to: "/auth",
                                      children: "Sign in",
                                    },
                                    void 0,
                                    false,
                                    {
                                      fileName: _jsxFileName$2,
                                      lineNumber: 88,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                },
                                void 0,
                                false,
                                {
                                  fileName: _jsxFileName$2,
                                  lineNumber: 87,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                Button,
                                {
                                  asChild: true,
                                  variant: "hero",
                                  size: "sm",
                                  children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                    Link,
                                    {
                                      to: "/auth",
                                      search: { mode: "signup" },
                                      children: "Join now",
                                    },
                                    void 0,
                                    false,
                                    {
                                      fileName: _jsxFileName$2,
                                      lineNumber: 91,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                },
                                void 0,
                                false,
                                {
                                  fileName: _jsxFileName$2,
                                  lineNumber: 90,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                            ],
                          },
                          void 0,
                          true,
                          {
                            fileName: _jsxFileName$2,
                            lineNumber: 86,
                            columnNumber: 13,
                          },
                          this,
                        ),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    Sheet,
                    {
                      open,
                      onOpenChange: setOpen,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                          SheetTrigger,
                          {
                            asChild: true,
                            children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                              Button,
                              {
                                variant: "ghost",
                                size: "icon",
                                className: "md:hidden",
                                "aria-label": "Open menu",
                                children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                  Menu,
                                  {},
                                  void 0,
                                  false,
                                  {
                                    fileName: _jsxFileName$2,
                                    lineNumber: 100,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              },
                              void 0,
                              false,
                              {
                                fileName: _jsxFileName$2,
                                lineNumber: 99,
                                columnNumber: 15,
                              },
                              this,
                            ),
                          },
                          void 0,
                          false,
                          {
                            fileName: _jsxFileName$2,
                            lineNumber: 98,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                          SheetContent,
                          {
                            side: "right",
                            className: "w-72",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                SheetTitle,
                                {
                                  className: "sr-only",
                                  children: "Menu",
                                },
                                void 0,
                                false,
                                {
                                  fileName: _jsxFileName$2,
                                  lineNumber: 104,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                                "nav",
                                {
                                  className: "mt-10 flex flex-col gap-6",
                                  children: links,
                                },
                                void 0,
                                false,
                                {
                                  fileName: _jsxFileName$2,
                                  lineNumber: 105,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                            ],
                          },
                          void 0,
                          true,
                          {
                            fileName: _jsxFileName$2,
                            lineNumber: 103,
                            columnNumber: 13,
                          },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    true,
                    {
                      fileName: _jsxFileName$2,
                      lineNumber: 97,
                      columnNumber: 11,
                    },
                    this,
                  ),
                ],
              },
              void 0,
              true,
              {
                fileName: _jsxFileName$2,
                lineNumber: 59,
                columnNumber: 9,
              },
              this,
            ),
          ],
        },
        void 0,
        true,
        {
          fileName: _jsxFileName$2,
          lineNumber: 56,
          columnNumber: 7,
        },
        this,
      ),
    },
    void 0,
    false,
    {
      fileName: _jsxFileName$2,
      lineNumber: 55,
      columnNumber: 5,
    },
    this,
  );
}
var _jsxFileName$1 = "/app/applet/src/components/site/site-footer.tsx";
function SiteFooter() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "footer",
    {
      className: "border-t border-border/60 bg-surface/40",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "div",
          {
            className:
              "mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8",
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                "div",
                {
                  className: "space-y-3",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                      Logo,
                      {},
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName$1,
                        lineNumber: 9,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                      "p",
                      {
                        className: "max-w-sm text-sm font-light text-muted-foreground",
                        children:
                          "Evidence-based training, coaching content and AI technique review for athletes who want to get better on purpose.",
                      },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName$1,
                        lineNumber: 10,
                        columnNumber: 11,
                      },
                      this,
                    ),
                  ],
                },
                void 0,
                true,
                {
                  fileName: _jsxFileName$1,
                  lineNumber: 8,
                  columnNumber: 9,
                },
                this,
              ),
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                "nav",
                {
                  className:
                    "flex flex-wrap gap-x-8 gap-y-3 text-sm font-normal text-muted-foreground",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                      Link,
                      {
                        to: "/articles",
                        className: "hover:text-foreground",
                        children: "Sports Science",
                      },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName$1,
                        lineNumber: 15,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                      Link,
                      {
                        to: "/dashboard",
                        className: "hover:text-foreground",
                        children: "Member dashboard",
                      },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName$1,
                        lineNumber: 16,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                      Link,
                      {
                        to: "/submit",
                        className: "hover:text-foreground",
                        children: "Video review",
                      },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName$1,
                        lineNumber: 17,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                      Link,
                      {
                        to: "/auth",
                        className: "hover:text-foreground",
                        children: "Sign in",
                      },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName$1,
                        lineNumber: 18,
                        columnNumber: 11,
                      },
                      this,
                    ),
                  ],
                },
                void 0,
                true,
                {
                  fileName: _jsxFileName$1,
                  lineNumber: 14,
                  columnNumber: 9,
                },
                this,
              ),
            ],
          },
          void 0,
          true,
          {
            fileName: _jsxFileName$1,
            lineNumber: 7,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "div",
          {
            className: "border-t border-border/60 py-5 text-center text-xs text-muted-foreground",
            children: ["© ", /* @__PURE__ */ new Date().getFullYear(), " Kinetic Performance Lab"],
          },
          void 0,
          true,
          {
            fileName: _jsxFileName$1,
            lineNumber: 21,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    true,
    {
      fileName: _jsxFileName$1,
      lineNumber: 6,
      columnNumber: 5,
    },
    this,
  );
}
var _jsxFileName = "/app/applet/src/routes/__root.tsx";
function NotFoundComponent() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: "flex min-h-screen items-center justify-center bg-background px-4",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        "div",
        {
          className: "max-w-md text-center",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "h1",
              {
                className: "text-7xl font-extralight tracking-tight text-foreground",
                children: "404",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 24,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "h2",
              {
                className: "mt-4 text-xl font-medium text-foreground",
                children: "Page not found",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 25,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "p",
              {
                className: "mt-2 text-sm text-muted-foreground",
                children: "The page you're looking for doesn't exist or has been moved.",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 26,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "div",
              {
                className: "mt-6",
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                  Link,
                  {
                    to: "/",
                    className:
                      "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                    children: "Go home",
                  },
                  void 0,
                  false,
                  {
                    fileName: _jsxFileName,
                    lineNumber: 30,
                    columnNumber: 11,
                  },
                  this,
                ),
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 29,
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
          lineNumber: 23,
          columnNumber: 7,
        },
        this,
      ),
    },
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 5,
    },
    this,
  );
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  (0, import_react.useEffect)(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: "flex min-h-screen items-center justify-center bg-background px-4",
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        "div",
        {
          className: "max-w-md text-center",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "h1",
              {
                className: "text-xl font-medium tracking-tight text-foreground",
                children: "This page didn't load",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 52,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "p",
              {
                className: "mt-2 text-sm text-muted-foreground",
                children:
                  "Something went wrong on our end. You can try refreshing or head back home.",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 55,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "div",
              {
                className: "mt-6 flex flex-wrap justify-center gap-2",
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    "button",
                    {
                      onClick: () => {
                        router.invalidate();
                        reset();
                      },
                      className:
                        "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                      children: "Try again",
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 59,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    "a",
                    {
                      href: "/",
                      className:
                        "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                      children: "Go home",
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 68,
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
                lineNumber: 58,
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
          lineNumber: 51,
          columnNumber: 7,
        },
        this,
      ),
    },
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 50,
      columnNumber: 5,
    },
    this,
  );
}
var Route$6 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Kinetic — Sports Training Membership" },
      {
        name: "description",
        content: "Elite training videos, sports science and AI technique review for athletes.",
      },
      {
        name: "author",
        content: "Kinetic Performance Lab",
      },
      {
        property: "og:title",
        content: "Kinetic — Sports Training Membership",
      },
      {
        property: "og:description",
        content: "Elite training videos, sports science and AI technique review for athletes.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: styles_default,
      },
      {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..700&family=Geist+Mono:wght@300..500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "html",
    {
      lang: "en",
      className: "dark",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "head",
          {
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              HeadContent,
              {},
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 120,
                columnNumber: 9,
              },
              this,
            ),
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 119,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "body",
          {
            children: [
              children,
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                Scripts,
                {},
                void 0,
                false,
                {
                  fileName: _jsxFileName,
                  lineNumber: 124,
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
            lineNumber: 122,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    true,
    {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 5,
    },
    this,
  );
}
function RootComponent() {
  const { queryClient } = Route$6.useRouteContext();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    QueryClientProvider,
    {
      client: queryClient,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
        AuthProvider,
        {
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              "div",
              {
                className: "flex min-h-screen flex-col",
                children: [
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    SiteHeader,
                    {},
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 137,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    "main",
                    {
                      className: "flex-1",
                      children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        Outlet,
                        {},
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 140,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    },
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 138,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                    SiteFooter,
                    {},
                    void 0,
                    false,
                    {
                      fileName: _jsxFileName,
                      lineNumber: 142,
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
                lineNumber: 136,
                columnNumber: 9,
              },
              this,
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              Toaster$1,
              {
                theme: "dark",
                position: "top-center",
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 144,
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
          lineNumber: 135,
          columnNumber: 7,
        },
        this,
      ),
    },
    void 0,
    false,
    {
      fileName: _jsxFileName,
      lineNumber: 134,
      columnNumber: 5,
    },
    this,
  );
}
var $$splitComponentImporter$5 = () => import("./routes-B3TRXHFW.mjs");
var Route$5 = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinetic — Train Smarter. Move Faster." },
      {
        name: "description",
        content:
          "Join Kinetic: a training membership with coach-led video library, sports science articles and AI technique review of your own footage.",
      },
      {
        property: "og:title",
        content: "Kinetic — Train Smarter. Move Faster.",
      },
      {
        property: "og:description",
        content:
          "Coach-led video library, sports science and AI technique review for serious athletes.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
});
var $$splitComponentImporter$4 = () => import("./route-CRRSyPUS.mjs");
var Route$4 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
});
var $$splitComponentImporter$3 = () => import("./reset-password-DwDqg--m.mjs");
var Route$3 = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Kinetic" },
      {
        name: "description",
        content: "Choose a new password for your Kinetic membership.",
      },
      {
        property: "og:title",
        content: "Set a new password — Kinetic",
      },
      {
        property: "og:description",
        content: "Choose a new password for your Kinetic membership.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
});
var $$splitComponentImporter$2 = () => import("./dashboard-BP2n7T4s.mjs");
var Route$2 = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Kinetic" },
      {
        name: "description",
        content: "Your Kinetic training dashboard and video library.",
      },
      {
        property: "og:title",
        content: "Dashboard — Kinetic",
      },
      {
        property: "og:description",
        content: "Your Kinetic training dashboard and video library.",
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
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery()),
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
});
var $$splitComponentImporter$1 = () => import("./submit-DTWiG9D-.mjs");
var Route$1 = createFileRoute("/_authenticated/submit")({
  head: () => ({
    meta: [
      { title: "Video Review — Kinetic" },
      {
        name: "description",
        content: "Submit a training video link and notes for AI technique feedback.",
      },
      {
        property: "og:title",
        content: "Video Review — Kinetic",
      },
      {
        property: "og:description",
        content: "Submit a training video link and notes for AI technique feedback.",
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
  loader: ({ context }) => context.queryClient.ensureQueryData(submitQuery()),
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
});
var $$splitComponentImporter = () => import("./articles.index-CiyWI29t.mjs");
var Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Sports Science Articles — Kinetic" },
      {
        name: "description",
        content:
          "Evidence-based articles on sleep, power, injury prevention, nutrition, psychology and training load for athletes.",
      },
      {
        property: "og:title",
        content: "Sports Science Articles — Kinetic",
      },
      {
        property: "og:description",
        content: "The research behind better training, explained by practitioners.",
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
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery()),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
var IndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6,
});
var AuthenticatedRouteRoute = Route$4.update({
  id: "/_authenticated",
  getParentRoute: () => Route$6,
});
var AuthRoute = Route$8.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$6,
});
var ResetPasswordRoute = Route$3.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$6,
});
var AuthenticatedDashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute,
});
var AuthenticatedSubmitRoute = Route$1.update({
  id: "/submit",
  path: "/submit",
  getParentRoute: () => AuthenticatedRouteRoute,
});
var ArticlesIndexRoute = Route.update({
  id: "/articles/",
  path: "/articles/",
  getParentRoute: () => Route$6,
});
var ArticlesSlugRoute = Route$7.update({
  id: "/articles/$slug",
  path: "/articles/$slug",
  getParentRoute: () => Route$6,
});
var AuthenticatedRouteRouteChildren = {
  AuthenticatedDashboardRoute,
  AuthenticatedSubmitRoute,
};
var rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(
    AuthenticatedRouteRouteChildren,
  ),
  AuthRoute,
  ResetPasswordRoute,
  ArticlesSlugRoute,
  ArticlesIndexRoute,
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
//#endregion
export { getRouter };
