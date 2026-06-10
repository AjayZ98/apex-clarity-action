import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel — AI PMO Intelligence" },
      {
        name: "description",
        content:
          "Sentinel is an AI PMO intelligence platform for Nexus Digital Solutions — built for CXO-grade portfolio command.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-[#0F172A] text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-[28px] font-semibold tracking-tight text-[#0F172A]">
          Sentinel · AI PMO Intelligence
        </h1>
        <p className="mt-2 text-[14px] text-[#64748B]">
          Executive command center for portfolio risk, financial exposure, and PMO course
          correction at Nexus Digital Solutions.
        </p>
        <Link
          to="/leadership"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#0F172A] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1E293B]"
        >
          Enter Leadership View
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
