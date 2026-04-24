/*
  Warnings:

  - Added the required column `reason` to the `score_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "score_logs" ADD COLUMN     "reason" TEXT NOT NULL;
