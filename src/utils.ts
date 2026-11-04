export function diasParaVencer(validade: string): number {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas, minutos, segundos e milissegundos
    
    const dataValidade = new Date(validade + 'T00:00:00'); // Adiciona a hora para evitar problemas de fuso horário
    const milissegundosPorDia = 1000 * 60 * 60 * 24;
    return Math.round((dataValidade.getTime() - hoje.getTime()) / milissegundosPorDia);
}

export function corDaValidade(dias: number): string {
    if (dias < 0) return "#6b7280";
    if (dias <= 3) return "#dc2626";
    if (dias <= 7) return "#f97316";
    if (dias <= 30) return "#22c55e";
    return "#10b981";
}

//transforma a quantidade de dias em uma string que indica se o alimento está vencido, vencendo hoje, ou quantos dias faltam para vencer
export function textoDaValidade(dias: number): string {
    if (dias < 0) return `Venceu há ${Math.abs(dias)} dia(s)`;
    if (dias === 0) return 'Vence hoje!';
    if (dias === 1) return 'Vence amanhã!!';
    if (dias <= 3) return `Vence em ${dias} dia(s) - Atenção!`;
    if (dias <= 7) return `Vence em ${dias} dia(s) - Cuidado!`;
    if (dias <= 30) return `Vence em ${dias} dia(s) - Fique atento!`;
    return `Vence em ${dias} dia(s)`;
}

    const UNIDADES: Record<string, {singular:string; plural:string}> = {
        "L": { singular: "Litro", plural: "Litros" },
        "ml": { singular: "Mililitro", plural: "Mililitros" },
        "kg": { singular: "Quilograma", plural: "Quilogramas" },
        "g": { singular: "Grama", plural: "Gramas" },
        "un": { singular: "Unidade", plural: "Unidades" },
        "pct": { singular: "Pacote", plural: "Pacotes" }
    };

export function textoDaUnidade(unidade: string, quantidade: number): string {
    const nomes = UNIDADES[unidade];
    if (!nomes) return unidade; // Retorna a unidade original se não estiver no mapeamento
    return quantidade === 1 ? nomes.singular : nomes.plural;
}