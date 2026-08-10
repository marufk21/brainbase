"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isAuthenticated, resolveAuthRedirect } from "@/lib/auth";

/**
 * Client-side gate for the demo authentication flow. Renders a placeholder
 * until a real session snapshot exists, so protected UI is never shown before
 * authentication; unauthenticated visitors are sent to /login. The effect
 * re-reads sessionStorage directly, which is authoritative once mounted.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const target = resolveAuthRedirect(pathname, isAuthenticated());
    if (target) {
      router.replace(target);
    }
  }, [pathname, session, router]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm font-medium text-slate-400">Checking session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
