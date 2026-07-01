import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log('Gemini AI Client inicializado com sucesso.');
      } catch (error) {
        this.logger.error('Erro ao inicializar o cliente Gemini:', error);
      }
    } else {
      this.logger.warn('GEMINI_API_KEY não encontrada. O sistema utilizará o Mock Fallback.');
    }
  }

  async analyzeProject(project: {
    name: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    description?: string | null;
    risk: string;
    status: string;
  }): Promise<string> {
    const startStr = project.startDate.toLocaleDateString('pt-BR');
    const endStr = project.endDate.toLocaleDateString('pt-BR');
    const budgetFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(project.budget);

    const diffInMs = project.endDate.getTime() - project.startDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    const durationMonths = (diffInDays / 30).toFixed(1);

    const prompt = `
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

    if (this.aiClient) {
      try {
        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return response.text;
        }
        throw new Error('Retorno vazio da API do Gemini');
      } catch (error: any) {
        this.logger.error(
          `Falha na chamada da API do Gemini. Acionando Mock Fallback. Erro: ${error.message}`,
        );
        return this.generateMockAnalysis(project, startStr, endStr, budgetFormatted, diffInDays, durationMonths);
      }
    } else {
      this.logger.log('Gemini API indisponível (sem chave). Acionando Mock Fallback.');
      return this.generateMockAnalysis(project, startStr, endStr, budgetFormatted, diffInDays, durationMonths);
    }
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
*   **Gargalos Potenciais:** A falta de marcos intermediários de entrega (Milestones) pode mascarar atrasos no desenvolvimento inicial. Recomenda-se a adoção de sprints semanais ou quinzenais.

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
