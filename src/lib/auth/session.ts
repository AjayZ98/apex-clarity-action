import type { DemoUser, UserRole } from "./types";
import { DEMO_USERS } from "./types";

const STORAGE_KEY = "sentinel-demo-user";

export function getStoredUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    return DEMO_USERS.find((u) => u.id === parsed.id) ?? null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: DemoUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function requireRole(roles: UserRole[]) {
  const user = getStoredUser();
  if (!user || !roles.includes(user.role)) {
  return { redirect: true as const, user };
  }
  return { redirect: false as const, user };
}
