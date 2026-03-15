import { getMigrations } from "better-auth/db/migration";
import { notFound, onError } from "stoker/middlewares";

import type { AppOpenAPI } from "./types";

import { createAuth } from "./auth";
import { BASE_PATH } from "./constants";
import createRouter from "./create-router";

export default function createApp() {
  const app = createRouter()
    .use("*", (c, next) => {
      if (c.req.path.startsWith(BASE_PATH)) {
        return next();
      }
      // SPA redirect to /index.html
      const requestUrl = new URL(c.req.raw.url);
      return c.env.ASSETS.fetch(new URL("/index.html", requestUrl.origin));
    })
    .basePath(BASE_PATH) as AppOpenAPI;

  app
    .on(["GET", "POST"], "/auth/*", async (c) => {
      try {
        const auth = createAuth(c.env);
        return await auth.handler(c.req.raw);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const hint = /no such table|SQLITE_ERROR|table.*does not exist/i.test(message)
          ? " Run POST /api/migrate-auth to create Better Auth tables (user, session, organization, member, invitation)."
          : "";
        return c.json(
          { error: "Auth error", message: message + hint },
          500,
        );
      }
    })
    .post("/migrate-auth", async (c) => {
      try {
        const auth = createAuth(c.env);
        const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
          auth.options,
        );
        if (toBeCreated.length === 0 && toBeAdded.length === 0) {
          return c.json({ message: "No migrations needed" });
        }
        await runMigrations();
        return c.json({
          message: "Migrations completed successfully",
          created: toBeCreated.map((t) => t.table),
          added: toBeAdded.map((t) => t.table),
        });
      } catch (error) {
        return c.json(
          {
            error:
              error instanceof Error ? error.message : "Migration failed",
          },
          500,
        );
      }
    })
    .notFound(notFound)
    .onError(onError);

  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
