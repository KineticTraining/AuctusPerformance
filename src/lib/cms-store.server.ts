import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { readEnvFallback } from "./billing-store.server";
import {
  SEED_ARTICLES,
  SEED_NEWSLETTERS,
  SEED_NUTRITION,
  type ArticleSeedRow,
  type NewsletterIssue,
  type NutritionEntry,
} from "./mock-seed";
import { normalizeArticleCategory } from "./sports";

export type CmsState = {
  articles: ArticleSeedRow[];
  newsletters: NewsletterIssue[];
  nutrition: NutritionEntry[];
};

const CMS_GLOBAL_KEY = "__auctus_performance_cms_store__";
const SECRET_GLOBAL_KEY = "__auctus_performance_admin_hmac_secret__";
const HASH_GLOBAL_KEY = "__auctus_performance_admin_claimed_hash__";

export const LEGACY_FABRICATED_ARTICLE_SLUGS = new Set([
  "sleep-the-performance-drug",
  "rate-of-force-development",
  "hamstring-injury-prevention",
  "fueling-for-training",
  "mental-rehearsal",
  "training-load-acwr",
]);

export const LEGACY_FABRICATED_NEWSLETTER_IDS = new Set(["nl-012", "nl-013", "nl-014"]);

const g = globalThis as unknown as Record<string, unknown>;

function dataPath(filename: string): string {
  return resolve(process.cwd(), ".data", filename);
}

export function sanitizeCmsArticles(articles: ArticleSeedRow[]): ArticleSeedRow[] {
  return articles
    .filter((a) => !LEGACY_FABRICATED_ARTICLE_SLUGS.has(a.slug))
    .map((a) => ({
      ...a,
      category: normalizeArticleCategory(a.category),
    }));
}

export function sanitizeCmsNewsletters(newsletters: NewsletterIssue[]): NewsletterIssue[] {
  return newsletters.filter((n) => !LEGACY_FABRICATED_NEWSLETTER_IDS.has(n.id));
}

function readPersistedCms(): CmsState | null {
  try {
    const file = dataPath("cms-store.json");
    if (!existsSync(file)) return null;
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<CmsState>;
    if (
      !Array.isArray(parsed.articles) ||
      !Array.isArray(parsed.newsletters) ||
      !Array.isArray(parsed.nutrition)
    ) {
      return null;
    }
    const firstNut = parsed.nutrition[0] as Record<string, unknown> | undefined;
    const isLegacyNutrition =
      !firstNut ||
      typeof firstNut["performanceOneLiner"] !== "string" ||
      typeof firstNut["summarized"] !== "object" ||
      typeof firstNut["inDepth"] !== "object";

    const cleanArticles = sanitizeCmsArticles(parsed.articles);
    const cleanNewsletters = sanitizeCmsNewsletters(parsed.newsletters);

    return {
      articles: cleanArticles,
      newsletters: cleanNewsletters,
      nutrition: isLegacyNutrition ? structuredClone(SEED_NUTRITION) : parsed.nutrition,
    };
  } catch {
    return null;
  }
}

function persistCms(state: CmsState): void {
  try {
    const file = dataPath("cms-store.json");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Non-fatal in read-only runtimes; globalThis state remains active
  }
}

export function getCmsState(): CmsState {
  if (!g[CMS_GLOBAL_KEY]) {
    const persisted = readPersistedCms();
    g[CMS_GLOBAL_KEY] = persisted ?? {
      articles: structuredClone(SEED_ARTICLES),
      newsletters: structuredClone(SEED_NEWSLETTERS),
      nutrition: structuredClone(SEED_NUTRITION),
    };
  }
  return g[CMS_GLOBAL_KEY] as CmsState;
}

export function saveCmsState(next: CmsState): CmsState {
  g[CMS_GLOBAL_KEY] = next;
  persistCms(next);
  return next;
}

function getConfiguredEnvAdminKey(): string | undefined {
  return readEnvFallback("ADMIN_ACCESS_KEY") ?? readEnvFallback("VITE_ADMIN_KEY");
}

function readClaimedHash(): string | null {
  if (typeof g[HASH_GLOBAL_KEY] === "string" && g[HASH_GLOBAL_KEY]) {
    return g[HASH_GLOBAL_KEY] as string;
  }
  try {
    const file = dataPath("admin-key.hash");
    if (!existsSync(file)) return null;
    const val = readFileSync(file, "utf8").trim();
    if (val) {
      g[HASH_GLOBAL_KEY] = val;
      return val;
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveClaimedHash(hashRecord: string): void {
  g[HASH_GLOBAL_KEY] = hashRecord;
  try {
    const file = dataPath("admin-key.hash");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, hashRecord, { encoding: "utf8", mode: 0o600 });
  } catch {
    // Non-fatal
  }
}

export function getAdminKeyStatus(): {
  envConfigured: boolean;
  keyClaimed: boolean;
} {
  const envConfigured = Boolean(getConfiguredEnvAdminKey());
  const keyClaimed = envConfigured || Boolean(readClaimedHash());
  return { envConfigured, keyClaimed };
}

function hashScrypt(secret: string, saltHex?: string): string {
  const salt = saltHex ?? randomBytes(16).toString("hex");
  const derived = scryptSync(secret, salt, 32).toString("hex");
  return `${salt}:${derived}`;
}

function verifyScrypt(secret: string, storedRecord: string): boolean {
  const parts = storedRecord.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const candidate = scryptSync(secret, parts[0], 32);
  const expected = Buffer.from(parts[1], "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function verifyTimingSafeString(candidate: string, expected: string): boolean {
  const a = createHash("sha256").update(candidate, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function claimInitialAdminKey(newKey: string): void {
  const status = getAdminKeyStatus();
  if (status.envConfigured) {
    throw new Error("Admin key is already managed via server environment variables.");
  }
  if (status.keyClaimed) {
    throw new Error("Admin key has already been initialized. Enter your key to unlock.");
  }
  const hashed = hashScrypt(newKey);
  saveClaimedHash(hashed);
}

export function verifyAdminPasskey(submittedKey: string): boolean {
  const envKey = getConfiguredEnvAdminKey();
  if (envKey) {
    return verifyTimingSafeString(submittedKey, envKey);
  }
  const claimed = readClaimedHash();
  if (!claimed) {
    return false;
  }
  return verifyScrypt(submittedKey, claimed);
}

function getAdminHmacSecret(): string {
  if (typeof g[SECRET_GLOBAL_KEY] === "string" && g[SECRET_GLOBAL_KEY]) {
    return g[SECRET_GLOBAL_KEY] as string;
  }
  const configured =
    readEnvFallback("ADMIN_SESSION_SECRET") ??
    readEnvFallback("ADMIN_ACCESS_KEY") ??
    readEnvFallback("STRIPE_SECRET_KEY");
  const secret = configured
    ? createHash("sha256").update(`auctus-admin:${configured}`).digest("hex")
    : randomBytes(32).toString("hex");
  g[SECRET_GLOBAL_KEY] = secret;
  return secret;
}

export function issueAdminSessionToken(): { token: string; expiresAt: string } {
  const expMs = Date.now() + 8 * 60 * 60 * 1000;
  const payloadB64 = Buffer.from(
    JSON.stringify({ role: "admin", exp: expMs, nonce: randomBytes(8).toString("hex") }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", getAdminHmacSecret()).update(payloadB64).digest("base64url");
  return {
    token: `${payloadB64}.${sig}`,
    expiresAt: new Date(expMs).toISOString(),
  };
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [payloadB64, providedSig] = parts;
  const expectedSig = createHmac("sha256", getAdminHmacSecret())
    .update(payloadB64)
    .digest("base64url");
  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      role?: unknown;
      exp?: unknown;
    };
    if (decoded.role !== "admin") return false;
    if (typeof decoded.exp !== "number" || decoded.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
