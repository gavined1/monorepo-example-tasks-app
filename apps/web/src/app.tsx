import { authClient, type Session } from "@/web/lib/auth-client";
import { routeTree } from "@/web/route-tree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";

const router = createRouter({
  routeTree,
  context: {
    session: undefined as Session | null,
  },
});

declare module "@tanstack/react-router" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { data: session } = authClient.useSession();
  return <RouterProvider router={router} context={{ session: session ?? null }} />;
}
