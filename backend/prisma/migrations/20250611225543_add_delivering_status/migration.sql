/*
  Warnings:

  - You are about to drop the column `createdAt` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `isUrgent` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `purchases` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sequence_id]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `total_cost` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Made the column `status_updated_at` on table `purchases` required. This step will fail if there are existing NULL values in that column.
  - Made the column `logistics_cost` on table `purchases` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "purchases_sequence_id_idx";

-- DropIndex
DROP INDEX "purchases_status_updated_at_idx";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "createdAt",
DROP COLUMN "isUrgent",
DROP COLUMN "totalCost",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "total_cost" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "status_updated_at" SET NOT NULL,
ALTER COLUMN "logistics_cost" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "purchases_sequence_id_key" ON "purchases"("sequence_id");
