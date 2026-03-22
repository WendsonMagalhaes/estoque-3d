"use client"

import { useEffect, useState } from "react"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { PalletItem } from "@/components/PalletItem"
import { ModalPallet } from "@/components/ModalPallet"

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

    const [novaCamara, setNovaCamara] = useState({
        nome: "",
        largura: "10",
        profundidade: "10",
        altura: "3",
    })

    async function carregar() {
        try {
            const resC = await fetch("/api/camaras");
            const text = await resC.text();
            const camarasData: Camara[] = JSON.parse(text);
            setCamaras(camarasData);

            setCamaraSelecionada((prev: Camara | null) => {
                if (!prev) return camarasData[0] || null;
                const camaraAtualizada = camarasData.find(c => c.id === prev.id);
                return camaraAtualizada || camarasData[0] || null;
            });

            const resP = await fetch("/api/pallets");
            const palletsData: Pallet[] = await resP.json();
            setPallets(palletsData);

            const resM = await fetch("/api/modelos-caixa");
            const modelosData: ModeloCaixa[] = await resM.json();
            setModelos(modelosData);

        } catch (err) {
            console.error("Erro ao carregar:", err);
        }
    }

    useEffect(() => {
        carregar()
    }, [])

    // 🔹 Atualiza apenas o pallet no estado local
    function atualizarPalletNoEstado(palletAtualizado: Pallet) {
        setPallets(prev =>
            prev.map(p => p.id === palletAtualizado.id ? palletAtualizado : p)
        );
    }

    // 🟢 DRAG
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

        const palletsDaCamara = pallets.filter(p => p.camaraId === camaraSelecionada.id)
        const numero = palletsDaCamara.length + 1
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

    async function criarCamara() {
        const res = await fetch("/api/camaras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: novaCamara.nome,
                largura: Number(novaCamara.largura),
                profundidade: Number(novaCamara.profundidade),
                altura: Number(novaCamara.altura),
            }),
        })

        if (!res.ok) {
            alert("Erro ao criar câmara")
            return
        }

        setMostrarModal(false)
        setNovaCamara({ nome: "", largura: "10", profundidade: "10", altura: "3" })
        carregar()
    }

    return (
        <div className="h-screen w-screen bg-green-50 overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 bg-white shadow">
                <h1 className="text-xl font-bold text-green-800">🧊 Mapa de Câmaras</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMostrarModal(true)}
                        className="bg-white border border-green-500 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50"
                    >
                        + Câmara
                    </button>
                    <button
                        onClick={criarPallet}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        + Pallet
                    </button>
                </div>
            </div>

            {/* CONTEÚDO */}
            <div className="flex flex-1 overflow-hidden">
                {/* MAPA */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    <select
                        value={camaraSelecionada?.id || ""}
                        onChange={e => {
                            const camara = camaras.find(c => c.id === Number(e.target.value))
                            setCamaraSelecionada(camara || null)
                        }}
                        className="border border-green-200 p-2 rounded-lg text-gray-800 mb-2"
                    >
                        {camaras.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>

                    {camaraSelecionada && (
                        <div className="flex-1 bg-white rounded-xl shadow p-2 overflow-auto">
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
                        </div>
                    )}
                </div>

                {/* LATERAL */}
                <div className="w-72 bg-white border-l p-4 flex flex-col gap-6">
                    <div>
                        <h2 className="font-bold text-green-800 mb-2">📦 Modelos</h2>
                        <div className="flex flex-wrap gap-2">
                            {modelos.map(m => (
                                <div key={m.id} className="px-2 py-1 text-xs rounded text-back" style={{ backgroundColor: m.cor }}>
                                    {m.nome}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="font-bold text-green-800 mb-2">🎯 Legenda</h2>
                        <div className="flex flex-col gap-2 text-sm font-bold text-zinc-500">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div> Livre
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-400 rounded"></div> Ocupado
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded"></div> Lotado
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CÂMARA */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-80 flex flex-col gap-3">
                        <h2 className="font-bold text-green-800">Nova Câmara</h2>
                        <input placeholder="Nome" value={novaCamara.nome} onChange={e => setNovaCamara({ ...novaCamara, nome: e.target.value })} className="border p-2 rounded text-gray-800" />
                        <input placeholder="Largura" value={novaCamara.largura} onChange={e => setNovaCamara({ ...novaCamara, largura: e.target.value.replace(/[^0-9]/g, "") })} className="border p-2 rounded text-gray-800" />
                        <input placeholder="Profundidade" value={novaCamara.profundidade} onChange={e => setNovaCamara({ ...novaCamara, profundidade: e.target.value.replace(/[^0-9]/g, "") })} className="border p-2 rounded text-gray-800" />
                        <input placeholder="Altura" value={novaCamara.altura} onChange={e => setNovaCamara({ ...novaCamara, altura: e.target.value.replace(/[^0-9]/g, "") })} className="border p-2 rounded text-gray-800" />

                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setMostrarModal(false)}>Cancelar</button>
                            <button onClick={criarCamara} className="bg-green-600 text-white px-3 py-1 rounded">Criar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔥 MODAL PALLET */}
            {palletSelecionado && (
                <ModalPallet
                    pallet={palletSelecionado}
                    modelos={modelos}
                    onClose={() => setPalletSelecionado(null)}
                    onAtualizar={atualizarPalletNoEstado} // ✅ função local
                    onRemoverPallet={(id: number) => {
                        setPallets(prev => prev.filter(p => p.id !== id))
                        setPalletSelecionado(null)
                    }}
                />
            )}
        </div>
    )
}