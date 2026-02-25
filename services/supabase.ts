
/**
 * DREAMQUEST - SCHEMA SQL COMPLETO (PostgreSQL / Supabase)
 * Execute este script no SQL Editor do seu projeto Supabase.
 * 
 * -- TABELA DE MEMBROS (Heróis e Mentores)
 * CREATE TABLE IF NOT EXISTS members (
 *     id TEXT PRIMARY KEY,
 *     name TEXT NOT NULL,
 *     avatar TEXT,
 *     role TEXT NOT NULL,
 *     badge TEXT,
 *     level INTEGER DEFAULT 1,
 *     xp INTEGER DEFAULT 0,
 *     coins INTEGER DEFAULT 0,
 *     dreams JSONB DEFAULT '[]',
 *     tasks JSONB DEFAULT '[]',
 *     task_completions JSONB DEFAULT '[]',
 *     achievements JSONB DEFAULT '[]',
 *     redemptions JSONB DEFAULT '[]',
 *     history JSONB DEFAULT '[]',
 *     notifications JSONB DEFAULT '{"tasks": true, "achievements": true}',
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- TABELA DA LOJA
 * CREATE TABLE IF NOT EXISTS store_items (
 *     id TEXT PRIMARY KEY,
 *     title TEXT NOT NULL,
 *     price INTEGER NOT NULL,
 *     icon TEXT,
 *     color TEXT,
 *     assigned_to JSONB DEFAULT '[]',
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- TABELA DE CONFIGURAÇÕES GLOBAIS
 * CREATE TABLE IF NOT EXISTS global_settings (
 *     id TEXT PRIMARY KEY DEFAULT 'main_settings',
 *     allow_coin_creation BOOLEAN DEFAULT true,
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- TABELA DE CONFIGURAÇÃO DE NÍVEIS
 * CREATE TABLE IF NOT EXISTS level_configs (
 *     level_number INTEGER PRIMARY KEY,
 *     title TEXT NOT NULL,
 *     xp_required INTEGER NOT NULL,
 *     coins_required INTEGER NOT NULL,
 *     shield_icon TEXT NOT NULL,
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- TABELA DE MODELOS DE MAPA (Mapas do Reino)
 * CREATE TABLE IF NOT EXISTS journey_templates (
 *     id TEXT PRIMARY KEY,
 *     title TEXT NOT NULL,
 *     icon TEXT DEFAULT 'map',
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- TABELA DE PASSOS DOS MODELOS
 * CREATE TABLE IF NOT EXISTS journey_template_steps (
 *     id TEXT PRIMARY KEY,
 *     template_id TEXT REFERENCES journey_templates(id) ON DELETE CASCADE,
 *     title TEXT NOT NULL,
 *     order_index INTEGER NOT NULL,
 *     xp_reward INTEGER DEFAULT 50,
 *     x_pos INTEGER NOT NULL,
 *     y_pos INTEGER NOT NULL,
 *     icon TEXT DEFAULT 'star',
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */

import { createClient } from '@supabase/supabase-js';
import { Member, StoreItem, GlobalSettings, LevelConfig, JourneyTemplate, DreamStep } from '../types';
import { db } from './db';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MEMBROS ---

export const pushToCloud = async (member: Member) => {
    try {
        const { error } = await supabase.from('members').upsert({
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            role: member.role,
            badge: member.badge,
            level: member.level,
            xp: member.xp,
            coins: member.coins,
            dreams: member.dreams,
            tasks: member.tasks,
            task_completions: member.taskCompletions,
            achievements: member.achievements,
            redemptions: member.redemptions,
            history: member.history,
            notifications: member.notifications,
            updated_at: new Date(member.updatedAt).toISOString()
        });
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Erro ao subir membro:", e);
        return false;
    }
};

export const pushMembersToCloud = async (members: Member[]) => {
    if (members.length === 0) return true;
    try {
        const payload = members.map(member => ({
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            role: member.role,
            badge: member.badge,
            level: member.level,
            xp: member.xp,
            coins: member.coins,
            dreams: member.dreams,
            tasks: member.tasks,
            task_completions: member.taskCompletions,
            achievements: member.achievements,
            redemptions: member.redemptions,
            history: member.history,
            notifications: member.notifications,
            updated_at: new Date(member.updatedAt).toISOString()
        }));
        const { error } = await supabase.from('members').upsert(payload);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Erro ao subir membros em lote:", e);
        return false;
    }
};

export const pullFromCloud = async () => {
    try {
        const { data: cloudMembers, error: mError } = await supabase.from('members').select('*');
        if (mError) throw mError;
        
        if (cloudMembers) {
            const membersToPut = cloudMembers.map(cm => ({
                id: cm.id,
                name: cm.name,
                avatar: cm.avatar,
                role: cm.role as any,
                badge: cm.badge,
                level: cm.level,
                xp: cm.xp,
                coins: cm.coins,
                dreams: cm.dreams || [],
                tasks: cm.tasks || [],
                taskCompletions: cm.task_completions || [],
                achievements: cm.achievements || [],
                redemptions: cm.redemptions || [],
                history: cm.history || [],
                notifications: cm.notifications,
                updatedAt: new Date(cm.updated_at).getTime()
            }));
            await db.members.bulkPut(membersToPut);
        }

        const { data: cloudStore, error: sError } = await supabase.from('store_items').select('*');
        if (sError) throw sError;
        if (cloudStore) {
            const itemsToPut = cloudStore.map(cs => ({
                id: cs.id,
                title: cs.title,
                price: cs.price,
                icon: cs.icon,
                color: cs.color,
                assignedTo: cs.assigned_to || [],
                updatedAt: new Date(cs.updated_at).getTime()
            }));
            await db.storeItems.bulkPut(itemsToPut);
        }
    } catch (e) {
        console.error("Erro ao baixar dados:", e);
    }
};

// --- LOJA ---

export const pushStoreItem = async (item: StoreItem) => {
    await supabase.from('store_items').upsert({
        id: item.id,
        title: item.title,
        price: item.price,
        icon: item.icon,
        color: item.color,
        assigned_to: item.assignedTo,
        updated_at: new Date(item.updatedAt).toISOString()
    });
};

export const pushStoreItemsToCloud = async (items: StoreItem[]) => {
    if (items.length === 0) return true;
    const payload = items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        icon: item.icon,
        color: item.color,
        assigned_to: item.assignedTo,
        updated_at: new Date(item.updatedAt).toISOString()
    }));
    await supabase.from('store_items').upsert(payload);
};

// --- CONFIGURAÇÕES GLOBAIS ---

export const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    const { data } = await supabase.from('global_settings').select('*').eq('id', 'main_settings').single();
    // Fix: Added updatedAt to comply with GlobalSettings interface which extends BaseEntity
    return data ? { 
        allow_coin_creation: data.allow_coin_creation,
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now()
    } : { 
        allow_coin_creation: true,
        updatedAt: Date.now()
    };
};

export const updateGlobalSettings = async (settings: GlobalSettings) => {
    await supabase.from('global_settings').upsert({
        id: 'main_settings',
        allow_coin_creation: settings.allow_coin_creation,
        updated_at: new Date().toISOString()
    });
};

// --- NÍVEIS ---

export const fetchLevelConfigs = async (): Promise<LevelConfig[]> => {
    const { data } = await supabase.from('level_configs').select('*').order('level_number', { ascending: true });
    return (data || []).map(l => ({
        level_number: l.level_number,
        title: l.title,
        xp_required: l.xp_required,
        coins_required: l.coins_required,
        shield_icon: l.shield_icon,
        updatedAt: new Date(l.updated_at).getTime()
    }));
};

export const updateLevelConfig = async (config: LevelConfig) => {
    await supabase.from('level_configs').upsert({
        level_number: config.level_number,
        title: config.title,
        xp_required: config.xp_required,
        coins_required: config.coins_required,
        shield_icon: config.shield_icon,
        updated_at: new Date().toISOString()
    });
};

export const deleteLevelConfig = async (lvl: number) => {
    await supabase.from('level_configs').delete().eq('level_number', lvl);
};

// --- MAPAS DO REINO (TEMPLATES) ---

export const pushJourneyTemplate = async (template: JourneyTemplate) => {
    try {
        await supabase.from('journey_templates').upsert({
            id: template.id,
            title: template.title,
            icon: template.icon,
            updated_at: new Date(template.updatedAt).toISOString()
        });

        if (template.steps.length > 0) {
            await supabase.from('journey_template_steps').upsert(template.steps.map(s => ({
                id: s.id,
                template_id: template.id,
                title: s.title,
                order_index: s.orderIndex,
                xp_reward: s.xpReward,
                x_pos: s.xPos,
                y_pos: s.yPos,
                icon: s.icon,
                updated_at: new Date(s.updatedAt).toISOString()
            })));
        }
        return true;
    } catch (e) {
        console.error("Erro ao subir template:", e);
        return false;
    }
};

export const fetchJourneyTemplates = async (): Promise<JourneyTemplate[]> => {
    const { data, error } = await supabase.from('journey_templates').select(`
        *,
        journey_template_steps (*)
    `);

    if (error || !data) return [];

    return data.map(t => ({
        id: t.id,
        title: t.title,
        icon: t.icon,
        updatedAt: new Date(t.updated_at).getTime(),
        steps: (t.journey_template_steps || []).map((s: any) => ({
            id: s.id,
            title: s.title,
            isCompleted: false,
            orderIndex: s.order_index,
            xpReward: s.xp_reward,
            xPos: s.x_pos,
            y_pos: s.y_pos,
            icon: s.icon,
            updatedAt: new Date(s.updated_at).getTime()
        })).sort((a: any, b: any) => a.orderIndex - b.orderIndex)
    }));
};

export const deleteJourneyTemplate = async (id: string) => {
    await supabase.from('journey_templates').delete().eq('id', id);
};

// --- ALIASES ---
export const upsertMember = pushToCloud;
