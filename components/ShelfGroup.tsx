//components/ShelfGroup.tsx
"use client"

import { BinItem } from "./BinItem"

type Bin = {
    id: number
    codigo: string
    posicaoX: number
    posicaoY: number
    quantidade: number
}

type Shelf = {
    nome: string
    bins: Bin[]
}

export function ShelfGroup({ shelf }: { shelf: Shelf }) {
    if (!shelf.bins.length) return null

    const first = shelf.bins[0]

    return (
        <>
            {/* TÍTULO */}
            <div
                className="absolute text-purple-800 font-bold text-sm"
                style={{
                    left: first.posicaoX * 45,
                    top: first.posicaoY * 45 - 20,
                }}
            >
                {shelf.nome}
            </div>

            {/* BINS */}
            {shelf.bins.map(bin => (
                <BinItem key={bin.id} bin={bin} />
            ))}
        </>
    )
}