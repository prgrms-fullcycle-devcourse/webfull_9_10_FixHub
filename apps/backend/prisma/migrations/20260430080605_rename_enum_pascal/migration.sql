/*
  Warnings:

  - The `log_type` column on the `error_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('SENT', 'RECEIVED');

-- AlterTable
ALTER TABLE "error_logs" DROP COLUMN "log_type",
ADD COLUMN     "log_type" "LogType" NOT NULL DEFAULT 'SENT';

-- DropEnum
DROP TYPE "logType";
