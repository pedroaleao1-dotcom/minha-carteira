import { createClient } from '@supabase/supabase-js';
import { Member, StoreItem, GlobalSettings, LevelConfig, JourneyTemplate, DreamStep, Dream, Task, TaskCompletion, Achievement, Redemption, Transaction } from '../types';
import { db } from './db';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- HELPER PARA REMOVER E INSERIR RELAÇÕES DE FORMA SEGURA ---
// Como estamos lidando com sync, e o app salva a "foto" atual do membro, 
// a forma mais segura de lidar com arrays filhos é apagar os antigos e re-inserir.
// Porém, tabelas como history e task_completions são append-only na maioria das vezes.

export const pushToCloud = async (member: Member) => {
    return pushMembersToCloud([member]);
};

export const pushMembersToCloud = async (members: Member[]) => {
    if (members.length === 0) return true;
    try {
        // 1. Upsert Members (Base)
        const membersPayload = members.map(m => ({
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            role: m.role,
            badge: m.badge,
            level: m.level,
            xp: m.xp,
            coins: m.coins,
            status: m.status || 'active',
            notifications: m.notifications,
            updated_at: new Date(m.updatedAt).toISOString()
        }));
        
        const { error: mError } = await supabase.from('members').upsert(membersPayload);
        if (mError) throw mError;

        // Arrays para upsert em lote
        const allDreams: any[] = [];
        const allDreamSteps: any[] = [];
        const allTasks: any[] = [];
        const allCompletions: any[] = [];
        const allAchievements: any[] = [];
        const allTransactions: any[] = [];
        const allRedemptions: any[] = [];

        members.forEach(m => {
            (m.dreams || []).forEach(d => {
                allDreams.push({
                    id: d.id,
                    member_id: m.id,
                    title: d.title,
                    icon: d.icon,
                    target_amount: d.targetAmount,
                    current_amount: d.currentAmount,
                    estimated_amount: d.estimatedAmount,
                    image_url: d.imageUrl,
                    status: d.status,
                    template_id: d.templateId,
                    updated_at: new Date(d.updatedAt).toISOString()
                });
                (d.steps || []).forEach(s => {
                    allDreamSteps.push({
                        id: s.id,
                        dream_id: d.id,
                        title: s.title,
                        is_completed: s.isCompleted,
                        order_index: s.orderIndex,
                        xp_reward: s.xpReward,
                        x_pos: s.xPos,
                        y_pos: s.yPos,
                        icon: s.icon,
                        updated_at: new Date(s.updatedAt).toISOString()
                    });
                });
            });

            (m.tasks || []).forEach(t => {
                allTasks.push({
                    id: t.id,
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
                    assigned_to: t.assignedTo || [],
                    last_completed_at: t.lastCompletedAt,
                    updated_at: new Date(t.updatedAt).toISOString()
                });
            });

            (m.taskCompletions || []).forEach(tc => {
                allCompletions.push({
                    id: tc.id,
                    task_id: tc.taskId,
                    member_id: m.id,
                    completed_at: tc.completedAt,
                    task_title: tc.taskTitle,
                    icon: tc.icon,
                    reward_coins: tc.rewardCoins,
                    reward_xp: tc.rewardXp,
                    updated_at: new Date(tc.updatedAt).toISOString()
                });
            });

            (m.achievements || []).forEach(a => {
                allAchievements.push({
                    id: a.id,
                    member_id: m.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    earned: a.earned,
                    updated_at: new Date(a.updatedAt).toISOString()
                });
            });

            (m.history || []).forEach(tx => {
                allTransactions.push({
                    id: tx.id,
                    member_id: m.id,
                    type: tx.type,
                    title: tx.title,
                    amount: tx.amount,
                    icon: tx.icon,
                    timestamp: tx.timestamp,
                    updated_at: new Date(tx.updatedAt).toISOString()
                });
            });

            (m.redemptions || []).forEach(r => {
                allRedemptions.push({
                    id: r.id,
                    member_id: m.id,
                    item_id: r.itemId,
                    title: r.title,
                    icon: r.icon,
                    status: r.status,
                    timestamp: r.timestamp,
                    updated_at: new Date(r.updatedAt).toISOString()
                });
            });
        });

        // Upserts em Lote
        if (allDreams.length > 0) await supabase.from('dreams').upsert(allDreams);
        if (allDreamSteps.length > 0) await supabase.from('dream_steps').upsert(allDreamSteps);
        
        // Tasks have a member_id constraint in our schema? Wait, we didn't add member_id to tasks? 
        // Let's check SETUP_DATABASE.sql. Ah, we didn't add member_id to tasks because tasks are shared.
        // Actually, tasks are shared via "assigned_to" JSONB array. So upserting tasks directly is fine.
        if (allTasks.length > 0) {
            // Remove duplicates by ID in case multiple members share the same task in this batch
            const uniqueTasksMap = new Map();
            allTasks.forEach(t => uniqueTasksMap.set(t.id, t));
            await supabase.from('tasks').upsert(Array.from(uniqueTasksMap.values()));
        }

        if (allCompletions.length > 0) await supabase.from('task_completions').upsert(allCompletions);
        if (allAchievements.length > 0) await supabase.from('achievements').upsert(allAchievements);
        if (allTransactions.length > 0) await supabase.from('transactions').upsert(allTransactions);
        if (allRedemptions.length > 0) await supabase.from('redemptions').upsert(allRedemptions);

        return true;
    } catch (e) {
        console.error("Erro ao subir membros (Relacional):", e);
        return false;
    }
};

export const pullFromCloud = async () => {
    try {
        // 1. Fetching everything in parallel
        const [
            { data: cMembers, error: mError },
            { data: cDreams, error: dError },
            { data: cDreamSteps, error: dsError },
            { data: cTasks, error: tError },
            { data: cCompletions, error: tcError },
            { data: cAchievements, error: aError },
            { data: cHistory, error: hError },
            { data: cRedemptions, error: rError },
            { data: cStore, error: sError },
            { data: cStoreAssignments, error: saError }
        ] = await Promise.all([
            supabase.from('members').select('*'),
            supabase.from('dreams').select('*'),
            supabase.from('dream_steps').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('task_completions').select('*'),
            supabase.from('achievements').select('*'),
            supabase.from('transactions').select('*'),
            supabase.from('redemptions').select('*'),
            supabase.from('store_items').select('*'),
            supabase.from('store_item_assignments').select('*')
        ]);

        if (mError) throw mError;
        if (sError) throw sError;

        // 2. Re-assembling the Member objects
        if (cMembers) {
            const membersToPut: Member[] = cMembers.map(cm => {
                
                // Filter relationships
                const memberDreams = (cDreams || []).filter(d => d.member_id === cm.id).map(d => ({
                    id: d.id,
                    title: d.title,
                    icon: d.icon,
                    targetAmount: d.target_amount,
                    currentAmount: d.current_amount,
                    estimatedAmount: d.estimated_amount,
                    imageUrl: d.image_url,
                    status: d.status,
                    templateId: d.template_id,
                    updatedAt: new Date(d.updated_at).getTime(),
                    steps: (cDreamSteps || []).filter(s => s.dream_id === d.id).map(s => ({
                        id: s.id,
                        title: s.title,
                        isCompleted: s.is_completed,
                        orderIndex: s.order_index,
                        xpReward: s.xp_reward,
                        xPos: s.x_pos,
                        yPos: s.y_pos,
                        icon: s.icon,
                        updatedAt: new Date(s.updated_at).getTime()
                    }))
                }));

                const memberTasks = (cTasks || []).filter(t => (t.assigned_to || []).includes(cm.id)).map(t => ({
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
                    assignedTo: t.assigned_to,
                    lastCompletedAt: t.last_completed_at,
                    updatedAt: new Date(t.updated_at).getTime()
                }));

                const memberCompletions = (cCompletions || []).filter(tc => tc.member_id === cm.id).map(tc => ({
                    id: tc.id,
                    taskId: tc.task_id,
                    memberId: tc.member_id,
                    completedAt: tc.completed_at,
                    taskTitle: tc.task_title,
                    icon: tc.icon,
                    rewardCoins: tc.reward_coins,
                    rewardXp: tc.reward_xp,
                    updatedAt: new Date(tc.updated_at).getTime()
                }));

                const memberAchievements = (cAchievements || []).filter(a => a.member_id === cm.id).map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    icon: a.icon,
                    earned: a.earned,
                    updatedAt: new Date(a.updated_at).getTime()
                }));

                const memberHistory = (cHistory || []).filter(tx => tx.member_id === cm.id).map(tx => ({
                    id: tx.id,
                    type: tx.type,
                    title: tx.title,
                    amount: tx.amount,
                    icon: tx.icon,
                    timestamp: tx.timestamp,
                    updatedAt: new Date(tx.updated_at).getTime()
                }));

                const memberRedemptions = (cRedemptions || []).filter(r => r.member_id === cm.id).map(r => ({
                    id: r.id,
                    itemId: r.item_id,
                    title: r.title,
                    icon: r.icon,
                    status: r.status,
                    timestamp: r.timestamp,
                    updatedAt: new Date(r.updated_at).getTime()
                }));

                return {
                    id: cm.id,
                    name: cm.name,
                    avatar: cm.avatar,
                    role: cm.role as any,
                    badge: cm.badge,
                    level: cm.level,
                    xp: cm.xp,
                    coins: cm.coins,
                    dreams: memberDreams,
                    tasks: memberTasks,
                    taskCompletions: memberCompletions,
                    achievements: memberAchievements,
                    redemptions: memberRedemptions,
                    history: memberHistory,
                    status: cm.status || 'active',
                    notifications: cm.notifications,
                    updatedAt: new Date(cm.updated_at).getTime()
                };
            });
            await db.members.bulkPut(membersToPut);
        }

        // 3. Re-assembling Store Items
        if (cStore) {
            const itemsToPut: StoreItem[] = cStore.map(cs => {
                // Find assignments for this item
                const assignments = (cStoreAssignments || []).filter(sa => sa.store_item_id === cs.id).map(sa => sa.member_id);
                
                return {
                    id: cs.id,
                    title: cs.title,
                    price: cs.price,
                    icon: cs.icon,
                    color: cs.color,
                    assignedTo: assignments,
                    updatedAt: new Date(cs.updated_at).getTime()
                };
            });
            await db.storeItems.bulkPut(itemsToPut);
        }
    } catch (e: any) {
        console.error("Erro ao baixar dados:", e);
        alert("Erro no pullFromCloud: " + (e?.message || JSON.stringify(e)));
    }
};

// --- LOJA ---

export const pushStoreItem = async (item: StoreItem) => {
    return pushStoreItemsToCloud([item]);
};

export const pushStoreItemsToCloud = async (items: StoreItem[]) => {
    if (items.length === 0) return true;
    try {
        const payload = items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            icon: item.icon,
            color: item.color,
            updated_at: new Date(item.updatedAt).toISOString()
        }));
        await supabase.from('store_items').upsert(payload);

        // Update Assignments
        const allAssignments: { store_item_id: string, member_id: string }[] = [];
        
        // Fetch valid member IDs to avoid 409 Foreign Key Conflict for orphaned members
        const validMembers = await db.members.toArray();
        const validMemberIds = validMembers.map(m => m.id);

        items.forEach(item => {
            (item.assignedTo || []).forEach(memberId => {
                if (validMemberIds.includes(memberId)) {
                    allAssignments.push({
                        store_item_id: item.id,
                        member_id: memberId
                    });
                }
            });
        });

        // Delete old assignments for these items and insert new
        if(items.length > 0) {
            const itemIds = items.map(i => i.id);
            await supabase.from('store_item_assignments').delete().in('store_item_id', itemIds);
            if(allAssignments.length > 0){
                await supabase.from('store_item_assignments').insert(allAssignments);
            }
        }
        return true;
    } catch (e) {
         console.error("Erro ao subir items da loja (Relacional):", e);
         return false;
    }
};

// --- CONFIGURAÇÕES GLOBAIS ---

export const fetchGlobalSettings = async (): Promise<GlobalSettings> => {
    const { data } = await supabase.from('global_settings').select('*').eq('id', 'main_settings').single();
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
            yPos: s.y_pos,
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
