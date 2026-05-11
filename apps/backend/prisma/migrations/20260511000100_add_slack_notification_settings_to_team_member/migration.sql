ALTER TABLE "team_members"
ADD COLUMN "slack_notify_issue_created" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "slack_notify_comment_on_my_issue" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "slack_notify_reply_on_my_comment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "slack_notify_comment_adopted" BOOLEAN NOT NULL DEFAULT true;
