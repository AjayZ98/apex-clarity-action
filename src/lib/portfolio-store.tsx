import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { INITIAL_PROJECTS, type Project } from "@/components/leadership/types";

import {
  clearPortfolioSnapshot,
  createInitialSnapshot,
  loadPortfolioSnapshot,
  savePortfolioSnapshot,
} from "./portfolio/persistence";
import {
  INITIAL_ACTIONS,
  type ActionState,
  type ActivityEntry,
  type CommsMessage,
  type PmTask,
  type PortfolioTicket,
} from "./portfolio/types";

export type { ActionState, ActivityEntry, CommsMessage, PmTask, PortfolioTicket };

interface PortfolioContextValue {
  projects: Project[];
  actions: ActionState;
  tickets: PortfolioTicket[];
  pmTasks: PmTask[];
  comms: CommsMessage[];
  activity: ActivityEntry[];
  portfolioHealth: number;
  revenueAtRisk: number;
  ready: boolean;
  updateProject: (id: string, patch: Partial<Project>) => void;
  updateTicketStatus: (id: string, status: PortfolioTicket["status"], notes?: string) => void;
  togglePmTask: (taskId: string) => void;
  sendComms: (projectId: string, body: string) => void;
  resetPortfolio: () => void;
  handlers: {
    freezeVendor: () => void;
    authorizeAltVendor: () => void;
    forceMajeure: () => void;
    redeployResources: () => void;
    pmoAudit: () => void;
    talentFreeze: () => void;
    talentAbsorb: () => void;
    courseCorrect: () => void;
  };
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function makeTicket(
  partial: Omit<PortfolioTicket, "id" | "createdAt" | "status">,
): PortfolioTicket {
  return {
    ...partial,
    id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    status: "open",
  };
}

function makeActivity(
  message: string,
  role: ActivityEntry["role"],
): ActivityEntry {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    role,
    createdAt: Date.now(),
  };
}

function syncAutoTasks(tasks: PmTask[], actions: ActionState, projects: Project[]): PmTask[] {
  return tasks.map((task) => {
    if (!task.auto) return task;
    let done = task.done;
    if (task.id === "sap-vendor") done = actions.altVendorAuthorized;
    if (task.id === "idle-burn") {
      const techstar = projects.find((p) => p.id === "techstar");
      done = (techstar?.idleResources ?? 99) <= 15;
    }
    if (task.id === "license-track") done = actions.vendorFrozen;
    if (task.id === "tb-change-order") done = actions.talentBridge === "freeze";
    if (task.id === "tb-halt-work") done = actions.talentBridge === "freeze";
    return { ...task, done };
  });
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(createInitialSnapshot);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadPortfolioSnapshot();
    if (saved) setSnapshot(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    savePortfolioSnapshot(snapshot);
  }, [snapshot, ready]);

  const logActivity = useCallback((message: string, role: ActivityEntry["role"]) => {
    setSnapshot((s) => ({
      ...s,
      activity: [makeActivity(message, role), ...s.activity].slice(0, 50),
    }));
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setSnapshot((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const setActions = useCallback(
    (updater: (prev: ActionState) => ActionState) => {
      setSnapshot((s) => {
        const actions = updater(s.actions);
        return {
          ...s,
          actions,
          pmTasks: syncAutoTasks(s.pmTasks, actions, s.projects),
        };
      });
    },
    [],
  );

  const pushTicket = useCallback(
    (ticket: PortfolioTicket) => {
      setSnapshot((s) => ({ ...s, tickets: [ticket, ...s.tickets] }));
      logActivity(`Ticket created: ${ticket.title}`, "leadership");
    },
    [logActivity],
  );

  const updateTicketStatus = useCallback(
    (id: string, status: PortfolioTicket["status"], notes?: string) => {
      setSnapshot((s) => {
        const ticket = s.tickets.find((t) => t.id === id);
        if (!ticket) return s;

        const tickets = s.tickets.map((t) =>
          t.id === id ? { ...t, status, notes: notes ?? t.notes } : t,
        );

        let { projects, actions, pmTasks } = s;

        if (status === "in_progress") {
          // no project mutation
        }

        if (status === "done") {
          if (ticket.type === "audit" && ticket.assignee === "pmo") {
            actions = { ...actions, pmoAuditCompleted: true };
            projects = projects.map((p) =>
              p.id === "techstar"
                ? { ...p, confidence: Math.min(100, p.confidence + 8), status: "atrisk" as const }
                : p,
            );
          }
          if (ticket.id && ticket.assignee === "pm") {
            if (ticket.type === "vendor") {
              pmTasks = pmTasks.map((t) =>
                t.id === "sap-vendor" ? { ...t, done: true } : t,
              );
            }
            if (ticket.type === "scope" && ticket.projectId === "talentbridge") {
              pmTasks = pmTasks.map((t) =>
                t.id === "tb-change-order" || t.id === "tb-halt-work"
                  ? { ...t, done: true }
                  : t,
              );
            }
          }
        }

        return { ...s, tickets, projects, actions, pmTasks };
      });

      const ticket = snapshot.tickets.find((t) => t.id === id);
      if (ticket) {
        const role = ticket.assignee === "pmo" ? "pmo" : "pm";
        if (status === "in_progress") {
          logActivity(`${ticket.title} — work started`, role);
          toast.info("Ticket in progress", { description: ticket.title });
        }
        if (status === "done") {
          logActivity(`${ticket.title} — resolved`, role);
          toast.success("Ticket resolved", { description: ticket.title });
        }
      }
    },
    [logActivity, snapshot.tickets],
  );

  const togglePmTask = useCallback(
    (taskId: string) => {
      setSnapshot((s) => {
        const task = s.pmTasks.find((t) => t.id === taskId);
        if (!task || task.auto) return s;
        const pmTasks = s.pmTasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t,
        );
        return { ...s, pmTasks };
      });
      const task = snapshot.pmTasks.find((t) => t.id === taskId);
      if (task && !task.auto) {
        const next = !task.done;
        logActivity(
          `${task.label} — ${next ? "completed" : "reopened"}`,
          "pm",
        );
        if (next) toast.success("Task completed", { description: task.label });
      }
    },
    [logActivity, snapshot.pmTasks],
  );

  const sendComms = useCallback(
    (projectId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const msg: CommsMessage = {
        id: `msg-${Date.now()}`,
        projectId,
        from: "You → Client",
        body: trimmed,
        createdAt: Date.now(),
        direction: "outbound",
      };
      setSnapshot((s) => ({
        ...s,
        comms: [msg, ...s.comms],
        pmTasks: s.pmTasks.map((t) =>
          t.id === "client-comms" && projectId === "techstar" ? { ...t, done: true } : t,
        ),
      }));
      logActivity(`Client message sent on ${projectId}`, "pm");
      toast.success("Message sent to client");
    },
    [logActivity],
  );

  const resetPortfolio = useCallback(() => {
    clearPortfolioSnapshot();
    setSnapshot(createInitialSnapshot());
    toast.success("Demo reset", { description: "Portfolio state restored to defaults." });
  }, []);

  const { projects, actions, tickets, pmTasks, comms, activity } = snapshot;

  const portfolioHealth = useMemo(() => {
    const base = projects.reduce((a, p) => a + p.confidence, 0) / projects.length;
    let score = actions.courseCorrected ? 88 : base + 14;
    if (actions.pmoAuditCompleted) score += 3;
    const openP0 = tickets.filter((t) => t.priority === "P0" && t.status !== "done").length;
    score -= openP0 * 2;
    return Math.round(Math.min(95, Math.max(45, score)));
  }, [projects, actions, tickets]);

  const revenueAtRisk = useMemo(() => {
    let total = 19000000;
    if (actions.vendorFrozen) total -= 4800000;
    if (actions.resourceRedeployed) total -= 4000000;
    if (actions.talentBridge === "freeze") total -= 500000;
    if (actions.courseCorrected) total = Math.min(total, 7800000);
    if (actions.pmoAuditCompleted) total -= 300000;
    return Math.max(total, 4000000);
  }, [actions]);

  const handlers = useMemo(
    () => ({
      freezeVendor: () => {
        if (actions.vendorFrozen) return;
        setActions((a) => ({ ...a, vendorFrozen: true }));
        pushTicket(
          makeTicket({
            type: "vendor",
            title: "Vendor payment freeze — Apex Licensing",
            description: "Leadership froze SAP license payments. PMO to validate contract compliance.",
            priority: "P1",
            source: "leadership",
            projectId: "techstar",
            assignee: "pmo",
          }),
        );
        logActivity("Leadership froze Apex Licensing disbursements", "leadership");
        toast.success("Apex Licensing payments frozen");
      },
      authorizeAltVendor: () => {
        if (actions.altVendorAuthorized) return;
        setActions((a) => ({ ...a, altVendorAuthorized: true }));
        pushTicket(
          makeTicket({
            type: "vendor",
            title: "Alternative SAP vendor sourcing authorized",
            description: "Expedited procurement. PM to coordinate vendor onboarding within 72h.",
            priority: "P1",
            source: "leadership",
            projectId: "techstar",
            assignee: "pm",
          }),
        );
        logActivity("Leadership authorized alternative SAP vendor sourcing", "leadership");
        toast.success("Alternative SAP vendor sourcing authorized");
      },
      forceMajeure: () => {
        if (actions.forceMajeure) return;
        setActions((a) => ({ ...a, forceMajeure: true }));
        pushTicket(
          makeTicket({
            type: "notification",
            title: "Force Majeure notice dispatched",
            description: "Legal team notified Apex Licensing. PMO to track vendor response SLA.",
            priority: "P0",
            source: "leadership",
            projectId: "techstar",
            assignee: "pmo",
          }),
        );
        logActivity("Force Majeure notice sent to Apex Licensing", "leadership");
        toast.success("Force Majeure notice dispatched");
      },
      redeployResources: () => {
        if (actions.resourceRedeployed) return;
        setActions((a) => ({ ...a, resourceRedeployed: true }));
        setSnapshot((s) => ({
          ...s,
          actions: { ...s.actions, resourceRedeployed: true },
          projects: s.projects.map((p) => {
            if (p.id === "techstar") return { ...p, idleResources: 10 };
            if (p.id === "cloudedge") {
              return {
                ...p,
                resources:
                  INITIAL_PROJECTS.find((x) => x.id === "cloudedge")!.resources + 20,
              };
            }
            return p;
          }),
          pmTasks: syncAutoTasks(
            s.pmTasks,
            { ...s.actions, resourceRedeployed: true },
            s.projects,
          ),
          comms: [
            {
              id: `msg-${Date.now()}`,
              projectId: "techstar",
              from: "System",
              body: "Leadership redeployed 20 engineers to CloudEdge — update TechStar staffing plan.",
              createdAt: Date.now(),
              urgent: true,
              direction: "system",
            },
            ...s.comms,
          ],
        }));
        pushTicket(
          makeTicket({
            type: "resource",
            title: "Resource redeployment — 20 engineers to CloudEdge",
            description: "TechStar idle pool reduced 30 → 10. PM to update staffing plan.",
            priority: "P1",
            source: "leadership",
            projectId: "techstar",
            assignee: "pm",
          }),
        );
        pushTicket(
          makeTicket({
            type: "resource",
            title: "Cross-project bench utilization review",
            description: "PMO to validate redeployment against portfolio capacity model.",
            priority: "P2",
            source: "leadership",
            assignee: "pmo",
          }),
        );
        logActivity("Leadership redeployed 20 engineers to CloudEdge", "leadership");
        toast.success("20 engineers redeployed to CloudEdge");
      },
      pmoAudit: () => {
        if (actions.pmoAudit) return;
        setActions((a) => ({ ...a, pmoAudit: true }));
        pushTicket(
          makeTicket({
            type: "audit",
            title: "PMO Internal Audit — TechStar ERP",
            description:
              "P0 forensic audit requested. Review contracts, delivery logs, and vendor SLA breaches.",
            priority: "P0",
            source: "leadership",
            projectId: "techstar",
            assignee: "pmo",
          }),
        );
        logActivity("Leadership requested PMO internal audit on TechStar", "leadership");
        toast.success("PMO Internal Audit requested");
      },
      talentFreeze: () => {
        setActions((a) => ({ ...a, talentBridge: "freeze" }));
        setSnapshot((s) => ({
          ...s,
          actions: { ...s.actions, talentBridge: "freeze" },
          projects: s.projects.map((p) =>
            p.id === "talentbridge" ? { ...p, status: "ontrack", confidence: 76 } : p,
          ),
          pmTasks: syncAutoTasks(
            s.pmTasks,
            { ...s.actions, talentBridge: "freeze" },
            s.projects,
          ),
        }));
        pushTicket(
          makeTicket({
            type: "scope",
            title: "TalentBridge scope freeze",
            description: "Halt unbilled work. PM to present Change Order to PeoplePro.",
            priority: "P1",
            source: "leadership",
            projectId: "talentbridge",
            assignee: "pm",
          }),
        );
        logActivity("Leadership froze TalentBridge scope creep", "leadership");
        toast.success("Scope frozen on TalentBridge HRMS");
      },
      talentAbsorb: () => {
        setActions((a) => ({ ...a, talentBridge: "absorb" }));
        setSnapshot((s) => ({
          ...s,
          actions: { ...s.actions, talentBridge: "absorb" },
          projects: s.projects.map((p) =>
            p.id === "talentbridge"
              ? {
                  ...p,
                  budget:
                    INITIAL_PROJECTS.find((x) => x.id === "talentbridge")!.budget + 500000,
                  status: "atrisk" as const,
                  confidence: 68,
                }
              : p,
          ),
        }));
        pushTicket(
          makeTicket({
            type: "scope",
            title: "Emergency budget — TalentBridge scope infusion",
            description: "₹5L approved. PM to absorb work and invoice client post-facto.",
            priority: "P1",
            source: "leadership",
            projectId: "talentbridge",
            assignee: "pm",
          }),
        );
        logActivity("Leadership approved ₹5L emergency budget for TalentBridge", "leadership");
        toast.success("₹5L emergency budget approved");
      },
      courseCorrect: () => {
        setSnapshot((s) => {
          const nextActions: ActionState = {
            ...s.actions,
            courseCorrected: true,
            vendorFrozen: true,
            resourceRedeployed: true,
            altVendorAuthorized: true,
            pmoAudit: true,
            talentBridge: s.actions.talentBridge ?? "freeze",
          };
          return {
            ...s,
            actions: nextActions,
            projects: s.projects.map((p) => {
              if (p.id === "techstar")
                return { ...p, idleResources: 10, status: "atrisk", confidence: 61 };
              if (p.id === "cloudedge") {
                return {
                  ...p,
                  resources:
                    INITIAL_PROJECTS.find((x) => x.id === "cloudedge")!.resources + 20,
                };
              }
              if (p.id === "talentbridge") return { ...p, status: "ontrack", confidence: 76 };
              return p;
            }),
            pmTasks: syncAutoTasks(s.pmTasks, nextActions, s.projects),
          };
        });
        pushTicket(
          makeTicket({
            type: "audit",
            title: "Portfolio course correction — PMO oversight required",
            description:
              "Leadership executed bundled correction. PMO to validate compliance across all programs.",
            priority: "P0",
            source: "leadership",
            assignee: "pmo",
          }),
        );
        logActivity("Leadership executed portfolio course correction", "leadership");
        toast.success("Portfolio course correction executed");
      },
    }),
    [actions, logActivity, pushTicket, setActions],
  );

  const syncedPmTasks = useMemo(
    () => syncAutoTasks(pmTasks, actions, projects),
    [pmTasks, actions, projects],
  );

  const value: PortfolioContextValue = {
    projects,
    actions,
    tickets,
    pmTasks: syncedPmTasks,
    comms,
    activity,
    portfolioHealth,
    revenueAtRisk,
    ready,
    updateProject,
    updateTicketStatus,
    togglePmTask,
    sendComms,
    resetPortfolio,
    handlers,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
