//api/produtos/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const produtos = await prisma.produto.findMany()

        return NextResponse.json(produtos)
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const produto = await prisma.produto.create({
            data: {
                nome: body.nome,
                sku: body.sku,
            },
        })

        return NextResponse.json(produto)
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
    }
}