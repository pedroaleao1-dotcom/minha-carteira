
import { createClient } from '@supabase/supabase-js';
import { Member, StoreItem, Dream, Task, Achievement, Redemption, Transaction, LevelConfig, GlobalSettings, TaskCompletion, DreamStep } from '../types';

const SUPABASE_URL = 'https://omsjbleuvmwdqfcbzmjs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nqcylCcbP2z1YeeRZucUig_ggUhr6Wj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const fetchMembers = async (): Promise<Member[]> => {
    const { data, error } = await supabase
        .from('members')
        .select(`
            *,
            dreams (*, dream_steps (*)),
            tasks (*),
            task_completions (*),
            achievements (*),
            redemptions (*),
            history (*)
        `)
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Fetch members error:", error);
        return [];
    }

    return (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        role: m.role,
        badge: m.badge,
        level: m.level,
        xp: m.xp,
        coins: m.coins,
        notifications: m.notifications || { tasks: true, achievements: true },
        dreams: (m.dreams || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            icon: d.icon,
            targetAmount: d.target_amount,
            currentAmount: d.current_amount,
            imageUrl: d.image_url,
            status: d.status,
            steps: (d.dream_steps || []).map((s: any) => ({
                id: s.id,
                title: s.title,
                isCompleted: s.is_completed,
                orderIndex: s.order_index,
                xpReward: s.xp_reward,
                xPos: s.x_pos,
                yPos: s.y_pos,
                icon: s.icon
            })).sort((a: any, b: any) => a.orderIndex - b.orderIndex)
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
            proposalImage: t.proposal_image,
            linkedDreamId: t.linked_dream_id,
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
            rewardXp: c.reward_xp
        })),
        achievements: (m.achievements || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            icon: a.icon,
            earned: a.earned
        })),
        redemptions: (m.redemptions || []).map((r: any) => ({
            id: r.id,
            itemId: r.item_id,
            title: r.title,
            icon: r.icon,
            status: r.status,
            timestamp: Number(r.timestamp)
        })),
        history: (m.history || []).map((h: any) => ({
            id: h.id,
            type: h.type,
            title: h.title,
            amount: h.amount,
            icon: h.icon,
            timestamp: Number(h.timestamp)
        }))
    })) as Member[];
};

export const upsertMember = async (member: Member) => {
    // 1. Salvar Membro
    await supabase.from('members').upsert({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        role: member.role,
        badge: member.badge,
        level: member.level,
        xp: member.xp,
        coins: member.coins,
        notifications: member.notifications
    });

    // 2. Salvar Sonhos e seus Passos
    if (member.dreams.length > 0) {
        for (const d of member.dreams) {
            await supabase.from('dreams').upsert({
                id: d.id,
                member_id: member.id,
                title: d.title,
                icon: d.icon,
                target_amount: d.targetAmount,
                current_amount: d.currentAmount,
                image_url: d.imageUrl,
                status: d.status
            });

            if (d.steps && d.steps.length > 0) {
                await supabase.from('dream_steps').upsert(d.steps.map(s => ({
                    id: s.id,
                    dream_id: d.id,
                    title: s.title,
                    is_completed: s.isCompleted,
                    order_index: s.orderIndex,
                    xp_reward: s.xpReward,
                    x_pos: s.xPos,
                    y_pos: s.yPos,
                    icon: s.icon
                })));
            }
        }
    }

    // 3. Salvar Missões
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
            linked_dream_id: t.linkedDreamId
        })));
    }

    // 4. Salvar Histórico de Calendário
    if (member.taskCompletions && member.taskCompletions.length > 0) {
        await supabase.from('task_completions').upsert(member.taskCompletions.map(c => ({
            id: c.id,
            task_id: c.taskId,
            member_id: c.memberId,
            completed_at: new Date(c.completedAt).toISOString(),
            task_title: c.taskTitle,
            icon: c.icon,
            reward_coins: c.rewardCoins,
            reward_xp: c.rewardXp
        })));
    }

    // 5. Outros históricos
    if (member.achievements.length > 0) await supabase.from('achievements').upsert(member.achievements.map(a => ({ id: a.id, member_id: member.id, title: a.title, description: a.description, icon: a.icon, earned: a.earned })));
    if (member.redemptions.length > 0) await supabase.from('redemptions').upsert(member.redemptions.map(r => ({ id: r.id, member_id: member.id, item_id: r.itemId, title: r.title, icon: r.icon, status: r.status, timestamp: r.timestamp })));
    if (member.history.length > 0) await supabase.from('history').upsert(member.history.map(h => ({ id: h.id, member_id: member.id, type: h.type, title: h.title, amount: h.amount, icon: h.icon, timestamp: h.timestamp })));
};

export const fetchStoreItems = async (): Promise<StoreItem[]> => {
    const { data, error } = await supabase.from('store_items').select('*').order('title');
    if (error) return [];
    return data.map(i => ({ id: i.id, title: i.title, price: i.price, icon: i.icon, color: i.color, assignedTo: i.assigned_to || [] }));
};

export const upsertStoreItem = async (item: StoreItem) => {
    await supabase.from('store_items').upsert({ id: item.id, title: item.title, price: item.price, icon: item.icon, color: item.color, assigned_to: item.assignedTo });
};

export const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    const { data, error } = await supabase.from('global_settings').select('*').single();
    if (error || !data) return { allow_coin_creation: true };
    return { allow_coin_creation: data.allow_coin_creation };
};

export const updateGlobalSettings = async (settings: GlobalSettings) => {
    await supabase.from('global_settings').upsert({ id: 1, allow_coin_creation: settings.allow_coin_creation });
};

export const fetchLevelConfigs = async (): Promise<LevelConfig[]> => {
    const { data, error } = await supabase.from('level_configs').select('*').order('level_number', { ascending: true });
    if (error) return [];
    return data.map(lv => ({
        level_number: lv.level_number,
        title: lv.title,
        xp_required: lv.xp_required,
        coins_required: lv.coins_required,
        shield_icon: lv.shield_icon
    }));
};

export const updateLevelConfig = async (config: LevelConfig) => {
    await supabase.from('level_configs').upsert(config);
};

export const deleteLevelConfig = async (levelNumber: number) => {
    await supabase.from('level_configs').delete().eq('level_number', levelNumber);
};
