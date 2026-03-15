-- Scope tasks to Better Auth organization. Existing rows keep organizationId NULL
-- and are excluded from org-scoped list until backfilled.
ALTER TABLE `tasks` ADD COLUMN `organizationId` text;
