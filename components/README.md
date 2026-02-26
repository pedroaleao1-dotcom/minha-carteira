# Componentes (components/)

Esta pasta contém componentes de interface **reutilizáveis** que compõem as telas da aplicação DreamQuest Kids.

## Objetivo
Manter pedaços de UI isolados (como Cartões, Calendários, Listas) que podem ser instanciados em diferentes visualizações (`views/`) sem repetição de código.

## Regras e Padrões
- **Evitar Lógica de Negócios:** Componentes devem ser idealmente *dumb variables* (apenas receber `props` e renderizar as informações), delegando lógicas de alteração e acesso a banco de dados para as `views`.
- **Estilização:** Utiliza-se Tailwind CSS com base nas variáveis e restrições do projeto.
- **Desenvolvimento:** Construídos em React (TSX), conforme a base escolhida do projeto.

## Arquivos Principais Escopados
- `ActivityCalendar.tsx`: Renderiza os dias da semana e os selos de atividades concluídas em um formato de calendário gamificado.
- `HistoryView.tsx`: Um componente genérico de histórico utilizado tanto para o extrato de moedas quanto de experiência.
