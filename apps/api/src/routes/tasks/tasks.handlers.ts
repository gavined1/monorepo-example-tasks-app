import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/api/lib/types";

import { createDb } from "@/api/db";
import { tasks } from "@/api/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";
import { getActiveOrganizationIdOr401 } from "@/api/lib/session-middleware";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const authResult = await getActiveOrganizationIdOr401(c);
  if (authResult instanceof Response) return authResult as unknown as Awaited<ReturnType<AppRouteHandler<ListRoute>>>;
  const { organizationId } = authResult;
  const db = createDb(c.env);
  const taskList = await db.query.tasks.findMany({
    where(fields, operators) {
      return operators.eq(fields.organizationId, organizationId);
    },
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  return c.json(taskList);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const authResult = await getActiveOrganizationIdOr401(c);
  if (authResult instanceof Response) return authResult as unknown as Awaited<ReturnType<AppRouteHandler<CreateRoute>>>;
  const { organizationId } = authResult;
  const db = createDb(c.env);
  const task = c.req.valid("json");
  const [inserted] = await db
    .insert(tasks)
    .values({ ...task, organizationId })
    .returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const authResult = await getActiveOrganizationIdOr401(c);
  if (authResult instanceof Response) return authResult as unknown as Awaited<ReturnType<AppRouteHandler<GetOneRoute>>>;
  const { organizationId } = authResult;
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const task = await db.query.tasks.findFirst({
    where(fields) {
      return and(
        eq(fields.id, id),
        eq(fields.organizationId, organizationId),
      );
    },
  });

  if (!task) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const authResult = await getActiveOrganizationIdOr401(c);
  if (authResult instanceof Response) return authResult as unknown as Awaited<ReturnType<AppRouteHandler<PatchRoute>>>;
  const { organizationId } = authResult;
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [task] = await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, id), eq(tasks.organizationId, organizationId)))
    .returning();

  if (!task) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove = (async (c: Parameters<AppRouteHandler<RemoveRoute>>[0]) => {
  const authResult = await getActiveOrganizationIdOr401(c);
  if (authResult instanceof Response) return authResult as unknown as Awaited<ReturnType<AppRouteHandler<RemoveRoute>>>;
  const { organizationId } = authResult;
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const result: D1Response = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.organizationId, organizationId)));

  if (result.meta.changes === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
}) as AppRouteHandler<RemoveRoute>;
