import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const pallet = await prisma.pallet.update({
            where: { id: body.id },
            data: {
                posX: body.posX,
                posY: body.posY,
            },
        })

        return NextResponse.json(pallet)
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao atualizar posição" },
            { status: 500 }
        )
    }
}