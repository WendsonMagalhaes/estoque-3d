export function calcularSituacaoPallet(altura: number) {
    if (altura >= 1.5) return "Lotado"
    if (altura >= 1.0) return "Disponível"
    if (altura > 0.15) return "Ocupado"
    return "Livre"
}

export function podeAdicionarCaixa(pallet: any, caixas: any[], novaCaixa: any) {
    const ALTURA_MAX = 2.0
    const ALTURA_BASE = 0.15
    const EPS = 0.0001

    // 1️⃣ Capacidade por camada
    const caixasPorLinha = Math.floor(pallet.largura / novaCaixa.largura) || 1
    const caixasPorColuna = Math.floor(pallet.profundidade / novaCaixa.profundidade) || 1
    const caixasPorCamada = caixasPorLinha * caixasPorColuna

    // 2️⃣ Quantas camadas cabem
    const alturaDisponivel = ALTURA_MAX - ALTURA_BASE
    const camadas = Math.floor(alturaDisponivel / novaCaixa.altura)
    const capacidadeMaxima = caixasPorCamada * camadas

    if (caixas.length >= capacidadeMaxima) {
        return { ok: false, motivo: "Capacidade máxima do pallet atingida" }
    }

    // 3️⃣ Calcula camada atual e posição Z
    const camadaAtual = Math.floor(caixas.length / caixasPorCamada)
    const posZ = ALTURA_BASE + camadaAtual * novaCaixa.altura

    if (posZ + novaCaixa.altura - EPS > ALTURA_MAX) {
        return { ok: false, motivo: "Altura excedida" }
    }

    // 4️⃣ Colisão 3D
    const colide = caixas.some(c => {
        const overlapX = novaCaixa.posX < c.posX + c.largura - EPS &&
            novaCaixa.posX + novaCaixa.largura > c.posX + EPS
        const overlapY = novaCaixa.posY < c.posY + c.profundidade - EPS &&
            novaCaixa.posY + novaCaixa.profundidade > c.posY + EPS
        const overlapZ = posZ < c.posZ + c.altura - EPS &&
            posZ + novaCaixa.altura > c.posZ + EPS
        return overlapX && overlapY && overlapZ
    })

    if (colide) {
        return { ok: false, motivo: "Colisão com outra caixa" }
    }

    // ✅ retorna ok e posZ correto
    return { ok: true, posZ }
}

export function determinarSituacao(ocupadas: number, total: number) {
    if (ocupadas === 0) return "livre"
    if (ocupadas >= total) return "lotado"
    return "ocupado"
}