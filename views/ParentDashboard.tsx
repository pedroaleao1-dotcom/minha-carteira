
import React, { useState, useEffect } from 'react';
import { Member, Task, LevelConfig, GlobalSettings } from '../types';
import { fetchGlobalSettings, updateGlobalSettings, fetchLevelConfigs, updateLevelConfig, upsertMember } from '../services/supabase';

interface Props {
    activeParent: Member;
    members: Member[];
    onApprove: (taskId: string) => void;
    onLogout: () => void;
    onAddTask: () => void;
    onAddStoreItem: () => void;
    onPlay: () => void;
}

const ParentDashboard: React.FC<Props> = ({ activeParent, members, onApprove, onLogout, onAddTask, onAddStoreItem, onPlay }) => {
    const [settings, setSettings] = useState<GlobalSettings>({ allow_coin_creation: true });
    const [levels, setLevels] = useState<LevelConfig[]>([]);
    const [isCouncilOpen, setIsCouncilOpen] = useState(false);
    const [grantAmount, setGrantAmount] = useState(50);
    const [selectedGrantee, setSelectedGrantee] = useState<string | null>(null);

    useEffect(() => {
        fetchGlobalSettings().then(setSettings);
        fetchLevelConfigs().then(setLevels);
    }, []);

    const allPendingTasks = members.flatMap(m => m.tasks.filter(t => t.status === 'pending'));

    const toggleCoinCreation = async () => {
        const newSettings = { allow_coin_creation: !settings.allow_coin_creation };
        setSettings(newSettings);
        await updateGlobalSettings(newSettings);
    };

    const handleGrantCoins = async () => {
        if (!selectedGrantee) return;
        const member = members.find(m => m.id === selectedGrantee);
        if (!member) return;

        const now = Date.now();
        const updatedMember = {
            ...member,
            coins: member.coins + grantAmount,
            history: [{
                id: `grant-${now}`,
                type: 'bonus' as const,
                title: 'Bônus do Conselho',
                amount: grantAmount,
                icon: 'auto_awesome',
                timestamp: now
            }, ...member.history]
        };
        await upsertMember(updatedMember);
        alert(`Injetadas ${grantAmount} moedas para ${member.name}!`);
    };

    const saveLevel = async (lv: LevelConfig) => {
        await updateLevelConfig(lv);
        fetchLevelConfigs().then(setLevels);
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-[#2b8cee] shadow-md shrink-0">
                        <img src={activeParent.avatar} className="w-full h-full object-cover" alt="Parent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 leading-tight">Olá, {activeParent.name}</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Conselho de Heróis</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-slate-400 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
                </button>
            </header>

            <main className="space-y-6">
                {/* Banner de Status do Conselho */}
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]">gavel</span>
                    </div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h2 className="font-black text-lg">Sala do Conselho</h2>
                            <p className="text-[10px] opacity-70 uppercase tracking-widest">Controles do Reino</p>
                        </div>
                        <button 
                            onClick={() => setIsCouncilOpen(!isCouncilOpen)}
                            className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 active:scale-90 transition-all"
                        >
                            <span className="material-symbols-outlined">{isCouncilOpen ? 'expand_less' : 'settings_suggest'}</span>
                        </button>
                    </div>

                    {isCouncilOpen && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-6 animate-pop-in">
                            {/* Controle de Moedas */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-400">monetization_on</span>
                                    <span className="text-xs font-bold">Criar Moedas?</span>
                                </div>
                                <button 
                                    onClick={toggleCoinCreation}
                                    className={`w-12 h-6 rounded-full relative p-1 transition-all ${settings.allow_coin_creation ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${settings.allow_coin_creation ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>

                            {settings.allow_coin_creation && (
                                <div className="bg-white/5 p-4 rounded-2xl space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Injetar Moedas</p>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs outline-none"
                                        onChange={(e) => setSelectedGrantee(e.target.value)}
                                    >
                                        <option value="">Selecionar Herói...</option>
                                        {members.filter(m => m.role === 'child').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            value={grantAmount} 
                                            onChange={(e) => setGrantAmount(Number(e.target.value))}
                                            className="w-20 bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-center outline-none"
                                        />
                                        <button 
                                            onClick={handleGrantCoins}
                                            disabled={!selectedGrantee}
                                            className="flex-1 bg-amber-500 text-slate-900 rounded-xl font-black text-xs active:scale-95 disabled:opacity-30"
                                        >
                                            CONCEDER
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Gerenciamento de Escudos/Níveis */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Níveis e Escudos (Evolução)</p>
                                <div className="space-y-3">
                                    {levels.map((lv, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                                                <span className="material-symbols-outlined text-xl">{lv.shield_icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black">{lv.title} (Nível {lv.level_number})</p>
                                                <p className="text-[8px] opacity-60">Fronteira: {lv.xp_required} XP</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newXp = prompt(`Qual o novo limite de XP para o nível ${lv.level_number}?`, lv.xp_required.toString());
                                                    if (newXp) saveLevel({...lv, xp_required: parseInt(newXp)});
                                                }}
                                                className="text-[10px] font-black text-blue-400"
                                            >
                                                EDITAR
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={onPlay}
                    className="w-full bg-gradient-to-br from-amber-400 to-orange-500 text-white p-5 rounded-[2.5rem] font-black shadow-xl active-press flex items-center gap-4 group overflow-hidden"
                >
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-3xl">sports_esports</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <h3 className="text-lg leading-none mb-1 truncate">Entrar no Jogo</h3>
                        <p className="text-[10px] opacity-90 uppercase tracking-tighter truncate">Brinque com sua família!</p>
                    </div>
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={onAddTask}
                        className="bg-[#2b8cee] text-white p-5 rounded-[2rem] font-black shadow-lg chunky-shadow-blue active-press flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl">add_task</span> 
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Nova Missão</span>
                    </button>
                    
                    <button 
                        onClick={onAddStoreItem}
                        className="bg-purple-500 text-white p-5 rounded-[2rem] font-black shadow-[0_6px_0_0_#7e22ce] active-press flex flex-col items-center justify-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl">redeem</span> 
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Novo Prêmio</span>
                    </button>
                </div>

                <section className="pt-2">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aprovações Pendentes ({allPendingTasks.length})</h2>
                    </div>

                    {allPendingTasks.length === 0 ? (
                        <div className="bg-white/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                <span className="material-symbols-outlined text-4xl">verified</span>
                            </div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">Sua família está em dia!<br/>Nada para aprovar agora.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allPendingTasks.map(task => (
                                <div key={task.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2b8cee] shrink-0">
                                            <span className="material-symbols-outlined">{task.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{task.title}</h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-[12px] text-amber-500 fill-1">monetization_on</span>
                                                <p className="text-[10px] text-amber-600 font-black">{task.reward} MOEDAS</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onApprove(task.id)}
                                        className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs active-press shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        APROVAR E DAR MOEDAS
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ParentDashboard;
