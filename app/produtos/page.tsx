"use client"

import { useEffect, useState } from "react"

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState([])
    const [nome, setNome] = useState("")
    const [sku, setSku] = useState("")

    async function carregar() {
        const res = await fetch("/api/produtos")
        const data = await res.json()
        setProdutos(data)
    }

    async function salvar() {
        await fetch("/api/produtos", {
            method: "POST",
            body: JSON.stringify({ nome, sku }),
        })
        carregar()
    }

    useEffect(() => {
        carregar()
    }, [])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Produtos</h1>

            <input
                placeholder="Nome"
                onChange={(e) => setNome(e.target.value)}
                className="border p-2 mr-2"
            />

            <input
                placeholder="SKU"
                onChange={(e) => setSku(e.target.value)}
                className="border p-2 mr-2"
            />

            <button onClick={salvar} className="bg-blue-500 text-white px-4 py-2">
                Salvar
            </button>

            <ul className="mt-6">
                {produtos.map((p: any) => (
                    <li key={p.id}>
                        {p.nome} - {p.sku}
                    </li>
                ))}
            </ul>
        </div>
    )
}