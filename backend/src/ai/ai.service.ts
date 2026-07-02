import { Injectable } from '@nestjs/common';
import { AiClient } from './ai-client';
import { ProjectAnalysisPromptBuilder } from './prompt-builder';

@Injectable()
export class AiAnalysisService {
  constructor(private readonly aiClient: AiClient) {}

  async analyzeProject(project: {
    name: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    description?: string | null;
    risk: string;
    status: string;
  }): Promise<string> {
    const prompt = ProjectAnalysisPromptBuilder.build(project);

    return this.aiClient.generateContent(prompt, () => {
      const startStr = project.startDate.toLocaleDateString('pt-BR');
      const endStr = project.endDate.toLocaleDateString('pt-BR');
      const budgetFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(project.budget);

      const diffInMs = project.endDate.getTime() - project.startDate.getTime();
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
      const durationMonths = (diffInDays / 30).toFixed(1);

      return this.generateMockAnalysis(project, startStr, endStr, budgetFormatted, diffInDays, durationMonths);
    });
  }

  private generateMockAnalysis(
    project: any,
    startStr: string,
    endStr: string,
    budgetFormatted: string,
    diffInDays: number,
    durationMonths: string,
  ): string {
    const riskBadge = project.risk === 'ALTO' ? '🔴 ALTO' : project.risk === 'MEDIO' ? '🟡 MÉDIO' : '🟢 BAIXO';
    const burnRateValue = project.budget / (Number(durationMonths) || 1);
    const burnRateFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(burnRateValue);
    
    return `## 📊 Relatório de Viabilidade: ${project.name} (Modo Simulação)

> **Nota do Sistema:** Esta análise foi gerada localmente pelo motor de fallback devido à ausência ou limite da API Key do Gemini.

### 🔍 1. Resumo Executivo & Diagnóstico de Viabilidade
O projeto **${project.name}** encontra-se atualmente no status **${project.status}** com classificação de risco classificada como **${riskBadge}**. 

Com um orçamento de **${budgetFormatted}** para um prazo estimado de **${diffInDays} dias (~${durationMonths} meses)**, o projeto apresenta uma **viabilidade geral ${project.risk === 'ALTO' ? 'Crítica' : project.risk === 'MEDIO' ? 'Moderada com Ressalvas' : 'Alta'}**. Projetos com essa configuração exigem monitoramento contínuo dos indicadores-chave.

---

### 📅 2. Análise do Cronograma (Prazos)
*   **Período de Execução:** De **${startStr}** a **${endStr}**.
*   **Aparência de Risco:** ${project.risk === 'ALTO' ? 'O prazo de ' + durationMonths + ' meses é agressivo para o escopo e orçamento indicados, aumentando consideravelmente o risco de atrasos.' : 'O prazo é adequado ao escopo cadastrado, permitindo entregas graduais e testes de qualidade.'}
*   **Gargalos Potenciais:** A falta de marcos intermediários de entrega (Milestones) pode marcar atrasos no desenvolvimento inicial. Recomenda-se a adoção de sprints semanais ou quinzenais.

---

### 💵 3. Análise do Orçamento (Financeiro)
*   **Orçamento Alocado:** **${budgetFormatted}**.
*   **Taxa de Queima Projetada (Burn Rate):** Aproximadamente **${burnRateFormatted}/mês**.
*   **Análise:** O valor alocado é ${project.risk === 'ALTO' ? 'muito expressivo, exigindo uma governança financeira e auditorias periódicas para evitar desperdícios de recursos.' : 'proporcional à duração planejada, apresentando margem de contingência recomendada de 10%.'}

---

### 🛡️ 4. Matriz de Riscos & Recomendações (${riskBadge})
1.  **Controle de Escopo:** Implementar um processo formal de aprovação de mudanças (Change Request) para evitar o aumento do escopo sem orçamento equivalente.
2.  **Governança:** Realizar reuniões semanais de acompanhamento (Status Report) com as partes interessadas para validação do cronograma físico-financeiro.
3.  **Contingência:** Reservar uma parcela do orçamento para imprevistos técnicos, especialmente nas entregas finais.
`;
  }
}
