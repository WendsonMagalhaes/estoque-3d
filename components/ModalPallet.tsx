"use client"
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react"

type Modelo = { id: number; nome: string; largura: number; profundidade: number; altura: number }
type Caixa = { id: number; modeloId: number; largura: number; profundidade: number; altura: number; posX: number; posY: number; posZ: number }
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
type ModalPalletProps = {
    pallet: Pallet
    modelos: Modelo[]
    onClose: () => void
    onAtualizar: (palletAtualizado: Pallet) => void
    onRemoverPallet: (palletId: number) => void
}

export function ModalPallet({ pallet, modelos, onClose, onAtualizar, onRemoverPallet }: ModalPalletProps) {
    const [modeloSelecionado, setModeloSelecionado] = useState<Modelo | null>(null)
    const [quantidade, setQuantidade] = useState<number>(1)
    const [camadaIndex, setCamadaIndex] = useState<number>(0)
    const [palletState, setPalletState] = useState<Pallet>(pallet);

    useEffect(() => {
        setPalletState(pallet);

        // Se houver caixas, seleciona automaticamente o modelo que está no pallet
        if (pallet.caixas.length > 0) {
            const modeloNoPallet = modelos.find(m => m.id === pallet.caixas[0].modeloId) || null;
            setModeloSelecionado(modeloNoPallet);
        } else {
            setModeloSelecionado(null);
        }
    }, [pallet, modelos]);

    function calcularCapacidade(modelo: Modelo | null, palletAtual: Pallet) {
        if (!modelo) return { total: 0, restante: 0, ocupadas: 0, porCamada: 0, camadas: 0, normalLinha: 0, normalColuna: 0 }

        const larguraPallet = Number(palletAtual.largura)
        const profundidadePallet = Number(palletAtual.profundidade)
        const larguraCaixa = Number(modelo.largura) / 100
        const profundidadeCaixa = Number(modelo.profundidade) / 100
        const alturaCaixa = Number(modelo.altura) / 100

        const normalLinha = Math.floor(larguraPallet / larguraCaixa)
        const normalColuna = Math.floor(profundidadePallet / profundidadeCaixa)
        const porCamada = normalLinha * normalColuna

        const alturaMax = 2.0
        const alturaBase = 0.15
        const camadas = Math.floor((alturaMax - alturaBase) / alturaCaixa)

        const capacidadeTotal = porCamada * camadas
        const ocupadas = palletAtual.caixas?.length || 0
        const restante = Math.max(capacidadeTotal - ocupadas, 0)

        return { total: capacidadeTotal, ocupadas, restante, porCamada, camadas, normalLinha, normalColuna }
    }

    const capacidade = calcularCapacidade(modeloSelecionado, palletState);

    function corSituacao(situacao: string) {
        switch (situacao.toLowerCase()) {
            case "livre": return "text-green-400"
            case "ocupado": return "text-yellow-400"
            case "lotado": return "text-red-500"
            default: return "text-white"
        }
    }

    function definirSituacao(ocupadas: number, total: number) {
        if (ocupadas === 0) return "livre"
        if (ocupadas < total) return "ocupado"
        return "lotado"
    }

    async function atualizarPalletLocalEBackend(novasCaixas: Caixa[], altura?: number) {
        const novaSituacao = definirSituacao(novasCaixas.length, capacidade.total);
        const palletAtualizado = { ...pallet, caixas: novasCaixas, situacao: novaSituacao, altura: altura ?? pallet.altura };

        onAtualizar(palletAtualizado);

        await fetch("/api/pallets/atualizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ palletId: pallet.id, situacao: novaSituacao, altura: altura ?? pallet.altura }),
        });
    }

    async function adicionarCaixas() {
        if (!modeloSelecionado) return;

        // Só permite modelo existente se pallet estiver ocupado
        if (palletState.situacao === 'ocupado') {
            const modeloNoPallet = palletState.caixas[0]?.modeloId;
            if (modeloSelecionado.id !== modeloNoPallet) {
                return alert("Só é possível adicionar caixas do modelo já existente neste pallet.");
            }
        }

        if (quantidade < 1) return alert("Quantidade deve ser maior que 0");
        if (quantidade > capacidade.restante) return alert(`Quantidade excede a capacidade (${capacidade.restante})`);

        try {
            const res = await fetch("/api/caixas/lote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ palletId: palletState.id, modeloId: modeloSelecionado.id, quantidade })
            });
            const data = await res.json();
            if (!res.ok) return alert(data.error);

            // Atualiza o estado local com as caixas retornadas pelo backend
            const novasCaixas = [...palletState.caixas, ...data.novasCaixas];
            const novaSituacao = definirSituacao(novasCaixas.length, capacidade.total);
            const novaAltura = data.altura ?? palletState.altura;

            const palletAtualizado: Pallet = {
                ...palletState,
                caixas: novasCaixas,
                situacao: novaSituacao,
                altura: novaAltura
            };

            // Atualiza o estado e notifica o parent
            setPalletState(palletAtualizado);
            onAtualizar(palletAtualizado);

            // Atualiza backend apenas uma vez
            await fetch("/api/pallets/atualizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    palletId: palletState.id,
                    situacao: novaSituacao,
                    altura: novaAltura,
                    caixas: novasCaixas   // ← importante!
                }),
            });

        } catch (err) {
            console.error(err);
            alert("Erro ao adicionar caixas");
        }
    }

    async function removerUltimaCaixa() {
        if (palletState.caixas.length === 0) return;
        if (!confirm("Remover última caixa?")) return;

        try {
            // ✅ Alterado para usar query param palletId
            const res = await fetch(`/api/caixas/lifo?palletId=${palletState.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) return alert(data.error);

            // Remove do estado local
            const novasCaixas = [...palletState.caixas];
            novasCaixas.pop();

            const novaSituacao = definirSituacao(novasCaixas.length, capacidade.total);
            const novaAltura = data.altura ?? palletState.altura;

            const palletAtualizado: Pallet = {
                ...palletState,
                caixas: novasCaixas,
                situacao: novaSituacao,
                altura: novaAltura
            };

            setPalletState(palletAtualizado);
            onAtualizar(palletAtualizado);

            // Atualiza backend apenas uma vez
            await fetch("/api/pallets/atualizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    palletId: palletState.id,
                    situacao: novaSituacao,
                    altura: novaAltura,
                    caixas: novasCaixas
                }),
            });

        } catch (err) {
            console.error(err);
            alert("Erro ao remover caixa");
        }
    }
    async function excluirCaixa(indiceGlobal: number) {
        if (!confirm("Deseja realmente remover esta caixa?")) return;

        const res = await fetch("/api/caixas/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ palletId: pallet.id, indice: indiceGlobal })
        });
        const data = await res.json();
        if (!res.ok) return alert(data.error);

        const novasCaixas = pallet.caixas.filter((_, idx) => idx !== indiceGlobal);
        atualizarPalletLocalEBackend(novasCaixas);
    }

    async function removerPallet() {
        if (!confirm("Deseja realmente remover este pallet?")) return;
        const res = await fetch(`/api/pallets/${pallet.id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) return alert(data.error);

        onRemoverPallet(pallet.id)
        onClose()
    }

    function renderCamadaAtual() {
        if (!modeloSelecionado) return null
        const { normalLinha, normalColuna, camadas, porCamada } = capacidade
        const caixas = [...palletState.caixas]

        return (
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={removerUltimaCaixa} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg transition">Remover Última</button>
                    <div className="flex gap-1">
                        <button onClick={() => setCamadaIndex(Math.max(camadaIndex - 1, 0))} disabled={camadaIndex === 0} className="px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50">←</button>
                        <span className="text-zinc-300 font-medium px-2">{camadaIndex + 1}/{camadas}</span>
                        <button onClick={() => setCamadaIndex(Math.min(camadaIndex + 1, camadas - 1))} disabled={camadaIndex >= camadas - 1} className="px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600 disabled:opacity-50">→</button>
                    </div>
                </div>

                <div className="grid gap-1 justify-center overflow-auto max-h-[300px] border p-2 rounded bg-zinc-900">
                    {Array.from({ length: normalColuna }).map((_, rowIdx) => (
                        <div key={rowIdx} className="flex gap-1 justify-center">
                            {Array.from({ length: normalLinha }).map((_, colIdx) => {
                                const indiceGlobal = camadaIndex * porCamada + rowIdx * normalLinha + colIdx
                                const preenchida = indiceGlobal < caixas.length
                                return (
                                    <div key={colIdx} className={`w-10 h-10 border rounded relative transition-colors ${preenchida ? 'bg-green-500 border-green-600' : 'bg-zinc-800 border-zinc-700'}`}>
                                        {preenchida && <button onClick={() => excluirCaixa(indiceGlobal)} className="absolute top-0 right-0 w-5 h-5 text-xs text-red-600 font-bold hover:text-red-400">×</button>}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

                <div className="text-xs text-zinc-400 mt-1">
                    Total: {capacidade.total} | Ocupadas: {capacidade.ocupadas} | Disponíveis: {capacidade.restante}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-zinc-900 text-zinc-100 rounded-2xl w-full max-w-[900px] flex flex-col gap-4 shadow-2xl border border-zinc-700 p-6">

                {/* Topo: código e remover */}
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-green-400 text-2xl">📦 {palletState.codigo}</h2>
                    <button onClick={removerPallet} className="text-red-500 hover:text-red-400 transition">
                        <Trash2 size={24} />
                    </button>
                </div>

                {/* Informações do pallet */}
                <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-zinc-800 p-3 rounded-lg">
                        Altura
                        <p className="font-bold text-white">{palletState.altura.toFixed(2)}m</p>
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-lg">
                        Situação
                        <p className={`font-bold ${corSituacao(palletState.situacao)}`}>{palletState.situacao}</p>
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-lg">
                        Caixas
                        <p className="font-bold text-white">{palletState.caixas.length}</p>
                    </div>
                    {modeloSelecionado && (
                        <div className="bg-zinc-800 p-3 rounded-lg">
                            Dimensões
                            <p className="font-bold text-white">{modeloSelecionado.largura}x{modeloSelecionado.profundidade}x{modeloSelecionado.altura} cm</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Esquerda: select e adicionar caixas */}
                    <div className="flex flex-col gap-3">
                        <select
                            className="bg-zinc-800 border border-zinc-600 text-zinc-100 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
                            onChange={e => setModeloSelecionado(modelos.find(m => m.id === Number(e.target.value)) || null)}
                            value={modeloSelecionado?.id || ""}
                            disabled={palletState.situacao === 'ocupado' || palletState.situacao === 'lotado'} // trava o select
                        >
                            <option value="">Selecione um modelo</option>
                            {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                        </select>

                        {modeloSelecionado && palletState.situacao !== 'lotado' && (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    value={quantidade}
                                    min={1}
                                    max={capacidade.restante}
                                    onChange={e => {
                                        let val = Number(e.target.value)
                                        if (val > capacidade.restante) val = capacidade.restante
                                        if (val < 1) val = 1
                                        setQuantidade(val)
                                    }}
                                    className="bg-zinc-700 border border-zinc-600 text-white p-3 rounded-lg w-full"
                                    disabled={palletState.situacao === 'ocupado' ? false : false} // permite apenas ajustar quantidade
                                />
                                <button
                                    onClick={adicionarCaixas}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg transition"
                                    disabled={quantidade < 1 || quantidade > capacidade.restante} // habilita apenas se quantidade válida
                                >
                                    Adicionar
                                </button>
                            </div>
                        )}

                        <div className="w-full bg-zinc-700 h-3 rounded overflow-hidden mt-2">
                            <div className={`h-full ${corSituacao(palletState.situacao).replace('text-', 'bg-')}`} style={{ width: `${(capacidade.ocupadas / capacidade.total) * 100}%` }} />
                        </div>
                    </div>

                    {/* Direita: visualização das camadas */}
                    <div>{renderCamadaAtual()}</div>
                </div>

                {/* Fechar modal */}
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition">Fechar</button>
                </div>
            </div>
        </div>
    )
}