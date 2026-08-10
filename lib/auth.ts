/**
 * Frontend-only demo authentication for the Brainbase take-home assignment.
 *
 * Credentials are checked in the browser against a hard-coded demo account
 * and the session is kept in `sessionStorage`. Nothing is sent to any API,
 * and this is intentionally NOT production-grade security.
 */

export type DemoSession = {
  email: string;
  name: string;
  loggedInAt: string;
};

export type LoginResult = { ok: true; session: DemoSession } | { ok: false; error: string };

/** Minimal storage surface so the logic can be tested without a browser. */
export type AuthStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const DEMO_ACCOUNT = {
  email: "test@brainbase.local",
  password: "Brainbase123!",
  name: "Demo User",
};

export const SESSION_KEY = "brainbase.auth.session";

export const HOME_PATH = "/";
export const LOGIN_PATH = "/login";

function browserStorage(): AuthStorage | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

// --- Reactive snapshot store (consumed via useSyncExternalStore) -----------

type AuthListener = () => void;

const listeners = new Set<AuthListener>();
let cachedRaw: string | null | undefined;
let cachedSession: DemoSession | null = null;

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyAuthChange(): void {
  for (const listener of [...listeners]) listener();
}

function parseSession(raw: string | null): DemoSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (typeof parsed.email !== "string" || typeof parsed.name !== "string") {
      return null;
    }
    return { email: parsed.email, name: parsed.name, loggedInAt: parsed.loggedInAt ?? "" };
  } catch {
    return null;
  }
}

/** Client snapshot for useSyncExternalStore; referentially stable per value. */
export function getSessionSnapshot(
  storage: AuthStorage | null = browserStorage(),
): DemoSession | null {
  const raw = storage?.getItem(SESSION_KEY) ?? null;
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = parseSession(raw);
  }
  return cachedSession;
}

/** Server/hydration snapshot: sessionStorage never exists on the server. */
export function getServerSessionSnapshot(): DemoSession | null {
  return null;
}

// ---------------------------------------------------------------------------

export function isValidCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_ACCOUNT.email.toLowerCase() &&
    password === DEMO_ACCOUNT.password
  );
}

export function getSession(storage: AuthStorage | null = browserStorage()): DemoSession | null {
  return parseSession(storage?.getItem(SESSION_KEY) ?? null);
}

export function isAuthenticated(storage?: AuthStorage | null): boolean {
  return getSession(storage) !== null;
}

/** Validates demo credentials locally and stores the session. No network call. */
export function login(
  email: string,
  password: string,
  storage: AuthStorage | null = browserStorage(),
): LoginResult {
  if (!storage) {
    return { ok: false, error: "Authentication is only available in the browser." };
  }
  if (!isValidCredentials(email, password)) {
    return { ok: false, error: "Invalid email or password. Try the demo account below." };
  }
  const session: DemoSession = {
    email: DEMO_ACCOUNT.email,
    name: DEMO_ACCOUNT.name,
    loggedInAt: new Date().toISOString(),
  };
  storage.setItem(SESSION_KEY, JSON.stringify(session));
  notifyAuthChange();
  return { ok: true, session };
}

export function logout(storage: AuthStorage | null = browserStorage()): void {
  storage?.removeItem(SESSION_KEY);
  notifyAuthChange();
}

/**
 * Central redirect decision: protected routes send unauthenticated visitors
 * to /login, and authenticated visitors on /login are sent back home.
 */
export function resolveAuthRedirect(pathname: string, authenticated: boolean): string | null {
  if (pathname === LOGIN_PATH) {
    return authenticated ? HOME_PATH : null;
  }
  return authenticated ? null : LOGIN_PATH;
}
