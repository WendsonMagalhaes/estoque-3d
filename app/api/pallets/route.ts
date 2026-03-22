// app/api/pallets/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ✅ GET - busca todos os pallets
export async function GET() {
    try {
        const pallets = await prisma.pallet.findMany({
            include: {
                caixas: true, // mantém para front se precisar
            },
        })

        // Retorna exatamente o que está no banco
        return NextResponse.json(pallets)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erro ao buscar pallets" }, { status: 500 })
    }
}

// ✅ POST - cria pallet
export async function POST(req: Request) {
    try {
        const body = await req.json()

        const pallet = await prisma.pallet.create({
            data: {
                codigo: body.codigo,
                camaraId: body.camaraId,
                posX: body.posX ?? 0,
                posY: body.posY ?? 0,
                posZ: body.posZ ?? 0,
                largura: 1,
                profundidade: 1.2,
                altura: 0.15, // altura inicial do pallet
                situacao: "livre", // cria como livre por padrão
            },
        })

        return NextResponse.json(pallet)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erro ao criar pallet" }, { status: 500 })
    }
}