import { Activity } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { ActivityEntry } from "@/lib/portfolio/types";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<ActivityEntry["role"], string> = {
  leadership: "bg-[#E6F1FB] text-[#0C447C]",
  pmo: "bg-[#FAEEDA] text-[#633806]",
  pm: "bg-[#EAF3DE] text-[#27500A]",
  system: "bg-[#F1F5F9] text-[#64748B]",
};

export function ActivityFeed({
  entries,
  title = "Portfolio activity",
  limit = 8,
  className,
}: {
  entries: ActivityEntry[];
  title?: string;
  limit?: number;
  className?: string;
}) {
  const visible = entries.slice(0, limit);

  return (
    <Card className={cn("border-[#E5E7EB] p-0 shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-5 py-4">
        <Activity className="h-4 w-4 text-[#64748B]" />
        <div>
          <h2 className="text-[14px] font-medium">{title}</h2>
          <p className="text-[12px] text-[#64748B]">Live feed across Leadership, PMO &amp; PM</p>
        </div>
      </div>
      <ul className="divide-y divide-[#E5E7EB]">
        {visible.length === 0 ? (
          <li className="px-5 py-8 text-center text-[13px] text-[#64748B]">No activity yet.</li>
        ) : (
          visible.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 px-5 py-3">
              <span
                className={cn(
                  "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                  ROLE_STYLES[entry.role],
                )}
              >
                {entry.role}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[#0F172A]">{entry.message}</p>
                <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
