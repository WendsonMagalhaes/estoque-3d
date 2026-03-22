//api/modelos-caixa/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 🔵 GET - listar modelos
export async function GET() {
    try {
        const modelos = await prisma.modeloCaixa.findMany({
            orderBy: { id: "desc" },
        })

        return NextResponse.json(modelos)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Erro ao buscar modelos de caixa" },
            { status: 500 }
        )
    }
}

// 🔴 POST - criar modelo
export async function POST(req: Request) {
    try {
        const body = await req.json()

        // 🧠 validação básica
        if (!body.nome) {
            return NextResponse.json(
                { error: "Nome é obrigatório" },
                { status: 400 }
            )
        }

        if (
            body.largura <= 0 ||
            body.profundidade <= 0 ||
            body.altura <= 0
        ) {
            return NextResponse.json(
                { error: "Dimensões devem ser maiores que zero" },
                { status: 400 }
            )
        }

        const modelo = await prisma.modeloCaixa.create({
            data: {
                nome: body.nome,
                largura: Number(body.largura),
                profundidade: Number(body.profundidade),
                altura: Number(body.altura),
                cor: body.cor || "#3b82f6", // cor padrão
            },
        })

        return NextResponse.json(modelo, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Erro ao criar modelo de caixa" },
            { status: 500 }
        )
    }
}