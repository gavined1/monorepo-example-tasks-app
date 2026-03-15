/**
 * Resolves the current session and active organization for task routes.
 * Returns the organization ID or a 401 Response. Use in handlers instead of
 * middleware to preserve OpenAPI router types for the client.
 */
import type { Context } from "hono";

import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppEnv } from "./types";

import { createAuth } from "./auth";

export async function getActiveOrganizationIdOr401(
  c: Context<AppEnv>,
): Promise<{ organizationId: string } | Response> {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json(
      { message: "Unauthorized. Sign in to access tasks." },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  const activeOrganizationId = session.session?.activeOrganizationId ?? null;
  if (!activeOrganizationId) {
    return c.json(
      {
        message:
          "No active organization. Create or select an organization to view tasks.",
      },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  return { organizationId: activeOrganizationId };
}
