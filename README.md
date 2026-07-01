# Gerenciador de Projetos Inteligente

Esta aplicação web simplificada permite o gerenciamento de projetos de uma empresa, com cálculo automático de risco, controle de fluxo de status e análise de viabilidade apoiada por Inteligência Artificial.

## Arquitetura do Sistema

O sistema é dividido em duas partes principais:

1. **Backend (`/backend`):**
   - Framework: **NestJS** (Node.js + TypeScript).
   - Banco de Dados: **PostgreSQL** rodando via **Docker Compose**.
   - ORM: **Prisma ORM**.
   - IA: Camada isolada (`AiAnalysisService` e `AiClient`) para processar resumos de projeto com **Gemini API** (ou fallback mockado).
   - Documentação: Endpoints REST documentados via Swagger.

2. **Frontend (`/frontend`):**
   - Framework: **React** (TypeScript + Vite).
   - Estilização & UI: **Tailwind CSS** + **Shadcn UI** (Radix Primitives).
   - Integração: Chamadas via Fetch API ao backend NestJS.

---

## Estrutura de Arquivos de Especificação

- [spec.md](./spec.md) - Especificação detalhada de regras de negócio, dados e contratos de endpoints.
- [AI_USAGE.md](./AI_USAGE.md) - Relatório obrigatório de uso de inteligência artificial durante a elaboração do projeto.

---

## Como Executar o Projeto (Infraestrutura)

### Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose instalado

### Inicializando o Banco de Dados
Na raiz do projeto, execute o comando para iniciar o container do PostgreSQL:

```bash
docker compose up -d
```

*(As instruções passo a passo de inicialização do backend e do frontend serão preenchidas assim que as respectivas pastas forem criadas).*
