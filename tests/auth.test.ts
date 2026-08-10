import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  DEMO_ACCOUNT,
  getSession,
  isAuthenticated,
  login,
  logout,
  resolveAuthRedirect,
  SESSION_KEY,
  type AuthStorage,
} from "../lib/auth";

function createMemoryStorage(): AuthStorage & { entries: Map<string, string> } {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => {
      entries.set(key, String(value));
    },
    removeItem: (key) => {
      entries.delete(key);
    },
  };
}

describe("demo authentication", () => {
  let storage: ReturnType<typeof createMemoryStorage>;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("logs in with valid demo credentials and stores a session", () => {
    const result = login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password, storage);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.session.email, DEMO_ACCOUNT.email);
      assert.equal(result.session.name, DEMO_ACCOUNT.name);
    }
    assert.ok(storage.getItem(SESSION_KEY), "session should be persisted");
    const persisted = getSession(storage);
    assert.ok(persisted);
    assert.equal(persisted?.email, DEMO_ACCOUNT.email);
  });

  it("rejects invalid credentials with an error message", () => {
    const wrongPassword = login(DEMO_ACCOUNT.email, "wrong-password", storage);
    assert.equal(wrongPassword.ok, false);
    if (!wrongPassword.ok) assert.match(wrongPassword.error, /invalid/i);

    const wrongEmail = login("stranger@example.com", DEMO_ACCOUNT.password, storage);
    assert.equal(wrongEmail.ok, false);
    if (!wrongEmail.ok) assert.match(wrongEmail.error, /invalid/i);

    assert.equal(storage.getItem(SESSION_KEY), null, "no session may be stored on failure");
  });

  it("keeps an authenticated user able to access the app (also after 'refresh')", () => {
    login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password, storage);

    // Simulates a fresh page load reading the same sessionStorage.
    assert.equal(isAuthenticated(storage), true);
    assert.ok(getSession(storage));
    assert.equal(resolveAuthRedirect("/", true), null);
    assert.equal(resolveAuthRedirect("/ask", true), null);
  });

  it("redirects an unauthenticated visitor to /login", () => {
    assert.equal(isAuthenticated(storage), false);
    assert.equal(getSession(storage), null);
    assert.equal(resolveAuthRedirect("/", false), "/login");
    assert.equal(resolveAuthRedirect("/knowledge", false), "/login");
  });

  it("redirects an authenticated visitor away from the login page", () => {
    assert.equal(resolveAuthRedirect("/login", true), "/");
    assert.equal(resolveAuthRedirect("/login", false), null);
  });

  it("clears the session on logout", () => {
    login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password, storage);
    assert.equal(isAuthenticated(storage), true);

    logout(storage);

    assert.equal(storage.getItem(SESSION_KEY), null);
    assert.equal(isAuthenticated(storage), false);
    assert.equal(resolveAuthRedirect("/", false), "/login");
  });

  it("ignores a corrupted stored session", () => {
    storage.setItem(SESSION_KEY, "{not-json");
    assert.equal(getSession(storage), null);
    assert.equal(isAuthenticated(storage), false);
  });
});
