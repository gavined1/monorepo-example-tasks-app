-- Drop Auth.js tables so Better Auth can create its own schema.
-- Run this migration before calling POST /api/migrate-auth to create Better Auth tables.
DROP TABLE IF EXISTS authenticator;
DROP TABLE IF EXISTS "verificationToken";
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS user;
