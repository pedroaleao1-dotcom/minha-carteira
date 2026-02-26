# Telas (views/)

Esta pasta contém as **Telas Principais (Views/Pages)** da aplicação DreamQuest Kids.
Cada arquivo aqui corresponde a uma página inteira e orquestra a composição de múltiplos `components/`.

## Objetivo
As Views são responsáveis por:
1. Receber as rotas ou ser a raiz renderizada com base no estado do aplicativo no `App.tsx`.
2. Carregar dados das funções (fetch) em `services/`.
3. Gerenciar o estado global da tela.
4. Renderizar a interface através dos componentes menores.

## Estrutura Básica
- **Dashboard dos Pais (`ParentDashboard.tsx`, `CouncilRoom.tsx`):** Interfaces administrativas focadas na gestão de metas, criação de tarefas e controle financeiro.
- **Dashboard das Crianças (`ChildDashboard.tsx`, `KingdomExplorer.tsx`):** Interfaces lúdicas focadas na gamificação, visualização de moedas, XP e resgates na lojinha.
- **Fluxos de Autenticação (`Login.tsx`, `RoleSelection.tsx`):** Controles de acesso e seleção do avatar na troca de perfis baseada na sessão atual do Supabase.
