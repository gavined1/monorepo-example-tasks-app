/**
 * Better Auth server instance factory.
 * Creates an auth instance per request using Workers env (D1, secrets, AUTH_URL).
 * When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, sessions
 * and rate limits use Redis; sessions are also stored in D1 for durability.
 * Organization plugin: tasks are scoped by active organization.
 * See apps/api/docs/better-auth-best-practices.md for security and production notes.
 */
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

import type { AppEnv } from "./types";

import { createRedisStorage } from "./redis-storage";

export function createAuth(env: AppEnv["Bindings"]) {
  const authUrl = env.AUTH_URL ?? "http://localhost:5173/api/auth";
  const baseURL = new URL(authUrl).origin;
  const basePath = new URL(authUrl).pathname;
  const redisStorage = createRedisStorage(env);

  return betterAuth({
    database: env.DB,
    secret: env.AUTH_SECRET,
    baseURL,
    basePath: basePath || "/api/auth",
    trustedOrigins: [baseURL],
    plugins: [organization()],
    ...(redisStorage && {
      secondaryStorage: redisStorage,
      session: {
        storeSessionInDatabase: true,
      },
    }),
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
    },
    advanced: {
      useSecureCookies: baseURL.startsWith("https://"),
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
  });
}
