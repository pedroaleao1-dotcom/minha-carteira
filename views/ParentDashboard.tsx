
import React from 'react';
import { Member, Task } from '../types';

interface Props {
    activeParent: Member;
    members: Member[];
    onApprove: (taskId: string) => void;
    onApproveProposal?: (taskId: string, rewardCoins: number, rewardXp: number) => void;
    onRejectProposal?: (taskId: string) => void;
    onLogout: () => void;
    onChangeProfile: () => void;
    onAddTask: () => void;
    onAddStoreItem: () => void;
    onOpenCouncil: () => void;
    onPlay: () => void;
    onEditMap: (dreamId: string) => void;
    onOpenReports: () => void;
    onManageMembers: () => void;
    onManageTemplates: () => void;
}

const ProposedTaskItem: React.FC<{ task: any, onApprove: (id: string, coins: number, xp: number) => void, onReject: (id: string) => void }> = ({ task, onApprove, onReject }) => {
    const [coins, setCoins] = React.useState(10);
    const [xp, setXp] = React.useState(10);

    return (
        <div className="bg-sky-50 rounded-[2rem] p-5 shadow-sm border border-sky-100 flex flex-col gap-4 animate-pop-in">
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 shrink-0">
                    <span className="material-symbols-outlined">{task.icon}</span>
                    <img src={task.memberAvatar} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{task.title}</h3>
                    <p className="text-[10px] text-sky-600 font-black uppercase">💡 Ideia de {task.memberName}</p>
                </div>
            </div>
            
            <div className="flex gap-4 items-center bg-white p-3 rounded-2xl">
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Moedas (Ouro)</label>
                    <input type="number" min="0" value={coins} onChange={(e) => setCoins(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-amber-500 text-center focus:outline-none focus:border-amber-300" />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">XP (Energia)</label>
                    <input type="number" min="0" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-bold text-sky-500 text-center focus:outline-none focus:border-sky-300" />
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button onClick={() => onReject(task.id)} className="flex-1 bg-red-100 text-red-500 py-3 rounded-2xl font-black text-xs active-press flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">close</span>REJEITAR
                </button>
                <button onClick={() => onApprove(task.id, coins, xp)} className="flex-[2] bg-sky-500 text-white py-3 rounded-2xl font-black text-xs active-press shadow-lg flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">thumb_up</span>APROVAR
                </button>
            </div>
        </div>
    );
};

const ParentDashboard: React.FC<Props> = ({ activeParent, members, onApprove, onApproveProposal, onRejectProposal, onLogout, onChangeProfile, onAddTask, onAddStoreItem, onOpenCouncil, onPlay, onEditMap, onOpenReports, onManageMembers, onManageTemplates }) => {
    const allPendingTasks = members.flatMap(m => m.tasks.filter(t => t.status === 'pending').map(t => ({ ...t, memberName: m.name, memberAvatar: m.avatar })));
    const children = members.filter(m => m.role === 'child');

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50 min-h-screen pb-24">
            <header className="flex items-center justify-between mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-[#2b8cee] shadow-md shrink-0">
                        <img src={activeParent.avatar} className="w-full h-full object-cover" alt="Parent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 leading-tight">Olá, {activeParent.name}</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Mentor dos Sonhos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onChangeProfile} className="text-slate-400 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1 active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-lg">group</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Perfis</span>
                    </button>
                    <button onClick={onLogout} className="text-red-400 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1 active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
                    </button>
                </div>
            </header>

            <main className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={onPlay}
                        className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-[2rem] font-black shadow-xl active-press flex flex-col items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-3xl">sports_esports</span>
                        <span className="text-[10px] uppercase tracking-widest text-center">Entrar no Jogo</span>
                    </button>
                    <button 
                        onClick={onOpenReports}
                        className="bg-white text-slate-800 p-6 rounded-[2rem] font-black shadow-sm border border-slate-100 active-press flex flex-col items-center gap-3"
                    >
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">analytics</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Relatórios</span>
                    </button>
                </div>

                <button 
                    onClick={onManageTemplates}
                    className="w-full bg-sky-600 text-white p-6 rounded-[2.5rem] font-black shadow-xl active-press flex items-center gap-4 relative overflow-hidden group"
                >
                    <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                        <span className="material-symbols-outlined text-3xl font-black">map</span>
                    </div>
                    <div className="flex-1 text-left relative z-10">
                        <h3 className="text-lg leading-none mb-1">Mapas dos Sonhos</h3>
                        <p className="text-[10px] text-sky-200 uppercase tracking-widest font-black">Gerenciar Caminhos & Heróis</p>
                    </div>
                    <span className="absolute bottom-[-10px] right-[-10px] material-symbols-outlined text-8xl opacity-10 rotate-12">explore</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={onManageMembers}
                        className="bg-slate-900 text-white p-6 rounded-[2rem] font-black shadow-sm flex flex-col items-center justify-center gap-3"
                    >
                        <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-xl">group</span></div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Membros</span>
                    </button>
                    <button 
                        onClick={onOpenCouncil}
                        className="bg-white text-slate-800 p-6 rounded-[2rem] font-black shadow-sm border border-slate-100 active-press flex flex-col items-center justify-center gap-3"
                    >
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-xl">shield</span></div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Conselho</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={onAddTask} className="bg-white text-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 active-press flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-xl">add_task</span></div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Nova Missão</span>
                    </button>
                    <button onClick={onAddStoreItem} className="bg-white text-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 active-press flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-xl">redeem</span></div>
                        <span className="text-[10px] uppercase tracking-widest text-center">Novo Prêmio</span>
                    </button>
                </div>

                <section className="pt-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Jornadas dos Heróis</h2>
                    <div className="space-y-4">
                        {children.map(child => (
                            <div key={child.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <img src={child.avatar} className="w-8 h-8 rounded-full border-2 border-sky-100" alt={child.name} />
                                    <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{child.name}</span>
                                </div>
                                <div className="space-y-2">
                                    {child.dreams.filter(d => d.status === 'active').map(dream => (
                                        <div key={dream.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-sky-500">{dream.icon}</span>
                                                <span className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[120px]">{dream.title}</span>
                                            </div>
                                            <button 
                                                onClick={() => onEditMap(dream.id)}
                                                className="bg-sky-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-xs">edit_location</span>
                                                Ajustar Mapa
                                            </button>
                                        </div>
                                    ))}
                                    {child.dreams.filter(d => d.status === 'active').length === 0 && (
                                        <p className="text-[9px] text-slate-400 font-bold uppercase text-center py-2 italic">Nenhuma jornada ativa</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="pt-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Aprovações Pendentes ({allPendingTasks.length})</h2>
                    {allPendingTasks.length === 0 ? (
                        <div className="bg-white/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Família em Paz</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allPendingTasks.map(task => {
                                const isProposal = task.reward === 0 && task.xp === 0;
                                
                                if (isProposal) {
                                    return <ProposedTaskItem key={task.id} task={task} onApprove={onApproveProposal!} onReject={onRejectProposal!} />;
                                }

                                return (
                                    <div key={task.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col gap-4 animate-pop-in">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                                                <span className="material-symbols-outlined">{task.icon}</span>
                                                <img src={task.memberAvatar} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-800 text-sm truncate">{task.title}</h3>
                                                <p className="text-[10px] text-amber-600 font-black uppercase">Prêmio: {task.reward} MOEDAS • {task.memberName}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => onApprove(task.id)} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs active-press shadow-lg flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>APROVAR
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ParentDashboard;
