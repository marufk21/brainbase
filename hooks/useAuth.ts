"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  login as loginDemo,
  logout as logoutDemo,
  subscribeAuth,
  type LoginResult,
} from "@/lib/auth";

/**
 * Centralized demo-auth state for client components. The session is a
 * sessionStorage-backed external store: the server/hydration snapshot is
 * always null, and React re-renders with the browser value after hydration.
 */
export function useAuth() {
  const session = useSyncExternalStore(subscribeAuth, getSessionSnapshot, getServerSessionSnapshot);

  const login = useCallback(
    (email: string, password: string): LoginResult => loginDemo(email, password),
    [],
  );

  const logout = useCallback(() => {
    logoutDemo();
  }, []);

  return {
    session,
    isAuthenticated: session !== null,
    login,
    logout,
  };
}
