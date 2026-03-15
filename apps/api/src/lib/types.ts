import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

import type { BASE_PATH } from "./constants";

/** Session from Better Auth getSession (with organization plugin: session.activeOrganizationId). */
export type AuthSession = {
  user: { id: string; email?: string | null; name?: string | null; image?: string | null };
  session: { activeOrganizationId?: string | null };
};

export type AppEnv = {
  Bindings: {
    AUTH_SECRET: string;
    AUTH_URL?: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ASSETS: Fetcher;
    DB: D1Database;
    /** Upstash Redis REST URL. When set with UPSTASH_REDIS_REST_TOKEN, sessions and rate limits use Redis. */
    UPSTASH_REDIS_REST_URL?: string;
    /** Upstash Redis REST token. Set via wrangler secret in production. */
    UPSTASH_REDIS_REST_TOKEN?: string;
  };
  Variables: {
    /** Set by session middleware for routes that require auth; includes activeOrganizationId. */
    session: AuthSession | null;
  };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
