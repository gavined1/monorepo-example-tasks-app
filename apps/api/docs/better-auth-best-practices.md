# Better Auth – Best Practices (summary)

Based on [better-auth.com/docs](https://better-auth.com/docs) and the Better Auth integration guide.

## Environment & secrets

- **Secret:** Min 32 characters. Prefer `BETTER_AUTH_SECRET` or `AUTH_SECRET`. Generate: `openssl rand -base64 32` or `npx auth secret`.
- **Base URL:** Set `BETTER_AUTH_URL` or `AUTH_URL` (e.g. `https://example.com`). In Workers, pass via `wrangler.toml` vars or `wrangler secret put`.
- **Production:** Never commit real secrets. Use `wrangler secret put AUTH_SECRET` and strong, random values.

## Security

- **trustedOrigins:** List exact origins allowed for CSRF (e.g. `https://yourapp.com`, `http://localhost:5173`). You already set this from `AUTH_URL` origin.
- **advanced.useSecureCookies:** `true` in production so cookies are `Secure` (HTTPS only). Default is secure in production.
- **advanced.disableCSRFCheck / disableOriginCheck:** Leave `false`; disabling them is a security risk.
- **advanced.trustedProxyHeaders:** Set `true` only if you run behind a trusted proxy (e.g. Cloudflare) and need `X-Forwarded-Host` / `X-Forwarded-Proto` for `baseURL`. Only enable if you trust the proxy.

## Rate limiting

- Enable to reduce abuse: `rateLimit: { enabled: true, window: 60, max: 100 }` (per window in seconds, max requests).
- Behind Cloudflare: set `advanced.ipAddress.ipAddressHeaders: ["cf-connecting-ip"]` so rate limiting uses the real client IP.

## Sessions

- **Cookie cache:** Default is `compact` (Base64url + HMAC). Options: `jwt`, `jwe` (encrypted).
- **session.expiresIn:** Default 7 days. Adjust as needed.
- **session.updateAge:** How often to refresh the session.
- **session.cookieCache.version:** Change to invalidate all existing sessions.
- **Redis (Upstash):** This project supports optional Upstash Redis for sessions and rate limits. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Wrangler (vars or secrets). When set, Better Auth uses Redis as secondary storage and also persists sessions to D1 (`session.storeSessionInDatabase: true`). Without Redis, sessions and rate limits use D1 only. Create a Redis database at [Upstash Console](https://console.upstash.com/); in production use `wrangler secret put UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

## Database

- Use a proper adapter: native D1 (current), or Drizzle/Prisma adapter for a single schema and migration story.
- Model/table names: config uses the **model** name (e.g. `user`), not necessarily the DB table name (e.g. `users`). Use `modelName` or adapter `schema` mapping if they differ.

### Better Auth migrations (organization plugin)

After enabling the organization plugin, run Better Auth migrations once so D1 has the required tables and columns:

```bash
curl -X POST http://localhost:8787/api/migrate-auth
```

(Use your API origin, e.g. `http://localhost:5173/api/migrate-auth` if the app proxies `/api` to the API.) This creates or updates tables such as `user`, `session`, `account`, `organization`, `member`, `invitation`, and adds `activeOrganizationId` (and optionally `activeTeamId`) to `session`. If you see 500 on `/api/auth/organization/list` or `/api/auth/organization/create`, run this endpoint first.

## GitHub OAuth – redirect URI

Better Auth’s callback URL is: **`{baseURL}{basePath}/callback/github`**.

In this app, `baseURL` and `basePath` come from `AUTH_URL` (origin and path). Use this exact URL as the **Authorization callback URL** in [GitHub OAuth App settings](https://github.com/settings/developers):

| Environment | AUTH_URL (example) | Redirect URI for GitHub |
|-------------|---------------------|--------------------------|
| **Local**   | `http://localhost:5173/api/auth` | `http://localhost:5173/api/auth/callback/github` |
| **Production** | `https://yourdomain.com/api/auth` | `https://yourdomain.com/api/auth/callback/github` |

**Steps:** GitHub → Settings → Developer settings → OAuth Apps → (your app) → set **Authorization callback URL** to the value above. For local + production you can add both callback URLs if the app allows multiple, or use separate OAuth apps per environment.

## Production checklist

1. Strong, random secret (32+ chars) via secrets manager / env.
2. `baseURL` / `AUTH_URL` set to the real app URL (HTTPS in prod).
3. `trustedOrigins` includes only your real frontend origin(s).
4. Rate limiting enabled with sensible `window` and `max`.
5. Secure cookies (default in production; or `advanced.useSecureCookies: true`).
6. GitHub OAuth **Authorization callback URL** set to `{AUTH_URL origin}{AUTH_URL path}/callback/github` (see table above).
7. Do not disable CSRF or origin checks unless you have a very good reason.

## References

- [Better Auth docs](https://better-auth.com/docs)
- [Options reference](https://better-auth.com/docs/reference/options)
- [Security](https://better-auth.com/docs/reference/security)
- [Session management](https://better-auth.com/docs/concepts/session-management)
- [Rate limit](https://better-auth.com/docs/concepts/rate-limit)
