/*
  Warnings:

  - You are about to drop the column `tag` on the `error_issues` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "error_issues" DROP COLUMN "tag";

-- CreateTable
CREATE TABLE "error_issue_tags" (
    "id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,
    "tag_name" TEXT NOT NULL,

    CONSTRAINT "error_issue_tags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "error_issue_tags" ADD CONSTRAINT "error_issue_tags_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "error_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
