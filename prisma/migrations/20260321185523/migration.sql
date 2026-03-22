/*
  Warnings:

  - You are about to drop the column `destinoId` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the column `origemId` on the `Movimentacao` table. All the data in the column will be lost.
  - You are about to drop the `Estoque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Localizacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Estoque" DROP CONSTRAINT "Estoque_localizacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Estoque" DROP CONSTRAINT "Estoque_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "Movimentacao" DROP CONSTRAINT "Movimentacao_destinoId_fkey";

-- DropForeignKey
ALTER TABLE "Movimentacao" DROP CONSTRAINT "Movimentacao_origemId_fkey";

-- AlterTable
ALTER TABLE "Movimentacao" DROP COLUMN "destinoId",
DROP COLUMN "origemId",
ADD COLUMN     "destinoCaixaId" INTEGER,
ADD COLUMN     "origemCaixaId" INTEGER;

-- DropTable
DROP TABLE "Estoque";

-- DropTable
DROP TABLE "Localizacao";

-- CreateTable
CREATE TABLE "Camara" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "largura" DOUBLE PRECISION NOT NULL,
    "profundidade" DOUBLE PRECISION NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Camara_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pallet" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "camaraId" INTEGER NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "posZ" DOUBLE PRECISION NOT NULL,
    "largura" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "profundidade" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
    "altura" DOUBLE PRECISION NOT NULL,
    "palletPaiId" INTEGER,

    CONSTRAINT "Pallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caixa" (
    "id" SERIAL NOT NULL,
    "palletId" INTEGER NOT NULL,
    "largura" DOUBLE PRECISION NOT NULL,
    "profundidade" DOUBLE PRECISION NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,
    "posX" DOUBLE PRECISION NOT NULL,
    "posY" DOUBLE PRECISION NOT NULL,
    "posZ" DOUBLE PRECISION NOT NULL,
    "caixaPaiId" INTEGER,

    CONSTRAINT "Caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCaixa" (
    "id" SERIAL NOT NULL,
    "caixaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "ItemCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pallet_codigo_key" ON "Pallet"("codigo");

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_camaraId_fkey" FOREIGN KEY ("camaraId") REFERENCES "Camara"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pallet" ADD CONSTRAINT "Pallet_palletPaiId_fkey" FOREIGN KEY ("palletPaiId") REFERENCES "Pallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_palletId_fkey" FOREIGN KEY ("palletId") REFERENCES "Pallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_caixaPaiId_fkey" FOREIGN KEY ("caixaPaiId") REFERENCES "Caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCaixa" ADD CONSTRAINT "ItemCaixa_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "Caixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCaixa" ADD CONSTRAINT "ItemCaixa_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_origemCaixaId_fkey" FOREIGN KEY ("origemCaixaId") REFERENCES "Caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_destinoCaixaId_fkey" FOREIGN KEY ("destinoCaixaId") REFERENCES "Caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
