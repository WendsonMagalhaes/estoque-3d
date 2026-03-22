import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { podeAdicionarCaixa } from "@/lib/pallet"

export async function POST(req: Request) {
    try {
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
        const caixasCriadas: typeof caixas = []

        for (let i = 0; i < body.quantidade; i++) {
            const caixasPorLinha = Math.floor(pallet.largura / largura) || 1
            const caixasPorColuna = Math.floor(pallet.profundidade / profundidade) || 1
            const caixasPorCamada = caixasPorLinha * caixasPorColuna

            const index = caixas.length
            const indexNaCamada = index % caixasPorCamada

            const posX = (indexNaCamada % caixasPorLinha) * largura
            const posY = Math.floor(indexNaCamada / caixasPorLinha) * profundidade

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
                data: {
                    palletId: pallet.id,
                    modeloId: modelo.id,
                    ...novaCaixa,
                },
            })

            caixas.push(caixa)
            caixasCriadas.push(caixa)
        }

        // Atualiza altura e situação do pallet
        const ALTURA_BASE = 0.15
        const ALTURA_MAX = 2.0
        const alturaAtual = caixas.length > 0
            ? Math.max(...caixas.map(c => c.posZ + c.altura))
            : ALTURA_BASE

        const ocupadas = caixas.length
        const caixasPorLinha = Math.floor(pallet.largura / largura) || 1
        const caixasPorColuna = Math.floor(pallet.profundidade / profundidade) || 1
        const porCamada = caixasPorLinha * caixasPorColuna
        const camadas = Math.floor((ALTURA_MAX - ALTURA_BASE) / altura)
        const capacidadeTotal = porCamada * camadas

        let situacao = "ocupado"
        if (ocupadas === 0) situacao = "livre"
        else if (ocupadas >= capacidadeTotal) situacao = "lotado"

        await prisma.pallet.update({
            where: { id: pallet.id },
            data: { altura: alturaAtual, situacao },
        })

        // 🔹 Retorna também as caixas recém-adicionadas
        return NextResponse.json({
            ok: true,
            altura: alturaAtual,
            situacao,
            novasCaixas: caixasCriadas
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Erro ao adicionar caixas" }, { status: 500 })
    }
}