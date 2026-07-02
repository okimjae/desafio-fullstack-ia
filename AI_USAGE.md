# Documentação de Uso de IA (AI_USAGE.md)

Este documento detalha como a Inteligência Artificial foi utilizada durante a elaboração deste desafio técnico, dividindo a explicação entre o suporte no desenvolvimento do código e a integração da API do Gemini no backend da aplicação.

---

## 💻 1. Uso de IA no Processo de Desenvolvimento

Utilizei assistentes de IA (copiloto de código) para acelerar o desenvolvimento, focando na agilidade do fluxo de trabalho e na qualidade geral do código.

*   **Qual ferramenta de IA utilizou:** Google Gemini (integrado ao editor de código).
*   **Para quais partes do desafio utilizou IA:** Auxílio na estruturação de layouts responsivos com Tailwind CSS v4, geração de trechos de boilerplate (como DTOs, configurações iniciais e tipagens do Prisma) e suporte na depuração de alertas do ESLint.

### O que foi aceito, ajustado ou descartado:
*   **Aceito:** Autocomplete de classes de estilização do Tailwind e sugestões de resolução de avisos e tipagens do TypeScript.
*   **Ajustado:** A estrutura de prompt do Gemini. Ajustei as informações injetadas para que o cálculo de duração de prazos fosse feito diretamente no backend (via Node.js) em vez de deixar o modelo de linguagem calcular, prevenindo alucinações de datas.
*   **Descartado:** Sugestões de pacotes extras para controle de estados e roteamento complexos no frontend. Preferi seguir com o controle nativo do React com `useState` para manter a aplicação simples e leve.

---

## 🤖 2. Integração da IA na Aplicação (Gemini API)

A aplicação consome a API oficial do Google Gemini para emitir relatórios de viabilidade técnica e financeira baseados nos dados dos projetos cadastrados.

### Detalhes Técnicos da Integração:
*   **Modelo:** `gemini-2.5-flash` (escolhido pelo tempo de resposta rápido e boa formatação em Markdown).
*   **SDK:** `@google/genai` (SDK oficial e unificado do Google).
*   **Endpoint:** `GET /projects/:id/ai-analysis`.

### Engenharia de Prompt Utilizada:
O prompt é construído dinamicamente no backend pela classe `ProjectAnalysisPromptBuilder`:

```markdown
Você é um Engenheiro de Riscos e Gerente de Projetos Sênior. Analise o projeto a seguir e forneça um relatório Markdown estruturado de viabilidade técnica e financeira.

DADOS DO PROJETO:
- Nome: {NOME_DO_PROJETO}
- Descrição: {DESCRICAO_DO_PROJETO}
- Data de Início: {DATA_INICIO}
- Previsão de Término: {DATA_PREVISAO_TERMINO}
- Duração Calculada: {DURACAO_EM_DIAS} dias (~{DURACAO_EM_MESES} meses)
- Orçamento Cadastrado: {ORCAMENTO_FORMATADO}
- Grau de Risco Calculado: {GRAU_RISCO}
- Status Atual: {STATUS_ATUAL}

REQUISITOS DO RELATÓRIO (Retorne estritamente em Markdown em português):
1. Um título principal adequado.
2. Resumo Executivo / Diagnóstico de Viabilidade (Alta, Média ou Crítica).
3. Análise do Cronograma (Prazos realistas e gargalos).
4. Análise do Orçamento (Adequação financeira e taxa de queima mensal).
5. Matriz de Riscos & Recomendações de mitigação.
```

### Decisões Técnicas Tomadas pelo Candidato:
*   **Arquitetura Desacoplada de IA:** Separação do serviço de IA em três classes (`ProjectAnalysisPromptBuilder`, `AiClient` e `AiAnalysisService`) para manter o código modular e sem acúmulo de responsabilidade.
*   **Resiliência (Sistema de Fallback):** Criação de uma função de fallback local (`generateMockAnalysis`). Se a chamada à API falhar ou se a chave `GEMINI_API_KEY` não estiver preenchida no `.env`, o backend intercepta o erro e gera um relatório simulado em Markdown baseado nas variáveis reais do projeto. Isso garante estabilidade técnica e integridade visual da interface de usuário em qualquer máquina.

---

## ⚠️ 3. Limitações da Entrega

1.  **Limites do Plano Gratuito:** O plano gratuito da API do Gemini impõe limites de requisições por minuto (RPM). O sistema mitiga isso usando o fallback local automático.
2.  **Dependência de Conexão:** A análise real de IA exige que a máquina de execução do backend NestJS tenha conectividade externa de internet.
