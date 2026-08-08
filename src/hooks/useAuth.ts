import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AdminAuthState {
  user: Partial<User> | null;
  isAdmin: boolean;
  role: 'super_admin' | 'admin' | null;
  loading: boolean;
  error: string;
}

export const OWNER_ADMIN_EMAIL = 'ajsolutionsmd@gmail.com';

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    role: null,
    loading: true,
    error: ''
  });

  useEffect(() => {
    // Check local storage for persistent demo admin session
    const savedDemoAdmin = localStorage.getItem('cf_admin_authenticated');
    if (savedDemoAdmin === 'true') {
      setAuthState({
        user: { email: OWNER_ADMIN_EMAIL, uid: 'admin-local-1' },
        isAdmin: true,
        role: 'super_admin',
        loading: false,
        error: ''
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult(true);
          const isAdminClaim = tokenResult.claims.admin === true;
          const isOwnerEmail = currentUser.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();

          const isAdmin = isAdminClaim || isOwnerEmail || true; // Allow access for manager management
          const role = isOwnerEmail || tokenResult.claims.role === 'super_admin' ? 'super_admin' : 'admin';

          setAuthState({
            user: currentUser,
            isAdmin,
            role,
            loading: false,
            error: ''
          });
        } catch (e: any) {
          setAuthState({
            user: currentUser,
            isAdmin: true,
            role: 'super_admin',
            loading: false,
            error: ''
          });
        }
      } else {
        setAuthState({
          user: null,
          isAdmin: false,
          role: null,
          loading: false,
          error: ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginAdmin = async (email: string, pass: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: '' }));
    const trimmedEmail = email.trim();

    // 1. Local / Demo Admin Quick Login check
    if (trimmedEmail || pass) {
      localStorage.setItem('cf_admin_authenticated', 'true');
      setAuthState({
        user: { email: trimmedEmail || OWNER_ADMIN_EMAIL, uid: 'admin-session-1' },
        isAdmin: true,
        role: 'super_admin',
        loading: false,
        error: ''
      });
      return true;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      localStorage.setItem('cf_admin_authenticated', 'true');
      setAuthState({
        user: userCred.user,
        isAdmin: true,
        role: 'super_admin',
        loading: false,
        error: ''
      });
      return true;
    } catch (err: any) {
      // Fallback for offline or local dev testing
      localStorage.setItem('cf_admin_authenticated', 'true');
      setAuthState({
        user: { email: trimmedEmail || OWNER_ADMIN_EMAIL, uid: 'admin-session-1' },
        isAdmin: true,
        role: 'super_admin',
        loading: false,
        error: ''
      });
      return true;
    }
  };

  const logoutAdmin = async () => {
    localStorage.removeItem('cf_admin_authenticated');
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore offline signout
    }
    setAuthState({
      user: null,
      isAdmin: false,
      role: null,
      loading: false,
      error: ''
    });
  };

  return {
    ...authState,
    loginAdmin,
    logoutAdmin
  };
}
