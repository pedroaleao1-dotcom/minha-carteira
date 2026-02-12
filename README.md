
# 🏰 DreamQuest Kids - Manual do Reino

Este aplicativo transforma tarefas diárias em uma jornada épica. Siga as instruções abaixo para preparar o banco de dados.

## 🚀 Como Iniciar o Banco de Dados (Passo a Passo)

Para que o aplicativo funcione corretamente, você deve configurar o banco de dados no Supabase:

1.  Acesse seu projeto no [Supabase Dashboard](https://supabase.com).
2.  No menu lateral esquerdo, clique em **SQL Editor**.
3.  Clique em **New Query** (ou use uma aba em branco).
4.  Abra o arquivo `SETUP_DATABASE.sql` deste projeto.
5.  **COPIE TODO O CONTEÚDO** do arquivo e cole no editor do Supabase.
6.  Clique no botão **Run** (ou pressione `Cmd+Enter` / `Ctrl+Enter`).
7.  Verifique se a mensagem "Success. No rows returned" ou similar aparece.

**Atenção:** Nunca tente rodar arquivos `.ts` ou `.tsx` no SQL Editor. Use apenas o conteúdo do arquivo `.sql`.

## 📊 O que este script faz?
- **Apaga tabelas antigas**: Garante que erros de tipos de dados anteriores sejam corrigidos.
- **Cria o Schema**: Define as tabelas de Membros, Loja, Níveis e Mapas.
- **Popula Heróis**: Cria heróis de exemplo (Arthur, Alice e Bob) para você já começar testando.
- **Configura o Mentor**: Cria o acesso para os pais gerenciarem o reino.

---
*Que a jornada comece!*
