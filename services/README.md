# Serviços (services/)

Esta pasta contém a **Camada de Dados e Lógica Externa** do DreamQuest Kids.
Aqui reside todo o código que se comunica com APIs ou bancos de dados locais/remotos.

## Objetivo
Separar a regra de negócios, o acesso ao banco e as integrações da camada de interface (React Views/Components). Dessa maneira, se no futuro o banco Supabase for trocado ou uma API nova for incluída, as telas do App não precisarão ser alteradas agressivamente.

## Arquivos Existentes
- `supabase.ts`: O coração da sincronização em nuvem e persistência relacional. É onde ocorrem os *fetches* para carregar membros, missões, transações da instância do MCP Database (Supabase PostgreSQL). Também lida com as mutações e validações da loja.
- `auth.ts`: Gerencia o fluxo de sessão de usuários (SingIn / SignOut) da API do GoTrue/Supabase Auth.
- `dexie.ts` / `db.ts`: Gerenciamento interno IndexedDB focado no fallback offline-first quando o aplicativo for refatorado por completo para operar sem internet temporariamente (arquitetura PWA/TWA em evolução).
- `gemini.ts`: Ponto de integração para geração inteligente e auxílio através de LLM para tarefas e interações.
