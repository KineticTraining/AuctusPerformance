import { i as __toESM } from "../_runtime.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as formatDate } from "./format-CBApI5FQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { n as useSuspenseQuery } from "../_libs/tanstack__react-query.mjs";
import { n as articlesQuery } from "./articles.functions-DQ1YInXE.mjs";
import { u as Clock, v as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { t as SportFilter } from "./sport-filter-1WYqehzQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/articles.index-CiyWI29t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/routes/articles.index.tsx?tsr-split=component";
function ArticlesPage() {
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];
  const [cat, setCat] = (0, import_react.useState)("All");
  const [sportFilters, setSportFilters] = (0, import_react.useState)([]);
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const isFiltered = cat !== "All" || sportFilters.length > 0;
  const matches = (a) =>
    (cat === "All" || a.category === cat) &&
    (sportFilters.length === 0 || a.sports.some((s) => sportFilters.includes(s)));
  const gridArticles = articles.filter(
    (a) => matches(a) && (isFiltered || a.slug !== featured?.slug),
  );
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: "mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "p",
          {
            className: "eyebrow",
            children: "The Lab Journal",
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 21,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "h1",
          {
            className: "text-display mt-4 text-6xl md:text-8xl",
            children: "Sports science",
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 22,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "p",
          {
            className: "mt-4 max-w-2xl text-lg text-muted-foreground",
            children:
              "The research behind better training — translated into what to actually do on Monday.",
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 23,
            columnNumber: 7,
          },
          this,
        ),
        featured &&
          !isFiltered &&
          /* @__PURE__ */ (void 0)(
            Link,
            {
              to: "/articles/$slug",
              params: { slug: featured.slug },
              className:
                "group mt-14 grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-[1.3fr_1fr]",
              children: [
                /* @__PURE__ */ (void 0)(
                  "div",
                  {
                    className: "p-8 md:p-12",
                    children: [
                      /* @__PURE__ */ (void 0)(
                        "span",
                        {
                          className:
                            "inline-flex rounded-full border border-brand-red/60 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand-red",
                          children: ["Featured · ", featured.category],
                        },
                        void 0,
                        true,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 31,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      /* @__PURE__ */ (void 0)(
                        "h2",
                        {
                          className: "text-display mt-6 text-4xl md:text-6xl",
                          children: featured.title,
                        },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 34,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      /* @__PURE__ */ (void 0)(
                        "p",
                        {
                          className: "mt-4 text-muted-foreground",
                          children: featured.excerpt,
                        },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 35,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      /* @__PURE__ */ (void 0)(
                        Byline,
                        { a: featured },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 36,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    ],
                  },
                  void 0,
                  true,
                  {
                    fileName: _jsxFileName,
                    lineNumber: 30,
                    columnNumber: 11,
                  },
                  this,
                ),
                /* @__PURE__ */ (void 0)(
                  "div",
                  {
                    className: "relative hidden items-end justify-end bg-grid p-8 md:flex",
                    children: /* @__PURE__ */ (void 0)(
                      ArrowUpRight,
                      {
                        className:
                          "size-16 stroke-1 text-brand-blue transition-transform group-hover:-translate-y-1 group-hover:translate-x-1",
                      },
                      void 0,
                      false,
                      {
                        fileName: _jsxFileName,
                        lineNumber: 39,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  false,
                  {
                    fileName: _jsxFileName,
                    lineNumber: 38,
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
              lineNumber: 27,
              columnNumber: 35,
            },
            this,
          ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "div",
          {
            className: "mt-14 flex flex-wrap gap-2",
            children: categories.map((c) =>
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                "button",
                {
                  onClick: () => setCat(c),
                  className: cn(
                    "rounded-full border px-4 py-1.5 text-sm font-normal transition-colors",
                    cat === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  ),
                  children: c,
                },
                c,
                false,
                {
                  fileName: _jsxFileName,
                  lineNumber: 44,
                  columnNumber: 30,
                },
                this,
              ),
            ),
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 43,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "div",
          {
            className: "mt-6",
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
              SportFilter,
              {
                selected: sportFilters,
                onChange: setSportFilters,
              },
              void 0,
              false,
              {
                fileName: _jsxFileName,
                lineNumber: 50,
                columnNumber: 9,
              },
              this,
            ),
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 49,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "div",
          {
            className: "mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3",
            children: [
              gridArticles.length === 0 &&
                /* @__PURE__ */ (void 0)(
                  "p",
                  {
                    className: "text-sm text-muted-foreground md:col-span-2 lg:col-span-3",
                    children: "No articles match these filters yet.",
                  },
                  void 0,
                  false,
                  {
                    fileName: _jsxFileName,
                    lineNumber: 54,
                    columnNumber: 39,
                  },
                  this,
                ),
              gridArticles.map((a) =>
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                  Link,
                  {
                    to: "/articles/$slug",
                    params: { slug: a.slug },
                    className:
                      "group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-foreground/30",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        "span",
                        {
                          className: "eyebrow",
                          children: a.category,
                        },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 58,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        "h3",
                        {
                          className: "text-display mt-4 text-2xl",
                          children: a.title,
                        },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 59,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        "p",
                        {
                          className: "mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground",
                          children: a.excerpt,
                        },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 60,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                        Byline,
                        { a },
                        void 0,
                        false,
                        {
                          fileName: _jsxFileName,
                          lineNumber: 61,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    ],
                  },
                  a.slug,
                  true,
                  {
                    fileName: _jsxFileName,
                    lineNumber: 55,
                    columnNumber: 32,
                  },
                  this,
                ),
              ),
            ],
          },
          void 0,
          true,
          {
            fileName: _jsxFileName,
            lineNumber: 53,
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
      lineNumber: 20,
      columnNumber: 10,
    },
    this,
  );
}
function Byline({ a }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
    "div",
    {
      className: "mt-6 flex items-center gap-4 text-xs text-muted-foreground",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "span",
          {
            className: "font-medium text-foreground",
            children: a.author,
          },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 76,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "span",
          { children: formatDate(a.published_at) },
          void 0,
          false,
          {
            fileName: _jsxFileName,
            lineNumber: 77,
            columnNumber: 7,
          },
          this,
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
          "span",
          {
            className: "flex items-center gap-1",
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
                Clock,
                { className: "size-3.5" },
                void 0,
                false,
                {
                  fileName: _jsxFileName,
                  lineNumber: 79,
                  columnNumber: 9,
                },
                this,
              ),
              " ",
              a.read_minutes,
              " min",
            ],
          },
          void 0,
          true,
          {
            fileName: _jsxFileName,
            lineNumber: 78,
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
      lineNumber: 75,
      columnNumber: 10,
    },
    this,
  );
}
//#endregion
export { ArticlesPage as component };
