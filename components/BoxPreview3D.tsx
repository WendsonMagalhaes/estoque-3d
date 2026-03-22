"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

export function BoxPreview3D({ largura, profundidade, altura, cor }: any) {

    // 🧠 1. Converte de cm → metros
    const larguraM = (largura || 1) / 100
    const profundidadeM = (profundidade || 1) / 100
    const alturaM = (altura || 1) / 100

    // 🧠 2. Escala dinâmica (NUNCA fica gigante ou minúsculo)
    const maiorLado = Math.max(larguraM, profundidadeM, alturaM)
    const SCALE = maiorLado > 0 ? 2 / maiorLado : 1

    return (
        <div className="w-full h-64">
            <Canvas camera={{ position: [3, 3, 3] }}>

                {/* 💡 Luz */}
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={1} />

                {/* 🧊 Caixa */}
                <mesh>
                    <boxGeometry
                        args={[
                            larguraM * SCALE,
                            alturaM * SCALE,
                            profundidadeM * SCALE,
                        ]}
                    />
                    <meshStandardMaterial color={cor || "#22c55e"} />
                </mesh>

                {/* 🎮 Controle */}
                <OrbitControls />

            </Canvas>
        </div>
    )
}