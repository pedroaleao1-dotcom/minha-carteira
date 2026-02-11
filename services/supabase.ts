
import { createClient } from '@supabase/supabase-js';
import { Member, StoreItem, GlobalSettings, LevelConfig } from '../types';
import { db } from './db';

const SUPABASE_URL = 'https://omsjbleuvmwdqfcbzmjs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nqcylCcbP2z1YeeRZucUig_ggUhr6Wj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para empurrar dados locais para o Supabase
export const pushToCloud = async (member: Member) => {
    try {
        // 1. Membro principal
        await supabase.from('members').upsert({
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            role: member.role,
            badge: member.badge,
            level: member.level,
            xp: member.xp,
            coins: member.coins,
            notifications: member.notifications,
            updated_at: member.updatedAt
        });

        // 2. Sonhos e Passos
        for (const d of member.dreams) {
            await supabase.from('dreams').upsert({
                id: d.id,
                member_id: member.id,
                title: d.title,
                icon: d.icon,
                target_amount: d.targetAmount,
                current_amount: d.currentAmount,
                image_url: d.imageUrl,
                status: d.status,
                updated_at: d.updatedAt || member.updatedAt
            });

            if (d.steps) {
                await supabase.from('dream_steps').upsert(d.steps.map(s => ({
                    id: s.id,
                    dream_id: d.id,
                    title: s.title,
                    is_completed: s.isCompleted,
                    order_index: s.orderIndex,
                    xp_reward: s.xpReward,
                    x_pos: s.xPos,
                    y_pos: s.yPos,
                    icon: s.icon,
                    updated_at: s.updatedAt || member.updatedAt
                })));
            }
        }

        // 3. Missões
        if (member.tasks.length > 0) {
            await supabase.from('tasks').upsert(member.tasks.map(t => ({
                id: t.id,
                member_id: member.id,
                title: t.title,
                reward: t.reward,
                xp: t.xp,
                status: t.status,
                icon: t.icon,
                frequency: t.frequency,
                recurrence_text: t.recurrenceText,
                category: t.category,
                proposal_image: t.proposalImage,
                linked_dream_id: t.linkedDreamId,
                updated_at: t.updatedAt || member.updatedAt
            })));
        }

        // 4. Outros históricos...
        if (member.taskCompletions.length > 0) {
            await supabase.from('task_completions').upsert(member.taskCompletions.map(c => ({
                id: c.id,
                task_id: c.taskId,
                member_id: c.memberId,
                completed_at: new Date(c.completedAt).toISOString(),
                task_title: c.taskTitle,
                icon: c.icon,
                reward_coins: c.rewardCoins,
                reward_xp: c.rewardXp,
                updated_at: c.updatedAt || member.updatedAt
            })));
        }

        // Simplicidade para redemptions, history, achievements
        if (member.achievements.length > 0) await supabase.from('achievements').upsert(member.achievements.map(a => ({ id: a.id, member_id: member.id, title: a.title, description: a.description, icon: a.icon, earned: a.earned, updated_at: a.updatedAt || member.updatedAt })));
        if (member.redemptions.length > 0) await supabase.from('redemptions').upsert(member.redemptions.map(r => ({ id: r.id, member_id: member.id, item_id: r.itemId, title: r.title, icon: r.icon, status: r.status, timestamp: r.timestamp, updated_at: r.updatedAt || member.updatedAt })));
        if (member.history.length > 0) await supabase.from('history').upsert(member.history.map(h => ({ id: h.id, member_id: member.id, type: h.type, title: h.title, amount: h.amount, icon: h.icon, timestamp: h.timestamp, updated_at: h.updatedAt || member.updatedAt })));
        
        return true;
    } catch (e) {
        console.warn("Offline - salvando localmente apenas.");
        return false;
    }
};

// Função para buscar do Supabase e atualizar local se for mais recente
export const pullFromCloud = async () => {
    const { data: remoteMembers, error } = await supabase.from('members').select(`
        *,
        dreams (*, dream_steps (*)),
        tasks (*),
        task_completions (*),
        achievements (*),
        redemptions (*),
        history (*)
    `);

    if (error || !remoteMembers) return;

    for (const m of remoteMembers) {
        const local = await db.members.get(m.id);
        if (!local || m.updated_at > local.updatedAt) {
            // Mapear snake_case para camelCase
            const mapped: Member = {
                id: m.id,
                name: m.name,
                avatar: m.avatar,
                role: m.role,
                badge: m.badge,
                level: m.level,
                xp: m.xp,
                coins: m.coins,
                notifications: m.notifications,
                updatedAt: m.updated_at,
                dreams: (m.dreams || []).map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    icon: d.icon,
                    targetAmount: d.target_amount,
                    currentAmount: d.current_amount,
                    imageUrl: d.image_url,
                    status: d.status,
                    updatedAt: d.updated_at,
                    steps: (d.dream_steps || []).map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        isCompleted: s.is_completed,
                        orderIndex: s.order_index,
                        xpReward: s.xp_reward,
                        xPos: s.x_pos,
                        yPos: s.y_pos,
                        icon: s.icon,
                        updatedAt: s.updated_at
                    }))
                })),
                tasks: (m.tasks || []).map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    reward: t.reward,
                    xp: t.xp,
                    status: t.status,
                    icon: t.icon,
                    frequency: t.frequency,
                    recurrenceText: t.recurrence_text,
                    category: t.category,
                    updatedAt: t.updated_at,
                    assignedTo: [m.id]
                })),
                taskCompletions: (m.task_completions || []).map((c: any) => ({
                    id: c.id,
                    taskId: c.task_id,
                    memberId: c.member_id,
                    completedAt: new Date(c.completed_at).getTime(),
                    taskTitle: c.task_title,
                    icon: c.icon,
                    rewardCoins: c.reward_coins,
                    rewardXp: c.reward_xp,
                    updatedAt: c.updated_at
                })),
                achievements: (m.achievements || []).map((a: any) => ({ id: a.id, title: a.title, description: a.description, icon: a.icon, earned: a.earned, updatedAt: a.updated_at })),
                redemptions: (m.redemptions || []).map((r: any) => ({ id: r.id, itemId: r.item_id, title: r.title, icon: r.icon, status: r.status, timestamp: r.timestamp, updatedAt: r.updated_at })),
                history: (m.history || []).map((h: any) => ({ id: h.id, type: h.type, title: h.title, amount: h.amount, icon: h.icon, timestamp: h.timestamp, updatedAt: h.updated_at }))
            };
            await db.members.put(mapped);
        }
    }
};

// Funções para StoreItems
export const pushStoreItem = async (item: StoreItem) => {
    await supabase.from('store_items').upsert({
        id: item.id,
        title: item.title,
        price: item.price,
        icon: item.icon,
        color: item.color,
        assigned_to: item.assignedTo,
        updated_at: item.updatedAt
    });
};

// New functions for Global Settings and Level Configs
export const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    try {
        const { data, error } = await supabase.from('global_settings').select('*').single();
        if (error || !data) return { allow_coin_creation: true, updatedAt: Date.now() };
        return { 
            allow_coin_creation: data.allow_coin_creation, 
            updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now() 
        };
    } catch (e) {
        return { allow_coin_creation: true, updatedAt: Date.now() };
    }
};

export const updateGlobalSettings = async (settings: Partial<GlobalSettings>) => {
    try {
        await supabase.from('global_settings').upsert({ 
            id: 'global', 
            allow_coin_creation: settings.allow_coin_creation, 
            updated_at: new Date().toISOString() 
        });
    } catch (e) {
        console.error("Error updating global settings", e);
    }
};

export const fetchLevelConfigs = async (): Promise<LevelConfig[]> => {
    try {
        const { data, error } = await supabase.from('level_configs').select('*').order('level_number', { ascending: true });
        if (error || !data) return [];
        return data.map(l => ({
            level_number: l.level_number,
            xp_required: l.xp_required,
            coins_required: l.coins_required,
            shield_icon: l.shield_icon,
            title: l.title,
            updatedAt: l.updated_at ? new Date(l.updated_at).getTime() : Date.now()
        }));
    } catch (e) {
        return [];
    }
};

export const updateLevelConfig = async (config: LevelConfig) => {
    try {
        await supabase.from('level_configs').upsert({
            level_number: config.level_number,
            xp_required: config.xp_required,
            coins_required: config.coins_required,
            shield_icon: config.shield_icon,
            title: config.title,
            updated_at: new Date().toISOString()
        });
    } catch (e) {
        console.error("Error updating level config", e);
    }
};

export const deleteLevelConfig = async (levelNumber: number) => {
    try {
        await supabase.from('level_configs').delete().eq('level_number', levelNumber);
    } catch (e) {
        console.error("Error deleting level config", e);
    }
};

export const upsertMember = async (member: Member) => {
    return pushToCloud(member);
};
