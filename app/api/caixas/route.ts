import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { podeAdicionarCaixa } from "@/lib/pallet"

export async function POST(req: Request) {
    const body = await req.json()

    const pallet = await prisma.pallet.findUnique({
        where: { id: body.palletId },
        include: { caixas: true },
    })

    const modelo = await prisma.modeloCaixa.findUnique({
        where: { id: body.modeloId },
    })

    if (!pallet || !modelo) {
        return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const largura = modelo.largura / 100
    const profundidade = modelo.profundidade / 100
    const altura = modelo.altura / 100

    let caixas = [...pallet.caixas]

    const caixasPorLinha = Math.floor(pallet.largura / largura) || 1
    const caixasPorColuna = Math.floor(pallet.profundidade / profundidade) || 1
    const caixasPorCamada = caixasPorLinha * caixasPorColuna

    for (let i = 0; i < body.quantidade; i++) {
        const index = caixas.length
        const camadaAtual = Math.floor(index / caixasPorCamada)
        const indexNaCamada = index % caixasPorCamada

        const linha = Math.floor(indexNaCamada / caixasPorColuna)  // ⚡ correção
        const coluna = indexNaCamada % caixasPorColuna             // ⚡ correção

        const posX = coluna * largura
        const posY = linha * profundidade

        const novaCaixa = { largura, profundidade, altura, posX, posY, posZ: 0 }

        const validacao = podeAdicionarCaixa(pallet, caixas, novaCaixa)
        if (!validacao.ok) {
            return NextResponse.json(
                { error: `Parou na caixa ${i + 1}: ${validacao.motivo}` },
                { status: 400 }
            )
        }

        novaCaixa.posZ = validacao.posZ!

        const caixa = await prisma.caixa.create({
            data: { palletId: pallet.id, modeloId: modelo.id, ...novaCaixa },
        })

        caixas.push(caixa)
    }

    return NextResponse.json({ ok: true })
}