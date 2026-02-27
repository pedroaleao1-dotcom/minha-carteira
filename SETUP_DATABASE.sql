
-- ==========================================================
-- 🏰 DREAMQUEST KIDS - SCRIPT MESTRE DE CONFIGURAÇÃO
-- Este script apaga tudo, cria as tabelas e popula com dados.
-- Execute este bloco INTEIRO no SQL Editor do Supabase.
-- ==========================================================

-- 1. LIMPEZA TOTAL (Reset do Banco)
DROP TABLE IF EXISTS journey_template_steps CASCADE;
DROP TABLE IF EXISTS journey_templates CASCADE;
DROP TABLE IF EXISTS level_configs CASCADE;
DROP TABLE IF EXISTS global_settings CASCADE;
DROP TABLE IF EXISTS store_items CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- 2. CRIAÇÃO DAS TABELAS

-- Membros (Heróis e Mentores)
CREATE TABLE members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL,
    badge TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    dreams JSONB DEFAULT '[]',
    tasks JSONB DEFAULT '[]',
    task_completions JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    redemptions JSONB DEFAULT '[]',
    history JSONB DEFAULT '[]',
    notifications JSONB DEFAULT '{"tasks": true, "achievements": true}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loja do Reino
CREATE TABLE store_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    icon TEXT,
    color TEXT,
    assigned_to JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações Gerais
CREATE TABLE global_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    allow_coin_creation BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuração de Níveis
CREATE TABLE level_configs (
    level_number INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    xp_required INTEGER NOT NULL,
    coins_required INTEGER NOT NULL,
    shield_icon TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modelos de Mapas
CREATE TABLE journey_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT DEFAULT 'map',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passos dos Mapas
CREATE TABLE journey_template_steps (
    id TEXT PRIMARY KEY,
    template_id TEXT REFERENCES journey_templates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50,
    x_pos INTEGER NOT NULL,
    y_pos INTEGER NOT NULL,
    icon TEXT DEFAULT 'star',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. POPULAÇÃO DE DADOS (SEED)

-- Níveis
INSERT INTO level_configs (level_number, title, xp_required, coins_required, shield_icon) VALUES
(1, 'Recruta do Reino', 0, 0, 'shield'),
(2, 'Explorador Aprendiz', 500, 100, 'bolt'),
(3, 'Guerreiro de Elite', 1500, 300, 'military_tech'),
(4, 'Cavaleiro Lendário', 3500, 700, 'stars'),
(5, 'Mestre dos Sonhos', 7000, 1500, 'workspace_premium');

-- Configuração Global
INSERT INTO global_settings (id, allow_coin_creation) VALUES ('main_settings', true);

-- Prêmios na Loja
INSERT INTO store_items (id, title, price, icon, color, assigned_to) VALUES
('si_1', '15 min de Tablet', 40, 'tablet_android', 'bg-indigo-500', '["hero_1", "hero_2", "hero_3"]'::jsonb),
('si_2', 'Escolher o Filme', 80, 'movie', 'bg-purple-500', '["hero_1", "hero_2", "hero_3"]'::jsonb),
('si_3', 'Sorvete de Sobremesa', 120, 'icecream', 'bg-pink-500', '["hero_1", "hero_3"]'::jsonb),
('si_4', 'Dormir 30min mais tarde', 150, 'bedtime', 'bg-blue-600', '["hero_1", "hero_2"]'::jsonb);

-- Modelos de Jornada
INSERT INTO journey_templates (id, title, icon) VALUES ('temp_math', 'Desafio Matemático', 'calculate');
INSERT INTO journey_template_steps (id, template_id, title, order_index, xp_reward, x_pos, y_pos, icon) VALUES
('ms_1', 'temp_math', 'Tabuada do 2', 0, 50, 50, 100, 'star'),
('ms_2', 'temp_math', 'Tabuada do 5', 1, 100, 30, 250, 'bolt'),
('ms_3', 'temp_math', 'Divisões Simples', 2, 150, 70, 400, 'psychology'),
('ms_4', 'temp_math', 'Problema Lógico', 3, 200, 50, 550, 'redeem');

-- HERÓIS E MENTORES

-- Mentor Principal
INSERT INTO members (id, name, avatar, role, badge) VALUES 
('parent_1', 'Mestre Mentor', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4', 'parent', 'settings');

-- Herói 1: Arthur (Nível 2, Ativo)
INSERT INTO members (id, name, avatar, role, badge, level, xp, coins, dreams, tasks, history, task_completions) VALUES (
    'hero_1', 'Arthur o Bravo', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur', 'child', 'star', 2, 650, 145,
    '[{"id": "d1", "title": "LEGO Star Wars", "icon": "rocket_launch", "targetAmount": 1000, "currentAmount": 145, "status": "active"}]',
    '[{"id": "t1", "title": "Arrumar a Cama", "reward": 10, "xp": 20, "status": "todo", "icon": "bed", "frequency": "daily", "category": "chore", "assignedTo": ["hero_1"]}]',
    '[{"id": "tx1", "type": "reward", "title": "Missão: Ler Livro", "amount": 20, "icon": "menu_book", "timestamp": 1710000000000}]',
    '[{"id": "tc1", "taskId": "old_1", "memberId": "hero_1", "completedAt": 1710000000000, "taskTitle": "Ler Livro", "icon": "menu_book", "rewardCoins": 20, "rewardXp": 40}]'
);

-- Herói 2: Alice (Nível 3, Focada em Estudos)
INSERT INTO members (id, name, avatar, role, badge, level, xp, coins, dreams, tasks) VALUES (
    'hero_2', 'Alice a Sábia', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice', 'child', 'star', 3, 1600, 320,
    '[{"id": "d2", "title": "Curso de Desenho", "icon": "brush", "targetAmount": 500, "currentAmount": 320, "status": "active"}]',
    '[{"id": "t2", "title": "Estudar Inglês", "reward": 30, "xp": 60, "status": "todo", "icon": "translate", "frequency": "daily", "category": "study", "assignedTo": ["hero_2"]}]'
);

-- Herói 3: Bob (Nível 1, Iniciante)
INSERT INTO members (id, name, avatar, role, badge, level, xp, coins) VALUES (
    'hero_3', 'Pequeno Bob', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob', 'child', 'star', 1, 50, 10
);
