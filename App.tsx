
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
import CouncilRoom from './views/CouncilRoom';
import JourneyPath from './views/JourneyPath';
import { supabase, fetchMembers, upsertMember, fetchStoreItems, upsertStoreItem, deleteTask, deleteRedemption } from './services/supabase';

type View = 'role' | 'child_dash' | 'parent_dash' | 'dream_gallery' | 'dream_details' | 'add_dream' | 'tasks' | 'store' | 'achievements' | 'add_task' | 'profile' | 'request_mission' | 'review_dream' | 'add_store_item' | 'wallet' | 'add_member' | 'council_room' | 'journey';

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
                setMembers(dbMembers);
                setStoreItems(dbStoreItems);
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();

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

    const approveTask = async (taskId: string) => {
        const now = Date.now();
        const memberToUpdate = members.find(m => m.tasks.some(t => t.id === taskId && t.status === 'pending'));
        if (!memberToUpdate) return;
        const task = memberToUpdate.tasks.find(t => t.id === taskId);
        if (!task) return;

        await updateMemberById(memberToUpdate.id, m => ({
            ...m,
            tasks: m.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as const, lastCompletedAt: now } : t),
            coins: m.coins + task.reward,
            xp: m.xp + task.xp,
            history: [{ id: `tx-rew-${now}`, type: 'reward', title: `Missão: ${task.title}`, amount: task.reward, icon: task.icon, timestamp: now }, ...m.history]
        }));
    };

    if (isLoading) return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-sky-50">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4 animate-bounce">
                <span className="material-symbols-outlined text-sky-500 animate-spin">sync</span>
            </div>
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Aguarde o Mestre...</p>
        </div>
    );

    return (
        <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden flex flex-col bg-slate-50">
            {view === 'role' && <RoleSelection members={members} onSelect={(id) => { setActiveMemberId(id); const m = members.find(x => x.id === id); setView(m?.role === 'parent' ? 'parent_dash' : 'child_dash'); }} onAddNew={() => setView('add_member')} />}
            {view === 'add_member' && <AddMember onSave={async (m) => { await upsertMember({...m, id: Math.random().toString(36).substr(2, 9), level: 1, xp: 0, coins: 0, dreams: [], tasks: [], achievements: [], redemptions: [], history: [], notifications: {tasks: true, achievements: true}}); setView('role'); }} onBack={() => setView('role')} />}
            
            {activeMember && (
                <>
                    {view === 'child_dash' && <ChildDashboard child={activeMember} onNavigate={setView} onOpenDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onLogout={handleLogout} />}
                    {view === 'journey' && <JourneyPath member={activeMember} onSelectDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onBack={() => setView('child_dash')} />}
                    {view === 'parent_dash' && <ParentDashboard activeParent={activeMember} members={members} onApprove={approveTask} onLogout={handleLogout} onAddTask={() => setView('add_task')} onAddStoreItem={() => setView('add_store_item')} onOpenCouncil={() => setView('council_room')} onPlay={() => setView('child_dash')} />}
                    {view === 'council_room' && <CouncilRoom members={members} onBack={() => setView('parent_dash')} />}
                    {view === 'dream_gallery' && <DreamGallery dreams={activeMember.dreams} onSelect={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onAdd={() => setView('add_dream')} onBack={() => setView('child_dash')} />}
                    {view === 'add_dream' && <AddDream onAdd={(d) => { updateMemberById(activeMember.id, m => ({...m, dreams: [...m.dreams, {...d, id: Math.random().toString(36).substr(2, 9), currentAmount: 0, status: 'active'}]})); setView('dream_gallery'); }} onBack={() => setView('dream_gallery')} />}
                    {view === 'dream_details' && selectedDream && <DreamDetails dream={selectedDream} coins={activeMember.coins} onAddCoins={(amt) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - amt, dreams: m.dreams.map(d => d.id === selectedDreamId ? {...d, currentAmount: d.currentAmount + amt} : d)}))} onBack={() => setView(activeMember.role === 'child' ? 'journey' : 'parent_dash')} />}
                    {view === 'add_task' && <AddTask members={members} onAdd={async (t) => { await Promise.all(t.assignedTo.map(id => updateMemberById(id, m => ({...m, tasks: [...m.tasks, {...t, id: Math.random().toString(36).substr(2, 9), status: 'todo'}]})))); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />}
                    {/* Outras vistas existentes continuam aqui... */}
                    {view === 'store' && <Store coins={activeMember.coins} storeItems={storeItems.filter(si => si.assignedTo.includes(activeMember.id))} redemptions={activeMember.redemptions} onBuy={(item) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'pending', timestamp: Date.now()}]}))} onBack={() => setView('child_dash')} />}
                    {view === 'tasks' && <TaskList tasks={activeMember.tasks} onComplete={(id) => updateMemberById(activeMember.id, m => ({...m, tasks: m.tasks.map(t => t.id === id ? {...t, status: 'pending'} : t)}))} onBack={() => setView('child_dash')} />}
                    {view === 'profile' && <Profile child={activeMember} storeItems={storeItems} onNavigate={setView} onBack={() => setView(activeMember.role === 'parent' ? 'parent_dash' : 'child_dash')} onUpdateAvatar={(img) => updateMemberById(activeMember.id, m => ({...m, avatar: img}))} onUpdateNotifications={(n) => updateMemberById(activeMember.id, m => ({...m, notifications: n}))} onBuyItem={(item) => activeMember.coins >= item.price && updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'delivered', timestamp: Date.now()}]}))} onSellItem={() => {}} />}
                </>
            )}
        </div>
    );
};

export default App;
