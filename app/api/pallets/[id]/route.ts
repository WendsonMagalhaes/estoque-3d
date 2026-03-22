// app/api/pallets/[id]/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // aguarda a Promise de params
        const { id: idStr } = await context.params
        const id = Number(idStr)

        if (isNaN(id)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 })
        }

        // Deleta todas as caixas do pallet antes
        await prisma.caixa.deleteMany({ where: { palletId: id } })

        // Deleta o pallet
        await prisma.pallet.delete({ where: { id } })

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erro ao excluir pallet" }, { status: 500 })
    }
}