import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Session Timeout Logic
    const updateActivity = () => {
      localStorage.setItem('last_active_time', Date.now().toString());
    };

    // Check on mount if session is expired
    const checkSessionTimeout = async () => {
      const lastActive = localStorage.getItem('last_active_time');
      if (lastActive) {
        const diff = Date.now() - parseInt(lastActive, 10);
        // 5 minutes in milliseconds
        if (diff > 5 * 60 * 1000) {
          console.warn('Session expired due to inactivity (closed tab for > 5 mins)');
          await supabase.auth.signOut();
          localStorage.removeItem('last_active_time');
          return true; // Expired
        }
      }
      // If not expired, update timestamp
      updateActivity();
      return false; // Valid
    };

    // Start heartbeat to keep session alive while tab is open
    const activityInterval = setInterval(updateActivity, 10000); // Update every 10s

    // Safety timeout: force loading to false after 5 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.warn('Auth check timed out, forcing loading to false');
          return false;
        }
        return currentLoading;
      });
    }, 5000);

    // Initial Check
    checkSessionTimeout().then((expired) => {
      if (expired) {
        setLoading(false);
        return;
      }

      // Normal Auth Flow
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error checking session:', error);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }).catch((err) => {
        console.error('Unexpected error checking session:', err);
        setLoading(false);
      }).finally(() => {
        clearTimeout(safetyTimeout);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        updateActivity(); // Ensure we have a timestamp on login
      } else {
        setProfile(null);
        setLoading(false);
        localStorage.removeItem('last_active_time'); // Clear on logout
      }
    });

    return () => {
      subscription.unsubscribe();
      clearInterval(activityInterval);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // If profile doesn't exist, create a default 'user' profile
        // Only if we are in a real env, otherwise mock it for now
        console.error('Error fetching profile:', error);
      }
      
      if (data) {
        setProfile(data);
      } else {
        // Fallback for demo if no profile table yet
        setProfile({ id: userId, email: user?.email || '', role: 'user' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
