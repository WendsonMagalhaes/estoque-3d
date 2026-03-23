"use client"

import { useDraggable } from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

export function PalletItem({
    pallet,
    palletWidth,
    palletDepth,
    sobreposto,
    onClick,
}: any) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `pallet-${pallet.id}`,
    })

    const style = transform
        ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
        : undefined

    let cor = ""
    if (sobreposto) {
        cor = pallet.situacao === "lotado" ? "#800080" : "#FFA500"
    } else {
        cor =
            pallet.situacao === "lotado"
                ? "#FF0000"
                : pallet.situacao === "ocupado"
                    ? "#FFFF00"
                    : "#00FF00"
    }

    return (
        <div
            ref={setNodeRef}
            className="absolute border rounded shadow flex flex-col items-center justify-center"
            style={{
                ...style,
                width: palletWidth,
                height: palletDepth,
                left: pallet.posX * palletWidth,
                top: pallet.posY * palletDepth,
                zIndex: sobreposto ? 20 : 10,
                backgroundColor: cor,
            }}
        >
            {/* 🔥 HANDLE DE DRAG (só aqui arrasta) */}
            <div
                {...listeners}
                {...attributes}
                className="absolute top-1 right-1 cursor-grab active:cursor-grabbing"
            >
                <GripVertical size={14} />
            </div>

            {/* 📦 Código clicável */}
            <span
                className="text-xs font-bold text-black cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation()
                    onClick?.(pallet)
                }}
            >
                {pallet.codigo}
            </span>
        </div>
    )
}