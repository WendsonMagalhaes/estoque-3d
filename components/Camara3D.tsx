"use client"

import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

const ALTURA_PALLET = 0.15
const LARGURA_PALLET = 1.0
const PROFUNDIDADE_PALLET = 1.2
const SCALE = 5

// 🟧 Caixa
function Caixa3D({ caixa }: any) {
    return (
        <group
            position={[
                caixa.posX * SCALE + (caixa.largura * SCALE) / 2,
                // 🔥 altura corrigida (colada no pallet)
                caixa.posZ * SCALE + (caixa.altura * SCALE) / 2 + (ALTURA_PALLET - 0.1),
                caixa.posY * SCALE + (caixa.profundidade * SCALE) / 2,
            ]}
        >
            {/* Caixa */}
            <mesh>
                <boxGeometry args={[
                    caixa.largura * SCALE,
                    caixa.altura * SCALE,
                    caixa.profundidade * SCALE
                ]} />
                <meshStandardMaterial color="orange" opacity={0.9} transparent />
            </mesh>

            {/* Contorno */}
            <lineSegments>
                <edgesGeometry args={[
                    new THREE.BoxGeometry(
                        caixa.largura * SCALE,
                        caixa.altura * SCALE,
                        caixa.profundidade * SCALE
                    )
                ]} />
                <lineBasicMaterial color="black" />
            </lineSegments>
        </group>
    )
}

// 🟫 Pallet
function Pallet3D({ pallet }: any) {

    const caixas = pallet.caixas || []

    if (caixas.length === 0) {
        return (
            <group position={[pallet.posX * SCALE, 0, pallet.posY * SCALE]}>
                <mesh position={[
                    LARGURA_PALLET * SCALE / 2,
                    (ALTURA_PALLET * SCALE) / 2,
                    PROFUNDIDADE_PALLET * SCALE / 2
                ]}>
                    <boxGeometry args={[
                        LARGURA_PALLET * SCALE,
                        ALTURA_PALLET * SCALE,
                        PROFUNDIDADE_PALLET * SCALE
                    ]} />
                    <meshStandardMaterial color="#8B4513" />
                </mesh>
            </group>
        )
    }

    const larguraCaixa = caixas[0].largura
    const profundidadeCaixa = caixas[0].profundidade

    const caixasPorLinha = Math.floor(LARGURA_PALLET / larguraCaixa)
    const caixasPorColuna = Math.floor(PROFUNDIDADE_PALLET / profundidadeCaixa)

    const larguraOcupada = caixasPorLinha * larguraCaixa
    const profundidadeOcupada = caixasPorColuna * profundidadeCaixa

    // 🔥 CENTRALIZAÇÃO REAL (X e Z)
    const offsetX = (LARGURA_PALLET - larguraOcupada) / 2
    const offsetY = (PROFUNDIDADE_PALLET - profundidadeOcupada) / 2

    return (
        <group position={[
            pallet.posX * SCALE,
            0,
            pallet.posY * SCALE
        ]}>
            {/* Base do pallet */}
            <mesh position={[
                LARGURA_PALLET * SCALE / 2,
                (ALTURA_PALLET * SCALE) / 2,
                PROFUNDIDADE_PALLET * SCALE / 2
            ]}>
                <boxGeometry args={[
                    LARGURA_PALLET * SCALE,
                    ALTURA_PALLET * SCALE,
                    PROFUNDIDADE_PALLET * SCALE
                ]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Caixas */}
            {caixas.map((cx: any) => (
                <Caixa3D
                    key={cx.id}
                    caixa={{
                        ...cx,
                        posX: cx.posX + offsetX,
                        posY: cx.posY + offsetY,
                    }}
                />
            ))}
        </group>
    )
}

// 🎥 Cena
export function Camara3D({ camara, pallets }: any) {
    const controlsRef = useRef<any>(null)
    const cameraRef = useRef<any>(null)

    function zoomIn() {
        cameraRef.current.position.multiplyScalar(0.8)
        controlsRef.current?.update()
    }

    function zoomOut() {
        cameraRef.current.position.multiplyScalar(1.2)
        controlsRef.current?.update()
    }

    function reset() {
        cameraRef.current.position.set(30, 30, 30)
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
    }

    return (
        <div className="relative w-full h-[500px] bg-black rounded-xl">

            {/* Botões */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
                <button onClick={zoomIn} className="bg-white px-3 py-1 rounded shadow">+</button>
                <button onClick={zoomOut} className="bg-white px-3 py-1 rounded shadow">-</button>
                <button onClick={reset} className="bg-white px-3 py-1 rounded shadow">⟳</button>
            </div>

            <Canvas
                camera={{ position: [30, 30, 30] }}
                onCreated={({ camera }) => {
                    cameraRef.current = camera
                }}
            >
                <OrbitControls ref={controlsRef} />

                {/* Luz */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[20, 20, 10]} />

                {/* Piso */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[
                        camara.largura * SCALE,
                        camara.profundidade * SCALE
                    ]} />
                    <meshStandardMaterial color="#e5e7eb" />
                </mesh>

                {/* Pallets */}
                {pallets.map((p: any) => (
                    <Pallet3D key={p.id} pallet={p} />
                ))}
            </Canvas>
        </div>
    )
}