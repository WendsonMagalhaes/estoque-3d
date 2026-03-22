/*
  Warnings:

  - You are about to drop the column `palletPaiId` on the `Pallet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pallet" DROP CONSTRAINT "Pallet_palletPaiId_fkey";

-- DropIndex
DROP INDEX "Pallet_codigo_key";

-- AlterTable
ALTER TABLE "Pallet" DROP COLUMN "palletPaiId",
ALTER COLUMN "largura" DROP DEFAULT,
ALTER COLUMN "profundidade" DROP DEFAULT;
