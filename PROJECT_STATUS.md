# DreamQuest Kids - Status do Projeto

Este arquivo serve como o ponto central de controle do progresso de desenvolvimento do DreamQuest Kids, conforme exigido pelas regras globais.

## Legenda de Status
- `[ ]` Pendente
- `[/]` Em Progresso
- `[x]` Concluído
- `[!]` Bloqueado

---

## Épicos e Funcionalidades

### 1. Autenticação e Gestão de Sessão
- `[x]` Configuração base de conexão com Supabase.
- `[x]` Criação da tela de Login (Email e Senha).
- `[x]` Integração com Supabase Auth (signIn, signOut).
- `[x]` Toggle de visibilidade de senha (👁️).
- `[x]` Isolamento de dados por usuário logado (tabela `user_members`).

### 2. Painel Principal (Dashboard)
- `[x]` Separação entre Visão do Mentor (Dashboard de Pais) e Visão do Herói (Dashboard da Criança).
- `[x]` Seleção de perfis (Tela RoleSelection).
- `[x]` Sincronização e hidratação de dados (Pull from Cloud via IndexedDB).

### 3. Sistema de Tarefas
- `[x]` Visualização de tarefas pendentes e concluídas.
- `[x]` Criação de novas tarefas pelo Mentor com filtros de recorrência (`daily`, `weekly`, `once`).
- `[x]` Atribuição de tarefas para heróis específicos.

### 4. Loja do Reino
- `[x]` Definição de recompensas na loja (StoreItems).
- `[x]` Atribuição de itens da loja por herói (`store_item_assignments`).
- `[x]` Fluxo de compra (Gasto de moedas e geração de Resgate pendente).

### 5. Configurações de Padrões PWA e Boas Práticas (Regras Globais)
- `[x]` Uso de React para componentização (exceção à regra VanillaJS aprovada).
- `[x]` Atualização do README principal focando no uso do Supabase MCP.
- `[x]` Criação do `PROJECT_STATUS.md` (Este arquivo).
- `[x]` Documentação exigida por pastas (README em `views/`, `components/`, `services/`).
- `[x]` Adequações Mobile-First: Tag `viewport-fit=cover`.
- `[x]` Adequações PWA: Criação do `manifest.json`.
- `[x]` Adequações PWA: Implementação do Service Worker (Offline-first).
- `[x]` Refatoração de tokens CSS globais em `variables.css` (Nativa do Tailwind configurada via CSS).

---

## Log de Conclusões Recentes

**Data: 26 de Fev, 2026**
- *O que foi feito:* Corrigido o bug de "Database error querying schema" removendo a injeção de `NULL` nas chaves do Supabase Auth.
- *Plano de teste:* Logar com `mestre@dreamquest.com` e checar se o dashboard carrega sem apresentar "Erro 500". (Validado com sucesso).
- *Próximo passo lógico:* Adequar o projeto às regras de boas práticas PWA e documentação (Criar Manifest, READMEs das pastas).
