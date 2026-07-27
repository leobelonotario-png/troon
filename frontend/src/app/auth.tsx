import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  getSupabaseClient,
  signIn,
  signOut as endSession,
} from '../shared/repositories/auth.repositories';

type AuthContextValue = {
  isAuthenticated: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): void;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      signIn,
      signOut() {
        void endSession();
      },
    }),
    [isAuthenticated],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider.');
  return auth;
}
