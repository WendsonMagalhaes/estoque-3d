//components//CaixaItem.tsx
"use client"

const SCALE = 40

export function CaixaItem({ caixa }: any) {
    return (
        <div
            style={{
                position: "absolute",
                left: caixa.posX * SCALE,
                top: caixa.posY * SCALE,
                width: caixa.largura * SCALE,
                height: caixa.profundidade * SCALE,
                zIndex: caixa.posZ,
            }}
            className="bg-blue-500/80 border border-blue-800 text-[10px] text-white flex items-center justify-center rounded"
        >
            CX {caixa.id}
        </div>
    )
}