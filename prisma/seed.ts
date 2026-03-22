import { PrismaClient } from "@prisma/client"
import "dotenv/config"

const prisma = new PrismaClient()

function random(min: number, max: number) { return Math.random() * (max - min) + min }
function randomInt(min: number, max: number) { return Math.floor(random(min, max)) }

// Função helper diretamente no seed
function calcularSituacaoPallet(alturaAtual: number, alturaMaxima = 1.5) {
    if (alturaAtual >= alturaMaxima) return "lotado"
    if (alturaAtual > 0) return "disponivel"
    return "livre"
}

const tiposCaixa = [
    { largura: 0.3, profundidade: 0.3, altura: 0.2 },
    { largura: 0.4, profundidade: 0.4, altura: 0.3 },
    { largura: 0.5, profundidade: 0.5, altura: 0.4 },
    { largura: 0.6, profundidade: 0.4, altura: 0.35 },
]

async function main() {
    console.log("🌱 Seed WMS avançado...")

    await prisma.itemCaixa.deleteMany()
    await prisma.caixa.deleteMany()
    await prisma.pallet.deleteMany()
    await prisma.camara.deleteMany()
    await prisma.produto.deleteMany()

    // Produtos
    await prisma.produto.createMany({
        data: [
            { nome: "Arroz", sku: "SKU001" },
            { nome: "Feijão", sku: "SKU002" },
            { nome: "Macarrão", sku: "SKU003" },
            { nome: "Açúcar", sku: "SKU004" },
            { nome: "Café", sku: "SKU005" },
        ],
    })

    const produtos = await prisma.produto.findMany()

    // Câmaras
    const camaras = await Promise.all([
        prisma.camara.create({ data: { nome: "Câmara Congelados", largura: 30, profundidade: 20, altura: 6 } }),
        prisma.camara.create({ data: { nome: "Câmara Resfriados", largura: 25, profundidade: 15, altura: 5 } }),
    ])

    // Criação de pallets e caixas
    for (const camara of camaras) {
        const pallets: any[] = []

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 5; x++) {
                const pallet = await prisma.pallet.create({
                    data: {
                        codigo: `${camara.nome}-P${y}${x}`,
                        camaraId: camara.id,
                        posX: x * 2,
                        posY: y * 2,
                        posZ: 0,
                        altura: 0.15,
                        situacao: "livre",
                        largura: 1,
                        profundidade: 1.2,
                    },
                })
                pallets.push(pallet)
            }
        }

        // Adicionar caixas
        for (const pallet of pallets) {
            const qtdCaixas = randomInt(1, 5)
            let alturaAtual = pallet.altura

            for (let i = 0; i < qtdCaixas; i++) {
                const tipo = tiposCaixa[Math.floor(Math.random() * tiposCaixa.length)]
                if (alturaAtual + tipo.altura > 1.5) break // respeita altura máxima

                const caixa = await prisma.caixa.create({
                    data: {
                        palletId: pallet.id,
                        largura: tipo.largura,
                        profundidade: tipo.profundidade,
                        altura: tipo.altura,
                        posX: random(0, 0.8),
                        posY: random(0, 0.8),
                        posZ: alturaAtual,
                    },
                })

                alturaAtual += tipo.altura

                // Produto dentro da caixa
                const produto = produtos[Math.floor(Math.random() * produtos.length)]
                await prisma.itemCaixa.create({
                    data: { caixaId: caixa.id, produtoId: produto.id, quantidade: randomInt(5, 50) },
                })
            }

            // Atualiza altura e situação do pallet
            await prisma.pallet.update({
                where: { id: pallet.id },
                data: { altura: alturaAtual, situacao: calcularSituacaoPallet(alturaAtual) },
            })
        }
    }

    console.log("✅ Seed finalizado!")
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect() })