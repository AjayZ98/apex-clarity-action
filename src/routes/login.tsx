import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { getStoredUser } from "@/lib/auth/session";
import { DEMO_USERS } from "@/lib/auth/types";
import { usePortfolio } from "@/lib/portfolio-store";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    switch: search.switch === "1" || search.switch === 1,
  }),
  beforeLoad: ({ search }) => {
    if (search.switch) return;
    const user = getStoredUser();
    if (user) {
      throw redirect({ to: user.route });
    }
  },
  head: () => ({
    meta: [{ title: "Sign in — Sentinel PMO" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const { resetPortfolio } = usePortfolio();
  const navigate = useNavigate();

  const signIn = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (!user) return;
    login(user);
    navigate({ to: user.route });
  };

  const leadershipUsers = DEMO_USERS.filter((u) => u.role === "leadership");
  const pmoUsers = DEMO_USERS.filter((u) => u.role === "pmo");
  const pmUsers = DEMO_USERS.filter((u) => u.role === "pm");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-[#0F172A] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-[28px] font-semibold tracking-tight text-[#0F172A]">
            Sentinel · Sign in
          </h1>
          <p className="mt-2 text-[14px] text-[#64748B]">
            Demo mode — pick a role to explore the portfolio from a different lens.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <UserGroup title="Leadership" subtitle="Lands on /leadership" users={leadershipUsers} onSignIn={signIn} />
          <UserGroup title="PMO Head" subtitle="Lands on /pmo" users={pmoUsers} onSignIn={signIn} />
          <UserGroup title="Project Manager" subtitle="Lands on /pm" users={pmUsers} onSignIn={signIn} />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-center text-[12px] text-[#94A3B8]">
            Mock auth · Shared live state persists across refresh (localStorage)
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-md text-[12px]"
            onClick={resetPortfolio}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo data
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserGroup({
  title,
  subtitle,
  users,
  onSignIn,
}: {
  title: string;
  subtitle: string;
  users: (typeof DEMO_USERS)[number][];
  onSignIn: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <span className="text-[12px] font-medium uppercase tracking-wide text-[#64748B]">
          {title}
        </span>
        <span className="text-[11px] text-[#94A3B8]">{subtitle}</span>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <Card
            key={user.id}
            className="cursor-pointer border-[#E5E7EB] p-0 shadow-sm transition-colors hover:border-[#0F172A]/20 hover:bg-white"
            onClick={() => onSignIn(user.id)}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <div className="text-[14px] font-medium text-[#0F172A]">{user.name}</div>
                <div className="text-[12px] text-[#64748B]">
                  {user.title} · {user.email}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
