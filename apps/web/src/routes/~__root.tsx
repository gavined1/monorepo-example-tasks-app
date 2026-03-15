import type { Session } from "@/web/lib/auth-client";

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import AppNavbar from "../components/app-navbar";

export const Route = createRootRouteWithContext<{
  session: Session | null;
}>()({
  component: () => (
    <>
      <AppNavbar />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
        <TanStackRouterDevtools />
      </main>
    </>
  ),
});
