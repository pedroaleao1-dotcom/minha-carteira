-- 5. PERMISSÕES E SEGURANÇA
-- Garante que o usuário autenticado da API (e anon) possam ler/escrever nas tabelas.
-- Recomenda-se adicionar RLS (Row Level Security) futuramente.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
