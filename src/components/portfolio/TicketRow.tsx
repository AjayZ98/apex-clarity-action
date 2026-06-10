import { CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PortfolioTicket } from "@/lib/portfolio/types";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  P0: "bg-[#FCEBEB] text-[#791F1F]",
  P1: "bg-[#FAEEDA] text-[#633806]",
  P2: "bg-[#E6F1FB] text-[#0C447C]",
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

export function TicketRow({
  ticket,
  onStatusChange,
  compact,
}: {
  ticket: PortfolioTicket;
  onStatusChange: (id: string, status: PortfolioTicket["status"]) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", compact ? "py-3" : "px-5 py-4")}>
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F7F8FA]">
          <ClipboardList className="h-4 w-4 text-[#64748B]" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium">{ticket.title}</span>
            <Badge className={cn("rounded-md text-[10px]", PRIORITY_COLORS[ticket.priority])}>
              {ticket.priority}
            </Badge>
            <Badge
              className={cn(
                "rounded-md text-[10px]",
                ticket.status === "done"
                  ? "bg-[#EAF3DE] text-[#27500A]"
                  : ticket.status === "in_progress"
                    ? "bg-[#E6F1FB] text-[#0C447C]"
                    : "bg-[#F1F5F9] text-[#64748B]",
              )}
            >
              {STATUS_LABELS[ticket.status]}
            </Badge>
          </div>
          <p className="mt-1 text-[12px] text-[#64748B]">{ticket.description}</p>
          <p className="mt-1 text-[11px] text-[#94A3B8]">
            From {ticket.source}
            {ticket.projectId ? ` · ${ticket.projectId}` : ""} ·{" "}
            {new Date(ticket.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        {ticket.status === "open" && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-md text-[12px]"
            onClick={() => onStatusChange(ticket.id, "in_progress")}
          >
            <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
            Start
          </Button>
        )}
        {ticket.status === "in_progress" && (
          <Button
            size="sm"
            className="rounded-md bg-[#1D9E75] text-[12px] hover:bg-[#178A66]"
            onClick={() => onStatusChange(ticket.id, "done")}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Resolve
          </Button>
        )}
        {ticket.status === "open" && ticket.assignee === "pm" && (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-md text-[12px]"
            onClick={() => onStatusChange(ticket.id, "done")}
          >
            Quick close
          </Button>
        )}
      </div>
    </div>
  );
}
