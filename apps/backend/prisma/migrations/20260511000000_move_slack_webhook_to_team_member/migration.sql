-- AlterTable
ALTER TABLE "team_members" ADD COLUMN "slack_webhook_url" TEXT;

-- Preserve existing team-level webhook settings by assigning them to the leader.
UPDATE "team_members"
SET "slack_webhook_url" = "teams"."slack_webhook_url"
FROM "teams"
WHERE "team_members"."team_id" = "teams"."id"
  AND "team_members"."role" = 'LEADER'
  AND "teams"."slack_webhook_url" IS NOT NULL;

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "slack_webhook_url";
