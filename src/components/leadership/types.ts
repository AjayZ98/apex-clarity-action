export type RAG = "critical" | "atrisk" | "ontrack";

export interface Project {
  id: string;
  name: string;
  budget: number; // in rupees
  spent: number;
  resources: number;
  idleResources?: number;
  progress: number;
  status: RAG;
  due: string;
  tool: string;
  confidence: number;
  riskNote?: string;
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "techstar",
    name: "TechStar ERP Modernisation",
    budget: 24000000,
    spent: 10800000,
    resources: 82,
    idleResources: 30,
    progress: 42,
    status: "critical",
    due: "31 Aug 2026",
    tool: "Jira",
    confidence: 34,
    riskNote: "Apex Licensing 15 days overdue on SAP licenses. Daily idle burn ₹4.8L.",
  },
  {
    id: "cloudedge",
    name: "CloudEdge Infrastructure Migration",
    budget: 18000000,
    spent: 11000000,
    resources: 64,
    progress: 68,
    status: "ontrack",
    due: "31 Jul 2026",
    tool: "MS Project",
    confidence: 82,
  },
  {
    id: "retailiq",
    name: "RetailIQ Analytics Platform",
    budget: 4800000,
    spent: 2400000,
    resources: 18,
    progress: 55,
    status: "ontrack",
    due: "31 May 2026",
    tool: "Monday.com",
    confidence: 71,
    riskNote: "UAT defects 3x threshold.",
  },
  {
    id: "talentbridge",
    name: "TalentBridge HRMS",
    budget: 3500000,
    spent: 1400000,
    resources: 14,
    progress: 45,
    status: "atrisk",
    due: "31 May 2026",
    tool: "Asana",
    confidence: 58,
    riskNote: "Scope creep — 2 unapproved modules.",
  },
  {
    id: "logisense",
    name: "LogiSense Supply Chain Dashboard",
    budget: 2900000,
    spent: 800000,
    resources: 22,
    progress: 30,
    status: "ontrack",
    due: "30 Jun 2026",
    tool: "ClickUp",
    confidence: 78,
  },
];

export const fmtCr = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export const RAG_META: Record<RAG, { label: string; bg: string; text: string; dot: string }> = {
  critical: { label: "Critical", bg: "bg-[#FCEBEB]", text: "text-[#791F1F]", dot: "bg-[#E24B4A]" },
  atrisk: { label: "At Risk", bg: "bg-[#FAEEDA]", text: "text-[#633806]", dot: "bg-[#EF9F27]" },
  ontrack: { label: "On Track", bg: "bg-[#EAF3DE]", text: "text-[#27500A]", dot: "bg-[#1D9E75]" },
};
