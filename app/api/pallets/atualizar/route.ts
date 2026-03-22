// app/api/pallets/atualizar/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { palletId, situacao, altura, caixas } = body;

        if (!palletId) {
            return NextResponse.json(
                { error: "ID do pallet inválido" },
                { status: 400 }
            );
        }

        // Garante que 'caixas' seja sempre um array
        const caixasArray = Array.isArray(caixas) ? caixas : [];

        // Atualiza pallet e suas caixas
        const palletAtualizado = await prisma.pallet.update({
            where: { id: palletId },
            data: {
                situacao,
                altura,
                caixas: {
                    deleteMany: {}, // remove todas as caixas antigas
                    create: caixasArray.map((c: any) => ({
                        modeloId: c.modeloId,
                        largura: c.largura,
                        profundidade: c.profundidade,
                        altura: c.altura,
                        posX: c.posX,
                        posY: c.posY,
                        posZ: c.posZ,
                    })),
                },
            },
            include: { caixas: true }, // retorna as caixas atualizadas
        });

        return NextResponse.json({ ok: true, pallet: palletAtualizado });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Erro ao atualizar pallet" },
            { status: 500 }
        );
    }
}