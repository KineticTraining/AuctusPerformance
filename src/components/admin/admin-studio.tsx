import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckSquare,
  ExternalLink,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  Square,
  Trash2,
  Unlock,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  adminStatusQuery,
  claimAdminKeyFn,
  deleteCmsArticle,
  deleteCmsNewsletter,
  deleteCmsNutrition,
  listAdminContent,
  unlockAdminSession,
  upsertCmsArticle,
  upsertCmsNewsletter,
  upsertCmsNutrition,
  validateAdminToken,
} from "@/lib/cms.functions";
import type {
  ArticleSeedRow,
  ArticleSource,
  NewsletterIssue,
  NutrientEntry,
} from "@/lib/mock-seed";
import {
  AGE_GROUPS,
  ARTICLE_CATEGORIES,
  EXPERIENCE_LEVELS,
  FILTER_SPORTS,
  NUTRITION_GROUPS,
  type AgeGroup,
  type ExperienceLevel,
  type NutritionGroup,
} from "@/lib/sports";
import { cn } from "@/lib/utils";

const ADMIN_TOKEN_STORAGE_KEY = "dusk_admin_session_token";

type AdminTab = "articles" | "newsletters" | "nutrition";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function AdminStudio() {
  const queryClient = useQueryClient();
  const statusQuery = useSuspenseQuery(adminStatusQuery());

  const validateTokenFn = useServerFn(validateAdminToken);
  const claimKeyFn = useServerFn(claimAdminKeyFn);
  const unlockFn = useServerFn(unlockAdminSession);
  const fetchContentFn = useServerFn(listAdminContent);
  const upsertArticleFn = useServerFn(upsertCmsArticle);
  const deleteArticleFn = useServerFn(deleteCmsArticle);
  const upsertNewsletterFn = useServerFn(upsertCmsNewsletter);
  const deleteNewsletterFn = useServerFn(deleteCmsNewsletter);
  const upsertNutritionFn = useServerFn(upsertCmsNutrition);
  const deleteNutritionFn = useServerFn(deleteCmsNutrition);

  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [checkingToken, setCheckingToken] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState("");
  const [confirmPasskey, setConfirmPasskey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("articles");
  const [articles, setArticles] = useState<ArticleSeedRow[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterIssue[]>([]);
  const [nutrition, setNutrition] = useState<NutrientEntry[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Restore saved token if still valid on server
  useEffect(() => {
    let mounted = true;
    async function restore() {
      if (typeof window === "undefined") {
        setCheckingToken(false);
        return;
      }
      const saved = window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
      if (!saved) {
        setCheckingToken(false);
        return;
      }
      try {
        const res = await validateTokenFn({ data: { adminToken: saved } });
        if (!mounted) return;
        if (res.valid) {
          setAdminToken(saved);
        } else {
          window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        }
      } catch {
        window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      } finally {
        if (mounted) setCheckingToken(false);
      }
    }
    restore();
    return () => {
      mounted = false;
    };
  }, [validateTokenFn]);

  async function refreshCmsContent(token: string) {
    setLoadingContent(true);
    try {
      const data = await fetchContentFn({ data: { adminToken: token } });
      setArticles(data.articles);
      setNewsletters(data.newsletters);
      setNutrition(data.nutrition);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load CMS content.");
      setAdminToken(null);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      }
    } finally {
      setLoadingContent(false);
    }
  }

  useEffect(() => {
    if (adminToken) {
      refreshCmsContent(adminToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  async function handleUnlockOrClaim(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    const needsSetup = !statusQuery.data.envConfigured && !statusQuery.data.keyClaimed;

    if (needsSetup) {
      if (passkeyInput.length < 8) {
        setAuthError("Create an Admin Key of at least 8 characters.");
        return;
      }
      if (passkeyInput !== confirmPasskey) {
        setAuthError("Keys do not match.");
        return;
      }
      setAuthBusy(true);
      try {
        const res = await claimKeyFn({ data: { passkey: passkeyInput } });
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, res.token);
        }
        setAdminToken(res.token);
        setPasskeyInput("");
        setConfirmPasskey("");
        queryClient.invalidateQueries({ queryKey: ["admin-config-status"] });
        toast.success("Admin Key initialized and Admin Studio unlocked.");
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : "Could not initialize Admin Key.");
      } finally {
        setAuthBusy(false);
      }
      return;
    }

    if (!passkeyInput.trim()) {
      setAuthError("Enter your Admin Access Key.");
      return;
    }

    setAuthBusy(true);
    try {
      const res = await unlockFn({ data: { passkey: passkeyInput } });
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, res.token);
      }
      setAdminToken(res.token);
      setPasskeyInput("");
      toast.success("Admin Mode unlocked.");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Invalid Admin Access Key.");
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLock() {
    setAdminToken(null);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    }
    toast.info("Admin Studio locked.");
  }

  function invalidatePublicContent() {
    queryClient.invalidateQueries({ queryKey: ["articles"] });
    queryClient.invalidateQueries({ queryKey: ["article"] });
    queryClient.invalidateQueries({ queryKey: ["newsletters"] });
    queryClient.invalidateQueries({ queryKey: ["nutrition-library"] });
  }

  if (checkingToken) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5">
        <Loader2 className="size-7 animate-spin text-brand-amber" />
      </div>
    );
  }

  if (!adminToken) {
    const needsSetup = !statusQuery.data.envConfigured && !statusQuery.data.keyClaimed;
    return (
      <div className="mx-auto max-w-xl px-5 py-16 md:py-24">
        <div className="rounded-2xl border border-border bg-surface p-7 sm:p-9">
          <span className="block h-[3px] w-14 bg-tricolor" aria-hidden="true" />
          <div className="mt-6 flex items-center gap-2.5 text-brand-amber">
            <KeyRound className="size-5" aria-hidden="true" />
            <p className="eyebrow text-brand-amber">
              {needsSetup ? "First-Run Admin Key Setup" : "Private Admin Access"}
            </p>
          </div>
          <h1 className="text-display mt-3 text-3xl sm:text-4xl">
            {needsSetup ? "Initialize Admin Key" : "Unlock Admin Studio"}
          </h1>
          <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
            {needsSetup
              ? "No ADMIN_ACCESS_KEY environment variable is set yet. Create a private Admin Key (hashed securely on the server) to manage News Articles, Data Conclusions, Newsletters, and the Free Nutrition Library."
              : "Enter your private Admin Access Key to publish or update Latest Science articles, My Data Conclusions, Newsletter Dispatches, and Nutrition Guide entries."}
          </p>

          <form onSubmit={handleUnlockOrClaim} className="mt-7 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-passkey">
                {needsSetup ? "Create private Admin Key (min 8 chars)" : "Admin Access Key"}
              </Label>
              <Input
                id="admin-passkey"
                type="password"
                autoComplete="off"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            {needsSetup && (
              <div className="space-y-2">
                <Label htmlFor="admin-passkey-confirm">Confirm Admin Key</Label>
                <Input
                  id="admin-passkey-confirm"
                  type="password"
                  autoComplete="off"
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  placeholder="Re-enter private key"
                />
              </div>
            )}

            {authError && <p className="text-sm text-destructive">{authError}</p>}

            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={authBusy}>
              {authBusy ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Unlock aria-hidden="true" />
              )}
              {needsSetup ? "Save Key & Unlock Admin Mode" : "Unlock Admin Studio"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="flex flex-col gap-5 border-b border-border/70 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="block h-[3px] w-16 bg-tricolor" aria-hidden="true" />
          <p className="eyebrow mt-5 text-brand-amber">Admin Mode Active · Authenticated CMS</p>
          <h1 className="text-display mt-2 text-4xl sm:text-5xl">Dusk Kinetic Admin Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Publish research posts, data conclusions, newsletters, and nutrition protocols live to
            the site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/articles">
              View Latest Science <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/nutrition">
              View Nutrition Hub <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button type="button" variant="glass" size="sm" onClick={handleLock} className="gap-1.5">
            <Lock className="size-3.5" aria-hidden="true" /> Lock Admin Mode
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["articles", `Articles & Data Conclusions (${articles.length})`],
            ["newsletters", `Newsletters (${newsletters.length})`],
            ["nutrition", `Nutrient Guide (${nutrition.length})`],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "min-h-10 rounded-full border px-4 py-1.5 text-sm transition-colors",
              activeTab === tab
                ? "border-brand-amber bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loadingContent ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-7 animate-spin text-brand-amber" />
        </div>
      ) : activeTab === "articles" ? (
        <ArticlesEditor
          adminToken={adminToken}
          articles={articles}
          onSave={async (payload) => {
            await upsertArticleFn({ data: payload });
            await refreshCmsContent(adminToken);
            invalidatePublicContent();
          }}
          onDelete={async (slug) => {
            await deleteArticleFn({ data: { adminToken, slug } });
            await refreshCmsContent(adminToken);
            invalidatePublicContent();
          }}
        />
      ) : activeTab === "newsletters" ? (
        <NewslettersEditor
          adminToken={adminToken}
          newsletters={newsletters}
          onSave={async (payload) => {
            await upsertNewsletterFn({ data: payload });
            await refreshCmsContent(adminToken);
            invalidatePublicContent();
          }}
          onDelete={async (id) => {
            await deleteNewsletterFn({ data: { adminToken, id } });
            await refreshCmsContent(adminToken);
            invalidatePublicContent();
          }}
        />
      ) : (
        <NutritionEditor
          adminToken={adminToken}
          entries={nutrition}
          onSave={async (payload) => {
            await upsertNutritionFn({ data: payload });
            await refreshCmsContent(adminToken);
            invalidatePublicContent();
          }}
          onDelete={async (id) => {
            await deleteNutritionFn({ data: { adminToken, id } });
            await refreshCmsContent(adminToken);
            invalidatePublicContent();
          }}
        />
      )}
    </div>
  );
}

function ArticlesEditor({
  adminToken,
  articles,
  onSave,
  onDelete,
}: {
  adminToken: string;
  articles: ArticleSeedRow[];
  onSave: (data: {
    adminToken: string;
    originalSlug?: string;
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    category: (typeof ARTICLE_CATEGORIES)[number];
    author: string;
    author_role: string;
    read_minutes: number;
    featured: boolean;
    published_at: string;
    sports: string[];
    age_groups: AgeGroup[];
    experience_levels: ExperienceLevel[];
    sources: ArticleSource[];
    data_conclusion: string;
  }) => Promise<void>;
  onDelete: (slug: string) => Promise<void>;
}) {
  const [editingOriginalSlug, setEditingOriginalSlug] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<(typeof ARTICLE_CATEGORIES)[number]>("Training Science");
  const [author, setAuthor] = useState("Coach Daniel Reyes");
  const [authorRole, setAuthorRole] = useState("Head Coach & Performance Director");
  const [readMinutes, setReadMinutes] = useState(5);
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [featured, setFeatured] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [dataConclusion, setDataConclusion] = useState("");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([...AGE_GROUPS]);
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([
    ...EXPERIENCE_LEVELS,
  ]);
  const [sports, setSports] = useState<string[]>(["Track & Field", "Basketball"]);
  const [sources, setSources] = useState<ArticleSource[]>([
    { label: "PubMed Reference Study", url: "https://pubmed.ncbi.nlm.nih.gov/" },
  ]);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingOriginalSlug(undefined);
    setTitle("");
    setSlug("");
    setCategory("Training Science");
    setAuthor("Coach Daniel Reyes");
    setAuthorRole("Head Coach & Performance Director");
    setReadMinutes(5);
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setFeatured(false);
    setExcerpt("");
    setBody("");
    setDataConclusion("");
    setAgeGroups([...AGE_GROUPS]);
    setExperienceLevels([...EXPERIENCE_LEVELS]);
    setSports(["Track & Field", "Basketball"]);
    setSources([{ label: "PubMed Reference Study", url: "https://pubmed.ncbi.nlm.nih.gov/" }]);
  }

  function loadForEdit(a: ArticleSeedRow) {
    setEditingOriginalSlug(a.slug);
    setTitle(a.title);
    setSlug(a.slug);
    setCategory(
      (ARTICLE_CATEGORIES.find((c) => c === a.category) ??
        "Training Science") as (typeof ARTICLE_CATEGORIES)[number],
    );
    setAuthor(a.author);
    setAuthorRole(a.author_role);
    setReadMinutes(a.read_minutes);
    setPublishedAt(a.published_at);
    setFeatured(a.featured);
    setExcerpt(a.excerpt);
    setBody(a.body);
    setDataConclusion(a.data_conclusion);
    setAgeGroups(
      a.age_groups.filter((ag): ag is AgeGroup => (AGE_GROUPS as readonly string[]).includes(ag)),
    );
    setExperienceLevels(
      a.experience_levels.filter((lv): lv is ExperienceLevel =>
        (EXPERIENCE_LEVELS as readonly string[]).includes(lv),
      ),
    );
    setSports(a.sports.length > 0 ? a.sports : ["Track & Field"]);
    setSources(a.sources.length > 0 ? a.sources : []);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const finalSlug = (slug || slugify(title)).trim();
    if (!finalSlug) {
      toast.error("Provide an article title or URL slug.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        adminToken,
        ...(editingOriginalSlug ? { originalSlug: editingOriginalSlug } : {}),
        slug: finalSlug,
        title,
        excerpt,
        body,
        category,
        author,
        author_role: authorRole,
        read_minutes: Number(readMinutes) || 5,
        featured,
        published_at: publishedAt,
        sports: sports.length > 0 ? sports : ["Track & Field"],
        age_groups: ageGroups.length > 0 ? ageGroups : [...AGE_GROUPS],
        experience_levels: experienceLevels.length > 0 ? experienceLevels : [...EXPERIENCE_LEVELS],
        sources: sources.filter((s) => s.label.trim() && s.url.trim()),
        data_conclusion: dataConclusion,
      });
      toast.success(editingOriginalSlug ? "Article updated live." : "Article published live.");
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save article.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.35fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Published Articles</p>
          <Button type="button" variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
            <Plus className="size-3.5" /> New Article
          </Button>
        </div>

        <div className="space-y-3">
          {articles.map((a) => (
            <div
              key={a.slug}
              className={cn(
                "rounded-2xl border bg-surface p-4 transition-colors",
                editingOriginalSlug === a.slug ? "border-brand-amber" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                    {a.category} {a.featured ? "· Lead Story" : ""}
                  </p>
                  <h3 className="mt-1 text-base font-medium text-foreground">{a.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.published_at} · {a.author}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button type="button" variant="ghost" size="sm" onClick={() => loadForEdit(a)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${a.title}`}
                    onClick={async () => {
                      await onDelete(a.slug);
                      if (editingOriginalSlug === a.slug) resetForm();
                      toast.success("Article deleted.");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-display text-2xl">
            {editingOriginalSlug ? "Edit Research Article" : "Publish New Article"}
          </h2>
          {editingOriginalSlug && (
            <Link
              to="/articles/$slug"
              params={{ slug: editingOriginalSlug }}
              className="text-xs text-brand-amber underline underline-offset-4"
            >
              View post →
            </Link>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="art-title">Title</Label>
            <Input
              id="art-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingOriginalSlug) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g., Isometric Tendon Loading Before Evening Track Work"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="art-slug">URL Slug</Label>
            <Input
              id="art-slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="isometric-tendon-loading"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as (typeof ARTICLE_CATEGORIES)[number])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="art-author">Author</Label>
            <Input id="art-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="art-role">Author Role</Label>
            <Input
              id="art-role"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="art-date">Published Date</Label>
            <Input
              id="art-date"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="art-read">Read Time (minutes)</Label>
            <Input
              id="art-read"
              type="number"
              min={1}
              max={60}
              value={readMinutes}
              onChange={(e) => setReadMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 accent-brand-amber"
          />
          Feature as Lead Story on Latest Science
        </label>

        <div className="space-y-2">
          <Label htmlFor="art-excerpt">Lead Excerpt</Label>
          <Textarea
            id="art-excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Concise summary appearing on cards and SEO metadata..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="art-body">Article Body (supports ## Headings and - bullet lists)</Label>
          <Textarea
            id="art-body"
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write evidence-based field analysis here..."
            required
          />
        </div>

        <div className="space-y-2 rounded-xl border border-brand-amber/40 bg-background/60 p-4">
          <Label htmlFor="art-conclusion" className="text-brand-amber">
            Coach&apos;s Conclusion / My Data Takeaway
          </Label>
          <Textarea
            id="art-conclusion"
            rows={3}
            value={dataConclusion}
            onChange={(e) => setDataConclusion(e.target.value)}
            placeholder="Summarize your own coach data verdict or applied field conclusion displayed at the end of this post..."
            required
          />
        </div>

        <TagToggleGroup
          label="Target Age Groups"
          options={AGE_GROUPS}
          selected={ageGroups}
          onChange={(next) => setAgeGroups(next as AgeGroup[])}
        />

        <TagToggleGroup
          label="Target Experience Levels"
          options={EXPERIENCE_LEVELS}
          selected={experienceLevels}
          onChange={(next) => setExperienceLevels(next as ExperienceLevel[])}
        />

        <TagToggleGroup
          label="Relevant Sports"
          options={FILTER_SPORTS}
          selected={sports}
          onChange={setSports}
        />

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label>Source Citations &amp; Links</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSources((s) => [...s, { label: "", url: "https://" }])}
              className="gap-1 text-xs"
            >
              <Plus className="size-3.5" /> Add source
            </Button>
          </div>
          {sources.map((src, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-[1.1fr_1fr_auto]">
              <Input
                value={src.label}
                onChange={(e) =>
                  setSources((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, label: e.target.value } : item)),
                  )
                }
                placeholder="Author, Journal (Year) — Title"
              />
              <Input
                value={src.url}
                onChange={(e) =>
                  setSources((prev) =>
                    prev.map((item, i) => (i === idx ? { ...item, url: e.target.value } : item)),
                  )
                }
                placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove source"
                onClick={() => setSources((prev) => prev.filter((_, i) => i !== idx))}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={saving}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {editingOriginalSlug ? "Save Article Changes" : "Publish Research Article"}
        </Button>
      </form>
    </div>
  );
}

function NewslettersEditor({
  adminToken,
  newsletters,
  onSave,
  onDelete,
}: {
  adminToken: string;
  newsletters: NewsletterIssue[];
  onSave: (data: {
    adminToken: string;
    id?: string;
    issue_number: number;
    title: string;
    published_at: string;
    summary: string;
    highlights: string[];
    coach_note: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [issueNumber, setIssueNumber] = useState((newsletters[0]?.issue_number ?? 14) + 1);
  const [title, setTitle] = useState("");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(undefined);
    setIssueNumber((newsletters[0]?.issue_number ?? 14) + 1);
    setTitle("");
    setPublishedAt(new Date().toISOString().slice(0, 10));
    setSummary("");
    setHighlightsText("");
    setCoachNote("");
  }

  function loadForEdit(nl: NewsletterIssue) {
    setEditingId(nl.id);
    setIssueNumber(nl.issue_number);
    setTitle(nl.title);
    setPublishedAt(nl.published_at);
    setSummary(nl.summary);
    setHighlightsText(nl.highlights.join("\n"));
    setCoachNote(nl.coach_note);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const highlights = highlightsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (highlights.length === 0) {
      toast.error("Enter at least one newsletter highlight line.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        adminToken,
        ...(editingId ? { id: editingId } : {}),
        issue_number: Number(issueNumber) || 1,
        title,
        published_at: publishedAt,
        summary,
        highlights,
        coach_note: coachNote,
      });
      toast.success(editingId ? "Newsletter dispatch updated." : "Newsletter dispatch published.");
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save newsletter.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.35fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Published Newsletters</p>
          <Button type="button" variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
            <Plus className="size-3.5" /> New Dispatch
          </Button>
        </div>

        <div className="space-y-3">
          {newsletters.map((nl) => (
            <div
              key={nl.id}
              className={cn(
                "rounded-2xl border bg-surface p-4",
                editingId === nl.id ? "border-brand-amber" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                    Issue #{nl.issue_number} · {nl.published_at}
                  </p>
                  <h3 className="mt-1 text-base font-medium text-foreground">{nl.title}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button type="button" variant="ghost" size="sm" onClick={() => loadForEdit(nl)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${nl.title}`}
                    onClick={async () => {
                      await onDelete(nl.id);
                      if (editingId === nl.id) resetForm();
                      toast.success("Newsletter deleted.");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <h2 className="text-display text-2xl">
          {editingId ? "Edit Newsletter Dispatch" : "Publish Newsletter Dispatch"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nl-num">Issue Number</Label>
            <Input
              id="nl-num"
              type="number"
              min={1}
              value={issueNumber}
              onChange={(e) => setIssueNumber(Number(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nl-date">Publish Date</Label>
            <Input
              id="nl-date"
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nl-title">Dispatch Headline</Label>
            <Input
              id="nl-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dusk Dispatch #15:..."
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nl-summary">Summary</Label>
          <Textarea
            id="nl-summary"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nl-highlights">Key Bullet Highlights (one per line)</Label>
          <Textarea
            id="nl-highlights"
            rows={4}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            placeholder="First actionable finding...&#10;Second protocol note..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nl-note">Coach&apos;s Note / Data Insight</Label>
          <Textarea
            id="nl-note"
            rows={3}
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={saving}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {editingId ? "Save Newsletter Changes" : "Publish Newsletter Issue"}
        </Button>
      </form>
    </div>
  );
}

function NutritionEditor({
  adminToken,
  entries,
  onSave,
  onDelete,
}: {
  adminToken: string;
  entries: NutrientEntry[];
  onSave: (data: {
    adminToken: string;
    id?: string;
    slug: string;
    name: string;
    group: NutritionGroup;
    subgroup?: string;
    performanceOneLiner: string;
    summarized: {
      whatItDoes: string;
      threeFoods: string;
      bodyNeeds: string;
      averageAmericanGets: string;
    };
    inDepth: {
      biochemicalFunction: string;
      whereLocatedInFood: string;
    };
    ageGroups: AgeGroup[];
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [group, setGroup] = useState<NutritionGroup>("Macronutrients");
  const [subgroup, setSubgroup] = useState("");
  const [performanceOneLiner, setPerformanceOneLiner] = useState("");
  const [whatItDoes, setWhatItDoes] = useState("");
  const [threeFoods, setThreeFoods] = useState("");
  const [bodyNeeds, setBodyNeeds] = useState("");
  const [averageAmericanGets, setAverageAmericanGets] = useState("");
  const [biochemicalFunction, setBiochemicalFunction] = useState("");
  const [whereLocatedInFood, setWhereLocatedInFood] = useState("");
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([...AGE_GROUPS]);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(undefined);
    setName("");
    setSlug("");
    setGroup("Macronutrients");
    setSubgroup("");
    setPerformanceOneLiner("");
    setWhatItDoes("");
    setThreeFoods("");
    setBodyNeeds("");
    setAverageAmericanGets("");
    setBiochemicalFunction("");
    setWhereLocatedInFood("");
    setAgeGroups([...AGE_GROUPS]);
  }

  function loadForEdit(n: NutrientEntry) {
    setEditingId(n.id);
    setName(n.name);
    setSlug(n.slug);
    setGroup(n.group);
    setSubgroup(n.subgroup ?? "");
    setPerformanceOneLiner(n.performanceOneLiner);
    setWhatItDoes(n.summarized.whatItDoes);
    setThreeFoods(n.summarized.threeFoods);
    setBodyNeeds(n.summarized.bodyNeeds);
    setAverageAmericanGets(n.summarized.averageAmericanGets);
    setBiochemicalFunction(n.inDepth.biochemicalFunction);
    setWhereLocatedInFood(n.inDepth.whereLocatedInFood);
    setAgeGroups(
      n.ageGroups.filter((ag): ag is AgeGroup => (AGE_GROUPS as readonly string[]).includes(ag)),
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const finalSlug = (slug || slugify(name)).trim();
    if (!finalSlug || !name.trim()) {
      toast.error("Provide a nutrient name and slug.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        adminToken,
        ...(editingId ? { id: editingId } : {}),
        slug: finalSlug,
        name: name.trim(),
        group,
        ...(subgroup.trim() ? { subgroup: subgroup.trim() } : {}),
        performanceOneLiner: performanceOneLiner.trim(),
        summarized: {
          whatItDoes: whatItDoes.trim(),
          threeFoods: threeFoods.trim(),
          bodyNeeds: bodyNeeds.trim(),
          averageAmericanGets: averageAmericanGets.trim(),
        },
        inDepth: {
          biochemicalFunction: biochemicalFunction.trim(),
          whereLocatedInFood: whereLocatedInFood.trim(),
        },
        ageGroups: ageGroups.length > 0 ? ageGroups : [...AGE_GROUPS],
      });
      toast.success(editingId ? "Nutrient guide updated." : "Nutrient added.");
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save nutrient.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.35fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Nutrient Entries ({entries.length})</p>
          <Button type="button" variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
            <Plus className="size-3.5" /> New Nutrient
          </Button>
        </div>

        <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
          {entries.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-2xl border bg-surface p-4",
                editingId === item.id ? "border-brand-amber" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
                    {item.group}
                    {item.subgroup ? ` · ${item.subgroup}` : ""}
                  </p>
                  <h3 className="mt-1 text-base font-medium text-foreground">{item.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.performanceOneLiner}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button type="button" variant="ghost" size="sm" onClick={() => loadForEdit(item)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${item.name}`}
                    onClick={async () => {
                      await onDelete(item.id);
                      if (editingId === item.id) resetForm();
                      toast.success("Nutrient deleted.");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <h2 className="text-display text-2xl">
          {editingId ? "Edit Nutrient Entry" : "Add Nutrient Entry"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nut-name">Nutrient Name</Label>
            <Input
              id="nut-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g., Magnesium"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nut-slug">Slug</Label>
            <Input
              id="nut-slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Group</Label>
            <Select value={group} onValueChange={(v) => setGroup(v as NutritionGroup)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUTRITION_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nut-subgroup">Subgroup Label (optional)</Label>
            <Input
              id="nut-subgroup"
              value={subgroup}
              onChange={(e) => setSubgroup(e.target.value)}
              placeholder="e.g., Fat-Soluble or Water-Soluble: B-Complex & Vitamin C"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nut-oneliner">Performance 1-Liner</Label>
          <Input
            id="nut-oneliner"
            value={performanceOneLiner}
            onChange={(e) => setPerformanceOneLiner(e.target.value)}
            required
          />
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-background/50 p-4">
          <p className="eyebrow text-brand-amber">Summarized Explanation</p>
          <div className="space-y-2">
            <Label htmlFor="nut-what">What it does</Label>
            <Textarea
              id="nut-what"
              rows={2}
              value={whatItDoes}
              onChange={(e) => setWhatItDoes(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nut-foods">3 Foods</Label>
            <Input
              id="nut-foods"
              value={threeFoods}
              onChange={(e) => setThreeFoods(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nut-needs">Body Needs</Label>
            <Input
              id="nut-needs"
              value={bodyNeeds}
              onChange={(e) => setBodyNeeds(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nut-avg">Average American Gets</Label>
            <Input
              id="nut-avg"
              value={averageAmericanGets}
              onChange={(e) => setAverageAmericanGets(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-background/50 p-4">
          <p className="eyebrow text-brand-orange">In-Depth Explanation</p>
          <div className="space-y-2">
            <Label htmlFor="nut-biochem">Biochemical Function</Label>
            <Textarea
              id="nut-biochem"
              rows={5}
              value={biochemicalFunction}
              onChange={(e) => setBiochemicalFunction(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nut-where">Where It Is Located in Food</Label>
            <Textarea
              id="nut-where"
              rows={2}
              value={whereLocatedInFood}
              onChange={(e) => setWhereLocatedInFood(e.target.value)}
              required
            />
          </div>
        </div>

        <TagToggleGroup
          label="Age Bracket Highlights"
          options={AGE_GROUPS}
          selected={ageGroups}
          onChange={(next) => setAgeGroups(next as AgeGroup[])}
        />

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={saving}>
          {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {editingId ? "Save Nutrient Changes" : "Publish Nutrient"}
        </Button>
      </form>
    </div>
  );
}

function TagToggleGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() =>
                onChange(active ? selected.filter((item) => item !== opt) : [...selected, opt])
              }
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-brand-amber/60 bg-background text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <CheckSquare className="size-3.5 text-brand-amber" aria-hidden="true" />
              ) : (
                <Square className="size-3.5" aria-hidden="true" />
              )}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
