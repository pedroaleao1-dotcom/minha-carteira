
import React, { useState, useEffect } from 'react';
import { Member, Task, StoreItem, Redemption, Transaction } from './types';
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

const STORAGE_KEY = 'dreamquest_v2_data';

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

type View = 'role' | 'child_dash' | 'parent_dash' | 'dream_gallery' | 'dream_details' | 'add_dream' | 'tasks' | 'store' | 'achievements' | 'add_task' | 'profile' | 'request_mission' | 'review_dream' | 'add_store_item' | 'wallet';

const App: React.FC = () => {
    const [view, setView] = useState<View>('role');
    const [members, setMembers] = useState<Member[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : initialMembers;
    });
    const [storeItems, setStoreItems] = useState<StoreItem[]>(initialStoreItems);
    const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
    const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }, [members]);

    const activeMember = members.find(m => m.id === activeMemberId) || members[0];

    const updateActiveMember = (updater: (m: Member) => Member) => {
        setMembers(prev => prev.map(m => m.id === activeMemberId ? updater(m) : m));
    };

    const handleMemberSelect = (id: string) => {
        setActiveMemberId(id);
        const member = members.find(m => m.id === id);
        if (member?.role === 'parent') {
            setView('parent_dash');
        } else {
            setView('child_dash');
        }
    };

    const handleBuyItem = (item: StoreItem) => {
        if (activeMember.coins >= item.price) {
            const now = Date.now();
            updateActiveMember(m => ({
                ...m,
                coins: m.coins - item.price,
                redemptions: [
                    ...m.redemptions,
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        itemId: item.id,
                        title: item.title,
                        icon: item.icon,
                        status: 'delivered',
                        timestamp: now
                    }
                ],
                history: [
                    {
                        id: `tx-${now}`,
                        type: 'purchase',
                        title: `Comprou: ${item.title}`,
                        amount: -item.price,
                        icon: item.icon,
                        timestamp: now
                    },
                    ...m.history
                ]
            }));
        }
    };

    const handleSellItem = (redemptionId: string) => {
        const redemption = activeMember.redemptions.find(r => r.id === redemptionId);
        if (!redemption) return;

        const storeItem = storeItems.find(si => si.id === redemption.itemId);
        const refundAmount = storeItem ? Math.floor(storeItem.price * 0.7) : 10;
        const now = Date.now();

        updateActiveMember(m => ({
            ...m,
            coins: m.coins + refundAmount,
            redemptions: m.redemptions.filter(r => r.id !== redemptionId),
            history: [
                {
                    id: `tx-sell-${now}`,
                    type: 'sale',
                    title: `Vendeu: ${redemption.title}`,
                    amount: refundAmount,
                    icon: redemption.icon,
                    timestamp: now
                },
                ...m.history
            ]
        }));
    };

    const approveTask = (taskId: string) => {
        const now = Date.now();
        setMembers(prev => prev.map(m => {
            const task = m.tasks.find(t => t.id === taskId && t.status === 'pending');
            if (!task) return m;

            const newTx: Transaction = {
                id: `tx-reward-${now}`,
                type: 'reward',
                title: `Missão: ${task.title}`,
                amount: task.reward,
                icon: task.icon,
                timestamp: now
            };

            return {
                ...m,
                tasks: m.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t),
                coins: m.coins + task.reward,
                xp: m.xp + task.xp,
                history: [newTx, ...m.history]
            };
        }));
    };

    return (
        <div className="max-w-md mx-auto min-h-screen relative overflow-x-hidden flex flex-col">
            {view === 'role' && <RoleSelection members={members} onSelect={handleMemberSelect} />}
            
            {view === 'child_dash' && (
                <ChildDashboard 
                    child={activeMember} 
                    onNavigate={setView} 
                    onOpenDream={(id) => { setSelectedDreamId(id); setView('dream_details'); }} 
                />
            )}

            {view === 'parent_dash' && (
                <ParentDashboard 
                    activeParent={activeMember}
                    members={members}
                    onApprove={approveTask} 
                    onBack={() => setView('role')} 
                    onAddTask={() => setView('add_task')} 
                    onAddStoreItem={() => setView('add_store_item')}
                    onPlay={() => setView('child_dash')} 
                />
            )}

            {view === 'add_store_item' && (
                <AddStoreItem 
                    members={members}
                    onAdd={(item) => {
                        setStoreItems(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
                        setView('parent_dash');
                    }}
                    onBack={() => setView('parent_dash')}
                />
            )}

            {view === 'profile' && (
                <Profile 
                    child={activeMember} 
                    storeItems={storeItems}
                    onNavigate={setView} 
                    onBack={() => setView(activeMember.role === 'parent' ? 'parent_dash' : 'child_dash')} 
                    onUpdateAvatar={(img) => updateActiveMember(m => ({...m, avatar: img}))} 
                    onUpdateNotifications={(notifs) => updateActiveMember(m => ({...m, notifications: notifs}))}
                    onBuyItem={handleBuyItem}
                    onSellItem={handleSellItem} 
                />
            )}
            
            {view === 'wallet' && <Wallet child={activeMember} onBack={() => setView('child_dash')} />}
            {view === 'tasks' && <TaskList tasks={activeMember.tasks} onComplete={(id) => updateActiveMember(m => ({...m, tasks: m.tasks.map(t => t.id === id ? {...t, status: 'pending'} : t)}))} onBack={() => setView('child_dash')} />}
            {view === 'store' && <Store coins={activeMember.coins} storeItems={storeItems.filter(si => si.assignedTo.includes(activeMember.id))} redemptions={activeMember.redemptions} onBuy={handleBuyItem} onBack={() => setView('child_dash')} />}
            {view === 'achievements' && <Achievements achievements={activeMember.achievements} onBack={() => setView('child_dash')} />}
        </div>
    );
};

export default App;
