// app/api/caixas/lifo/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const palletId = Number(searchParams.get("palletId"));

        if (!palletId) {
            return NextResponse.json({ error: "palletId inválido" }, { status: 400 });
        }

        // Busca a última caixa do pallet (LIFO)
        const ultimaCaixa = await prisma.caixa.findFirst({
            where: { palletId },
            orderBy: { id: "desc" },
        });

        if (!ultimaCaixa) {
            return NextResponse.json({ error: "Nenhuma caixa para remover" }, { status: 400 });
        }

        await prisma.caixa.delete({ where: { id: ultimaCaixa.id } });

        return NextResponse.json({ ok: true, caixaRemovida: ultimaCaixa.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao remover caixa" }, { status: 500 });
    }
}