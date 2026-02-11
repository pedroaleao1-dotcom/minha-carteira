
import { createClient } from '@supabase/supabase-js';
import { Member, StoreItem, Dream, Task, Achievement, Redemption, Transaction, LevelConfig, GlobalSettings } from '../types';

const SUPABASE_URL = 'https://omsjbleuvmwdqfcbzmjs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nqcylCcbP2z1YeeRZucUig_ggUhr6Wj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    const { data, error } = await supabase.from('global_settings').select('*').eq('id', 'config').single();
    if (error) return { allow_coin_creation: true };
    return { allow_coin_creation: data.allow_coin_creation };
};

export const updateGlobalSettings = async (settings: GlobalSettings) => {
    await supabase.from('global_settings').upsert({ id: 'config', ...settings });
};

export const fetchLevelConfigs = async (): Promise<LevelConfig[]> => {
    const { data, error } = await supabase.from('level_configs').select('*').order('level_number');
    if (error) return [];
    return data.map(lv => ({
        level_number: lv.level_number,
        xp_required: lv.xp_required,
        coins_required: lv.coins_required || 0,
        shield_icon: lv.shield_icon,
        title: lv.title
    }));
};

export const updateLevelConfig = async (config: LevelConfig) => {
    await supabase.from('level_configs').upsert(config);
};

export const deleteLevelConfig = async (levelNumber: number) => {
    await supabase.from('level_configs').delete().eq('level_number', levelNumber);
};

export const fetchMembers = async (): Promise<Member[]> => {
    const { data, error } = await supabase
        .from('members')
        .select(`
            *,
            dreams (*),
            tasks (*),
            achievements (*),
            redemptions (*),
            history (*)
        `)
        .order('name', { ascending: true });
    
    if (error) return [];

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
            status: d.status
        })),
        tasks: (m.tasks || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            reward: t.reward,
            xp: t.xp,
            status: t.status,
            icon: t.icon,
            proposalImage: t.proposal_image,
            linkedDreamId: t.linked_dream_id,
            assignedTo: [m.id]
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

    if (member.dreams.length > 0) {
        await supabase.from('dreams').upsert(member.dreams.map(d => ({
            id: d.id,
            member_id: member.id,
            title: d.title,
            icon: d.icon,
            target_amount: d.targetAmount,
            current_amount: d.currentAmount,
            image_url: d.imageUrl,
            status: d.status
        })));
    }

    if (member.tasks.length > 0) {
        await supabase.from('tasks').upsert(member.tasks.map(t => ({
            id: t.id,
            member_id: member.id,
            title: t.title,
            reward: t.reward,
            xp: t.xp,
            status: t.status,
            icon: t.icon,
            proposal_image: t.proposalImage,
            linked_dream_id: t.linkedDreamId
        })));
    }

    if (member.achievements.length > 0) {
        await supabase.from('achievements').upsert(member.achievements.map(a => ({
            id: a.id,
            member_id: member.id,
            title: a.title,
            description: a.description,
            icon: a.icon,
            earned: a.earned
        })));
    }
    if (member.redemptions.length > 0) {
        await supabase.from('redemptions').upsert(member.redemptions.map(r => ({
            id: r.id,
            member_id: member.id,
            item_id: r.itemId,
            title: r.title,
            icon: r.icon,
            status: r.status,
            timestamp: r.timestamp
        })));
    }
    if (member.history.length > 0) {
        await supabase.from('history').upsert(member.history.map(h => ({
            id: h.id,
            member_id: member.id,
            type: h.type,
            title: h.title,
            amount: h.amount,
            icon: h.icon,
            timestamp: h.timestamp
        })));
    }
};

export const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
};

export const deleteRedemption = async (redemptionId: string) => {
    await supabase.from('redemptions').delete().eq('id', redemptionId);
};

export const fetchStoreItems = async (): Promise<StoreItem[]> => {
    const { data, error } = await supabase.from('store_items').select('*').order('title');
    if (error) return [];
    return data.map(i => ({
        id: i.id,
        title: i.title,
        price: i.price,
        icon: i.icon,
        color: i.color,
        assignedTo: i.assigned_to || []
    }));
};

export const upsertStoreItem = async (item: StoreItem) => {
    await supabase.from('store_items').upsert({
        id: item.id,
        title: item.title,
        price: item.price,
        icon: item.icon,
        color: item.color,
        assigned_to: item.assignedTo
    });
};
