-- AlterTable
ALTER TABLE "Caixa" ADD COLUMN     "modeloId" INTEGER;

-- CreateTable
CREATE TABLE "ModeloCaixa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "largura" DOUBLE PRECISION NOT NULL,
    "profundidade" DOUBLE PRECISION NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,
    "cor" TEXT,

    CONSTRAINT "ModeloCaixa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Caixa" ADD CONSTRAINT "Caixa_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "ModeloCaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
