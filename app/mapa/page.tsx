"use client"

import { useEffect, useState } from "react"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { PalletItem } from "@/components/PalletItem"

const PALLET_WIDTH = 50
const PALLET_DEPTH = 40

export default function MapaPage() {
    const [pallets, setPallets] = useState<any[]>([])
    const [camaras, setCamaras] = useState<any[]>([])
    const [camaraSelecionada, setCamaraSelecionada] = useState<any>(null)

    async function carregar() {
        try {
            const resC = await fetch("/api/camaras")
            const camarasData = await resC.json()
            setCamaras(camarasData)
            setCamaraSelecionada(camarasData[0] || null)

            const resP = await fetch("/api/pallets")
            const data = await resP.json()
            setPallets(data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        carregar()
    }, [])

    function handleDragEnd(event: DragEndEvent) {
        const { active, delta } = event
        const id = String(active.id).replace("pallet-", "")

        setPallets(prev =>
            prev.map(p => {
                if (p.id != id) return p

                const novoX = Math.round((p.posX * PALLET_WIDTH + delta.x) / PALLET_WIDTH)
                const novoY = Math.round((p.posY * PALLET_DEPTH + delta.y) / PALLET_DEPTH)

                fetch("/api/pallets/update-posicao", {
                    method: "POST",
                    body: JSON.stringify({ id: p.id, posX: novoX, posY: novoY }),
                })

                return { ...p, posX: novoX, posY: novoY }
            })
        )
    }

    // Função para checar se pallet está sobre outro
    function estaSobreposto(pallet: any) {
        return pallets.some(
            p =>
                p.id !== pallet.id &&
                p.camaraId === pallet.camaraId &&
                p.posX === pallet.posX &&
                p.posY === pallet.posY
        )
    }

    return (
        <div className="p-4 flex flex-col items-center justify-center min-h-screen">
            <h1 className="font-bold text-xl mb-4">🧊 Editor de Câmaras</h1>

            <select
                value={camaraSelecionada?.id || ""}
                onChange={e => {
                    const camara = camaras.find(c => c.id === Number(e.target.value))
                    setCamaraSelecionada(camara)
                }}
                className="mb-4 p-2 border rounded"
            >
                {camaras.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
            </select>

            {camaraSelecionada && (
                <>
                    <div
                        className="relative border-4 border-purple-500 shadow-lg overflow-auto mx-auto"
                        style={{
                            width: camaraSelecionada.largura * PALLET_WIDTH,
                            height: camaraSelecionada.profundidade * PALLET_DEPTH,
                            backgroundColor: "#f0f0f0",
                            backgroundSize: `${PALLET_WIDTH}px ${PALLET_DEPTH}px`,
                            backgroundImage:
                                'linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)',
                            maxWidth: "90vw",
                            maxHeight: "70vh",
                        }}
                    >
                        <DndContext onDragEnd={handleDragEnd}>
                            {pallets
                                .filter(p => p.camaraId === camaraSelecionada.id)
                                .map(pallet => (
                                    <PalletItem
                                        key={pallet.id}
                                        pallet={pallet}
                                        palletWidth={PALLET_WIDTH}
                                        palletDepth={PALLET_DEPTH}
                                        sobreposto={estaSobreposto(pallet)}
                                    />
                                ))}
                        </DndContext>
                    </div>

                    {/* Legenda */}
                    <div className="mt-4 flex gap-4 flex-wrap">
                        <div className="flex items-center gap-1"><div className="w-5 h-5 bg-green-500 border"></div> Palete livre</div>
                        <div className="flex items-center gap-1"><div className="w-5 h-5 bg-red-500 border"></div> Palete lotado</div>
                        <div className="flex items-center gap-1"><div className="w-5 h-5 bg-yellow-500 border"></div> Palete com disponibilidade</div>
                        <div className="flex items-center gap-1"><div className="w-5 h-5 bg-purple-500 border"></div> Palete sobreposto lotado</div>
                        <div className="flex items-center gap-1"><div className="w-5 h-5 bg-orange-500 border"></div> Palete sobreposto com disponibilidade</div>
                    </div>
                </>
            )}
        </div>
    )
}