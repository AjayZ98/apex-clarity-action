import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertTriangle,
  Gavel,
  Inbox,
  Shield,
  Filter,
} from "lucide-react";
import { useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ActivityFeed } from "@/components/portfolio/ActivityFeed";
import { TicketRow } from "@/components/portfolio/TicketRow";
import { RAG_META, fmtCr } from "@/components/leadership/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStoredUser } from "@/lib/auth/session";
import { usePortfolio } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pmo")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "pmo" && user.role !== "leadership") {
      throw redirect({ to: user.route });
    }
  },
  head: () => ({
    meta: [{ title: "PMO Head — Sentinel PMO" }],
  }),
  component: PmoPage,
});

type FilterKey = "all" | "open" | "audit" | "done";

function PmoPage() {
  const { projects, tickets, actions, portfolioHealth, updateTicketStatus, activity } =
    usePortfolio();
  const [filter, setFilter] = useState<FilterKey>("all");

  const pmoTickets = tickets.filter((t) => t.assignee === "pmo");
  const filtered = pmoTickets.filter((t) => {
    if (filter === "open") return t.status !== "done";
    if (filter === "audit") return t.type === "audit";
    if (filter === "done") return t.status === "done";
    return true;
  });

  const openCount = pmoTickets.filter((t) => t.status !== "done").length;
  const auditOpen = pmoTickets.filter((t) => t.type === "audit" && t.status !== "done").length;
  const criticalProjects = projects.filter((p) => p.status === "critical" || p.status === "atrisk");

  return (
    <DashboardShell
      subtitle="PMO Head · Portfolio governance & audit queue"
      badge="PMO Head"
      actions={
        openCount > 0 ? (
          <Badge className="rounded-md bg-[#FCEBEB] text-[#791F1F] hover:bg-[#FCEBEB]">
            {openCount} open
          </Badge>
        ) : (
          <Badge className="rounded-md bg-[#EAF3DE] text-[#27500A]">Queue clear</Badge>
        )
      }
    >
      <section className="grid grid-cols-12 gap-4">
        <KpiCard
          className="col-span-3"
          label="Open audits"
          value={String(auditOpen)}
          icon={<Gavel className="h-4 w-4" />}
          accent={auditOpen > 0 ? "critical" : "success"}
        />
        <KpiCard
          className="col-span-3"
          label="Open PMO tickets"
          value={String(openCount)}
          icon={<Inbox className="h-4 w-4" />}
          accent={openCount > 0 ? "warning" : "success"}
        />
        <KpiCard
          className="col-span-3"
          label="Programs at risk"
          value={String(criticalProjects.length)}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="warning"
        />
        <KpiCard
          className="col-span-3"
          label="Portfolio health"
          value={`${portfolioHealth}%`}
          icon={<Shield className="h-4 w-4" />}
          accent={portfolioHealth >= 80 ? "success" : "warning"}
        />
      </section>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <Card className="col-span-7 border-[#E5E7EB] p-0 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h2 className="text-[14px] font-medium">PMO ticket queue</h2>
              <p className="text-[12px] text-[#64748B]">
                Start → Resolve workflow · updates Leadership health score
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["all", "All"],
                  ["open", "Open"],
                  ["audit", "Audits"],
                  ["done", "Done"],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={filter === key ? "default" : "outline"}
                  className="h-7 rounded-md text-[11px]"
                  onClick={() => setFilter(key)}
                >
                  {key === "all" && <Filter className="mr-1 h-3 w-3" />}
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-[13px] text-[#64748B]">
                {pmoTickets.length === 0
                  ? "No tickets yet. Sign in as Leadership and trigger PMO Internal Audit."
                  : "No tickets match this filter."}
              </div>
            ) : (
              filtered.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onStatusChange={updateTicketStatus}
                />
              ))
            )}
          </div>
          {actions.pmoAuditCompleted && (
            <div className="border-t border-[#E5E7EB] bg-[#F7FBF3] px-5 py-3 text-[12px] text-[#27500A]">
              TechStar audit completed — portfolio confidence boosted +3% on Leadership view.
            </div>
          )}
        </Card>

        <div className="col-span-5 space-y-6">
          <Card className="border-[#E5E7EB] p-0 shadow-sm">
            <div className="border-b border-[#E5E7EB] px-5 py-4">
              <h2 className="text-[14px] font-medium">Compliance snapshot</h2>
              <p className="text-[12px] text-[#64748B]">All active programs</p>
            </div>
            <div className="max-h-[360px] space-y-3 overflow-y-auto p-5">
              {projects.map((project) => {
                const meta = RAG_META[project.status];
                return (
                  <div
                    key={project.id}
                    className="rounded-md border border-[#E5E7EB] bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[13px] font-medium">{project.name}</div>
                        <div className="mt-0.5 text-[11px] text-[#64748B]">
                          {fmtCr(project.spent)} / {fmtCr(project.budget)}
                        </div>
                      </div>
                      <Badge className={cn("rounded-md", meta.bg, meta.text)}>
                        {meta.label}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="mt-2 h-1.5" />
                  </div>
                );
              })}
            </div>
          </Card>

          <ActivityFeed entries={activity} limit={5} title="Recent activity" />
        </div>
      </div>
    </DashboardShell>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "critical" | "warning" | "success";
  className?: string;
}) {
  const accents = {
    critical: "border-[#F5C4C4] bg-[#FEF7F7]",
    warning: "border-[#F5DFB4] bg-[#FFFBF0]",
    success: "border-[#C8E6B4] bg-[#F7FBF3]",
  };

  return (
    <Card className={cn("border p-4 shadow-sm", accents[accent], className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-[#64748B]">{label}</span>
        <span className="text-[#64748B]">{icon}</span>
      </div>
      <div className="mt-2 text-[24px] font-semibold tracking-tight">{value}</div>
    </Card>
  );
}
