import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Provider, Session } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  AUTH_PROVIDERS,
  GOOGLE_OAUTH_PROVIDER,
  type AuthProviderConfig,
} from "@/lib/auth-providers";

type AuthState = {
  session: Session | null;
  ready: boolean;
  providers: Record<"google", AuthProviderConfig>;
  googleProvider: Provider;
};

const AuthContext = createContext<AuthState>({
  session: null,
  ready: false,
  providers: AUTH_PROVIDERS,
  googleProvider: GOOGLE_OAUTH_PROVIDER,
});

/** Single app-wide auth subscriber: keeps session state fresh and refreshes route/query data on identity changes. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    session: null,
    ready: false,
    providers: AUTH_PROVIDERS,
    googleProvider: GOOGLE_OAUTH_PROVIDER,
  });

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setState((prev) => ({ ...prev, session: data.session, ready: true })));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState((prev) => ({ ...prev, session, ready: true }));
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
