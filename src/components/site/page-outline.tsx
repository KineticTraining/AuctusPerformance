import { ChevronDown, ListTree } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface OutlineSection {
  id: string;
  label: string;
  accentDotClass?: string;
  accentTextClass?: string;
  accentBarClass?: string;
}

export function PageOutline({
  sections,
  title = "On this page",
  className,
}: {
  sections: OutlineSection[];
  title?: string;
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionIdsKey = sections.map((s) => s.id).join("|");

  useEffect(() => {
    if (sections.length === 0) return;
    if (!sections.some((s) => s.id === activeId)) {
      setActiveId(sections[0]!.id);
    }
  }, [sections, activeId]);

  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const visibleRatios = new Map<string, number>();

    const updateActiveFromScroll = () => {
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      // Near top of page -> first section
      if (scrollY < 48 && elements[0]) {
        setActiveId(elements[0].id);
        return;
      }

      // Near bottom of page -> last section
      if (scrollY + viewportH >= docH - 32 && elements.length > 0) {
        setActiveId(elements[elements.length - 1]!.id);
        return;
      }

      // Pick section whose top is closest to the upper-third anchor (140px below header)
      const anchor = 140;
      let chosen = elements[0]!.id;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor) {
          chosen = el.id;
        }
      }
      setActiveId(chosen);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof window.IntersectionObserver === "function") {
      try {
        observer = new window.IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              visibleRatios.set(
                entry.target.id,
                entry.isIntersecting ? entry.intersectionRatio : 0,
              );
            }

            let bestId: string | null = null;
            let bestScore = 0;
            for (const el of elements) {
              const ratio = visibleRatios.get(el.id) ?? 0;
              if (ratio > bestScore) {
                bestScore = ratio;
                bestId = el.id;
              }
            }

            if (bestId) {
              setActiveId(bestId);
            } else {
              updateActiveFromScroll();
            }
          },
          {
            rootMargin: "-18% 0px -60% 0px",
            threshold: [0, 0.25, 0.5],
          },
        );
        for (const el of elements) {
          observer.observe(el);
        }
      } catch {
        observer = null;
      }
    }

    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    updateActiveFromScroll();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", updateActiveFromScroll);
    };
  }, [sectionIdsKey, sections]);

  if (sections.length === 0) return null;

  const activeSection = sections.find((s) => s.id === activeId) ?? sections[0]!;

  function scrollToSection(id: string) {
    setActiveId(id);
    setMobileOpen(false);
    if (typeof document === "undefined") return;
    const target = document.getElementById(id);
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className={className}>
      {/* MOBILE COLLAPSIBLE OUTLINE BAR (< lg, non-sticky) */}
      <div className="mb-4 lg:hidden">
        <div className="rounded-xl border border-border/80 bg-surface/90">
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-page-outline-list"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex min-h-10 w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-xs"
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <ListTree className="size-3.5 shrink-0 text-brand-amber" aria-hidden="true" />
              <span className="font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Outline
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                ·
              </span>
              <span
                className={cn(
                  "truncate font-medium text-foreground",
                  activeSection.accentTextClass,
                )}
              >
                {activeSection.label}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                mobileOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          {mobileOpen && (
            <nav
              id="mobile-page-outline-list"
              aria-label="Page outline"
              className="border-t border-border/60 px-2.5 py-2"
            >
              <ul className="grid gap-1 sm:grid-cols-2">
                {sections.map((section) => {
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(section.id);
                        }}
                        className={cn(
                          "flex min-h-9 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                          isActive
                            ? "bg-background font-medium text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                          isActive && section.accentTextClass,
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            isActive ? (section.accentDotClass ?? "bg-brand-amber") : "bg-border",
                          )}
                        />
                        <span className="truncate">{section.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* DESKTOP PERSISTENT STICKY OUTLINE SIDEBAR (>= lg) */}
      <aside className="hidden lg:block" aria-label="Page outline">
        <div className="rounded-2xl border border-border/70 bg-surface/65 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
            <ListTree className="size-3.5 text-brand-amber" aria-hidden="true" />
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
              {title}
            </p>
          </div>
          <nav className="mt-2.5" aria-label="Section navigation">
            <ul className="space-y-1 border-l border-border/70">
              {sections.map((section) => {
                const isActive = section.id === activeId;
                return (
                  <li key={section.id} className="relative">
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -left-[1px] top-1.5 bottom-1.5 w-[2px] rounded-full",
                          section.accentBarClass ?? "bg-brand-amber",
                        )}
                      />
                    )}
                    <a
                      href={`#${section.id}`}
                      aria-current={isActive ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(section.id);
                      }}
                      className={cn(
                        "flex items-center gap-2 py-1.5 pl-3 pr-1.5 text-xs transition-colors",
                        isActive
                          ? "font-medium text-foreground"
                          : "font-normal text-muted-foreground hover:text-foreground",
                        isActive && section.accentTextClass,
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 shrink-0 rounded-full transition-colors",
                          isActive
                            ? (section.accentDotClass ?? "bg-brand-amber")
                            : "bg-transparent",
                        )}
                      />
                      <span className="truncate">{section.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}

export function PageWithOutline({
  sections,
  title,
  children,
  className,
  contentClassName,
}: {
  sections: OutlineSection[];
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[90rem] px-4 pt-5 pb-14 sm:px-6 sm:pt-7 lg:grid lg:grid-cols-[12.25rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:px-8 lg:pt-8 lg:pb-20",
        className,
      )}
    >
      <div className="lg:sticky lg:top-20">
        <PageOutline sections={sections} {...(title ? { title } : {})} />
      </div>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}
