"use client"

import { useDraggable } from "@dnd-kit/core"

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
            onClick={() => onClick?.(pallet)}
            className="absolute border rounded shadow flex items-center justify-center cursor-pointer"
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
            {/* Área de drag separada */}
            <div
                {...listeners}
                {...attributes}
                className="w-full h-full flex items-center justify-center"
            >
                <span className="text-xs font-bold text-black">
                    {pallet.codigo}
                </span>
            </div>
        </div>
    )
}