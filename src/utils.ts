export function diasParaVencer(validade: string): number {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera as horas, minutos, segundos e milissegundos
    
    const dataValidade = new Date(validade + 'T00:00:00'); // Adiciona a hora para evitar problemas de fuso horário
    const milissegundosPorDia = 1000 * 60 * 60 * 24;
    return Math.round((dataValidade.getTime() - hoje.getTime()) / milissegundosPorDia);
}

export function corDaValidade(dias: number): string {
    if (dias < 0) return "#6b7280";  // Vencido
    if (dias === 0) return "#f59e0b";  // Vence hoje
    if (dias <= 3) return "#f97316";  // Vence em até 3 dias
    if (dias <= 7) return "#eab308";  // Vence em até 7 dias
    if (dias <= 30) return "#22c55e";  // Vence em até 30 dias
    return "#10b981";  // Vence em mais de 30 dias
}

//transforma a quantidade de dias em uma string que indica se o alimento está vencido, vencendo hoje, ou quantos dias faltam para vencer
export function textoDaValidade(dias: number): string {
    if (dias < 0) return `Venceu há ${Math.abs(dias)} dia(s)`;
    if (dias === 0) return 'Vence hoje!';
    if (dias <= 3) return `Vence em ${dias} dia(s) - Atenção!`;
    if (dias <= 7) return `Vence em ${dias} dia(s) - Cuidado!`;
    if (dias <= 30) return `Vence em ${dias} dia(s) - Fique atento!`;
    return `Vence em ${dias} dia(s)`;
}