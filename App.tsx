
import React, { useState, useEffect } from 'react';
import { Member, Task, StoreItem, Dream, TaskCompletion, DreamStep } from './types';

// Importação das Páginas (Views)
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
import AddStoreItem from './views/AddStoreItem';
import Wallet from './views/Wallet';
import AddMember from './views/AddMember';
import CouncilRoom from './views/CouncilRoom';
import JourneyPath from './views/JourneyPath';
import MapEditor from './views/MapEditor';

// Serviços
import { db } from './services/db';
import { supabase, pushToCloud, pullFromCloud, pushStoreItem } from './services/supabase';

type View = 
    | 'role' 
    | 'child_dash' 
    | 'parent_dash' 
    | 'dream_gallery' 
    | 'dream_details' 
    | 'add_dream' 
    | 'tasks' 
    | 'store' 
    | 'achievements' 
    | 'add_task' 
    | 'profile' 
    | 'add_store_item' 
    | 'wallet' 
    | 'add_member' 
    | 'council_room' 
    | 'journey' 
    | 'map_editor';

const App: React.FC = () => {
    const [view, setView] = useState<View>('role');
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [members, setMembers] = useState<Member[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
    const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);

    const activeMember = members.find(m => m.id === activeMemberId);
    const selectedDream = members.flatMap(m => m.dreams).find(d => d.id === selectedDreamId);

    // Monitor de Conexão
    useEffect(() => {
        const handleOnline = () => { setIsOnline(true); syncData(); };
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Sincronização Principal
    const syncData = async () => {
        if (!navigator.onLine || isSyncing) return;
        setIsSyncing(true);
        try {
            // 1. Puxar do Cloud (Atualiza local se o cloud for mais novo)
            await pullFromCloud();
            
            // 2. Empurrar alterações locais para o Cloud
            const localMembers = await db.members.toArray();
            for (const m of localMembers) {
                await pushToCloud(m);
            }
            
            const localStore = await db.storeItems.toArray();
            for (const item of localStore) {
                await pushStoreItem(item);
            }

            // Recarregar estado da UI após sync
            const updatedMembers = await db.members.toArray();
            setMembers(updatedMembers);
            const updatedStore = await db.storeItems.toArray();
            setStoreItems(updatedStore);
        } catch (e) {
            console.error("Erro no Sync:", e);
        } finally {
            setIsSyncing(false);
        }
    };

    // Carregamento Inicial (Local-First)
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const localMembers = await db.members.toArray();
            const localStore = await db.storeItems.toArray();
            setMembers(localMembers);
            setStoreItems(localStore);
            setIsLoading(false);
            
            // Tenta sync se estiver online
            if (navigator.onLine) syncData();
        };
        init();
    }, []);

    const updateMemberById = async (id: string, updater: (m: Member) => Member) => {
        const currentMember = members.find(m => m.id === id);
        if (!currentMember) return;
        
        const updated = { ...updater(currentMember), updatedAt: Date.now() };
        
        // 1. Salva Local (Instantâneo)
        await db.members.put(updated);
        setMembers(prev => prev.map(m => m.id === id ? updated : m));
        
        // 2. Tenta Cloud (Background)
        if (navigator.onLine) pushToCloud(updated);
    };

    const handleLogout = () => {
        setActiveMemberId(null);
        setSelectedDreamId(null);
        setView('role');
    };

    const renderView = () => {
        if (isLoading) return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <span className="material-symbols-outlined text-4xl animate-spin text-amber-500 mb-4">sync</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invocando Heróis...</p>
            </div>
        );

        switch (view) {
            case 'role':
                return <RoleSelection members={members} isLoading={isLoading} onSelect={(id) => { setActiveMemberId(id); const m = members.find(x => x.id === id); setView(m?.role === 'parent' ? 'parent_dash' : 'child_dash'); }} onAddNew={() => setView('add_member')} />;
            case 'add_member':
                return <AddMember onSave={async (m) => { const newM = {...m, id: Math.random().toString(36).substr(2, 9), level: 1, xp: 0, coins: 0, dreams: [], tasks: [], taskCompletions: [], achievements: [], redemptions: [], history: [], notifications: {tasks: true, achievements: true}, updatedAt: Date.now()}; await db.members.put(newM as Member); setMembers(prev => [...prev, newM as Member]); if(navigator.onLine) pushToCloud(newM as Member); setView('role'); }} onBack={() => setView('role')} />;
            default:
                if (!activeMember) return null;
                switch (view) {
                    case 'child_dash': return <ChildDashboard child={activeMember} onNavigate={setView} onOpenDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onLogout={handleLogout} />;
                    case 'parent_dash': return <ParentDashboard activeParent={activeMember} members={members} onApprove={(id) => { /* lógica de aprovação aqui usando updateMemberById */ }} onLogout={handleLogout} onAddTask={() => setView('add_task')} onAddStoreItem={() => setView('add_store_item')} onOpenCouncil={() => setView('council_room')} onPlay={() => setView('child_dash')} onEditMap={(id) => { setSelectedDreamId(id); setView('map_editor'); }} />;
                    case 'journey': return <JourneyPath member={activeMember} onSelectDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onBack={() => setView('child_dash')} />;
                    case 'map_editor': return selectedDream ? <MapEditor dream={selectedDream} onSave={(steps) => updateMemberById(activeMember.id, m => ({...m, dreams: m.dreams.map(d => d.id === selectedDreamId ? {...d, steps} : d)}))} onBack={() => setView('parent_dash')} /> : null;
                    case 'dream_gallery': return <DreamGallery dreams={activeMember.dreams} onSelect={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onAdd={() => setView('add_dream')} onBack={() => setView('child_dash')} />;
                    case 'add_dream': return <AddDream onAdd={(d) => updateMemberById(activeMember.id, m => ({...m, dreams: [...m.dreams, {...d, id: Math.random().toString(36).substr(2, 9), currentAmount: 0, status: 'active', steps: [], updatedAt: Date.now()}]}))} onBack={() => setView('dream_gallery')} />;
                    case 'dream_details': return selectedDream ? <DreamDetails dream={selectedDream} coins={activeMember.coins} onAddCoins={(amt) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - amt, dreams: m.dreams.map(d => d.id === selectedDreamId ? {...d, currentAmount: d.currentAmount + amt} : d)}))} onBack={() => setView(activeMember.role === 'child' ? 'journey' : 'parent_dash')} /> : null;
                    case 'tasks': return <TaskList tasks={activeMember.tasks} onComplete={(id) => updateMemberById(activeMember.id, m => ({...m, tasks: m.tasks.map(t => t.id === id ? {...t, status: 'pending'} : t)}))} onBack={() => setView('child_dash')} />;
                    case 'store': return <Store coins={activeMember.coins} storeItems={storeItems.filter(si => si.assignedTo.includes(activeMember.id))} redemptions={activeMember.redemptions} onBuy={(item) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'pending', timestamp: Date.now(), updatedAt: Date.now()}]}))} onBack={() => setView('child_dash')} />;
                    case 'profile': return <Profile child={activeMember} storeItems={storeItems} onNavigate={setView} onBack={() => setView(activeMember.role === 'parent' ? 'parent_dash' : 'child_dash')} onUpdateAvatar={(img) => updateMemberById(activeMember.id, m => ({...m, avatar: img}))} onUpdateNotifications={(n) => updateMemberById(activeMember.id, m => ({...m, notifications: n}))} onBuyItem={(item) => activeMember.coins >= item.price && updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'delivered', timestamp: Date.now(), updatedAt: Date.now()}]}))} onSellItem={() => {}} />;
                    case 'wallet': return <Wallet child={activeMember} onBack={() => setView('child_dash')} />;
                    case 'achievements': return <Achievements achievements={activeMember.achievements} onBack={() => setView('child_dash')} />;
                    case 'add_task': return <AddTask members={members} onAdd={async (t) => { t.assignedTo.forEach(id => updateMemberById(id, m => ({...m, tasks: [...m.tasks, {...t, id: Math.random().toString(36).substr(2, 9), status: 'todo', updatedAt: Date.now()}] as any}))); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />;
                    case 'add_store_item': return <AddStoreItem members={members} onAdd={async (item) => { const newI = {...item, id: Math.random().toString(36).substr(2, 9), updatedAt: Date.now()}; await db.storeItems.put(newI); setStoreItems(prev => [...prev, newI]); if(navigator.onLine) pushStoreItem(newI); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />;
                    case 'council_room': return <CouncilRoom members={members} onBack={() => setView('parent_dash')} />;
                    default: return <RoleSelection members={members} onSelect={(id) => setView('child_dash')} onAddNew={() => setView('add_member')} />;
                }
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden flex flex-col bg-slate-50 shadow-2xl">
            {/* Indicador de Sincronização */}
            <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg transition-all ${isOnline ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                <span className="material-symbols-outlined text-[10px]">{isSyncing ? 'sync' : isOnline ? 'wifi' : 'wifi_off'}</span>
                {isSyncing ? 'Sincronizando...' : isOnline ? 'Online' : 'Offline'}
                {isOnline && !isSyncing && (
                    <button onClick={syncData} className="ml-1 opacity-60 hover:opacity-100">
                        <span className="material-symbols-outlined text-[10px]">refresh</span>
                    </button>
                )}
            </div>
            
            {renderView()}
        </div>
    );
};

export default App;
