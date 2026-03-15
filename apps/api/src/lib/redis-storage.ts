/**
 * Better Auth secondary storage using Upstash Redis (HTTP-based, Workers-compatible).
 * Sessions and rate-limit counters are stored in Redis when configured.
 */
import { Redis } from "@upstash/redis";

import type { AppEnv } from "./types";

export type SecondaryStorage = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

/**
 * Creates Better Auth secondary storage from Upstash Redis env vars.
 * Returns undefined when URL or token is missing (e.g. local dev without Redis).
 */
export function createRedisStorage(
  env: Pick<
    AppEnv["Bindings"],
    "UPSTASH_REDIS_REST_URL" | "UPSTASH_REDIS_REST_TOKEN"
  >,
): SecondaryStorage | undefined {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return undefined;

  const redis = new Redis({ url, token });

  return {
    get: async (key: string) => {
      const v = await redis.get(key);
      if (v == null) return null;
      return typeof v === "string" ? v : JSON.stringify(v);
    },
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl != null && ttl > 0) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key: string) => {
      await redis.del(key);
    },
  };
}
