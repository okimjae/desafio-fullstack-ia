export class ProjectAnalysisPromptBuilder {
  static build(project: {
    name: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    description?: string | null;
    risk: string;
    status: string;
  }): string {
    const startStr = project.startDate.toLocaleDateString('pt-BR');
    const endStr = project.endDate.toLocaleDateString('pt-BR');
    const budgetFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(project.budget);

    const diffInMs = project.endDate.getTime() - project.startDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const durationMonths = (diffInDays / 30).toFixed(1);

    return `
Você é um Engenheiro de Riscos e Gerente de Projetos Sênior. Analise o projeto a seguir e forneça um relatório Markdown estruturado de viabilidade técnica e financeira.

DADOS DO PROJETO:
- Nome: ${project.name}
- Descrição: ${project.description || 'Não informada'}
- Data de Início: ${startStr}
- Previsão de Término: ${endStr}
- Duração Calculada: ${diffInDays} dias (~${durationMonths} meses)
- Orçamento Cadastrado: ${budgetFormatted}
- Grau de Risco Calculado: ${project.risk}
- Status Atual: ${project.status}

REQUISITOS DO RELATÓRIO (Retorne estritamente em Markdown em português):
1. Um título principal adequado.
2. **Resumo Executivo / Diagnóstico de Viabilidade:** Avaliação resumida do projeto com um indicador claro de viabilidade (Alta, Média ou Crítica).
3. **Análise do Cronograma (Prazos):** Avaliação de o tempo planejado ser realista, identificando pontos de atenção e gargalos potenciais.
4. **Análise do Orçamento (Financeiro):** Avaliação sobre a adequação do orçamento em relação à duração e escopo.
5. **Matriz de Riscos & Recomendações:** Sugestões e contramedidas práticas para mitigar os riscos com base no risco "${project.risk}" calculado.

Não use placeholders. Escreva de forma profissional, executiva e direta.
`;
  }
}
