-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localizacao" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "rua" TEXT,
    "prateleira" TEXT,
    "nivel" TEXT,
    "posicaoX" INTEGER,
    "posicaoY" INTEGER,
    "posicaoZ" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Localizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estoque" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "localizacaoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "origemId" INTEGER,
    "destinoId" INTEGER,
    "quantidade" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Localizacao_codigo_key" ON "Localizacao"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Estoque_produtoId_localizacaoId_key" ON "Estoque"("produtoId", "localizacaoId");

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "Localizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "Localizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
