
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
import { supabase, fetchMembers, upsertMember, fetchStoreItems, upsertStoreItem, deleteTask, deleteRedemption } from './services/supabase';

const INITIAL_MEMBERS: Member[] = [
    {
        id: 'm1', name: 'Junior', role: 'child', badge: 'star',
        avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Junior&backgroundColor=b6e3f4',
        level: 3, xp: 350, coins: 120, 
        dreams: [], 
        tasks: [
            { id: 't1', title: 'Arrumar a Cama', reward: 10, xp: 20, status: 'todo', icon: 'bed', assignedTo: ['m1'] },
            { id: 't2', title: 'Dever de Casa', reward: 40, xp: 80, status: 'todo', icon: 'edit_note', assignedTo: ['m1'] },
            { id: 't3', title: 'Guardar Brinquedos', reward: 15, xp: 30, status: 'todo', icon: 'category', assignedTo: ['m1'] },
            { id: 't4', title: 'Escovar os Dentes', reward: 5, xp: 10, status: 'todo', icon: 'clean_hands', assignedTo: ['m1'] },
            { id: 't5', title: 'Ajudar no Jantar', reward: 25, xp: 50, status: 'todo', icon: 'restaurant', assignedTo: ['m1'] },
            { id: 't6', title: 'Leitura (20 min)', reward: 30, xp: 60, status: 'todo', icon: 'menu_book', assignedTo: ['m1'] },
            { id: 't7', title: 'Regar as Plantas', reward: 15, xp: 30, status: 'todo', icon: 'eco', assignedTo: ['m1'] },
            { id: 't8', title: 'Organizar Sapatos', reward: 10, xp: 20, status: 'todo', icon: 'checkroom', assignedTo: ['m1'] },
            { id: 't9', title: 'Levar o Lixo', reward: 20, xp: 40, status: 'todo', icon: 'delete', assignedTo: ['m1'] },
            { id: 't10', title: 'Banho sem Reclamação', reward: 15, xp: 30, status: 'todo', icon: 'shower', assignedTo: ['m1'] }
        ], 
        achievements: [
            { id: 'a1', title: 'Primeiros Passos', description: 'Completou sua primeira missão!', icon: 'rocket_launch', earned: true },
            { id: 'a2', title: 'Mestre da Limpeza', description: 'Arrumou o quarto 5 vezes.', icon: 'cleaning_services', earned: false }
        ], 
        redemptions: [], 
        history: [],
        notifications: { tasks: true, achievements: true }
    },
    {
        id: 'p1', name: 'Papai', role: 'parent', badge: 'settings',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dad&backgroundColor=b6e3f4',
        level: 10, xp: 5000, coins: 1000, dreams: [], tasks: [], achievements: [], redemptions: [], history: [],
        notifications: { tasks: true, achievements: true }
    },
    {
        id: 'p2', name: 'Mamãe', role: 'parent', badge: 'heart',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mom&backgroundColor=ffd5dc',
        level: 10, xp: 5200, coins: 1000, dreams: [], tasks: [], achievements: [], redemptions: [], history: [],
        notifications: { tasks: true, achievements: true }
    }
];

const INITIAL_STORE: StoreItem[] = [
    { id: 's1', title: '30 min de Game', price: 50, icon: 'sports_esports', color: 'bg-indigo-500', assignedTo: ['m1'] },
    { id: 's2', title: 'Sorvete Especial', price: 80, icon: 'icecream', color: 'bg-orange-500', assignedTo: ['m1'] },
    { id: 's3', title: 'Escolher o Jantar', price: 40, icon: 'local_pizza', color: 'bg-red-400', assignedTo: ['m1'] },
    { id: 's4', title: '1 Hora Extra de TV', price: 100, icon: 'tv', color: 'bg-blue-400', assignedTo: ['m1'] },
    { id: 's5', title: 'Passeio no Parque', price: 150, icon: 'park', color: 'bg-green-400', assignedTo: ['m1'] },
    { id: 's6', title: 'Dormir 30min Tarde', price: 60, icon: 'bedtime', color: 'bg-purple-600', assignedTo: ['m1'] },
    { id: 's7', title: 'Cinema com Pipoca', price: 120, icon: 'movie', color: 'bg-yellow-500', assignedTo: ['m1'] },
    { id: 's8', title: 'Escolher Sobremesa', price: 30, icon: 'cake', color: 'bg-pink-400', assignedTo: ['m1'] },
    { id: 's9', title: 'Dia do Pijama', price: 100, icon: 'checkroom', color: 'bg-cyan-500', assignedTo: ['m1'] },
    { id: 's10', title: 'Acampar na Sala', price: 300, icon: 'tent', color: 'bg-amber-700', assignedTo: ['m1'] },
    { id: 's11', title: 'Brinquedo Pequeno', price: 200, icon: 'toys', color: 'bg-teal-500', assignedTo: ['m1'] },
    { id: 's12', title: 'Piquenique Quintal', price: 90, icon: 'bakery_dining', color: 'bg-lime-500', assignedTo: ['m1'] },
    { id: 's13', title: 'Vale Abraço Gigante', price: 10, icon: 'favorite', color: 'bg-rose-500', assignedTo: ['m1'] },
    { id: 's14', title: 'Gibi Novo', price: 70, icon: 'menu_book', color: 'bg-orange-600', assignedTo: ['m1'] }
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
    const selectedDream = members.flatMap(m => m.dreams).find(d => d.id === selectedDreamId);

    useEffect(() => {
        const init = async () => {
            try {
                const [dbMembers, dbStoreItems] = await Promise.all([
                    fetchMembers(),
                    fetchStoreItems()
                ]);

                // Se o banco estiver vazio (após o reset), popula com dados iniciais expandidos
                if (dbMembers.length === 0) {
                    await Promise.all([
                        ...INITIAL_MEMBERS.map(m => upsertMember(m)),
                        ...INITIAL_STORE.map(s => upsertStoreItem(s))
                    ]);
                    const refreshedMembers = await fetchMembers();
                    const refreshedStore = await fetchStoreItems();
                    setMembers(refreshedMembers);
                    setStoreItems(refreshedStore);
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

        // Realtime Subscription para sincronia entre dispositivos
        const tables = ['members', 'dreams', 'tasks', 'achievements', 'redemptions', 'history', 'store_items'];
        const channels = tables.map(table => 
            supabase.channel(`${table}_realtime`).on('postgres_changes', { event: '*', schema: 'public', table }, () => {
                if (table === 'store_items') fetchStoreItems().then(setStoreItems);
                else fetchMembers().then(setMembers);
            }).subscribe()
        );

        return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
    }, []);

    const updateMemberById = async (id: string, updater: (m: Member) => Member) => {
        const currentMember = members.find(m => m.id === id);
        if (!currentMember) return;
        const updated = updater(currentMember);
        setMembers(prev => prev.map(m => m.id === id ? updated : m));
        await upsertMember(updated);
    };

    const handleLogout = () => {
        setActiveMemberId(null);
        setSelectedDreamId(null);
        setView('role');
    };

    const handleSellItem = async (redemptionId: string) => {
        if (!activeMember) return;
        const redemption = activeMember.redemptions.find(r => r.id === redemptionId);
        if (!redemption) return;
        const storeItem = storeItems.find(si => si.id === redemption.itemId);
        const refundAmount = storeItem ? Math.floor(storeItem.price * 0.7) : 10;
        const now = Date.now();

        await deleteRedemption(redemptionId);
        await updateMemberById(activeMember.id, m => ({
            ...m,
            coins: m.coins + refundAmount,
            redemptions: m.redemptions.filter(r => r.id !== redemptionId),
            history: [{ id: `tx-sell-${now}`, type: 'sale', title: `Vendeu: ${redemption.title}`, amount: refundAmount, icon: redemption.icon, timestamp: now }, ...m.history]
        }));
    };

    const approveTask = async (taskId: string) => {
        const now = Date.now();
        const memberToUpdate = members.find(m => m.tasks.some(t => t.id === taskId && t.status === 'pending'));
        if (!memberToUpdate) return;
        const task = memberToUpdate.tasks.find(t => t.id === taskId);
        if (!task) return;

        await updateMemberById(memberToUpdate.id, m => ({
            ...m,
            tasks: m.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const } : t),
            coins: m.coins + task.reward,
            xp: m.xp + task.xp,
            history: [{ id: `tx-rew-${now}`, type: 'reward', title: `Missão: ${task.title}`, amount: task.reward, icon: task.icon, timestamp: now }, ...m.history]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 animate-bounce">
                    <span className="material-symbols-outlined text-4xl text-[#2b8cee] animate-spin">cloud_sync</span>
                </div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Sincronizando Reino...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden flex flex-col">
            {view === 'role' && <RoleSelection members={members} onSelect={(id) => { setActiveMemberId(id); const m = members.find(x => x.id === id); setView(m?.role === 'parent' ? 'parent_dash' : 'child_dash'); }} onAddNew={() => setView('add_member')} />}
            {view === 'add_member' && <AddMember onSave={async (m) => { await upsertMember({...m, id: Math.random().toString(36).substr(2, 9), level: 1, xp: 0, coins: 0, dreams: [], tasks: [], achievements: [], redemptions: [], history: [], notifications: {tasks: true, achievements: true}}); setView('role'); }} onBack={() => setView('role')} />}
            
            {activeMember && (
                <>
                    {view === 'child_dash' && <ChildDashboard child={activeMember} onNavigate={setView} onOpenDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onLogout={handleLogout} />}
                    {view === 'parent_dash' && <ParentDashboard activeParent={activeMember} members={members} onApprove={approveTask} onLogout={handleLogout} onAddTask={() => setView('add_task')} onAddStoreItem={() => setView('add_store_item')} onPlay={() => setView('child_dash')} />}
                    {view === 'dream_gallery' && <DreamGallery dreams={activeMember.dreams} onSelect={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onAdd={() => setView('add_dream')} onBack={() => setView('child_dash')} />}
                    {view === 'add_dream' && <AddDream onAdd={(d) => { updateMemberById(activeMember.id, m => ({...m, dreams: [...m.dreams, {...d, id: Math.random().toString(36).substr(2, 9), currentAmount: 0, status: 'active'}]})); setView('dream_gallery'); }} onBack={() => setView('dream_gallery')} />}
                    {view === 'dream_details' && selectedDream && <DreamDetails dream={selectedDream} coins={activeMember.coins} onAddCoins={(amt) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - amt, dreams: m.dreams.map(d => d.id === selectedDreamId ? {...d, currentAmount: d.currentAmount + amt} : d)}))} onBack={() => setView(activeMember.role === 'child' ? 'dream_gallery' : 'parent_dash')} />}
                    {view === 'review_dream' && selectedDream && <ReviewDream dream={selectedDream} onConfirm={(dreamId, realAmount, tasks) => { updateMemberById(activeMember.id, m => ({...m, dreams: m.dreams.map(d => d.id === dreamId ? { ...d, targetAmount: realAmount, status: 'active' as const } : d), tasks: [...m.tasks, ...tasks.map(t => ({...t, id: Math.random().toString(36).substr(2, 9), status: 'todo' as const, assignedTo: [m.id]}))]})); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />}
                    {view === 'add_store_item' && <AddStoreItem members={members} onAdd={async (item) => { await upsertStoreItem({...item, id: Math.random().toString(36).substr(2, 9)}); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />}
                    {view === 'profile' && <Profile child={activeMember} storeItems={storeItems} onNavigate={setView} onBack={() => setView(activeMember.role === 'parent' ? 'parent_dash' : 'child_dash')} onUpdateAvatar={(img) => updateMemberById(activeMember.id, m => ({...m, avatar: img}))} onUpdateNotifications={(n) => updateMemberById(activeMember.id, m => ({...m, notifications: n}))} onBuyItem={(item) => activeMember.coins >= item.price && updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'delivered', timestamp: Date.now()}]}))} onSellItem={handleSellItem} />}
                    {view === 'wallet' && <Wallet child={activeMember} onBack={() => setView('child_dash')} />}
                    {view === 'tasks' && <TaskList tasks={activeMember.tasks} onComplete={(id) => updateMemberById(activeMember.id, m => ({...m, tasks: m.tasks.map(t => t.id === id ? {...t, status: 'pending'} : t)}))} onBack={() => setView('child_dash')} />}
                    {view === 'store' && <Store coins={activeMember.coins} storeItems={storeItems.filter(si => si.assignedTo.includes(activeMember.id))} redemptions={activeMember.redemptions} onBuy={(item) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'pending', timestamp: Date.now()}]}))} onBack={() => setView('child_dash')} />}
                    {view === 'achievements' && <Achievements achievements={activeMember.achievements} onBack={() => setView('child_dash')} />}
                    {view === 'request_mission' && <RequestMission onPropose={(p) => { updateMemberById(activeMember.id, m => ({...m, tasks: [...m.tasks, {...p, id: Math.random().toString(36).substr(2, 9), status: 'pending' as const, reward: 20, xp: 40, assignedTo: [m.id]}]})); setView('child_dash'); }} onBack={() => setView('child_dash')} />}
                    {view === 'add_task' && <AddTask members={members} onAdd={async (t) => { await Promise.all(t.assignedTo.map(id => updateMemberById(id, m => ({...m, tasks: [...m.tasks, {...t, id: Math.random().toString(36).substr(2, 9), status: 'todo'}]})))); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />}
                </>
            )}
        </div>
    );
};

export default App;
