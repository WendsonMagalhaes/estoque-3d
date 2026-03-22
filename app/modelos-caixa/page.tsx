"use client"

import { useEffect, useState } from "react"
import { BoxPreview3D } from "@/components/BoxPreview3D"

export default function ModelosCaixaPage() {
    const [aba, setAba] = useState<"cadastro" | "lista">("cadastro")
    const [modelos, setModelos] = useState<any[]>([])

    const [form, setForm] = useState({
        nome: "",
        largura: "1",
        profundidade: "1",
        altura: "1",
        cor: "#22c55e",
    })

    async function carregar() {
        try {
            const res = await fetch("/api/modelos-caixa")
            const data = await res.json()
            setModelos(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error(err)
            setModelos([])
        }
    }

    useEffect(() => {
        carregar()
    }, [])

    function handleNumberInput(value: string) {
        return value.replace(",", ".").replace(/[^0-9.]/g, "")
    }

    async function criarModelo() {
        const res = await fetch("/api/modelos-caixa", {
            method: "POST",
            body: JSON.stringify({
                nome: form.nome,
                largura: Number(form.largura),
                profundidade: Number(form.profundidade),
                altura: Number(form.altura),
                cor: form.cor,
            }),
        })

        if (!res.ok) {
            const err = await res.json()
            alert(err.error)
            return
        }

        setForm({
            nome: "",
            largura: "1",
            profundidade: "1",
            altura: "1",
            cor: "#22c55e",
        })

        setAba("lista")
        carregar()
    }

    const inputClass =
        "w-full border border-green-200 rounded-lg p-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-400"

    const labelClass = "text-sm font-medium text-green-800"

    return (
        <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center">

            <div className="w-full max-w-6xl flex flex-col gap-6">

                <h1 className="text-2xl font-bold text-green-800">
                    📦 Modelos de Caixa
                </h1>

                {/* 🧭 ABAS */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setAba("cadastro")}
                        className={`px-4 py-2 rounded-lg transition ${aba === "cadastro"
                            ? "bg-green-600 text-white shadow"
                            : "bg-white border text-green-700 hover:bg-green-50"
                            }`}
                    >
                        Cadastrar
                    </button>

                    <button
                        onClick={() => setAba("lista")}
                        className={`px-4 py-2 rounded-lg transition ${aba === "lista"
                            ? "bg-green-600 text-white shadow"
                            : "bg-white border text-green-700 hover:bg-green-50"
                            }`}
                    >
                        Meus Modelos
                    </button>
                </div>

                {/* 🟢 CADASTRO */}
                {aba === "cadastro" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-2xl shadow">

                        {/* FORM */}
                        <div className="flex flex-col gap-4">

                            <div>
                                <label className={labelClass}>Nome</label>
                                <input
                                    value={form.nome}
                                    onChange={e =>
                                        setForm({ ...form, nome: e.target.value })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Comprimento</label>
                                <input
                                    value={form.largura}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            largura: handleNumberInput(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Largura</label>
                                <input
                                    value={form.profundidade}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            profundidade: handleNumberInput(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Altura</label>
                                <input
                                    value={form.altura}
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            altura: handleNumberInput(e.target.value),
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Cor</label>
                                <input
                                    type="color"
                                    value={form.cor}
                                    onChange={e =>
                                        setForm({ ...form, cor: e.target.value })
                                    }
                                    className="w-full h-10 rounded-lg border border-green-200"
                                />
                            </div>

                            <button
                                onClick={criarModelo}
                                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg mt-2 transition shadow"
                            >
                                Criar Modelo
                            </button>
                        </div>

                        {/* 🧊 PREVIEW 3D */}
                        <div className="bg-green-100 rounded-xl p-4 flex items-center justify-center">
                            <BoxPreview3D
                                largura={Number(form.largura)}
                                profundidade={Number(form.profundidade)}
                                altura={Number(form.altura)}
                                cor={form.cor}
                            />
                        </div>
                    </div>
                )}

                {/* 📋 LISTA */}
                {aba === "lista" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                        {modelos.map(modelo => (
                            <div
                                key={modelo.id}
                                className="bg-white p-4 rounded-2xl shadow flex flex-col gap-2 hover:shadow-md transition"
                            >
                                <h3 className="font-bold text-green-800">
                                    {modelo.nome}
                                </h3>

                                <p className="text-sm text-gray-600">
                                    {modelo.largura} x {modelo.profundidade} x {modelo.altura}
                                </p>

                                <BoxPreview3D {...modelo} />
                            </div>
                        ))}

                        {modelos.length === 0 && (
                            <p className="text-gray-500">
                                Nenhum modelo cadastrado ainda.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}