import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Sparkles, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  subtitle: string;
  badge?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const NAV: { to: "/leadership" | "/pmo" | "/pm"; label: string; roles: UserRole[] }[] = [
  { to: "/leadership", label: "Leadership", roles: ["leadership"] },
  { to: "/pmo", label: "PMO", roles: ["leadership", "pmo"] },
  { to: "/pm", label: "PM", roles: ["leadership", "pm"] },
];

export function DashboardShell({ subtitle, badge, actions, children }: DashboardShellProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const allowedNav = NAV.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A]">
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0F172A] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[15px] font-semibold leading-tight">Sentinel</div>
              <div className="text-[11px] leading-tight text-[#64748B]">{subtitle}</div>
            </div>
            {badge && (
              <Badge
                variant="secondary"
                className="ml-3 rounded-md bg-[#E6F1FB] text-[#0C447C] hover:bg-[#E6F1FB]"
              >
                {badge}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <div className="text-[13px] font-medium">{user.name}</div>
                <div className="text-[11px] text-[#64748B]">
                  {user.title} · {ROLE_LABELS[user.role]}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white p-1">
              {allowedNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded px-2.5 py-1 text-[12px] text-[#64748B] hover:bg-[#F7F8FA] hover:text-[#0F172A]",
                    user?.route === item.to && "bg-[#0F172A] text-white hover:bg-[#1E293B] hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 rounded-md text-[12px] text-[#64748B]"
              onClick={() => navigate({ to: "/login", search: { switch: 1 } })}
            >
              <UserRound className="h-3.5 w-3.5" />
              Switch user
            </Button>
            {actions}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 gap-2 rounded-md text-[13px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-8 py-6">{children}</main>
    </div>
  );
}
