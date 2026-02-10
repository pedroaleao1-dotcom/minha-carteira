
import React from 'react';
import { Member } from '../types';

interface Props {
    child: Member;
    onNavigate: (view: any) => void;
    onOpenDream: (id: string) => void;
    onLogout: () => void;
}

const ChildDashboard: React.FC<Props> = ({ child, onNavigate, onOpenDream, onLogout }) => {
    const activeDreams = child.dreams.filter(d => d.status === 'active');
    const proposalDreams = child.dreams.filter(d => d.status === 'proposal');
    const displayDreams = [...activeDreams, ...proposalDreams].slice(0, 3);
    const quickTasks = child.tasks.filter(t => t.status === 'todo').slice(0, 3);

    return (
        <div className="flex-1 flex flex-col p-6 pb-24">
            <header className="flex flex-col items-center mb-8 pt-4">
                <div className="w-full flex justify-between items-center mb-4">
                    <button 
                        onClick={onLogout} 
                        className="text-slate-400 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1 active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
                    </button>
                    <div className="w-10 h-10"></div> {/* Spacer */}
                </div>

                <div className="relative mb-4 cursor-pointer group" onClick={() => onNavigate('profile')}>
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white group-active:scale-95 transition-transform">
                        <img src={child.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#2b8cee] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                        NÍVEL {child.level}
                    </div>
                </div>
                <h1 className="text-2xl font-black text-slate-800">Olá, {child.name}! 👋</h1>
                
                <button 
                    onClick={() => onNavigate('wallet')}
                    className="mt-6 bg-white rounded-full px-6 py-2 shadow-lg flex items-center gap-2 border border-slate-100 active:scale-95 transition-all hover:bg-amber-50"
                >
                    <span className="material-symbols-outlined text-amber-400 font-bold fill-1">monetization_on</span>
                    <span className="text-xl font-black text-slate-800">{child.coins}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moedas</span>
                    <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                </button>
            </header>

            {/* Seção de Sonhos */}
            <section className="mb-8">
                <div className="flex justify-between items-end mb-4 px-2">
                    <h2 className="text-xl font-black text-slate-800">Cofre de Sonhos 🚀</h2>
                    <button onClick={() => onNavigate('dream_gallery')} className="text-xs font-black text-[#2b8cee] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Ver todos</button>
                </div>

                <div className="space-y-4">
                    {displayDreams.length > 0 ? (
                        displayDreams.map(dream => {
                            const progress = Math.round((dream.currentAmount / dream.targetAmount) * 100);
                            const isPending = dream.status === 'proposal';
                            
                            return (
                                <div 
                                    key={dream.id}
                                    onClick={() => onOpenDream(dream.id)} 
                                    className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-5 shadow-xl border-2 border-white cursor-pointer hover:scale-[1.01] transition-transform relative overflow-hidden group"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${isPending ? 'bg-slate-50 text-slate-300' : 'bg-emerald-50 text-emerald-500'}`}>
                                                <span className="material-symbols-outlined text-2xl fill-1">{dream.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-sm leading-tight ${isPending ? 'text-slate-400' : 'text-slate-800'}`}>{dream.title}</h3>
                                                {isPending && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Em análise</span>}
                                            </div>
                                        </div>
                                        {!isPending && <span className="text-xs font-black text-emerald-500">{progress}%</span>}
                                    </div>
                                    
                                    {!isPending && (
                                        <div className="w-full h-2.5 bg-slate-100/50 rounded-full overflow-hidden p-0.5 border border-white">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_#10b981]" 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <button 
                            onClick={() => onNavigate('add_dream')}
                            className="w-full py-10 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#2b8cee] hover:text-[#2b8cee] transition-all bg-white/20"
                        >
                            <span className="material-symbols-outlined text-4xl mb-2">add_circle</span>
                            <span className="font-black uppercase tracking-widest text-xs">Plante um sonho</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Missões Rápidas */}
            <section className="mb-8">
                <div className="flex justify-between items-end mb-4 px-2">
                    <h2 className="text-xl font-black text-slate-800">Missões de Hoje ⚡</h2>
                    <button onClick={() => onNavigate('tasks')} className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">Ver mais</button>
                </div>

                <div className="space-y-3">
                    {quickTasks.length > 0 ? (
                        quickTasks.map(task => (
                            <div 
                                key={task.id}
                                className="bg-white rounded-[1.5rem] p-4 shadow-md border-2 border-white flex items-center gap-4 active:scale-95 transition-all"
                            >
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#2b8cee] shrink-0">
                                    <span className="material-symbols-outlined text-xl">{task.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-sm">{task.title}</h3>
                                    <div className="flex gap-2">
                                        <span className="text-[9px] font-black text-emerald-500">+{task.reward} 💰</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onNavigate('tasks');
                                    }}
                                    className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                                >
                                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/40 rounded-[1.5rem] p-6 text-center border-2 border-dashed border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Todas as missões feitas! 🏆</p>
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                    onClick={() => onNavigate('tasks')}
                    className="aspect-square bg-amber-400 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-white chunky-shadow-yellow active-press"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-4xl fill-1">checklist</span>
                    </div>
                    <span className="font-black text-lg text-center leading-tight">Minhas<br/>Missões</span>
                </button>
                <button 
                    onClick={() => onNavigate('store')}
                    className="aspect-square bg-purple-500 rounded-[2.5rem] p-6 flex flex-col items-center justify-center text-white shadow-[0_6px_0_0_#7e22ce] active-press"
                >
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-4xl fill-1">storefront</span>
                    </div>
                    <span className="font-black text-lg text-center leading-tight">Loja de<br/>Prêmios</span>
                </button>
            </div>

            <button 
                onClick={() => onNavigate('request_mission')}
                className="w-full bg-[#2b8cee] rounded-[2.5rem] p-6 flex items-center justify-between text-white shadow-xl chunky-shadow-blue active-press group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-3xl">mail</span>
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-lg leading-tight">Pedir Missão</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Proponha um desafio!</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </button>
        </div>
    );
};

export default ChildDashboard;
