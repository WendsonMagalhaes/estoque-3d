//components/BinItem.tsx
"use client"

import { useDraggable } from "@dnd-kit/core"

export function BinItem({ bin }: any) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: bin.id,
    })

    const style = {
        transform: transform
            ? `translate(${transform.x}px, ${transform.y}px)`
            : undefined,
    }

    let cor = "bg-green-500"
    if (bin.quantidade > 0 && bin.quantidade < 10) cor = "bg-yellow-400"
    if (bin.quantidade >= 10) cor = "bg-red-500"

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                position: "absolute",
                left: bin.posicaoX * 45,
                top: bin.posicaoY * 45,
                width: 40,
                height: 40,
            }}
            {...listeners}
            {...attributes}
            className={`text-[10px] text-white flex items-center justify-center rounded shadow cursor-grab ${cor}`}
        >
            {bin.codigo}
        </div>
    )
}