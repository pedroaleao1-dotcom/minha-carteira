-- 1. LIMPEZA TOTAL (Reset do Banco)
DROP TABLE IF EXISTS journey_template_steps CASCADE;
DROP TABLE IF EXISTS journey_templates CASCADE;
DROP TABLE IF EXISTS level_configs CASCADE;
DROP TABLE IF EXISTS global_settings CASCADE;
DROP TABLE IF EXISTS store_item_assignments CASCADE;
DROP TABLE IF EXISTS store_items CASCADE;
DROP TABLE IF EXISTS user_members CASCADE;
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

-- Vínculo de Usuários (Auth) com Membros
CREATE TABLE user_members (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, member_id)
);

-- Atribuições de Itens da Loja
CREATE TABLE store_item_assignments (
    store_item_id TEXT NOT NULL,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    PRIMARY KEY (store_item_id, member_id)
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
