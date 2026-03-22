-- AlterTable
ALTER TABLE "Pallet" ADD COLUMN     "palletPaiId" INTEGER;

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_palletPaiId_fkey" FOREIGN KEY ("palletPaiId") REFERENCES "Pallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
