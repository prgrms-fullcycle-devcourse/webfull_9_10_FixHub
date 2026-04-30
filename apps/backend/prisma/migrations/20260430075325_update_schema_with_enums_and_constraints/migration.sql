/*
  Warnings:

  - The `status` column on the `error_issues` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `log_type` column on the `error_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `team_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[issue_id,tag_name]` on the table `error_issue_tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_id,user_id]` on the table `team_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('UNSOLVED', 'SOLVED');

-- CreateEnum
CREATE TYPE "logType" AS ENUM ('SENT', 'RECEIVED');

-- AlterTable
ALTER TABLE "error_issues" DROP COLUMN "status",
ADD COLUMN     "status" "IssueStatus" NOT NULL DEFAULT 'UNSOLVED';

-- AlterTable
ALTER TABLE "error_logs" DROP COLUMN "log_type",
ADD COLUMN     "log_type" "logType" NOT NULL DEFAULT 'SENT';

-- AlterTable
ALTER TABLE "team_members" DROP COLUMN "role",
ADD COLUMN     "role" "TeamRole" NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE UNIQUE INDEX "error_issue_tags_issue_id_tag_name_key" ON "error_issue_tags"("issue_id", "tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");
