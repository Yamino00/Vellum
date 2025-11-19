import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Caricamento profilo per userId:', userId);
      
      // Forza il ricaricamento dal database (no cache)
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Usa maybeSingle invece di single per evitare errori se non trova il record

      console.log('📥 Risposta database:', { data, error });

      if (error) {
        console.error('❌ Errore nel caricamento profilo:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Profilo caricato:', data);
        console.log('🔐 is_admin:', data.is_admin);
        setUserProfile(data);
      } else {
        console.warn('⚠️ Nessun profilo trovato per questo utente');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Il profilo verrà caricato automaticamente dal listener onAuthStateChange
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    // Registra l'utente con i metadati
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: userData.nome,
          cognome: userData.cognome,
          genere: userData.genere,
          eta: userData.eta,
        },
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      // Inserisci direttamente nella tabella utenti (il trigger potrebbe non attivarsi subito)
      const { error: profileError } = await supabase.from('utenti').insert({
        id: authData.user.id,
        email,
        nome: userData.nome || 'Nome',
        cognome: userData.cognome || 'Cognome',
        genere: userData.genere || 'Altro',
        eta: userData.eta || 18,
        is_admin: userData.is_admin || false,
      });

      if (profileError) {
        // Se l'inserimento fallisce (es. già esistente per via del trigger), ignora l'errore
        console.log('Profile insert handled by trigger or already exists:', profileError.message);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

