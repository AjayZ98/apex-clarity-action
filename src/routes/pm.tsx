import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  MessageSquare,
  Send,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { TicketRow } from "@/components/portfolio/TicketRow";
import { RAG_META, fmtCr } from "@/components/leadership/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getStoredUser } from "@/lib/auth/session";
import { usePortfolio } from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

const PM_PROJECTS = ["techstar", "talentbridge"] as const;

export const Route = createFileRoute("/pm")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "pm" && user.role !== "leadership") {
      throw redirect({ to: user.route });
    }
  },
  head: () => ({
    meta: [{ title: "Project Manager — Sentinel PMO" }],
  }),
  component: PmPage,
});

function PmPage() {
  const { projects, tickets, actions, pmTasks, comms, togglePmTask, sendComms, updateTicketStatus } =
    usePortfolio();
  const [projectId, setProjectId] = useState<(typeof PM_PROJECTS)[number]>("techstar");
  const [draft, setDraft] = useState("");

  const project = projects.find((p) => p.id === projectId)!;
  const meta = RAG_META[project.status];
  const pmTickets = tickets.filter((t) => t.assignee === "pm");
  const projectTickets = pmTickets.filter((t) => !t.projectId || t.projectId === projectId);
  const projectTasks = pmTasks.filter((t) => t.projectId === projectId);
  const projectComms = comms
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => b.createdAt - a.createdAt);
  const openCount = pmTickets.filter((t) => t.status !== "done").length;
  const tasksDone = projectTasks.filter((t) => t.done).length;

  const handleSend = () => {
    sendComms(projectId, draft);
    setDraft("");
  };

  return (
    <DashboardShell
      subtitle="Project Manager · Multi-project workspace"
      badge={`PM · ${projectId === "techstar" ? "TechStar" : "TalentBridge"}`}
      actions={
        <Badge className="rounded-md bg-[#E6F1FB] text-[#0C447C]">
          {tasksDone}/{projectTasks.length} tasks done
        </Badge>
      }
    >
      <div className="mb-4 flex gap-2">
        {PM_PROJECTS.map((id) => {
          const p = projects.find((x) => x.id === id)!;
          const openForProject = pmTickets.filter(
            (t) => t.status !== "done" && (!t.projectId || t.projectId === id),
          ).length;
          return (
            <Button
              key={id}
              variant={projectId === id ? "default" : "outline"}
              size="sm"
              className="rounded-md text-[12px]"
              onClick={() => setProjectId(id)}
            >
              {p.name.split(" ")[0]}
              {openForProject > 0 && (
                <span className="ml-1.5 rounded-full bg-[#E24B4A] px-1.5 text-[10px] text-white">
                  {openForProject}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      <section className="grid grid-cols-12 gap-4">
        <Card className="col-span-8 border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-semibold">{project.name}</h2>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Due {project.due} · {project.tool} · {project.resources} resources
              </p>
            </div>
            <Badge className={cn("rounded-md", meta.bg, meta.text)}>{meta.label}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <Stat label="Budget" value={fmtCr(project.budget)} />
            <Stat label="Spent" value={fmtCr(project.spent)} />
            <Stat label="Progress" value={`${project.progress}%`} />
            <Stat
              label="Idle bench"
              value={String(project.idleResources ?? "—")}
              alert={(project.idleResources ?? 0) > 15}
            />
          </div>
          <Progress value={project.progress} className="mt-4 h-2" />
          {project.riskNote && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-[#FCEBEB] px-3 py-2 text-[12px] text-[#791F1F]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {project.riskNote}
            </div>
          )}
        </Card>

        <Card className="col-span-4 border-[#E5E7EB] p-0 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-5 py-4">
            <Bell className="h-4 w-4 text-[#64748B]" />
            <div>
              <h2 className="text-[14px] font-medium">Action items</h2>
              <p className="text-[12px] text-[#64748B]">{openCount} total open across projects</p>
            </div>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {projectTickets.length === 0 ? (
              <p className="px-5 py-8 text-center text-[12px] text-[#64748B]">
                No tickets for this project. Leadership actions appear here live.
              </p>
            ) : (
              projectTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onStatusChange={updateTicketStatus}
                  compact
                />
              ))
            )}
          </div>
        </Card>
      </section>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <Card className="col-span-6 border-[#E5E7EB] p-0 shadow-sm">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex items-center gap-2 text-[14px] font-medium">
              <Wrench className="h-4 w-4 text-[#64748B]" />
              Tasks &amp; risks
            </div>
            <p className="text-[12px] text-[#64748B]">Click to complete manual tasks</p>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {projectTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                disabled={task.auto}
                onClick={() => togglePmTask(task.id)}
                className={cn(
                  "flex w-full items-center justify-between px-5 py-3 text-left transition-colors",
                  !task.auto && "hover:bg-[#F7F8FA]",
                  task.auto && "cursor-default opacity-90",
                )}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4",
                      task.done ? "text-[#1D9E75]" : "text-[#CBD5E1]",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[13px]",
                      task.done ? "text-[#64748B] line-through" : "text-[#0F172A]",
                    )}
                  >
                    {task.label}
                  </span>
                </div>
                {task.auto && !task.done && (
                  <Badge className="rounded-md bg-[#FAEEDA] text-[#633806]">Awaiting Leadership</Badge>
                )}
                {task.auto && task.done && (
                  <Badge className="rounded-md bg-[#EAF3DE] text-[#27500A]">Auto</Badge>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-6 border-[#E5E7EB] p-0 shadow-sm">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex items-center gap-2 text-[14px] font-medium">
              <MessageSquare className="h-4 w-4 text-[#64748B]" />
              Client communications
            </div>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message to ${project.name} client...`}
                className="min-h-[72px] resize-none text-[13px]"
              />
            </div>
            <Button
              size="sm"
              className="gap-2 rounded-md"
              disabled={!draft.trim()}
              onClick={handleSend}
            >
              <Send className="h-3.5 w-3.5" />
              Send to client
            </Button>
            <div className="max-h-[240px] space-y-2 overflow-y-auto pt-2">
              {projectComms.map((msg) => (
                <CommsItem
                  key={msg.id}
                  from={msg.from}
                  time={formatRelative(msg.createdAt)}
                  body={msg.body}
                  urgent={msg.urgent}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-[14px] font-medium">
          <Users className="h-4 w-4 text-[#64748B]" />
          Resource snapshot
        </div>
        <p className="mt-2 text-[13px] text-[#64748B]">
          {project.resources} total
          {project.idleResources != null ? ` · ${project.idleResources} idle` : ""}
          {projectId === "techstar" && actions.resourceRedeployed
            ? " · Bench reduced per Leadership redeployment"
            : projectId === "techstar"
              ? " · Awaiting Leadership resource action"
              : ""}
          {projectId === "talentbridge" && actions.talentBridge
            ? ` · Leadership chose: ${actions.talentBridge}`
            : ""}
        </p>
      </Card>
    </DashboardShell>
  );
}

function formatRelative(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-[#64748B]">{label}</div>
      <div className={cn("mt-1 text-[16px] font-semibold", alert && "text-[#E24B4A]")}>
        {value}
      </div>
    </div>
  );
}

function CommsItem({
  from,
  time,
  body,
  urgent,
}: {
  from: string;
  time: string;
  body: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2",
        urgent ? "border-[#F5C4C4] bg-[#FEF7F7]" : "border-[#E5E7EB] bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium">{from}</span>
        <span className="text-[11px] text-[#94A3B8]">{time}</span>
      </div>
      <p className="mt-1 text-[12px] text-[#64748B]">{body}</p>
    </div>
  );
}
