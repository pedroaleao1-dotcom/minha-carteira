
import React from 'react';
import { Member, Task } from '../types';

interface Props {
    activeParent: Member;
    members: Member[];
    onApprove: (taskId: string) => void;
    onBack: () => void;
    onAddTask: () => void;
    onAddStoreItem: () => void;
    onPlay: () => void;
}

const ParentDashboard: React.FC<Props> = ({ activeParent, members, onApprove, onBack, onAddTask, onAddStoreItem, onPlay }) => {
    // Pegamos todas as tarefas pendentes de todos os membros
    const allPendingTasks = members.flatMap(m => m.tasks.filter(t => t.status === 'pending'));

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
                <button onClick={onBack} className="text-slate-400 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
                </button>
            </header>

            <main className="space-y-6">
                {/* Botão "Entrar no Jogo" - Layout Reforçado contra Overlap */}
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
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform">chevron_right</span>
                    </div>
                </button>

                {/* Botões de Ação Rápida - Grid com Gap seguro */}
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

                {/* Seção de Aprovações */}
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
