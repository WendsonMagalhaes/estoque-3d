// app/api/camaras/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// ✅ GET
export async function GET() {
    try {
        const camaras = await prisma.camara.findMany({
            include: {
                pallets: true,
            },
        })
        return NextResponse.json(camaras)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Erro ao buscar câmaras" }, { status: 500 })
    }
}

// ✅ POST (🔥 FALTAVA ISSO)
export async function POST(req: Request) {
    try {
        const body = await req.json()

        const camara = await prisma.camara.create({
            data: {
                nome: body.nome,
                largura: body.largura,
                profundidade: body.profundidade,
                altura: body.altura, // ✅ ADICIONA ISSO
            },
        })

        return NextResponse.json(camara)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Erro ao criar câmara" }, { status: 500 })
    }
}