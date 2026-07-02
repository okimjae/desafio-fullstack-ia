# Gerenciador de Projetos Inteligente

Esta aplicação web permite o gerenciamento completo e inteligente de projetos de uma empresa, com cálculo automático de risco, controle de fluxo de status, gráficos de histórico de propostas e análise de viabilidade técnica/financeira apoiada por Inteligência Artificial (Google Gemini).

---

## 🏗️ Arquitetura do Sistema

O sistema é dividido em duas partes principais seguindo rígidos padrões de engenharia de software:

1.  **Backend (`/backend`):**
    *   Framework: **NestJS** (Node.js + TypeScript).
    *   Banco de Dados: **PostgreSQL** rodando via **Docker Compose** na porta `5433`.
    *   ORM: **Prisma ORM** (para modelagem, migrações e seed).
    *   Camada de IA Desacoplada: Separação de responsabilidades utilizando as classes `ProjectAnalysisPromptBuilder`, `AiClient` e `AiAnalysisService` para consumo do **Gemini API**.
    *   Validação de Dados: Filtros de validação globais baseados em `class-validator` e `class-transformer`.
    *   Documentação: Endpoints REST 100% documentados interativamente via **Swagger** na rota `/api`.

2.  **Frontend (`/frontend`):**
    *   Framework: **React** (TypeScript + Vite).
    *   Estilização & UI: **Tailwind CSS v4** + **Shadcn UI v4** (Radix Primitives).
    *   Visual Premium: Seletor de temas (Claro / Escuro) animado por máscara circular do **Magic UI** (View Transitions API nativa).
    *   Analytics: Gráfico de áreas empilhadas do **Recharts** demonstrando a evolução de demandas por nível de risco.
    *   Responsividade: Design móvel fluido autoajustável para celulares, tablets e desktops.

---

## 📄 Documentos de Especificação

*   **[AI_USAGE.md](./AI_USAGE.md):** Relatório detalhando o modelo de IA utilizado (`gemini-2.5-flash`), prompts, tomadas de decisão e o mecanismo de fallback robusto implementado.
*   **[spec.md](./spec.md):** Detalhamento das regras de negócio de status e cálculo matemático de risco.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
*   Node.js (v18 ou superior)
*   Docker e Docker Compose instalados

### Passo 1: Inicializando o Banco de Dados (PostgreSQL)
Na raiz do projeto, execute o comando para iniciar o container do banco de dados em segundo plano:
```bash
docker compose up -d
```
*O banco será inicializado na porta `5433` (evitando conflitos com serviços locais do Postgres).*

---

### Passo 2: Executando o Backend (NestJS)

1.  Acesse a pasta do backend:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  *(Opcional)* Configure a chave de API do Gemini em `backend/.env` se quiser testar a integração real com inteligência artificial:
    ```env
    GEMINI_API_KEY=sua_chave_aqui
    ```
    *Caso a chave não seja configurada, o motor de fallback gerará relatórios de simulação contextuais e estéticos automaticamente.*
4.  Execute as migrações do banco de dados e gere o Prisma Client:
    ```bash
    npx prisma migrate dev
    ```
5.  Inicie o servidor de desenvolvimento NestJS:
    ```bash
    npm run start:dev
    ```
*O backend estará rodando em **`http://localhost:3333`**.*
*Acesse a documentação interativa Swagger dos endpoints em **`http://localhost:3333/api`**.*

---

### Passo 3: Executando o Frontend (Vite)

1.  Abra um novo terminal na raiz do projeto e acesse a pasta do frontend:
    ```bash
    cd frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento Vite:
    ```bash
    npm run dev
    ```
*O frontend estará rodando em **`http://localhost:5173`**.*

---

## ✨ Diferenciais Técnicos e Capricho de Entrega

*   **Lint Totalmente Limpo (Zero Warnings/Errors):** Ambas as bases de código (frontend e backend) foram validadas e corrigidas contra avisos do compilador TypeScript e regras do ESLint/Oxlint.
*   **Segurança no Fluxo de Status:** O backend valida estritamente a máquina de estados (ex: impede pular etapas de `EM_ANALISE` direto para `EM_ANDAMENTO`).
*   **Bloqueio de Exclusão:** Projetos com status ativos (`EM_ANDAMENTO` ou `ENCERRADO`) têm sua exclusão bloqueada no banco e o botão desabilitado na interface.
*   **Mecanismo de Fallback de IA:** Se a chamada para o Gemini falhar ou se a chave não estiver preenchida no arquivo `.env`, o sistema gera uma análise simulada com base no escopo e valores reais cadastrados do projeto, de forma que o app nunca exiba erros na tela.
