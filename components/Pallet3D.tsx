"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

function Caixa3D({ caixa }: any) {
    return (
        <mesh
            position={[
                caixa.posX,
                caixa.posZ, // 🔥 altura no eixo Y
                caixa.posY,
            ]}
        >
            <boxGeometry args={[caixa.largura, caixa.altura, caixa.profundidade]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    )
}

function Pallet3DScene({ pallet }: any) {
    return (
        <>
            {/* Luz */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} />

            {/* Base do pallet */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[5, 0.5, 5]} />
                <meshStandardMaterial color="brown" />
            </mesh>

            {/* Caixas */}
            {pallet.caixas.map((cx: any) => (
                <Caixa3D key={cx.id} caixa={cx} />
            ))}
        </>
    )
}

export function Pallet3D({ pallet }: any) {
    return (
        <div className="w-full h-[400px]">
            <Canvas camera={{ position: [10, 10, 10] }}>
                <OrbitControls />
                <Pallet3DScene pallet={pallet} />
            </Canvas>
        </div>
    )
}