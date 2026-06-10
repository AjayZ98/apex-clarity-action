import { INITIAL_PROJECTS } from "@/components/leadership/types";

import {
  INITIAL_ACTIONS,
  INITIAL_COMMS,
  INITIAL_PM_TASKS,
  INITIAL_TICKETS,
  type PortfolioSnapshot,
} from "./types";

const STORAGE_KEY = "sentinel-portfolio-v2";

export function loadPortfolioSnapshot(): PortfolioSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PortfolioSnapshot;
  } catch {
    return null;
  }
}

export function savePortfolioSnapshot(snapshot: PortfolioSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearPortfolioSnapshot() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function createInitialSnapshot(): PortfolioSnapshot {
  return {
    projects: INITIAL_PROJECTS,
    actions: { ...INITIAL_ACTIONS },
    tickets: INITIAL_TICKETS.map((t) => ({ ...t })),
    pmTasks: INITIAL_PM_TASKS.map((t) => ({ ...t })),
    comms: INITIAL_COMMS.map((c) => ({ ...c })),
    activity: [
      {
        id: "act-seed",
        message: "Portfolio session started. Leadership, PMO, and PM views share live state.",
        role: "system",
        createdAt: Date.now(),
      },
    ],
  };
}
