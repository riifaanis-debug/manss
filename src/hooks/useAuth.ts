import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

async function checkAdminRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    console.error('Admin role check failed:', error.message);
    return false;
  }

  return Boolean(data);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isActive = true;

    const syncAuthState = async (nextSession: Session | null) => {
      if (!isActive) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const admin = await checkAdminRole(nextSession.user.id);
        if (!isActive) return;
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }

      if (isActive) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      void syncAuthState(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      void syncAuthState(currentSession);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, signUp, signIn, signOut };
}
