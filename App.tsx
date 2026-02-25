
import React, { useState, useEffect } from 'react';
import { Member, Task, StoreItem, Dream, TaskCompletion, DreamStep, JourneyTemplate } from './types';

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
import XPView from './views/XPView';
import AddMember from './views/AddMember';
import CouncilRoom from './views/CouncilRoom';
import JourneyPath from './views/JourneyPath';
import MapEditor from './views/MapEditor';
import Reports from './views/Reports';
import ManageMembers from './views/ManageMembers';
import ManageTemplates from './views/ManageTemplates';
import KingdomExplorer from './views/KingdomExplorer';
import RequestMission from './views/RequestMission';

// Serviços
import { db } from './services/db';
import { supabase, pushToCloud, pushMembersToCloud, pullFromCloud, pushStoreItem, pushStoreItemsToCloud, upsertMember, pushJourneyTemplate, fetchJourneyTemplates } from './services/supabase';
import { generateDreamSteps } from './services/gemini';

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
    | 'xp'
    | 'add_member' 
    | 'edit_member'
    | 'manage_members'
    | 'manage_templates'
    | 'kingdom_explorer'
    | 'request_mission'
    | 'council_room' 
    | 'journey' 
    | 'map_editor'
    | 'reports';

const App: React.FC = () => {
    const [view, setView] = useState<View>('role');
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [members, setMembers] = useState<Member[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
    const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);
    const [templateToEdit, setTemplateToEdit] = useState<JourneyTemplate | null>(null);
    const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

    const activeMember = members.find(m => m.id === activeMemberId);
    const selectedDream = members.flatMap(m => m.dreams).find(d => d.id === selectedDreamId);

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

    const syncData = async () => {
        if (!navigator.onLine || isSyncing) return;
        setIsSyncing(true);
        try {
            await pullFromCloud();
            const localMembers = await db.members.toArray();
            await pushMembersToCloud(localMembers);
            const localStore = await db.storeItems.toArray();
            await pushStoreItemsToCloud(localStore);
            
            const updatedMembers = await db.members.toArray();
            setMembers(updatedMembers);
            const updatedStore = await db.storeItems.toArray();
            setStoreItems(updatedStore);
        } catch (e: any) {
            console.error("Erro no Sync:", e);
            alert("Erro no Sync Data: " + (e?.message || JSON.stringify(e)));
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const localMembers = await db.members.toArray();
            const localStore = await db.storeItems.toArray();
            setMembers(localMembers);
            setStoreItems(localStore);
            setIsLoading(false);
            if (navigator.onLine) syncData();
        };
        init();
    }, []);

    // Debounced Sync for individual updates
    const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);

    const updateMemberById = async (id: string, updater: (m: Member) => Member) => {
        const currentMember = members.find(m => m.id === id);
        if (!currentMember) return;
        
        const updated = { ...updater(currentMember), updatedAt: Date.now() };
        
        // Update local state and DB immediately (Optimistic)
        await db.members.put(updated);
        setMembers(prev => prev.map(m => m.id === id ? updated : m));
        
        // Debounce cloud sync
        if (navigator.onLine) {
            if (syncTimeout) clearTimeout(syncTimeout);
            const timeout = setTimeout(() => {
                pushToCloud(updated);
            }, 2000); // Wait 2 seconds of inactivity before pushing
            setSyncTimeout(timeout);
        }
    };

    const deleteMember = async (id: string) => {
        if (!confirm("Remover este membro?")) return;
        await db.members.delete(id);
        setMembers(prev => prev.filter(m => m.id !== id));
        if (navigator.onLine) await supabase.from('members').delete().eq('id', id);
    };

    const handleLogout = () => {
        setActiveMemberId(null);
        setSelectedDreamId(null);
        setView('role');
    };

    const startJourneyFromTemplate = async (template: JourneyTemplate) => {
        if (!activeMemberId) return;
        const existingDream = activeMember?.dreams.find(d => d.templateId === template.id);
        if (existingDream) {
            setSelectedDreamId(existingDream.id);
            setView('journey');
            return;
        }
        const newDream: Dream = {
            id: Math.random().toString(36).substr(2, 9),
            title: template.title,
            icon: template.icon,
            targetAmount: template.steps.length * 100,
            currentAmount: 0,
            status: 'active',
            templateId: template.id,
            steps: template.steps.map(s => ({ ...s, isCompleted: false })),
            updatedAt: Date.now()
        };
        await updateMemberById(activeMemberId, m => ({...m, dreams: [...m.dreams, newDream]}));
        setSelectedDreamId(newDream.id);
        setView('journey');
    };

    const approveTask = async (taskId: string) => {
        const now = Date.now();
        const memberToUpdate = members.find(m => m.tasks.some(t => t.id === taskId && t.status === 'pending'));
        if (!memberToUpdate) return;
        const task = memberToUpdate.tasks.find(t => t.id === taskId);
        if (!task) return;
        const newCompletion: TaskCompletion = {
            id: Math.random().toString(36).substr(2, 9),
            taskId: task.id,
            memberId: memberToUpdate.id,
            completedAt: now,
            taskTitle: task.title,
            icon: task.icon,
            rewardCoins: task.reward,
            rewardXp: task.xp,
            updatedAt: now
        };
        await updateMemberById(memberToUpdate.id, m => ({
            ...m,
            tasks: m.tasks.map(t => t.id === taskId ? { ...t, status: (t.frequency === 'daily' || t.frequency === 'custom' ? 'todo' : 'completed'), lastCompletedAt: now } : t),
            taskCompletions: [...(m.taskCompletions || []), newCompletion],
            coins: m.coins + task.reward,
            xp: m.xp + task.xp,
            history: [{ id: `tx-rew-${now}`, type: 'reward', title: `Missão: ${task.title}`, amount: task.reward, icon: task.icon, timestamp: now, updatedAt: now }, ...m.history]
        }));
    };

    const renderView = () => {
        if (isLoading) return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">Conjurando...</p>
            </div>
        );

        switch (view) {
            case 'role': return <RoleSelection members={members} isLoading={isLoading} onSelect={(id) => { setActiveMemberId(id); const m = members.find(x => x.id === id); setView(m?.role === 'parent' ? 'parent_dash' : 'child_dash'); }} onAddNew={() => { setMemberToEdit(null); setView('add_member'); }} />;
            case 'add_member':
            case 'edit_member': return <AddMember memberToEdit={memberToEdit} onSave={async (m) => { if (memberToEdit) { await updateMemberById(memberToEdit.id, prev => ({ ...prev, ...m })); } else { const newM = {...m, id: Math.random().toString(36).substr(2, 9), level: 1, xp: 0, coins: 0, dreams: [], tasks: [], taskCompletions: [], achievements: [], redemptions: [], history: [], updatedAt: Date.now()}; await db.members.put(newM as Member); setMembers(prev => [...prev, newM as Member]); if(navigator.onLine) pushToCloud(newM as Member); } setView(activeMemberId ? 'manage_members' : 'role'); }} onBack={() => setView(activeMemberId ? 'manage_members' : 'role')} />;
            case 'manage_members': return <ManageMembers members={members} onEdit={(m) => { setMemberToEdit(m); setView('edit_member'); }} onDelete={deleteMember} onAdd={() => { setMemberToEdit(null); setView('add_member'); }} onBack={() => setView('parent_dash')} />;
            case 'manage_templates': return <ManageTemplates onEditTemplate={(t) => { setTemplateToEdit(t); setView('map_editor'); }} onEditHeroMap={(id) => { setSelectedDreamId(id); setTemplateToEdit(null); setView('map_editor'); }} onBack={() => setView('parent_dash')} />;
            default:
                if (!activeMember) return null;
                switch (view) {
                    case 'child_dash': return <ChildDashboard child={activeMember} onNavigate={setView} onOpenDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onLogout={handleLogout} />;
                    case 'parent_dash': return <ParentDashboard activeParent={activeMember} members={members} onApprove={approveTask} onLogout={handleLogout} onAddTask={() => setView('add_task')} onAddStoreItem={() => setView('add_store_item')} onOpenCouncil={() => setView('council_room')} onPlay={() => setView('child_dash')} onEditMap={(id) => { setSelectedDreamId(id); setTemplateToEdit(null); setView('map_editor'); }} onOpenReports={() => setView('reports')} onManageMembers={() => setView('manage_members')} onManageTemplates={() => setView('manage_templates')} />;
                    case 'reports': return <Reports members={members.filter(m => m.role === 'child')} onBack={() => setView('parent_dash')} />;
                    case 'kingdom_explorer': return <KingdomExplorer member={activeMember} onSelectTemplate={startJourneyFromTemplate} onBack={() => setView('child_dash')} />;
                    case 'request_mission': return <RequestMission onPropose={(prop) => { updateMemberById(activeMember.id, m => ({ ...m, tasks: [...m.tasks, { ...prop, id: Math.random().toString(36).substr(2, 9), reward: 0, xp: 0, status: 'pending', frequency: 'once', category: 'chore', assignedTo: [activeMember.id], updatedAt: Date.now() } as any] })); setView('child_dash'); }} onBack={() => setView('child_dash')} />;
                    case 'map_editor': return <MapEditor dream={selectedDream} template={templateToEdit || undefined} onSave={async (steps, newTitle) => { if (templateToEdit) { const updatedT = { ...templateToEdit, title: newTitle || templateToEdit.title, steps, updatedAt: Date.now() }; await db.journeyTemplates.put(updatedT); if (navigator.onLine) pushJourneyTemplate(updatedT); setView('manage_templates'); } else if (selectedDream) { const owner = members.find(m => m.dreams.some(d => d.id === selectedDreamId)); if (owner) updateMemberById(owner.id, m => ({...m, dreams: m.dreams.map(d => d.id === selectedDreamId ? {...d, steps} : d)})); setView('manage_templates'); } }} onBack={() => setView(templateToEdit ? 'manage_templates' : 'parent_dash')} />;
                    case 'dream_gallery': return <DreamGallery dreams={activeMember.dreams} onSelect={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onAdd={() => setView('add_dream')} onBack={() => setView('child_dash')} />;
                    case 'dream_details': return selectedDream ? <DreamDetails dream={selectedDream} coins={activeMember.coins} onAddCoins={(amt) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - amt, dreams: m.dreams.map(d => d.id === selectedDreamId ? {...d, currentAmount: d.currentAmount + amt} : d)}))} onBack={() => setView('dream_gallery')} /> : null;
                    case 'tasks': return <TaskList tasks={activeMember.tasks} onComplete={(id) => updateMemberById(activeMember.id, m => ({...m, tasks: m.tasks.map(t => t.id === id ? {...t, status: 'pending'} : t)}))} onBack={() => setView('child_dash')} />;
                    case 'store': return <Store coins={activeMember.coins} storeItems={storeItems.filter(si => si.assignedTo.includes(activeMember.id))} redemptions={activeMember.redemptions} onBuy={(item) => updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'pending', timestamp: Date.now(), updatedAt: Date.now()}]}))} onBack={() => setView('child_dash')} />;
                    case 'profile': return <Profile child={activeMember} storeItems={storeItems} onNavigate={setView} onBack={() => setView(activeMember.role === 'parent' ? 'parent_dash' : 'child_dash')} onUpdateAvatar={(img) => updateMemberById(activeMember.id, m => ({...m, avatar: img}))} onBuyItem={(item) => activeMember.coins >= item.price && updateMemberById(activeMember.id, m => ({...m, coins: m.coins - item.price, redemptions: [...m.redemptions, {id: Math.random().toString(36).substr(2, 9), itemId: item.id, title: item.title, icon: item.icon, status: 'delivered', timestamp: Date.now(), updatedAt: Date.now()}]}))} onSellItem={() => {}} />;
                    case 'wallet': return <Wallet child={activeMember} onBack={() => setView('child_dash')} />;
                    case 'xp': return <XPView child={activeMember} onBack={() => setView('child_dash')} />;
                    case 'achievements': return <Achievements achievements={activeMember.achievements} onBack={() => setView('child_dash')} />;
                    case 'add_task': return <AddTask members={members} onAdd={async (t) => { t.assignedTo.forEach(id => updateMemberById(id, m => ({...m, tasks: [...m.tasks, {...t, id: Math.random().toString(36).substr(2, 9), status: 'todo', updatedAt: Date.now()}] as any}))); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />;
                    case 'add_dream': return <AddDream onAdd={(dream) => { updateMemberById(activeMember.id, m => ({ ...m, dreams: [...m.dreams, { ...dream, id: Math.random().toString(36).substr(2, 9), currentAmount: 0 } as any] })); setView('dream_gallery'); }} onBack={() => setView('dream_gallery')} />;
                    case 'add_store_item': return <AddStoreItem members={members} onAdd={async (item) => { const newI = {...item, id: Math.random().toString(36).substr(2, 9), updatedAt: Date.now()}; await db.storeItems.put(newI); setStoreItems(prev => [...prev, newI]); if(navigator.onLine) pushStoreItem(newI); setView('parent_dash'); }} onBack={() => setView('parent_dash')} />;
                    case 'council_room': return <CouncilRoom members={members} onBack={() => setView('parent_dash')} />;
                    case 'journey': return <JourneyPath member={activeMember} selectedDreamId={selectedDreamId || undefined} onSelectDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} onBack={() => setView('kingdom_explorer')} />;
                    default: return <RoleSelection members={members} onSelect={(id) => setView('child_dash')} onAddNew={() => { setMemberToEdit(null); setView('add_member'); }} />;
                }
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden flex flex-col bg-slate-50 shadow-2xl">
            <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg transition-all ${isOnline ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                <span className="material-symbols-outlined text-[10px]">{isSyncing ? 'sync' : isOnline ? 'wifi' : 'wifi_off'}</span>
                {isSyncing ? 'Sync...' : isOnline ? 'On' : 'Off'}
            </div>
            {renderView()}
        </div>
    );
};

export default App;
