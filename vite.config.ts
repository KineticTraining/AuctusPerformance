// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Expose public Supabase browser env vars (URL + publishable key only; never service role key)
// when the host injects SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY without VITE_ prefixes.
function clientSupabaseEnvPlugin(): Plugin {
  const url = process.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key =
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  const readUrl =
    /import\.meta\.env(?:\.VITE_SUPABASE_URL\b|\[\s*(["'`])VITE_SUPABASE_URL\1\s*\])/g;
  const readKey =
    /import\.meta\.env(?:\.VITE_SUPABASE_PUBLISHABLE_KEY\b|\[\s*(["'`])VITE_SUPABASE_PUBLISHABLE_KEY\1\s*\])/g;

  return {
    name: "dusk-client-supabase-env",
    transform(code, id) {
      if (id.includes("/node_modules/") || !code.includes("VITE_SUPABASE_")) return;
      let next = code;
      if (url) next = next.replace(readUrl, JSON.stringify(url));
      if (key) next = next.replace(readKey, JSON.stringify(key));
      return next === code ? undefined : { code: next, map: null };
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: { preset: "node-server" },
  vite: {
    plugins: [clientSupabaseEnvPlugin()],
    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
      allowedHosts: true,
    },
  },
});
