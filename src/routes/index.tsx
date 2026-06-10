import { createFileRoute, redirect } from "@tanstack/react-router";

import { getStoredUser } from "@/lib/auth/session";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (user) {
      throw redirect({ to: user.route });
    }
    throw redirect({ to: "/login" });
  },
});
