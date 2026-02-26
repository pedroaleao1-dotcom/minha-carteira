
# 🏰 DreamQuest Kids - Manual do Reino

Este aplicativo transforma tarefas diárias em uma jornada épica. Siga as instruções abaixo para preparar o banco de dados.

## 🚀 Gerenciamento do Banco de Dados via MCP

O banco de dados relacional (PostgreSQL) é hospedado no Supabase. Para manter a consistência e automatizar a configuração, nós **utilizamos o Supabase MCP (Model Context Protocol)**. 

Isso significa que o Agente (IA) tem a capacidade de:
1. **Ler o Schema:** Validar a estrutura das tabelas antes de propor o código.
2. **Executar Scripts:** Rodar o arquivo `SETUP_DATABASE.sql` diretamente no servidor.
3. **Gerenciar Dados:** Inserir dados de exemplo (seed) ou modificar registros necessários para testes.

Sempre que precisar resetar o banco ou aplicar novas tabelas, basta solicitar ao agente para **"executar o script de setup via MCP"**.

> **💡 Dica de Reset Seguro:** Ao rodar o `SETUP_DATABASE.sql`, o script identifica se os e-mails `mestre`, `arthur`, etc. já existem no Supabase Auth e apenas recarrega seus vínculos na tabela `user_members` sem quebrar seu acesso!

## 📊 O que este script faz?
- **Apaga tabelas antigas**: Garante que erros de tipos de dados anteriores sejam corrigidos.
- **Cria o Schema**: Define as tabelas de Membros, Loja, Níveis e Mapas.
- **Popula Heróis**: Cria heróis de exemplo (Arthur, Alice e Bob) para você já começar testando.
- **Configura o Mentor**: Cria o acesso para os pais gerenciarem o reino.

---
*Que a jornada comece!*
