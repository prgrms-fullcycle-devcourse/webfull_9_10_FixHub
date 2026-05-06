-- AlterTable
ALTER TABLE "score_logs" ADD COLUMN     "issue_id" UUID;

-- AddForeignKey
ALTER TABLE "score_logs" ADD CONSTRAINT "score_logs_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "error_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
