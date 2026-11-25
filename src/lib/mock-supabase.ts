import type {
  AuthChangeEvent,
  JwtPayload,
  Session,
  SignInWithOAuthCredentials,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SEED_ARTICLES, SEED_TECHNIQUES, SEED_VIDEOS } from "./mock-seed";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];

const SESSION_STORAGE_KEY = "kinetic_mock_session";
const USERS_STORAGE_KEY = "kinetic_mock_users";
const RECOVERY_STORAGE_KEY = "auctus_mock_recovery";

type StoredUser = {
  id: string;
  email: string;
  password: string;
  display_name: string;
  sport: string;
  level: string;
  age_group?: string;
};

type RecoveryState = {
  email: string;
  requestedAt: string;
};

type DbStore = {
  profiles: Map<string, ProfileRow>;
  submissions: SubmissionRow[];
};

const globalStoreKey = "__kinetic_mock_db_store__";
const g = globalThis as unknown as Record<string, DbStore | undefined>;
if (!g[globalStoreKey]) {
  g[globalStoreKey] = {
    profiles: new Map<string, ProfileRow>([
      [
        "00000000-0000-4000-8000-000000000001",
        {
          id: "00000000-0000-4000-8000-000000000001",
          display_name: "Jordan Ellis",
          sport: "Basketball",
          level: "Intermediate",
          created_at: "2026-10-01T12:00:00Z",
          updated_at: "2026-10-01T12:00:00Z",
        },
      ],
    ]),
    submissions: [],
  };
}
const serverStore = g[globalStoreKey]!;

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeMockJwt(payload: {
  sub: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): string {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

export function decodeMockJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const parsed = JSON.parse(fromBase64Url(parts[1])) as {
      sub?: unknown;
      email?: unknown;
      user_metadata?: Record<string, unknown>;
    };
    if (typeof parsed.sub !== "string" || !parsed.sub) return null;
    const now = Math.floor(Date.now() / 1000);
    return {
      iss: "mock-supabase",
      sub: parsed.sub,
      aud: "authenticated",
      exp: now + 3600 * 24 * 7,
      iat: now,
      role: "authenticated",
      aal: "aal1",
      session_id: "mock-session",
      ...(typeof parsed.email === "string" ? { email: parsed.email } : {}),
      ...(parsed.user_metadata ? { user_metadata: parsed.user_metadata } : {}),
    };
  } catch {
    return null;
  }
}

function makeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "00000000-0000-4000-8000-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}

function buildUser(info: {
  id: string;
  email: string;
  display_name?: string;
  sport?: string;
  level?: string;
  age_group?: string;
}): User {
  return {
    id: info.id,
    app_metadata: { provider: "email" },
    user_metadata: {
      display_name: info.display_name ?? "Jordan Ellis",
      sport: info.sport ?? "Basketball",
      level: info.level ?? "Intermediate",
      ...(info.age_group ? { age_group: info.age_group } : {}),
    },
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: info.email,
  };
}

function buildSession(user: User): Session {
  const token = encodeMockJwt({
    sub: user.id,
    ...(user.email ? { email: user.email } : {}),
    user_metadata: user.user_metadata,
  });
  return {
    access_token: token,
    refresh_token: "mock-refresh-token",
    expires_in: 3600 * 24 * 7,
    expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
    token_type: "bearer",
    user,
  };
}

function readStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function writeStoredSession(session: Session | null): void {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function readStoredUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredUser>;
  } catch {
    return {};
  }
}

function writeStoredUsers(users: Record<string, StoredUser>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage errors
  }
}

function readRecoveryState(): RecoveryState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RecoveryState;
  } catch {
    return null;
  }
}

function writeRecoveryState(state: RecoveryState | null): void {
  if (typeof window === "undefined") return;
  try {
    if (state) window.localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(state));
    else window.localStorage.removeItem(RECOVERY_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export type MockRpcAction =
  | {
      op: "select";
      table: "profiles" | "submissions";
      userId: string;
      filters: Array<{ col: string; val: unknown }>;
      orderCol?: string;
      ascending?: boolean;
      limitCount?: number;
    }
  | {
      op: "insert";
      table: "profiles" | "submissions";
      userId: string;
      payload: Record<string, unknown>;
    }
  | {
      op: "update";
      table: "profiles" | "submissions";
      userId: string;
      payload: Record<string, unknown>;
      filters: Array<{ col: string; val: unknown }>;
    }
  | {
      op: "delete";
      table: "profiles" | "submissions";
      userId: string;
      filters: Array<{ col: string; val: unknown }>;
    };

function applyFilters<T extends Record<string, unknown>>(
  rows: T[],
  filters: Array<{ col: string; val: unknown }>,
): T[] {
  return rows.filter((row) => filters.every((f) => row[f.col] === f.val));
}

function enrichSubmissions(
  rows: SubmissionRow[],
): Array<SubmissionRow & { technique: (typeof SEED_TECHNIQUES)[number] | null }> {
  return rows.map((sub) => ({
    ...sub,
    technique: sub.technique_id
      ? (SEED_TECHNIQUES.find((t) => t.id === sub.technique_id) ?? null)
      : null,
  }));
}

export function executeServerMockDb(action: MockRpcAction): {
  data: unknown;
  error: null | { message: string };
} {
  if (action.table === "profiles") {
    if (action.op === "select") {
      const all = Array.from(serverStore.profiles.values());
      const filtered = applyFilters(all as unknown as Record<string, unknown>[], action.filters);
      return { data: filtered, error: null };
    }
    if (action.op === "insert") {
      const id = String(action.payload["id"] ?? action.userId);
      const now = new Date().toISOString();
      const profile: ProfileRow = {
        id,
        display_name: String(action.payload["display_name"] ?? "Athlete"),
        sport: String(action.payload["sport"] ?? ""),
        level: String(action.payload["level"] ?? ""),
        created_at: now,
        updated_at: now,
      };
      serverStore.profiles.set(id, profile);
      return { data: [profile], error: null };
    }
    if (action.op === "update") {
      const existing = serverStore.profiles.get(action.userId);
      if (existing) {
        const updated: ProfileRow = {
          ...existing,
          ...action.payload,
          updated_at: new Date().toISOString(),
        };
        serverStore.profiles.set(action.userId, updated);
        return { data: [updated], error: null };
      }
      return { data: [], error: null };
    }
    return { data: [], error: null };
  }

  if (action.op === "select") {
    let rows = serverStore.submissions.filter((s) => !action.userId || s.user_id === action.userId);
    rows = applyFilters(
      rows as unknown as Record<string, unknown>[],
      action.filters,
    ) as unknown as SubmissionRow[];
    if (action.orderCol) {
      const col = action.orderCol;
      const asc = action.ascending !== false;
      rows = [...rows].sort((a, b) => {
        const av = String((a as unknown as Record<string, unknown>)[col] ?? "");
        const bv = String((b as unknown as Record<string, unknown>)[col] ?? "");
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    if (typeof action.limitCount === "number") {
      rows = rows.slice(0, action.limitCount);
    }
    return { data: enrichSubmissions(rows), error: null };
  }

  if (action.op === "insert") {
    const now = new Date().toISOString();
    const row: SubmissionRow = {
      id: typeof action.payload["id"] === "string" ? action.payload["id"] : makeUuid(),
      user_id:
        typeof action.payload["user_id"] === "string" ? action.payload["user_id"] : action.userId,
      title: String(action.payload["title"] ?? "Untitled rep"),
      video_url: String(action.payload["video_url"] ?? ""),
      technique_id:
        typeof action.payload["technique_id"] === "string" ? action.payload["technique_id"] : null,
      notes: String(action.payload["notes"] ?? ""),
      status: typeof action.payload["status"] === "string" ? action.payload["status"] : "pending",
      analysis: (action.payload["analysis"] as SubmissionRow["analysis"]) ?? null,
      error: typeof action.payload["error"] === "string" ? action.payload["error"] : null,
      created_at: now,
      analyzed_at:
        typeof action.payload["analyzed_at"] === "string" ? action.payload["analyzed_at"] : null,
    };
    serverStore.submissions.unshift(row);
    return { data: enrichSubmissions([row]), error: null };
  }

  if (action.op === "update") {
    const updated: SubmissionRow[] = [];
    serverStore.submissions = serverStore.submissions.map((s) => {
      const match = action.filters.every(
        (f) => (s as unknown as Record<string, unknown>)[f.col] === f.val,
      );
      if (!match) return s;
      const next = { ...s, ...action.payload } as SubmissionRow;
      updated.push(next);
      return next;
    });
    return { data: enrichSubmissions(updated), error: null };
  }

  if (action.op === "delete") {
    serverStore.submissions = serverStore.submissions.filter(
      (s) =>
        !action.filters.every((f) => (s as unknown as Record<string, unknown>)[f.col] === f.val),
    );
    return { data: [], error: null };
  }

  return { data: [], error: null };
}

async function runMockDbAction(
  action: MockRpcAction,
): Promise<{ data: unknown; error: null | { message: string } }> {
  if (typeof window === "undefined") {
    return executeServerMockDb(action);
  }
  try {
    const res = await fetch("/api/__mock-supabase", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action),
    });
    if (res.ok) {
      return (await res.json()) as { data: unknown; error: null | { message: string } };
    }
  } catch {
    // Fall back to in-memory store
  }
  return executeServerMockDb(action);
}

class MockQueryBuilder implements PromiseLike<{
  data: unknown;
  error: { message: string } | null;
}> {
  private table: string;
  private userId: string;
  private op: "select" | "insert" | "update" | "delete" = "select";
  private filters: Array<{ col: string; val: unknown }> = [];
  private orders: Array<{ col: string; ascending: boolean }> = [];
  private limitCount: number | undefined;
  private payload: Record<string, unknown> = {};
  private cardinality: "many" | "single" | "maybeSingle" = "many";

  constructor(table: string, userId: string) {
    this.table = table;
    this.userId = userId;
  }

  select(_columns?: string) {
    return this;
  }

  insert(values: Record<string, unknown> | Array<Record<string, unknown>>) {
    this.op = "insert";
    this.payload = Array.isArray(values) ? (values[0] ?? {}) : values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.op = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push({ col, val });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, ascending: opts?.ascending ?? true });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.cardinality = "single";
    return this;
  }

  maybeSingle() {
    this.cardinality = "maybeSingle";
    return this;
  }

  private async execute(): Promise<{ data: unknown; error: { message: string } | null }> {
    let rows: Record<string, unknown>[] = [];
    let error: { message: string } | null = null;

    if (this.table === "articles") {
      rows = [...SEED_ARTICLES] as unknown as Record<string, unknown>[];
      rows = applyFilters(rows, this.filters);
      for (const o of [...this.orders].reverse()) {
        rows.sort((a, b) => {
          const av = String(a[o.col] ?? "");
          const bv = String(b[o.col] ?? "");
          return o.ascending ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      if (typeof this.limitCount === "number") rows = rows.slice(0, this.limitCount);
    } else if (this.table === "videos") {
      rows = [...SEED_VIDEOS] as unknown as Record<string, unknown>[];
      rows = applyFilters(rows, this.filters);
      for (const o of [...this.orders].reverse()) {
        rows.sort((a, b) => {
          const av = a[o.col];
          const bv = b[o.col];
          if (typeof av === "number" && typeof bv === "number") {
            return o.ascending ? av - bv : bv - av;
          }
          return o.ascending
            ? String(av ?? "").localeCompare(String(bv ?? ""))
            : String(bv ?? "").localeCompare(String(av ?? ""));
        });
      }
      if (typeof this.limitCount === "number") rows = rows.slice(0, this.limitCount);
    } else if (this.table === "techniques") {
      rows = [...SEED_TECHNIQUES] as unknown as Record<string, unknown>[];
      rows = applyFilters(rows, this.filters);
      for (const o of [...this.orders].reverse()) {
        rows.sort((a, b) => {
          const av = String(a[o.col] ?? "");
          const bv = String(b[o.col] ?? "");
          return o.ascending ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      if (typeof this.limitCount === "number") rows = rows.slice(0, this.limitCount);
    } else if (this.table === "profiles" || this.table === "submissions") {
      const firstOrder = this.orders[0];
      const action: MockRpcAction =
        this.op === "select"
          ? {
              op: "select",
              table: this.table,
              userId: this.userId,
              filters: this.filters,
              ...(firstOrder ? { orderCol: firstOrder.col, ascending: firstOrder.ascending } : {}),
              ...(typeof this.limitCount === "number" ? { limitCount: this.limitCount } : {}),
            }
          : this.op === "insert"
            ? { op: "insert", table: this.table, userId: this.userId, payload: this.payload }
            : this.op === "update"
              ? {
                  op: "update",
                  table: this.table,
                  userId: this.userId,
                  payload: this.payload,
                  filters: this.filters,
                }
              : { op: "delete", table: this.table, userId: this.userId, filters: this.filters };

      const res = await runMockDbAction(action);
      rows = Array.isArray(res.data) ? (res.data as Record<string, unknown>[]) : [];
      error = res.error;
    }

    if (this.cardinality === "single") {
      if (rows.length === 0) return { data: null, error: error ?? { message: "Row not found" } };
      return { data: rows[0] ?? null, error };
    }
    if (this.cardinality === "maybeSingle") {
      return { data: rows[0] ?? null, error };
    }
    return { data: rows, error };
  }

  then<TResult1 = { data: unknown; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: unknown;
          error: { message: string } | null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const listeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

function notifyAuthListeners(event: AuthChangeEvent, session: Session | null) {
  for (const cb of listeners) {
    try {
      cb(event, session);
    } catch (err) {
      console.error("Mock auth listener error:", err);
    }
  }
}

export function getMockPendingRecoveryEmail(): string | null {
  return readRecoveryState()?.email ?? null;
}

export function createMockSupabaseClient(fixedUserId?: string): SupabaseClient<Database> {
  const client = {
    auth: {
      async getSession() {
        return { data: { session: readStoredSession() }, error: null };
      },
      async getUser() {
        const session = readStoredSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              id: "mock-sub",
              callback,
              unsubscribe: () => {
                listeners.delete(callback);
              },
            },
          },
        };
      },
      async signUp(params: {
        email: string;
        password: string;
        options?: {
          data?: { display_name?: string; sport?: string; level?: string; age_group?: string };
        };
      }) {
        const email = params.email.trim().toLowerCase();
        const users = readStoredUsers();
        const existing = users[email];
        const id = existing?.id ?? makeUuid();
        const display_name = params.options?.data?.display_name ?? email.split("@")[0] ?? "Athlete";
        const sport = params.options?.data?.sport ?? "Basketball";
        const level = params.options?.data?.level ?? "Intermediate";
        const age_group = params.options?.data?.age_group ?? "Young Adult (18–29)";
        users[email] = {
          id,
          email,
          password: params.password,
          display_name,
          sport,
          level,
          age_group,
        };
        writeStoredUsers(users);

        await runMockDbAction({
          op: "insert",
          table: "profiles",
          userId: id,
          payload: { id, display_name, sport, level },
        });

        const user = buildUser({ id, email, display_name, sport, level, age_group });
        const session = buildSession(user);
        writeStoredSession(session);
        notifyAuthListeners("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      async signInWithPassword(params: { email: string; password: string }) {
        const email = params.email.trim().toLowerCase();
        if (typeof window !== "undefined") {
          try {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, password: params.password }),
            });
            const body = (await res.json()) as {
              access_token?: string;
              refresh_token?: string;
              error?: string;
            };
            if (!res.ok || !body.access_token || !body.refresh_token) {
              return {
                data: { user: null, session: null },
                error: { message: body.error ?? "Invalid login credentials" },
              };
            }
            return await client.auth.setSession({
              access_token: body.access_token,
              refresh_token: body.refresh_token,
            });
          } catch {
            return {
              data: { user: null, session: null },
              error: { message: "Unable to verify credentials right now." },
            };
          }
        }
        return {
          data: { user: null, session: null },
          error: { message: "Invalid login credentials" },
        };
      },
      async signInWithOAuth(credentials: SignInWithOAuthCredentials) {
        if (credentials.provider !== "google") {
          return {
            data: { provider: credentials.provider, url: null },
            error: { message: `Provider ${credentials.provider} is not enabled.` },
          };
        }
        return {
          data: {
            provider: "google" as const,
            url: credentials.options?.redirectTo ?? "/auth/callback",
          },
          error: null,
        };
      },
      async exchangeCodeForSession(_authCode: string) {
        const existing = readStoredSession();
        if (existing) {
          return { data: { user: existing.user, session: existing }, error: null };
        }
        return {
          data: { user: null, session: null },
          error: { message: "No OAuth code session available in local fallback mode." },
        };
      },
      async signInDemo() {
        const id = "00000000-0000-4000-8000-000000000001";
        const user = buildUser({
          id,
          email: "demo@auctusperformance.com",
          display_name: "Jordan Ellis",
          sport: "Basketball",
          level: "Intermediate",
          age_group: "Young Adult (18–29)",
        });
        await runMockDbAction({
          op: "insert",
          table: "profiles",
          userId: id,
          payload: { id, display_name: "Jordan Ellis", sport: "Basketball", level: "Intermediate" },
        });
        const session = buildSession(user);
        writeStoredSession(session);
        notifyAuthListeners("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        writeStoredSession(null);
        if (typeof window !== "undefined") {
          fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        }
        notifyAuthListeners("SIGNED_OUT", null);
        return { error: null };
      },
      async resetPasswordForEmail(email: string) {
        const normalized = email.trim().toLowerCase();
        writeRecoveryState({ email: normalized, requestedAt: new Date().toISOString() });
        return { data: {}, error: null };
      },
      async updateUser(attrs: { password?: string }) {
        const session = readStoredSession();
        const recovery = readRecoveryState();
        const targetEmail = session?.user?.email?.toLowerCase() ?? recovery?.email?.toLowerCase();

        if (!targetEmail) {
          return {
            data: { user: null },
            error: { message: "Auth session missing. Request a fresh password reset link first." },
          };
        }

        const users = readStoredUsers();
        const existing = users[targetEmail];
        if (attrs.password) {
          if (typeof window !== "undefined") {
            await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email: targetEmail, password: attrs.password }),
            }).catch(() => {});
          }
          const id = existing?.id ?? session?.user?.id ?? makeUuid();
          const updatedUser: StoredUser = {
            id,
            email: targetEmail,
            password: attrs.password,
            display_name: existing?.display_name ?? targetEmail.split("@")[0] ?? "Athlete",
            sport: existing?.sport ?? "Basketball",
            level: existing?.level ?? "Intermediate",
            ...(existing?.age_group ? { age_group: existing.age_group } : {}),
          };
          users[targetEmail] = updatedUser;
          writeStoredUsers(users);
          writeRecoveryState(null);

          const user = buildUser(updatedUser);
          const nextSession = buildSession(user);
          writeStoredSession(nextSession);
          notifyAuthListeners("USER_UPDATED", nextSession);
          return { data: { user }, error: null };
        }

        return { data: { user: session?.user ?? null }, error: null };
      },
      async setSession(tokens: { access_token: string; refresh_token: string }) {
        const claims = decodeMockJwt(tokens.access_token);
        const meta = (claims?.["user_metadata"] ?? {}) as Record<string, unknown>;
        const user = buildUser({
          id: claims?.sub ?? "00000000-0000-4000-8000-000000000001",
          email: claims?.email ?? "demo@auctusperformance.com",
          ...(typeof meta["display_name"] === "string"
            ? { display_name: meta["display_name"] }
            : {}),
          ...(typeof meta["sport"] === "string" ? { sport: meta["sport"] } : {}),
          ...(typeof meta["level"] === "string" ? { level: meta["level"] } : {}),
          ...(typeof meta["age_group"] === "string" ? { age_group: meta["age_group"] } : {}),
        });
        const session: Session = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: 3600 * 24 * 7,
          expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 7,
          token_type: "bearer",
          user,
        };
        writeStoredSession(session);
        notifyAuthListeners("SIGNED_IN", session);
        return { data: { user, session }, error: null };
      },
      async getClaims(token?: string) {
        if (!token) return { data: null, error: new Error("Missing token") };
        const claims = decodeMockJwt(token);
        if (!claims) return { data: null, error: new Error("Invalid token") };
        return { data: { claims }, error: null };
      },
    },
    from(table: string) {
      const uid =
        fixedUserId ?? readStoredSession()?.user?.id ?? "00000000-0000-4000-8000-000000000001";
      return new MockQueryBuilder(table, uid);
    },
  };

  return client as unknown as SupabaseClient<Database>;
}
