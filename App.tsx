
import React, { useState, useEffect } from 'react';
import { Member, Task, StoreItem, Redemption, Transaction, Dream } from './types';
import RoleSelection from './views/RoleSelection';
import ChildDashboard from './views/ChildDashboard';
import ParentDashboard from './views/ParentDashboard';
import DreamDetails from './views/DreamDetails';
import TaskList from './views/TaskList';
import Store from './views/Store';
import Achievements from './views/Achievements';
import AddTask from './views/AddTask';
import Profile from './views/Profile';
import DreamGallery from './views/DreamGallery';
import AddDream from './views/AddDream';
import RequestMission from './views/RequestMission';
import ReviewDream from './views/ReviewDream';
import AddStoreItem from './views/AddStoreItem';
import Wallet from './views/Wallet';
import AddMember from './views/AddMember';
import { supabase, fetchMembers, upsertMember, fetchStoreItems, upsertStoreItem } from './services/supabase';

const initialMembers: Member[] = [
    {
        id: 'm1',
        name: 'Junior',
        role: 'child',
        badge: 'star',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Junior&backgroundColor=b6e3f4',
        level: 3, xp: 350, coins: 120,
        dreams: [], tasks: [], achievements: [], redemptions: [], history: [],
        notifications: { tasks: true, achievements: true }
    },
    {
        id: 'm2',
        name: 'Marina',
        role: 'child',
        badge: 'heart',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marina&backgroundColor=ffd5dc',
        level: 2, xp: 150, coins: 45,
        dreams: [], tasks: [], achievements: [], redemptions: [], history: [],
        notifications: { tasks: false, achievements: true }
    },
    {
        id: 'm3',
        name: 'Pais',
        role: 'parent',
        badge: 'settings',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
        level: 10, xp: 5000, coins: 1000,
        dreams: [], tasks: [], achievements: [], redemptions: [], history: [],
        notifications: { tasks: true, achievements: true }
    }
];

const initialStoreItems: StoreItem[] = [
    { id: 's1', title: '30 min de Game', price: 50, icon: 'sports_esports', color: 'bg-indigo-500', assignedTo: ['m1', 'm2'] },
    { id: 's2', title: 'Escolher o Jantar', price: 80, icon: 'restaurant', color: 'bg-orange-500', assignedTo: ['m1', 'm2', 'm3'] }
];

type View = 'role' | 'child_dash' | 'parent_dash' | 'dream_gallery' | 'dream_details' | 'add_dream' | 'tasks' | 'store' | 'achievements' | 'add_task' | 'profile' | 'request_mission' | 'review_dream' | 'add_store_item' | 'wallet' | 'add_member';

const App: React.FC = () => {
    const [view, setView] = useState<View>('role');
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
    const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);

    const activeMember = members.find(m => m.id === activeMemberId);
    const selectedDream = activeMember?.dreams?.find(d => d.id === selectedDreamId);

    // Inicialização e Real-time Subscription
    useEffect(() => {
        const init = async () => {
            try {
                const [dbMembers, dbStoreItems] = await Promise.all([
                    fetchMembers(),
                    fetchStoreItems()
                ]);

                if (dbMembers.length === 0) {
                    await Promise.all([
                        ...initialMembers.map(m => upsertMember(m)),
                        ...initialStoreItems.map(si => upsertStoreItem(si))
                    ]);
                    setMembers(initialMembers);
                    setStoreItems(initialStoreItems);
                } else {
                    setMembers(dbMembers);
                    setStoreItems(dbStoreItems);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        // Inscrever para mudanças em tempo real nas tabelas
        const membersSubscription = supabase
            .channel('members_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setMembers(prev => [...prev, payload.new as Member]);
                } else if (payload.eventType === 'UPDATE') {
                    setMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new as Member : m));
                } else if (payload.eventType === 'DELETE') {
                    setMembers(prev => prev.filter(m => m.id !== payload.old.id));
                }
            })
            .subscribe();

        const storeSubscription = supabase
            .channel('store_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'store_items' }, () => {
                fetchStoreItems().then(setStoreItems);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(membersSubscription);
            supabase.removeChannel(storeSubscription);
        };
    }, []);

    const updateActiveMember = async (updater: (m: Member) => Member) => {
        if (!activeMemberId) return;
        const currentMember = members.find(m => m.id === activeMemberId);
        if (!currentMember) return;

        const updated = updater(currentMember);
        // Atualização Otimista local
        setMembers(prev => prev.map(m => m.id === activeMemberId ? updated : m));
        // Persistência Remota
        await upsertMember(updated);
    };

    const handleMemberSelect = (id: string) => {
        setActiveMemberId(id);
        const member = members.find(m => m.id === id);
        if (member?.role === 'parent') setView('parent_dash');
        else if (member?.role === 'child') setView('child_dash');
    };

    const handleAddMember = async (newMemberData: any) => {
        const newMember: Member = {
            ...newMemberData,
            id: Math.random().toString(36).substr(2, 9),
            level: 1, xp: 0, coins: 0, dreams: [], tasks: [], achievements: [], redemptions: [], history: [],
            notifications: { tasks: true, achievements: true }
        };
        await upsertMember(newMember);
        setView('role');
    };

    const handleAddDream = (dreamData: any) => {
        const newDream: Dream = {
            ...dreamData,
            id: Math.random().toString(36).substr(2, 9),
            currentAmount: 0,
            status: 'active'
        };
        updateActiveMember(m => ({
            ...m,
            dreams: [...m.dreams, newDream]
        }));
        setView('dream_gallery');
    };

    const handleAddCoinsToDream = (amount: number) => {
        if (!selectedDreamId || !activeMember || activeMember.coins < amount) return;
        const now = Date.now();
        updateActiveMember(m => ({
            ...m,
            coins: m.coins - amount,
            dreams: m.dreams.map(d => d.id === selectedDreamId ? { ...d, currentAmount: d.currentAmount + amount } : d),
            history: [{ id: `tx-dream-${now}`, type: 'investment', title: `Poupou para: ${selectedDream?.title}`, amount: -amount, icon: selectedDream?.icon || 'star', timestamp: now }, ...m.history]
        }));
    };

    const handleBuyItem = (item: StoreItem) => {
        if (activeMember && activeMember.coins >= item.price) {
            const now = Date.now();
            updateActiveMember(m => ({
                ...m,
                coins: m.coins - item.price,
                redemptions: [...m.redemptions, { id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'delivered', timestamp: now }],
                history: [{ id: `tx-${now}`, type: 'purchase', title: `Comprou: ${item.title}`, amount: -item.price, icon: item.icon, timestamp: now }, ...m.history]
            }));
        }
    };

    const approveTask = async (taskId: string) => {
        const now = Date.now();
        const memberToUpdate = members.find(m => m.tasks.some(t => t.id === taskId && t.status === 'pending'));
        if (!memberToUpdate) return;

        const taskIndex = memberToUpdate.tasks.findIndex(t => t.id === taskId);
        const task = memberToUpdate.tasks[taskIndex];
        const updatedTask = { ...task, status: 'completed' as const };
        
        const updated: Member = {
            ...memberToUpdate,
            tasks: memberToUpdate.tasks.map(t => t.id === taskId ? updatedTask : t),
            coins: memberToUpdate.coins + task.reward,
            xp: memberToUpdate.xp + task.xp,
            history: [{ 
                id: `tx-reward-${now}`, 
                type: 'reward' as const, 
                title: `Missão: ${task.title}`, 
                amount: task.reward, 
                icon: task.icon, 
                timestamp: now 
            }, ...memberToUpdate.history]
        };
        
        await upsertMember(updated);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 animate-bounce">
                    <span className="material-symbols-outlined text-4xl text-[#2b8cee] animate-spin">cloud_sync</span>
                </div>
                <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Conectando ao Supabase...</p>
            </div>
        );
    }

    if (members.length === 0 && !isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
                <h1 className="text-xl font-black text-slate-800 mb-4">Bem-vindo ao DreamQuest!</h1>
                <button onClick={() => setView('add_member')} className="bg-[#2b8cee] text-white px-8 py-4 rounded-full font-black shadow-lg">CRIAR PRIMEIRO HERÓI</button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden flex flex-col">
            {view === 'role' && <RoleSelection members={members} onSelect={handleMemberSelect} onAddNew={() => setView('add_member')} />}
            {view === 'add_member' && <AddMember onSave={handleAddMember} onBack={() => setView('role')} />}
            
            {activeMember && (
                <>
                    {view === 'child_dash' && <ChildDashboard child={activeMember} onNavigate={setView} onOpenDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} />}
                    {view === 'parent_dash' && <ParentDashboard activeParent={activeMember} members={members} onApprove={approveTask} onBack={() => setView('role')} onAddTask={() => setView('add_task')} onAddStoreItem={() => setView('add_store_item')} onPlay={() => setView('child_dash')} />}
                    {view === 'dream_gallery' && <DreamGallery dreams={activeMember.dreams} onSelect={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onAdd={() => setView('add_dream')} onBack={() => setView('child_dash')} />}
                    {view === 'add_dream' && <AddDream onAdd={handleAddDream} onBack={() => setView('dream_gallery')} />}
                    {view === 'dream_details' && selectedDream && <DreamDetails dream={selectedDream} coins={activeMember.coins} onAddCoins={handleAddCoinsToDream} onBack={() => setView('dream_gallery')} />}
                    {view === 'add_store_item' && <AddStoreItem members={members} onAdd={async (item) => { const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) }; await upsertStoreItem(newItem); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />}
                    {view === 'profile' && <Profile child={activeMember} storeItems={storeItems} onNavigate={setView} onBack={() => setView(activeMember.role === 'parent' ? 'parent_dash' : 'child_dash')} onUpdateAvatar={(img) => updateActiveMember(m => ({...m, avatar: img}))} onUpdateNotifications={(notifs) => updateActiveMember(m => ({...m, notifications: notifs}))} onBuyItem={handleBuyItem} onSellItem={(id) => { /* handleSellItem logic here */ }} />}
                    {view === 'wallet' && <Wallet child={activeMember} onBack={() => setView('child_dash')} />}
                    {view === 'tasks' && <TaskList tasks={activeMember.tasks} onComplete={(id) => updateActiveMember(m => ({...m, tasks: m.tasks.map(t => t.id === id ? {...t, status: 'pending'} : t)}))} onBack={() => setView('child_dash')} />}
                    {view === 'store' && <Store coins={activeMember.coins} storeItems={storeItems.filter(si => si.assignedTo.includes(activeMember.id))} redemptions={activeMember.redemptions} onBuy={handleBuyItem} onBack={() => setView('child_dash')} />}
                    {view === 'achievements' && <Achievements achievements={activeMember.achievements} onBack={() => setView('child_dash')} />}
                    {view === 'request_mission' && <RequestMission onPropose={(proposal) => { updateActiveMember(m => ({ ...m, tasks: [...m.tasks, { ...proposal, id: Math.random().toString(36).substr(2, 9), status: 'pending', reward: 20, xp: 40, assignedTo: [m.id] }] })); setView('child_dash'); }} onBack={() => setView('child_dash')} />}
                </>
            )}
        </div>
    );
};

export default App;
