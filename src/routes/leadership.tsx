import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileWarning,
  Gavel,
  HandCoins,
  LineChart as LineChartIcon,
  ListChecks,
  Radar,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import { INITIAL_PROJECTS, RAG_META, fmtCr, type Project } from "@/components/leadership/types";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ActivityFeed } from "@/components/portfolio/ActivityFeed";
import { getStoredUser } from "@/lib/auth/session";
import { usePortfolio, type ActionState } from "@/lib/portfolio-store";

export const Route = createFileRoute("/leadership")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "leadership") throw redirect({ to: user.route });
  },
  head: () => ({
    meta: [
      { title: "Leadership View — Sentinel PMO" },
      {
        name: "description",
        content:
          "Executive command center for portfolio risk, financial exposure, and PMO course correction.",
      },
    ],
  }),
  component: LeadershipPage,
});

// ──────────────────────────────────────────────────────────────────────────────
// Root page
// ──────────────────────────────────────────────────────────────────────────────

function LeadershipPage() {
  const { projects, actions, handlers, portfolioHealth, revenueAtRisk, tickets, activity } =
    usePortfolio();
  const [drawer, setDrawer] = useState<
    null | "revenue" | "techstar" | "talentbridge" | "course"
  >(null);

  const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
  const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
  const openTickets = tickets.filter((t) => t.status !== "done").length;
  const resolvedTickets = tickets.filter((t) => t.status === "done").length;

  return (
    <DashboardShell
      subtitle="Leadership View · Nexus Digital Solutions"
      badge="CEO · COO · CFO"
      actions={
        <>
          <div className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5">
            <span className="text-[11px] uppercase tracking-wide text-[#64748B]">
              Portfolio Health
            </span>
            <span
              className={cn(
                "text-[13px] font-semibold",
                actions.courseCorrected ? "text-[#1D9E75]" : "text-[#EF9F27]",
              )}
            >
              {portfolioHealth}%
            </span>
          </div>
          {openTickets > 0 && (
            <Badge className="rounded-md bg-[#FAEEDA] text-[#633806]">
              {openTickets} downstream open
            </Badge>
          )}
          {resolvedTickets > 0 && (
            <Badge className="rounded-md bg-[#EAF3DE] text-[#27500A]">
              {resolvedTickets} resolved
            </Badge>
          )}
          <Button
            onClick={() => setDrawer("course")}
            className="h-9 gap-2 rounded-md bg-[#E24B4A] px-3 text-[13px] font-medium text-white shadow-sm hover:bg-[#C93C3B]"
          >
            <Zap className="h-4 w-4" />
            Course Correction
          </Button>
        </>
      }
    >
      <>
        {/* KPI strip */}
        <section className="grid grid-cols-12 gap-4">
          <KpiCard
            label="Portfolio Health"
            value={`${portfolioHealth}%`}
            trend={actions.courseCorrected ? "+14 pts" : "−3 pts WoW"}
            trendUp={actions.courseCorrected}
            accent="info"
            icon={<Radar className="h-4 w-4" />}
            className="col-span-3"
            sublabel={`${projects.length} active programs · 200 resources`}
          />
          <KpiCard
            label="Revenue at Risk"
            value={fmtCr(revenueAtRisk)}
            trend={
              revenueAtRisk < 19000000
                ? `−${fmtCr(19000000 - revenueAtRisk)} mitigated`
                : "+₹32L this week"
            }
            trendUp={revenueAtRisk < 19000000}
            accent="critical"
            icon={<TrendingDown className="h-4 w-4" />}
            className="col-span-3"
            onClick={() => setDrawer("revenue")}
            sublabel="Click to dissect exposure →"
          />
          <KpiCard
            label="Portfolio Burn"
            value={fmtCr(totalSpent)}
            trend={`${Math.round((totalSpent / totalBudget) * 100)}% of ${fmtCr(totalBudget)}`}
            trendUp={false}
            accent="warn"
            icon={<HandCoins className="h-4 w-4" />}
            className="col-span-3"
          />
          <KpiCard
            label="Bench / Idle Resources"
            value={`${
              projects.reduce((a, p) => a + (p.idleResources ?? 0), 0)
            } engineers`}
            trend={
              actions.resourceRedeployed ? "Optimized via redeploy" : "Daily burn ₹4.8L"
            }
            trendUp={actions.resourceRedeployed}
            accent={actions.resourceRedeployed ? "ok" : "critical"}
            icon={<Users className="h-4 w-4" />}
            className="col-span-3"
          />
        </section>

        {/* Programs grid */}
        <section className="mt-6">
          <SectionHeader
            title="Active Programs"
            subtitle="Forensic traffic light view · click TechStar or TalentBridge to drill in"
          />
          <div className="mt-3 grid grid-cols-12 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                className="col-span-6 xl:col-span-4"
                onOpen={
                  p.id === "techstar"
                    ? () => setDrawer("techstar")
                    : p.id === "talentbridge"
                      ? () => setDrawer("talentbridge")
                      : undefined
                }
                resolved={
                  (p.id === "talentbridge" && actions.talentBridge !== null) ||
                  (p.id === "techstar" && actions.resourceRedeployed)
                }
              />
            ))}
          </div>
        </section>

        {/* Decision queue */}
        <section className="mt-8">
          <SectionHeader
            title="Executive Decision Queue"
            subtitle="Actions awaiting CXO sign-off"
          />
          <Card className="mt-3 rounded-[10px] border-[#E5E7EB] shadow-none">
            <ul className="divide-y divide-[#EEF0F3]">
              <DecisionRow
                done={actions.vendorFrozen}
                tag="Critical"
                tagColor="critical"
                title="Freeze Apex Licensing disbursements"
                meta="TechStar ERP · ₹48L SLA exposure"
                cta="Open Revenue Deep-Dive"
                onClick={() => setDrawer("revenue")}
              />
              <DecisionRow
                done={actions.resourceRedeployed}
                tag="Critical"
                tagColor="critical"
                title="Redeploy 20 idle engineers to CloudEdge"
                meta="TechStar ERP · ₹72L recoverable bench cost"
                cta="Open TechStar Drill-Down"
                onClick={() => setDrawer("techstar")}
              />
              <DecisionRow
                done={actions.talentBridge !== null}
                tag="At Risk"
                tagColor="atrisk"
                title="Resolve TalentBridge HRMS scope creep"
                meta="PeoplePro Solutions · 2 unbilled modules"
                cta="Open Decision Modal"
                onClick={() => setDrawer("talentbridge")}
              />
            </ul>
          </Card>
        </section>

        <section className="mt-8">
          <ActivityFeed entries={activity} />
        </section>

        <RevenueDrawer
        open={drawer === "revenue"}
        onOpenChange={(o) => !o && setDrawer(null)}
        actions={actions}
        handlers={handlers}
        total={revenueAtRisk}
      />
      <TechStarDrawer
        open={drawer === "techstar"}
        onOpenChange={(o) => !o && setDrawer(null)}
        actions={actions}
        handlers={handlers}
        project={projects.find((p) => p.id === "techstar")!}
      />
      <TalentBridgeDrawer
        open={drawer === "talentbridge"}
        onOpenChange={(o) => !o && setDrawer(null)}
        actions={actions}
        handlers={handlers}
      />
      <CourseCorrectionDrawer
        open={drawer === "course"}
        onOpenChange={(o) => !o && setDrawer(null)}
        actions={actions}
        handlers={handlers}
        portfolioHealth={portfolioHealth}
      />
      </>
    </DashboardShell>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Small primitives
// ──────────────────────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-[14px] font-medium text-[#0F172A]">{title}</h2>
        {subtitle ? (
          <p className="text-[12px] text-[#64748B]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  trend,
  trendUp,
  accent,
  icon,
  className,
  onClick,
  sublabel,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  accent: "critical" | "warn" | "ok" | "info";
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  sublabel?: string;
}) {
  const accentMap = {
    critical: "text-[#E24B4A] bg-[#FCEBEB]",
    warn: "text-[#EF9F27] bg-[#FAEEDA]",
    ok: "text-[#1D9E75] bg-[#EAF3DE]",
    info: "text-[#378ADD] bg-[#E6F1FB]",
  } as const;
  return (
    <Card
      className={cn(
        "group rounded-[10px] border-[#E5E7EB] bg-white p-4 shadow-none transition-all",
        onClick && "cursor-pointer hover:border-[#CBD5E1] hover:shadow-sm",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-medium text-[#64748B]">{label}</div>
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md",
            accentMap[accent],
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-[22px] font-semibold tracking-tight text-[#0F172A]">
          {value}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px]">
        {trendUp ? (
          <TrendingUp className="h-3 w-3 text-[#1D9E75]" />
        ) : (
          <TrendingDown className="h-3 w-3 text-[#E24B4A]" />
        )}
        <span className={trendUp ? "text-[#27500A]" : "text-[#791F1F]"}>{trend}</span>
      </div>
      {sublabel ? (
        <div className="mt-2 border-t border-[#EEF0F3] pt-2 text-[11px] text-[#64748B]">
          {sublabel}
        </div>
      ) : null}
    </Card>
  );
}

function StatusPill({ status }: { status: Project["status"] }) {
  const m = RAG_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
        m.bg,
        m.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

function ProjectCard({
  project: p,
  className,
  onOpen,
  resolved,
}: {
  project: Project;
  className?: string;
  onOpen?: () => void;
  resolved?: boolean;
}) {
  const burnPct = Math.round((p.spent / p.budget) * 100);
  return (
    <Card
      className={cn(
        "rounded-[10px] border-[#E5E7EB] bg-white p-4 shadow-none transition-all",
        onOpen && "cursor-pointer hover:border-[#CBD5E1] hover:shadow-sm",
        className,
      )}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="truncate text-[13px] font-semibold text-[#0F172A]">
              {p.name}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-[#64748B]">
            Due {p.due} · {p.tool}
          </div>
        </div>
        <StatusPill status={p.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Metric label="Budget" value={fmtCr(p.budget)} />
        <Metric label="Spent" value={`${fmtCr(p.spent)} · ${burnPct}%`} />
        <Metric
          label="Resources"
          value={
            p.idleResources
              ? `${p.resources} · ${p.idleResources} idle`
              : `${p.resources}`
          }
          danger={!!p.idleResources && p.idleResources > 15}
        />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Progress</span>
          <span className="font-medium text-[#0F172A]">{p.progress}%</span>
        </div>
        <Progress value={p.progress} className="mt-1 h-1.5 bg-[#EEF0F3]" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#EEF0F3] pt-3">
        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
          <Cpu className="h-3 w-3" />
          AI confidence
          <span
            className={cn(
              "ml-1 font-semibold",
              p.confidence < 50
                ? "text-[#E24B4A]"
                : p.confidence < 70
                  ? "text-[#EF9F27]"
                  : "text-[#1D9E75]",
            )}
          >
            {p.confidence}%
          </span>
        </div>
        {onOpen ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#378ADD]">
            {resolved ? "Updated · Review" : "Drill down"}
            <ChevronRight className="h-3 w-3" />
          </span>
        ) : null}
      </div>

      {p.riskNote ? (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-[#FCEBEB] px-2.5 py-2 text-[11px] text-[#791F1F]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{p.riskNote}</span>
        </div>
      ) : null}
    </Card>
  );
}

function Metric({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md bg-[#F8FAFC] px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-[#94A3B8]">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[12px] font-medium",
          danger ? "text-[#791F1F]" : "text-[#0F172A]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DecisionRow({
  done,
  tag,
  tagColor,
  title,
  meta,
  cta,
  onClick,
}: {
  done: boolean;
  tag: string;
  tagColor: "critical" | "atrisk";
  title: string;
  meta: string;
  cta: string;
  onClick: () => void;
}) {
  const colors =
    tagColor === "critical"
      ? "bg-[#FCEBEB] text-[#791F1F]"
      : "bg-[#FAEEDA] text-[#633806]";
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            colors,
          )}
        >
          {tag}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-[#0F172A]">
            {title}
          </div>
          <div className="truncate text-[11px] text-[#64748B]">{meta}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#EAF3DE] px-2 py-1 text-[11px] font-medium text-[#27500A]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="h-8 gap-1 rounded-md border-[#E5E7EB] text-[12px]"
          >
            {cta}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Drawers
// ──────────────────────────────────────────────────────────────────────────────

interface DrawerCommon {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  actions: ActionState;
  handlers: ReturnType<typeof useMemo> extends never ? never : any;
}

function DrawerShell({
  open,
  onOpenChange,
  title,
  subtitle,
  badge,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  subtitle?: string;
  badge?: { label: string; tone: "critical" | "atrisk" | "ontrack" | "info" };
  children: React.ReactNode;
}) {
  const tone =
    badge?.tone === "critical"
      ? "bg-[#FCEBEB] text-[#791F1F]"
      : badge?.tone === "atrisk"
        ? "bg-[#FAEEDA] text-[#633806]"
        : badge?.tone === "ontrack"
          ? "bg-[#EAF3DE] text-[#27500A]"
          : "bg-[#E6F1FB] text-[#0C447C]";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[640px] overflow-hidden border-l border-[#E5E7EB] bg-white p-0 sm:max-w-[640px]"
      >
        <SheetHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-2">
            {badge ? (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  tone,
                )}
              >
                {badge.label}
              </span>
            ) : null}
          </div>
          <SheetTitle className="text-[18px] font-semibold text-[#0F172A]">
            {title}
          </SheetTitle>
          {subtitle ? (
            <SheetDescription className="text-[12px] text-[#64748B]">
              {subtitle}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-92px)]">
          <div className="space-y-6 px-6 py-5">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ActionTile({
  title,
  body,
  icon,
  cta,
  done,
  doneLabel,
  destructive,
  onConfirm,
  confirmTitle,
  confirmBody,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  cta: string;
  done: boolean;
  doneLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  confirmTitle: string;
  confirmBody: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            destructive ? "bg-[#FCEBEB] text-[#E24B4A]" : "bg-[#E6F1FB] text-[#378ADD]",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-[#0F172A]">{title}</div>
          <div className="mt-0.5 text-[12px] text-[#64748B]">{body}</div>
        </div>
        {done ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#EAF3DE] px-2 py-1 text-[11px] font-medium text-[#27500A]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {doneLabel}
          </span>
        ) : (
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className={cn(
              "h-8 shrink-0 rounded-md text-[12px]",
              destructive
                ? "bg-[#E24B4A] text-white hover:bg-[#C93C3B]"
                : "bg-[#0F172A] text-white hover:bg-[#1E293B]",
            )}
          >
            {cta}
          </Button>
        )}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-[10px] border-[#E5E7EB]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] text-[#64748B]">
              {confirmBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              className={cn(
                "rounded-md",
                destructive ? "bg-[#E24B4A] hover:bg-[#C93C3B]" : "bg-[#0F172A]",
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Revenue Drawer ─────────────────────────────────────────────────────────────

function RevenueDrawer({
  open,
  onOpenChange,
  actions,
  handlers,
  total,
}: DrawerCommon & { total: number }) {
  const data = [
    { name: "TechStar idle run-rate", value: 72, color: "#E24B4A" },
    { name: "TechStar SLA penalties", value: 48, color: "#EF6E6D" },
    { name: "RetailIQ SLA exposure", value: 48, color: "#EF9F27" },
    { name: "Unrecovered billing", value: 22, color: "#378ADD" },
  ];

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title="Revenue at Risk — Forensic Breakdown"
      subtitle={`Live exposure: ${fmtCr(total)} across 5 active programs`}
      badge={{ label: "Critical Exposure", tone: "critical" }}
    >
      <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`₹${v}L`, "Exposure"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="col-span-3 space-y-2">
            {data.map((d) => (
              <li
                key={d.name}
                className="flex items-center justify-between rounded-md bg-[#F8FAFC] px-3 py-2 text-[12px]"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: d.color }}
                  />
                  <span className="text-[#0F172A]">{d.name}</span>
                </span>
                <span className="font-semibold text-[#0F172A]">₹{d.value}L</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#0F172A]">
          <ListChecks className="h-4 w-4 text-[#378ADD]" />
          Executive Intervention Toolkit
        </div>
        <div className="space-y-2">
          <ActionTile
            title="Freeze Vendor Disbursements — Apex Licensing"
            body="Pause all outgoing payments and auto-log a contract compliance dispute."
            icon={<Ban className="h-4 w-4" />}
            cta="Freeze"
            destructive
            done={actions.vendorFrozen}
            doneLabel="Dispute Logged"
            onConfirm={handlers.freezeVendor}
            confirmTitle="Freeze payments to Apex Licensing?"
            confirmBody="This will halt ₹48L of scheduled disbursements and automatically log a contract compliance dispute with Legal."
          />
          <ActionTile
            title="Authorize Immediate Alternative Vendor Sourcing"
            body="Override standard procurement cycle to clear the SAP licensing roadblock."
            icon={<Zap className="h-4 w-4" />}
            cta="Authorize"
            done={actions.altVendorAuthorized}
            doneLabel="Authorized"
            onConfirm={handlers.authorizeAltVendor}
            confirmTitle="Bypass standard procurement?"
            confirmBody="An emergency RFP will be issued to 3 pre-qualified SAP partners. ETA to first quote: 72 hours."
          />
        </div>
      </div>
    </DrawerShell>
  );
}

// TechStar Drawer ────────────────────────────────────────────────────────────

function TechStarDrawer({
  open,
  onOpenChange,
  actions,
  handlers,
  project,
}: DrawerCommon & { project: Project }) {
  const velocity = [
    { week: "W1", planned: 30, actual: 28 },
    { week: "W2", planned: 32, actual: 24 },
    { week: "W3", planned: 34, actual: 18 },
    { week: "W4", planned: 36, actual: 12 },
    { week: "W5", planned: 38, actual: 10 },
    { week: "W6", planned: 40, actual: 9 },
  ];

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title="TechStar ERP Modernisation"
      subtitle="Forensic root-cause & emergency action workspace"
      badge={{ label: "Critical", tone: "critical" }}
    >
      <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#0F172A]">
          <Sparkles className="h-3.5 w-3.5 text-[#378ADD]" />
          AI Forensic Root-Cause Analysis
        </div>
        <ul className="mt-2 space-y-1.5 text-[12px] text-[#334155]">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E24B4A]" />
            Apex Licensing 15 days overdue on SAP entitlements — blocking 30 engineers across 4 squads.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E24B4A]" />
            Accumulated idle-resource loss has hit ₹72L to date, growing ₹4.8L/day.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E24B4A]" />
            Critical-path slip currently tracking 4 weeks behind plan; SLA penalty trigger in 11 days.
          </li>
        </ul>
      </div>

      <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#0F172A]">
            <LineChartIcon className="h-3.5 w-3.5 text-[#378ADD]" />
            Planned vs Actual Velocity (story points / week)
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-sm bg-[#378ADD]" /> Planned
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-sm bg-[#E24B4A]" /> Actual
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={velocity} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="week"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <RTooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#378ADD"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#E24B4A"
              strokeWidth={2}
              dot={{ r: 3, fill: "#E24B4A", stroke: "#E24B4A" }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <Metric label="Idle resources" value={`${project.idleResources ?? 0}`} danger={(project.idleResources ?? 0) > 15} />
          <Metric label="Confidence" value={`${project.confidence}%`} />
          <Metric label="Days to SLA trigger" value="11" danger />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#0F172A]">
          <ListChecks className="h-4 w-4 text-[#378ADD]" />
          Emergency Action Workspace
        </div>
        <div className="space-y-2">
          <ActionTile
            title="Enact Force Majeure Clause"
            body="Dispatch legal notice to Apex Licensing under Clause 14.2 of the MSA."
            icon={<Gavel className="h-4 w-4" />}
            cta="Enact"
            destructive
            done={actions.forceMajeure}
            doneLabel="Notice Sent"
            onConfirm={handlers.forceMajeure}
            confirmTitle="Send Force Majeure notice?"
            confirmBody="Legal will formally invoke MSA Clause 14.2 against Apex Licensing. This action is recorded and may impact ongoing vendor relationships."
          />
          <ActionTile
            title="Authorize Resource Redeployment"
            body="Move 20 of 30 idle engineers from TechStar to CloudEdge Migration immediately."
            icon={<Users className="h-4 w-4" />}
            cta="Authorize"
            done={actions.resourceRedeployed}
            doneLabel="Redeployed"
            onConfirm={handlers.redeployResources}
            confirmTitle="Redeploy 20 engineers to CloudEdge?"
            confirmBody="Bench utilization on TechStar drops from 30 → 10 idle. CloudEdge capacity increases by 20 engineers. PMO is auto-notified."
          />
          <ActionTile
            title="Request PMO Internal Audit"
            body="Push a high-priority audit ticket into the PMO Head's queue."
            icon={<FileWarning className="h-4 w-4" />}
            cta="Request"
            done={actions.pmoAudit}
            doneLabel="Audit Queued"
            onConfirm={handlers.pmoAudit}
            confirmTitle="Open a PMO internal audit?"
            confirmBody="A P0 audit ticket will be created and assigned to the PMO Head with full forensic context attached."
          />
        </div>
      </div>
    </DrawerShell>
  );
}

// TalentBridge Drawer ────────────────────────────────────────────────────────

function TalentBridgeDrawer({
  open,
  onOpenChange,
  actions,
  handlers,
}: DrawerCommon) {
  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title="TalentBridge HRMS — Scope Resolution"
      subtitle="Hard decision required · confidence 58%"
      badge={{ label: "At Risk", tone: "atrisk" }}
    >
      <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#0F172A]">
          <Scale className="h-3.5 w-3.5 text-[#EF9F27]" />
          Scope Creep Drill-Down
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[#334155]">
          Client <span className="font-medium text-[#0F172A]">(PeoplePro Solutions)</span> has
          requested 2 new HR modules without signing a Change Request (CR). The PM is hesitating
          to halt work to preserve customer relationship — dragging program confidence down to
          <span className="font-medium text-[#0F172A]"> 58%</span> and committing ~₹5L of
          unbilled engineering effort to date.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <Metric label="Unapproved modules" value="2" danger />
          <Metric label="Unbilled effort" value="₹5L" danger />
          <Metric label="Confidence" value="58%" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-[#0F172A]">
          <ListChecks className="h-4 w-4 text-[#378ADD]" />
          Choose Resolution Path
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ResolutionCard
            tone="hard"
            title="Enforce Hard Stop & Scope Freeze"
            body="PMO halts unbilled development immediately and presents formal Change Order to PeoplePro."
            cta="Enforce Guardrails"
            chosen={actions.talentBridge === "freeze"}
            otherChosen={actions.talentBridge === "absorb"}
            onClick={handlers.talentFreeze}
          />
          <ResolutionCard
            tone="soft"
            title="Approve Scope Infusion & Bill Back"
            body="Authorize ₹5L emergency budget. Absorb the work now, invoice client post-facto."
            cta="Approve Commercial Accommodation"
            chosen={actions.talentBridge === "absorb"}
            otherChosen={actions.talentBridge === "freeze"}
            onClick={handlers.talentAbsorb}
          />
        </div>
      </div>
    </DrawerShell>
  );
}

function ResolutionCard({
  tone,
  title,
  body,
  cta,
  chosen,
  otherChosen,
  onClick,
}: {
  tone: "hard" | "soft";
  title: string;
  body: string;
  cta: string;
  chosen: boolean;
  otherChosen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border bg-white p-4 transition-all",
        chosen
          ? "border-[#1D9E75] ring-1 ring-[#1D9E75]/30"
          : "border-[#E5E7EB]",
        otherChosen && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            tone === "hard"
              ? "bg-[#FCEBEB] text-[#791F1F]"
              : "bg-[#E6F1FB] text-[#0C447C]",
          )}
        >
          {tone === "hard" ? "Hard Stop" : "Commercial"}
        </span>
        {chosen ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-[#EAF3DE] px-2 py-0.5 text-[10px] font-medium text-[#27500A]">
            <CheckCircle2 className="h-3 w-3" />
            Selected
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-[13px] font-medium text-[#0F172A]">{title}</div>
      <div className="mt-1 text-[12px] text-[#64748B]">{body}</div>
      <Button
        size="sm"
        onClick={onClick}
        disabled={chosen}
        className={cn(
          "mt-3 h-8 w-full rounded-md text-[12px]",
          tone === "hard"
            ? "bg-[#E24B4A] text-white hover:bg-[#C93C3B]"
            : "bg-[#0F172A] text-white hover:bg-[#1E293B]",
        )}
      >
        {chosen ? "Executed" : cta}
      </Button>
    </div>
  );
}

// Course Correction Drawer ──────────────────────────────────────────────────

function CourseCorrectionDrawer({
  open,
  onOpenChange,
  actions,
  handlers,
  portfolioHealth,
}: DrawerCommon & { portfolioHealth: number }) {
  const issues = [
    {
      key: "freeze",
      tag: "Critical",
      tagColor: "critical" as const,
      title: "Apex Licensing default — ₹48L SLA exposure",
      meta: "TechStar ERP · Vendor compliance breach",
      cta: "Freeze Vendor Disbursements",
      done: actions.vendorFrozen,
      handler: handlers.freezeVendor,
    },
    {
      key: "alt",
      tag: "Critical",
      tagColor: "critical" as const,
      title: "SAP licensing roadblock — 30 engineers idle",
      meta: "TechStar ERP · ₹4.8L/day burn",
      cta: "Bypass Procurement Sourcing",
      done: actions.altVendorAuthorized,
      handler: handlers.authorizeAltVendor,
    },
    {
      key: "redeploy",
      tag: "Critical",
      tagColor: "critical" as const,
      title: "Bench optimization — recover ₹72L exposure",
      meta: "Move 20 engineers · TechStar → CloudEdge",
      cta: "Reallocate Bench",
      done: actions.resourceRedeployed,
      handler: handlers.redeployResources,
    },
    {
      key: "scope",
      tag: "At Risk",
      tagColor: "atrisk" as const,
      title: "TalentBridge unbilled scope creep",
      meta: "PeoplePro Solutions · 2 unapproved modules",
      cta: "Enforce Scope Halt",
      done: actions.talentBridge !== null,
      handler: handlers.talentFreeze,
    },
  ];

  const optimized = 88;
  const baseline = 74;
  const projected = actions.courseCorrected
    ? optimized
    : baseline + issues.filter((i) => i.done).length * 3;

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio Course Correction"
      subtitle="Single-click interventions ordered by financial urgency"
      badge={{ label: "Command Center", tone: "info" }}
    >
      <div className="rounded-[10px] border border-[#E5E7EB] bg-gradient-to-br from-white to-[#F8FAFC] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              Live Portfolio Health
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[28px] font-semibold tracking-tight text-[#0F172A]">
                {portfolioHealth}%
              </span>
              <span className="text-[12px] text-[#64748B]">current</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-[#64748B]">
              Optimized Projection
            </div>
            <div className="mt-1 flex items-baseline justify-end gap-2">
              <span
                className={cn(
                  "text-[28px] font-semibold tracking-tight transition-colors",
                  projected >= 85 ? "text-[#1D9E75]" : "text-[#EF9F27]",
                )}
              >
                {projected}%
              </span>
              <ArrowUpRight
                className={cn(
                  "h-5 w-5 transition-transform",
                  projected > portfolioHealth ? "translate-y-[-2px] text-[#1D9E75]" : "text-[#94A3B8]",
                )}
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Progress
            value={projected}
            className="h-2 bg-[#EEF0F3]"
          />
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#94A3B8]">
            <span>Baseline 74%</span>
            <span>Target 88%</span>
          </div>
        </div>
        <Separator className="my-3 bg-[#EEF0F3]" />
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] text-[#64748B]">
            Execute all 4 interventions in one click to project the optimized state.
          </div>
          <Button
            onClick={handlers.courseCorrect}
            disabled={actions.courseCorrected}
            className="h-9 gap-2 rounded-md bg-[#1D9E75] text-[13px] text-white hover:bg-[#178362]"
          >
            <Zap className="h-4 w-4" />
            {actions.courseCorrected ? "Correction Executed" : "Execute All"}
          </Button>
        </div>
      </div>

      <ul className="space-y-2">
        {issues.map((i) => (
          <li
            key={i.key}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  i.tagColor === "critical"
                    ? "bg-[#FCEBEB] text-[#791F1F]"
                    : "bg-[#FAEEDA] text-[#633806]",
                )}
              >
                {i.tag}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[#0F172A]">
                  {i.title}
                </div>
                <div className="truncate text-[11px] text-[#64748B]">{i.meta}</div>
              </div>
            </div>
            {i.done ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#EAF3DE] px-2 py-1 text-[11px] font-medium text-[#27500A]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Executed
              </span>
            ) : (
              <Button
                size="sm"
                onClick={i.handler}
                className="h-8 shrink-0 rounded-md bg-[#0F172A] text-[12px] text-white hover:bg-[#1E293B]"
              >
                {i.cta}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </DrawerShell>
  );
}
