import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public-supabase.server-Cc2kW9YE.js
/** Read-only publishable client for public data during SSR; no session persistence. */
function createPublicSupabase() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  return createClient(url, key, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, {
          ...init,
          headers: h,
        });
      },
    },
  });
}
//#endregion
export { createPublicSupabase };
