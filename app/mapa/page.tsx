"use client"

import { useEffect, useState } from "react"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { PalletItem } from "@/components/PalletItem"
import { ModalPallet } from "@/components/ModalPallet"
import { Camara3D } from "@/components/Camara3D" // 🔥 NOVO

const PALLET_WIDTH = 50
const PALLET_DEPTH = 40

type Camara = {
    id: number
    nome: string
    largura: number
    profundidade: number
    altura: number
}

type Caixa = {
    id: number
    modeloId: number
    largura: number
    profundidade: number
    altura: number
    posX: number
    posY: number
    posZ: number
}

type Pallet = {
    id: number
    codigo: string
    camaraId: number
    posX: number
    posY: number
    posZ: number
    largura: number
    profundidade: number
    altura: number
    situacao: string
    caixas: Caixa[]
}

type ModeloCaixa = {
    id: number
    nome: string
    cor: string
    largura: number
    profundidade: number
    altura: number
}

export default function MapaPage() {
    const [pallets, setPallets] = useState<Pallet[]>([])
    const [camaras, setCamaras] = useState<Camara[]>([])
    const [camaraSelecionada, setCamaraSelecionada] = useState<Camara | null>(null)
    const [modelos, setModelos] = useState<ModeloCaixa[]>([])

    const [palletSelecionado, setPalletSelecionado] = useState<Pallet | null>(null)
    const [mostrarModal, setMostrarModal] = useState(false)

    const [modo3D, setModo3D] = useState(false) // 🔥 NOVO

    const [novaCamara, setNovaCamara] = useState({
        nome: "",
        largura: "10",
        profundidade: "10",
        altura: "3",
    })

    async function carregar() {
        try {
            const resC = await fetch("/api/camaras")
            const camarasData: Camara[] = await resC.json()
            setCamaras(camarasData)

            setCamaraSelecionada((prev: Camara | null) => {
                if (!prev) return camarasData[0] || null
                const atualizada = camarasData.find(c => c.id === prev.id)
                return atualizada || camarasData[0] || null
            })

            const resP = await fetch("/api/pallets")
            const palletsData: Pallet[] = await resP.json()
            setPallets(palletsData)

            const resM = await fetch("/api/modelos-caixa")
            const modelosData: ModeloCaixa[] = await resM.json()
            setModelos(modelosData)

        } catch (err) {
            console.error("Erro ao carregar:", err)
        }
    }

    useEffect(() => {
        carregar()
    }, [])
    useEffect(() => {
        console.log("PALLETS:", pallets)
    }, [pallets])

    function atualizarPalletNoEstado(palletAtualizado: Pallet) {
        setPallets(prev =>
            prev.map(p => p.id === palletAtualizado.id ? palletAtualizado : p)
        )
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, delta } = event
        const id = Number(String(active.id).replace("pallet-", ""))

        setPallets(prev =>
            prev.map(p => {
                if (p.id !== id) return p

                const novoX = Math.round((p.posX * PALLET_WIDTH + delta.x) / PALLET_WIDTH)
                const novoY = Math.round((p.posY * PALLET_DEPTH + delta.y) / PALLET_DEPTH)

                fetch("/api/pallets/update-posicao", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: p.id, posX: novoX, posY: novoY }),
                })

                return { ...p, posX: novoX, posY: novoY }
            })
        )
    }

    function estaSobreposto(pallet: Pallet) {
        return pallets.some(
            p =>
                p.id !== pallet.id &&
                p.camaraId === pallet.camaraId &&
                p.posX === pallet.posX &&
                p.posY === pallet.posY
        )
    }

    async function criarPallet() {
        if (!camaraSelecionada) return

        const numero =
            pallets.filter(p => p.camaraId === camaraSelecionada.id).length + 1

        const codigo = `P-${String(numero).padStart(3, "0")}`

        await fetch("/api/pallets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                codigo,
                camaraId: camaraSelecionada.id,
                posX: 0,
                posY: 0,
            }),
        })

        carregar()
    }

    return (
        <div className="h-screen w-screen bg-green-50 flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-center p-4 bg-white shadow">
                <h1 className="text-xl font-bold text-green-800">
                    🧊 Mapa de Câmaras
                </h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setModo3D(!modo3D)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                        {modo3D ? "Ver 2D" : "Ver 3D"}
                    </button>

                    <button
                        onClick={criarPallet}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                        + Pallet
                    </button>
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="flex flex-1 overflow-hidden">

                {/* MAPA */}
                <div className="flex-1 p-4 overflow-hidden">

                    <select
                        value={camaraSelecionada?.id || ""}
                        onChange={e => {
                            const camara = camaras.find(c => c.id === Number(e.target.value))
                            setCamaraSelecionada(camara || null)
                        }}
                        className="border p-2 rounded-lg mb-2"
                    >
                        {camaras.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.nome}
                            </option>
                        ))}
                    </select>

                    {camaraSelecionada && (
                        <div className="flex-1 bg-white rounded-xl shadow p-2 h-full">

                            {modo3D ? (
                                <Camara3D
                                    camara={camaraSelecionada}
                                    pallets={pallets.filter(
                                        p => p.camaraId === camaraSelecionada.id
                                    )}
                                />
                            ) : (
                                <div
                                    className="relative mx-auto"
                                    style={{
                                        width: camaraSelecionada.largura * PALLET_WIDTH,
                                        height: camaraSelecionada.profundidade * PALLET_DEPTH,
                                        backgroundColor: "#f9fafb",
                                        backgroundSize: `${PALLET_WIDTH}px ${PALLET_DEPTH}px`,
                                        backgroundImage:
                                            'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
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
                                                    onClick={setPalletSelecionado}
                                                />
                                            ))}
                                    </DndContext>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PALLET */}
            {palletSelecionado && (
                <ModalPallet
                    pallet={palletSelecionado}
                    modelos={modelos}
                    onClose={() => setPalletSelecionado(null)}
                    onAtualizar={atualizarPalletNoEstado}
                    onRemoverPallet={(id: number) => {
                        setPallets(prev => prev.filter(p => p.id !== id))
                        setPalletSelecionado(null)
                    }}
                />
            )}
        </div>
    )
}