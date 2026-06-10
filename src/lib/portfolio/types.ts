import type { Project } from "@/components/leadership/types";

export interface ActionState {
  vendorFrozen: boolean;
  altVendorAuthorized: boolean;
  forceMajeure: boolean;
  resourceRedeployed: boolean;
  pmoAudit: boolean;
  pmoAuditCompleted: boolean;
  talentBridge: null | "freeze" | "absorb";
  courseCorrected: boolean;
}

export interface PortfolioTicket {
  id: string;
  type: "audit" | "resource" | "vendor" | "scope" | "notification";
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  source: "leadership" | "pmo" | "pm";
  createdAt: number;
  status: "open" | "in_progress" | "done";
  projectId?: string;
  assignee: "pmo" | "pm";
  notes?: string;
}

export interface PmTask {
  id: string;
  projectId: string;
  label: string;
  done: boolean;
  auto?: boolean;
}

export interface CommsMessage {
  id: string;
  projectId: string;
  from: string;
  body: string;
  createdAt: number;
  urgent?: boolean;
  direction: "inbound" | "outbound" | "system";
}

export interface ActivityEntry {
  id: string;
  message: string;
  role: "leadership" | "pmo" | "pm" | "system";
  createdAt: number;
}

export interface PortfolioSnapshot {
  projects: Project[];
  actions: ActionState;
  tickets: PortfolioTicket[];
  pmTasks: PmTask[];
  comms: CommsMessage[];
  activity: ActivityEntry[];
}

export const INITIAL_ACTIONS: ActionState = {
  vendorFrozen: false,
  altVendorAuthorized: false,
  forceMajeure: false,
  resourceRedeployed: false,
  pmoAudit: false,
  pmoAuditCompleted: false,
  talentBridge: null,
  courseCorrected: false,
};

const T0 = Date.now();

export const INITIAL_TICKETS: PortfolioTicket[] = [
  // PMO queue — standing items reflecting TechStar critical status
  {
    id: "tkt-init-pmo-1",
    type: "audit",
    title: "TechStar SLA compliance review",
    description:
      "Apex Licensing dispute now 15 days overdue. PMO to validate contract SLA obligations and assess penalty exposure before Leadership escalates to legal.",
    priority: "P1",
    source: "pmo",
    createdAt: T0 - 2 * 24 * 60 * 60 * 1000,
    status: "open",
    projectId: "techstar",
    assignee: "pmo",
  },
  {
    id: "tkt-init-pmo-2",
    type: "resource",
    title: "Idle bench cost audit — TechStar",
    description:
      "30 engineers idle on TechStar bench burning ₹4.8L/day. PMO to review redeployment options and present capacity report to Leadership.",
    priority: "P1",
    source: "pmo",
    createdAt: T0 - 1 * 24 * 60 * 60 * 1000,
    status: "open",
    projectId: "techstar",
    assignee: "pmo",
  },
  {
    id: "tkt-init-pmo-3",
    type: "audit",
    title: "Q2 portfolio governance review",
    description:
      "Quarterly governance review overdue by 3 days. PMO to compile risk register across all 4 programs and submit to Leadership for sign-off.",
    priority: "P2",
    source: "pmo",
    createdAt: T0 - 3 * 24 * 60 * 60 * 1000,
    status: "open",
    assignee: "pmo",
  },
  // PM action items — client escalations requiring immediate response
  {
    id: "tkt-init-pm-1",
    type: "notification",
    title: "Client escalation — TechStar CIO",
    description:
      "TechStar CIO escalated SAP license delay via email. Demanding a written recovery plan by EOD. Coordinate with PMO on vendor status before responding.",
    priority: "P0",
    source: "pm",
    createdAt: T0 - 2 * 60 * 60 * 1000,
    status: "open",
    projectId: "techstar",
    assignee: "pm",
  },
  {
    id: "tkt-init-pm-2",
    type: "scope",
    title: "TalentBridge SOW dispute — payroll analytics module",
    description:
      "PeoplePro VP HR flagged billing for payroll analytics module as out-of-scope. PM to cross-check SOW, gather evidence, and respond to client within 24h.",
    priority: "P1",
    source: "pm",
    createdAt: T0 - 5 * 60 * 60 * 1000,
    status: "open",
    projectId: "talentbridge",
    assignee: "pm",
  },
  {
    id: "tkt-init-pm-3",
    type: "resource",
    title: "Staffing plan update — TechStar Q3",
    description:
      "TechStar Q3 staffing plan not yet submitted. With 30 idle engineers, Leadership is reviewing redeployment. PM to update the plan to reflect current bench status.",
    priority: "P2",
    source: "pm",
    createdAt: T0 - 12 * 60 * 60 * 1000,
    status: "open",
    projectId: "techstar",
    assignee: "pm",
  },
];

export const INITIAL_PM_TASKS: PmTask[] = [
  {
    id: "sap-vendor",
    projectId: "techstar",
    label: "Onboard alternative SAP vendor",
    done: false,
    auto: true,
  },
  {
    id: "idle-burn",
    projectId: "techstar",
    label: "Reduce idle bench below 15 engineers",
    done: false,
    auto: true,
  },
  {
    id: "client-comms",
    projectId: "techstar",
    label: "Send weekly client risk digest",
    done: false,
  },
  {
    id: "license-track",
    projectId: "techstar",
    label: "Document Apex Licensing dispute timeline",
    done: false,
    auto: true,
  },
  {
    id: "recovery-plan",
    projectId: "techstar",
    label: "Publish SAP recovery plan to client",
    done: false,
  },
  {
    id: "tb-change-order",
    projectId: "talentbridge",
    label: "Present Change Order to PeoplePro",
    done: false,
    auto: true,
  },
  {
    id: "tb-halt-work",
    projectId: "talentbridge",
    label: "Halt unbilled module development",
    done: false,
    auto: true,
  },
];

export const INITIAL_COMMS: CommsMessage[] = [
  {
    id: "c1",
    projectId: "techstar",
    from: "Client — TechStar CIO",
    body: "Escalating SAP license delay. Need recovery plan by EOD.",
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    urgent: true,
    direction: "inbound",
  },
  {
    id: "c2",
    projectId: "techstar",
    from: "You → Client",
    body: "Drafted risk memo on Apex Licensing. Awaiting Leadership vendor freeze confirmation.",
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    direction: "outbound",
  },
  {
    id: "c3",
    projectId: "talentbridge",
    from: "Client — PeoplePro VP HR",
    body: "Why are we being billed for payroll analytics module? Not in SOW.",
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    urgent: true,
    direction: "inbound",
  },
];
