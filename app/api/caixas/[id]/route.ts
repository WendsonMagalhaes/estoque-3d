// app/api/caixas/[id]/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params
        const id = Number(idStr)

        if (isNaN(id)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 })
        }

        // Remove a última caixa do pallet (LIFO)
        // Busca todas as caixas do pallet ordenadas pela data de criação decrescente
        const ultimaCaixa = await prisma.caixa.findFirst({
            where: { palletId: id },
            orderBy: { id: "desc" }, // assume que id crescente = ordem de adição
        })

        if (!ultimaCaixa) {
            return NextResponse.json({ error: "Nenhuma caixa para remover" }, { status: 400 })
        }

        await prisma.caixa.delete({ where: { id: ultimaCaixa.id } })

        return NextResponse.json({ ok: true, caixaRemovida: ultimaCaixa.id })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erro ao remover caixa" }, { status: 500 })
    }
}