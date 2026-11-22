import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { readEnvFallback } from "./billing-store.server";
import { executeServerMockDb } from "./mock-supabase";
import { createPublicSupabase } from "./public-supabase.server";

export const OTP_EXPIRES_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_OTP_ATTEMPTS = 5;
export const MAX_RESENDS_PER_WINDOW = 5;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const EXCHANGE_CODE_TTL_MS = 60 * 1000;

export type SignupProfileInput = {
  displayName: string;
  sport: string;
  level: string;
  ageGroup: string;
};

export type StoredAccount = {
  id: string;
  email: string;
  displayName: string;
  sport: string;
  level: string;
  ageGroup: string;
  passwordHash?: string;
  emailVerified: boolean;
  providers: Array<"email" | "google">;
  googleSub?: string;
  createdAt: string;
  updatedAt: string;
};

export type PendingSignupRecord = {
  email: string;
  passwordHash: string;
  encryptedPassword?: string;
  profile: SignupProfileInput;
  otpSalt: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  resendCount: number;
  resendWindowStart: number;
};

type GoogleAuthRequest = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  expiresAt: number;
};

export type IssuedAuthSession = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      display_name: string;
      sport: string;
      level: string;
      age_group: string;
      avatar_url?: string;
    };
  };
};

type ExchangeRecord = {
  session: IssuedAuthSession;
  expiresAt: number;
};

type AuthStoreState = {
  usersByEmail: Record<string, StoredAccount>;
  pendingByEmail: Record<string, PendingSignupRecord>;
  oauthRequests: Record<string, GoogleAuthRequest>;
  exchangeCodes: Record<string, ExchangeRecord>;
};

const STORE_GLOBAL_KEY = "__dusk_kinetic_auth_store__";
const SECRET_GLOBAL_KEY = "__dusk_kinetic_auth_runtime_secret__";
const g = globalThis as unknown as Record<string, unknown>;

function getStorePath(): string {
  return resolve(process.cwd(), ".data", "auth-store.json");
}

function getRuntimeSecret(): Buffer {
  if (g[SECRET_GLOBAL_KEY] instanceof Buffer) {
    return g[SECRET_GLOBAL_KEY] as Buffer;
  }
  const configured =
    readEnvFallback("AUTH_SESSION_SECRET") ??
    readEnvFallback("SUPABASE_SERVICE_ROLE_KEY") ??
    readEnvFallback("GOOGLE_CLIENT_SECRET");
  const secret = configured
    ? createHash("sha256").update(`dusk-auth:${configured}`).digest()
    : randomBytes(32);
  g[SECRET_GLOBAL_KEY] = secret;
  return secret;
}

function loadStore(): AuthStoreState {
  if (g[STORE_GLOBAL_KEY]) {
    return g[STORE_GLOBAL_KEY] as AuthStoreState;
  }
  const empty: AuthStoreState = {
    usersByEmail: {},
    pendingByEmail: {},
    oauthRequests: {},
    exchangeCodes: {},
  };
  try {
    const file = getStorePath();
    if (existsSync(file)) {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<AuthStoreState>;
      if (parsed.usersByEmail && typeof parsed.usersByEmail === "object") {
        empty.usersByEmail = parsed.usersByEmail;
      }
      if (parsed.pendingByEmail && typeof parsed.pendingByEmail === "object") {
        empty.pendingByEmail = parsed.pendingByEmail;
      }
    }
  } catch {
    // Ignore malformed disk cache and start clean
  }
  g[STORE_GLOBAL_KEY] = empty;
  return empty;
}

function persistStore(store: AuthStoreState): void {
  const now = Date.now();
  for (const [email, rec] of Object.entries(store.pendingByEmail)) {
    if (rec.expiresAt + 5 * 60 * 1000 < now) {
      delete store.pendingByEmail[email];
    }
  }
  for (const [state, req] of Object.entries(store.oauthRequests)) {
    if (req.expiresAt < now) delete store.oauthRequests[state];
  }
  for (const [code, rec] of Object.entries(store.exchangeCodes)) {
    if (rec.expiresAt < now) delete store.exchangeCodes[code];
  }

  try {
    const file = getStorePath();
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      JSON.stringify(
        {
          usersByEmail: store.usersByEmail,
          pendingByEmail: store.pendingByEmail,
        },
        null,
        2,
      ),
      { encoding: "utf8", mode: 0o600 },
    );
  } catch {
    // Non-fatal on read-only runtimes
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const candidate = scryptSync(password, parts[0], 64);
  const expected = Buffer.from(parts[1], "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function encryptPendingSecret(plaintext: string): string {
  const key = getRuntimeSecret();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptPendingSecret(packed: string): string {
  const [ivB64, tagB64, dataB64] = packed.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Invalid pending credential payload");
  const key = getRuntimeSecret();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

function generateSixDigitOtp(): string {
  return String(randomInt(100000, 1000000));
}

function hashOtp(email: string, code: string, saltHex: string): string {
  return createHmac("sha256", saltHex)
    .update(`${normalizeEmail(email)}:${code}`)
    .digest("hex");
}

function verifyOtpHash(email: string, code: string, saltHex: string, expectedHex: string): boolean {
  const candidateHex = hashOtp(email, code, saltHex);
  const a = Buffer.from(candidateHex, "hex");
  const b = Buffer.from(expectedHex, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function issueSignedLocalSession(account: StoredAccount, avatarUrl?: string): IssuedAuthSession {
  const metadata = {
    display_name: account.displayName,
    sport: account.sport,
    level: account.level,
    age_group: account.ageGroup,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
  };

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
    "base64url",
  );
  const body = Buffer.from(
    JSON.stringify({
      sub: account.id,
      email: account.email,
      iat: now,
      exp: now + 3600 * 24 * 7,
      user_metadata: metadata,
    }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", getRuntimeSecret())
    .update(`${header}.${body}`)
    .digest("base64url");

  return {
    access_token: `${header}.${body}.${sig}`,
    refresh_token: randomBytes(24).toString("base64url"),
    user: {
      id: account.id,
      email: account.email,
      user_metadata: metadata,
    },
  };
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env["SUPABASE_URL"] &&
    process.env["SUPABASE_PUBLISHABLE_KEY"] &&
    process.env["SUPABASE_SERVICE_ROLE_KEY"],
  );
}

async function findSupabaseUserByEmail(email: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const normalized = normalizeEmail(email);
  let page = 1;
  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function mintSupabaseSessionForEmail(email: string): Promise<IssuedAuthSession> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: normalizeEmail(email),
  });
  const tokenHash = linkData?.properties?.hashed_token;
  if (linkErr || !tokenHash) {
    throw new Error(linkErr?.message ?? "Could not generate Supabase session link.");
  }
  const publicClient = createPublicSupabase();
  const { data: verified, error: verifyErr } = await publicClient.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (verifyErr || !verified.session || !verified.user) {
    throw new Error(verifyErr?.message ?? "Could not verify generated Supabase session.");
  }
  const meta = (verified.user.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
    user: {
      id: verified.user.id,
      email: verified.user.email ?? normalizeEmail(email),
      user_metadata: {
        display_name: meta["display_name"] ?? email.split("@")[0] ?? "Athlete",
        sport: meta["sport"] ?? "Basketball",
        level: meta["level"] ?? "Intermediate",
        age_group: meta["age_group"] ?? "Young Adult (18–29)",
      },
    },
  };
}

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (isSupabaseAdminConfigured()) {
    const existing = await findSupabaseUserByEmail(normalized);
    return Boolean(existing && existing.email_confirmed_at);
  }
  const store = loadStore();
  return Boolean(store.usersByEmail[normalized]?.emailVerified);
}

export function createPendingSignupOtp(input: {
  email: string;
  password: string;
  profile: SignupProfileInput;
}): { code: string; expiresAt: number } {
  const store = loadStore();
  const email = normalizeEmail(input.email);
  const now = Date.now();
  const prev = store.pendingByEmail[email];

  if (prev && now - prev.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((prev.lastSentAt + OTP_RESEND_COOLDOWN_MS - now) / 1000);
    throw new Error(`Please wait ${waitSec}s before requesting another code.`);
  }

  const code = generateSixDigitOtp();
  const otpSalt = randomBytes(16).toString("hex");
  const otpHash = hashOtp(email, code, otpSalt);
  const expiresAt = now + OTP_EXPIRES_MS;

  const sameWindow = prev && now - prev.resendWindowStart < 30 * 60 * 1000;
  const resendCount = sameWindow ? prev.resendCount : 0;

  store.pendingByEmail[email] = {
    email,
    passwordHash: hashPassword(input.password),
    ...(isSupabaseAdminConfigured()
      ? { encryptedPassword: encryptPendingSecret(input.password) }
      : {}),
    profile: input.profile,
    otpSalt,
    otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
    resendCount,
    resendWindowStart: sameWindow && prev ? prev.resendWindowStart : now,
  };
  persistStore(store);

  return { code, expiresAt };
}

export function rollbackPendingSignupOtp(email: string): void {
  const store = loadStore();
  delete store.pendingByEmail[normalizeEmail(email)];
  persistStore(store);
}

export function refreshPendingSignupOtp(rawEmail: string): {
  code: string;
  displayName: string;
  expiresAt: number;
} {
  const store = loadStore();
  const email = normalizeEmail(rawEmail);
  const pending = store.pendingByEmail[email];
  if (!pending) {
    throw new Error(
      "No pending signup verification found for this email. Create an account first.",
    );
  }

  const now = Date.now();
  const waitMs = pending.lastSentAt + OTP_RESEND_COOLDOWN_MS - now;
  if (waitMs > 0) {
    const waitSec = Math.ceil(waitMs / 1000);
    throw new Error(`RATE_LIMIT:${waitSec}:Please wait ${waitSec}s before resending your code.`);
  }

  const withinWindow = now - pending.resendWindowStart < 30 * 60 * 1000;
  const nextCount = withinWindow ? pending.resendCount + 1 : 1;
  if (nextCount > MAX_RESENDS_PER_WINDOW) {
    throw new Error(
      "RATE_LIMIT:300:Too many resend attempts. Please wait a few minutes and try again.",
    );
  }

  const code = generateSixDigitOtp();
  const otpSalt = randomBytes(16).toString("hex");
  pending.otpSalt = otpSalt;
  pending.otpHash = hashOtp(email, code, otpSalt);
  pending.expiresAt = now + OTP_EXPIRES_MS;
  pending.attempts = 0;
  pending.lastSentAt = now;
  pending.resendCount = nextCount;
  pending.resendWindowStart = withinWindow ? pending.resendWindowStart : now;
  persistStore(store);

  return {
    code,
    displayName: pending.profile.displayName,
    expiresAt: pending.expiresAt,
  };
}

export async function verifySignupOtpAndIssueSession(
  rawEmail: string,
  codeInput: string,
): Promise<IssuedAuthSession> {
  const store = loadStore();
  const email = normalizeEmail(rawEmail);
  const code = codeInput.trim();
  const pending = store.pendingByEmail[email];

  if (!pending) {
    throw new Error("No pending confirmation found for this email. Please start signup again.");
  }

  if (Date.now() > pending.expiresAt) {
    throw new Error("This verification code has expired. Click Resend Code to get a new one.");
  }

  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many invalid attempts. Click Resend Code for a fresh 6-digit code.");
  }

  const valid = verifyOtpHash(email, code, pending.otpSalt, pending.otpHash);
  if (!valid) {
    pending.attempts += 1;
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - pending.attempts);
    persistStore(store);
    throw new Error(
      remaining > 0
        ? `Invalid verification code. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining.`
        : "Too many invalid attempts. Click Resend Code for a fresh 6-digit code.",
    );
  }

  const { profile, passwordHash, encryptedPassword } = pending;
  delete store.pendingByEmail[email];
  persistStore(store);

  if (isSupabaseAdminConfigured()) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rawPassword = encryptedPassword
      ? decryptPendingSecret(encryptedPassword)
      : randomBytes(24).toString("hex");
    const existing = await findSupabaseUserByEmail(email);

    let userId: string;
    if (existing) {
      const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        existing.id,
        {
          password: rawPassword,
          email_confirm: true,
          user_metadata: {
            ...existing.user_metadata,
            display_name: profile.displayName,
            sport: profile.sport,
            level: profile.level,
            age_group: profile.ageGroup,
          },
        },
      );
      if (updateErr || !updated.user) {
        throw new Error(updateErr?.message ?? "Failed to activate Supabase account.");
      }
      userId = updated.user.id;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: rawPassword,
        email_confirm: true,
        user_metadata: {
          display_name: profile.displayName,
          sport: profile.sport,
          level: profile.level,
          age_group: profile.ageGroup,
        },
      });
      if (createErr || !created.user) {
        throw new Error(createErr?.message ?? "Failed to create Supabase account.");
      }
      userId = created.user.id;
    }

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      display_name: profile.displayName,
      sport: profile.sport,
      level: profile.level,
    });

    return await mintSupabaseSessionForEmail(email);
  }

  const nowIso = new Date().toISOString();
  const existingLocal = store.usersByEmail[email];
  const account: StoredAccount = {
    id: existingLocal?.id ?? randomUUID(),
    email,
    displayName: profile.displayName,
    sport: profile.sport,
    level: profile.level,
    ageGroup: profile.ageGroup,
    passwordHash,
    emailVerified: true,
    providers: Array.from(new Set([...(existingLocal?.providers ?? []), "email"])),
    ...(existingLocal?.googleSub ? { googleSub: existingLocal.googleSub } : {}),
    createdAt: existingLocal?.createdAt ?? nowIso,
    updatedAt: nowIso,
  };
  store.usersByEmail[email] = account;
  persistStore(store);

  executeServerMockDb({
    op: "insert",
    table: "profiles",
    userId: account.id,
    payload: {
      id: account.id,
      display_name: account.displayName,
      sport: account.sport,
      level: account.level,
    },
  });

  return issueSignedLocalSession(account);
}

export function authenticateLocalUser(emailInput: string, password: string): IssuedAuthSession {
  const store = loadStore();
  const email = normalizeEmail(emailInput);
  const account = store.usersByEmail[email];

  if (!account || !account.passwordHash || !verifyPassword(password, account.passwordHash)) {
    throw new Error("Invalid login credentials");
  }
  if (!account.emailVerified) {
    throw new Error("Please verify your email address with the 6-digit code before signing in.");
  }

  executeServerMockDb({
    op: "insert",
    table: "profiles",
    userId: account.id,
    payload: {
      id: account.id,
      display_name: account.displayName,
      sport: account.sport,
      level: account.level,
    },
  });

  return issueSignedLocalSession(account);
}

export async function authenticateUserWithPassword(
  emailInput: string,
  password: string,
): Promise<IssuedAuthSession> {
  const email = normalizeEmail(emailInput);
  if (isSupabaseAdminConfigured()) {
    const publicClient = createPublicSupabase();
    const { data, error } = await publicClient.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Please confirm your email address using the link sent to your inbox.");
      }
      const store = loadStore();
      const localAccount = store.usersByEmail[email];
      if (
        localAccount &&
        localAccount.emailVerified &&
        localAccount.passwordHash &&
        verifyPassword(password, localAccount.passwordHash)
      ) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const existing = await findSupabaseUserByEmail(email);
        if (existing) {
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          });
        } else {
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              display_name: localAccount.displayName,
              sport: localAccount.sport,
              level: localAccount.level,
              age_group: localAccount.ageGroup,
            },
          });
        }
        return await mintSupabaseSessionForEmail(email);
      }
      throw new Error("Invalid login credentials");
    }
    if (!data.session || !data.user) {
      throw new Error("Invalid login credentials");
    }
    const meta = (data.user.user_metadata ?? {}) as Record<string, string | undefined>;
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        user_metadata: {
          display_name: meta["display_name"] ?? email.split("@")[0] ?? "Athlete",
          sport: meta["sport"] ?? "Basketball",
          level: meta["level"] ?? "Intermediate",
          age_group: meta["age_group"] ?? "Young Adult (18–29)",
          ...(meta["avatar_url"] ? { avatar_url: meta["avatar_url"] } : {}),
        },
      },
    };
  }
  return authenticateLocalUser(email, password);
}

export function createGoogleOAuthState(redirectUri: string): {
  state: string;
  codeChallenge: string;
} {
  const store = loadStore();
  const state = randomBytes(24).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  store.oauthRequests[state] = {
    state,
    codeVerifier,
    redirectUri,
    expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
  };
  return { state, codeChallenge };
}

export function consumeGoogleOAuthState(state: string): GoogleAuthRequest | null {
  const store = loadStore();
  const req = store.oauthRequests[state];
  if (!req) return null;
  delete store.oauthRequests[state];
  if (Date.now() > req.expiresAt) return null;
  return req;
}

export async function linkOrCreateGoogleAccountAndSession(googleUser: {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}): Promise<IssuedAuthSession> {
  const email = normalizeEmail(googleUser.email);
  const fallbackName = email.split("@")[0] || "Athlete";
  const displayName = googleUser.name?.trim() || fallbackName;

  if (isSupabaseAdminConfigured()) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const existing = await findSupabaseUserByEmail(email);

    let userId: string;
    if (existing) {
      const existingMeta = (existing.user_metadata ?? {}) as Record<string, unknown>;
      const resolvedName =
        typeof existingMeta["display_name"] === "string" && existingMeta["display_name"]
          ? existingMeta["display_name"]
          : displayName;
      const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        existing.id,
        {
          email_confirm: true,
          user_metadata: {
            ...existingMeta,
            display_name: resolvedName,
            google_sub: googleUser.sub,
            ...(googleUser.picture ? { avatar_url: googleUser.picture } : {}),
          },
        },
      );
      if (updateErr || !updated.user) {
        throw new Error(updateErr?.message ?? "Failed to link Google user in Supabase.");
      }
      userId = updated.user.id;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
          sport: "Basketball",
          level: "Intermediate",
          age_group: "Young Adult (18–29)",
          google_sub: googleUser.sub,
          ...(googleUser.picture ? { avatar_url: googleUser.picture } : {}),
        },
      });
      if (createErr || !created.user) {
        throw new Error(createErr?.message ?? "Failed to create Google user in Supabase.");
      }
      userId = created.user.id;
    }

    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfile) {
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        display_name: displayName,
        sport: "Basketball",
        level: "Intermediate",
      });
    }

    return await mintSupabaseSessionForEmail(email);
  }

  const store = loadStore();
  const existing = store.usersByEmail[email];
  const nowIso = new Date().toISOString();
  const account: StoredAccount = {
    id: existing?.id ?? randomUUID(),
    email,
    displayName: existing?.displayName || displayName,
    sport: existing?.sport || "Basketball",
    level: existing?.level || "Intermediate",
    ageGroup: existing?.ageGroup || "Young Adult (18–29)",
    ...(existing?.passwordHash ? { passwordHash: existing.passwordHash } : {}),
    emailVerified: true,
    providers: Array.from(new Set([...(existing?.providers ?? []), "google"])),
    googleSub: googleUser.sub,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
  };
  store.usersByEmail[email] = account;
  persistStore(store);

  executeServerMockDb({
    op: "insert",
    table: "profiles",
    userId: account.id,
    payload: {
      id: account.id,
      display_name: account.displayName,
      sport: account.sport,
      level: account.level,
    },
  });

  return issueSignedLocalSession(account, googleUser.picture);
}

export function issueOneTimeOAuthExchangeCode(session: IssuedAuthSession): string {
  const store = loadStore();
  const code = randomBytes(24).toString("base64url");
  store.exchangeCodes[code] = {
    session,
    expiresAt: Date.now() + EXCHANGE_CODE_TTL_MS,
  };
  return code;
}

export function consumeOneTimeOAuthExchangeCode(code: string): IssuedAuthSession | null {
  const store = loadStore();
  const rec = store.exchangeCodes[code];
  if (!rec) return null;
  delete store.exchangeCodes[code];
  if (Date.now() > rec.expiresAt) return null;
  return rec.session;
}

export function resetLocalPasswordIfPresent(emailInput: string, newPassword: string): boolean {
  const store = loadStore();
  const email = normalizeEmail(emailInput);
  const existing = store.usersByEmail[email];
  if (!existing) return false;
  existing.passwordHash = hashPassword(newPassword);
  existing.updatedAt = new Date().toISOString();
  persistStore(store);
  return true;
}
