/**
 * Better Auth client for React. Use useSession(), signIn.social(), signOut() in components.
 * Organization plugin: useListOrganizations(), useActiveOrganization(), organization.create(), organization.setActive().
 */

import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL
  = typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env?.VITE_APP_URL ?? "http://localhost:5173";

export const authClient = createAuthClient({
  baseURL,
  plugins: [organizationClient()],
  fetchOptions: {
    credentials: "include",
  },
});

export type Session = Awaited<ReturnType<typeof authClient.getSession>>;
