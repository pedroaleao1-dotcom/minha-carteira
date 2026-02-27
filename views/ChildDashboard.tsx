
import React from 'react';
import { Member } from '../types';
import ActivityCalendar from '../components/ActivityCalendar';

interface Props {
    child: Member;
    onNavigate: (view: any) => void;
    onOpenDream: (id: string) => void;
    onLogout: () => void;
}

const ChildDashboard: React.FC<Props> = ({ child, onNavigate, onOpenDream, onLogout }) => {
    // Busca TODAS as tarefas pendentes do herói
    const activeTasks = child.tasks.filter(t => t.status === 'todo');
    const activeDreams = child.dreams.filter(d => d.status === 'active');

    return (
        <div className="flex-1 flex flex-col p-6 pb-24 bg-slate-50 min-h-screen">
            {/* Header: Status e Perfil */}
            <header className="flex flex-col items-center mb-6 pt-4">
                <div className="w-full flex justify-between items-center mb-6">
                    <button onClick={onLogout} className="text-slate-400 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Sair</span>
                    </button>
                    
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nível {child.level}</p>
                            <p className="text-xs font-black text-slate-800 uppercase">{child.name}</p>
                        </div>
                        <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full border-2 border-sky-500 shadow-md overflow-hidden active:scale-95 transition-all">
                            <img src={child.avatar} className="w-full h-full object-cover" />
                        </button>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                    <button onClick={() => onNavigate('wallet')} className="bg-white rounded-[2rem] p-5 shadow-xl flex items-center gap-3 border border-slate-50 active:scale-95 transition-all group">
                        <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <span className="material-symbols-outlined text-amber-500 fill-1">monetization_on</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Ouro</p>
                            <span className="text-xl font-black text-slate-800">{child.coins}</span>
                        </div>
                    </button>
                    
                    <button onClick={() => onNavigate('xp')} className="bg-white rounded-[2rem] p-5 shadow-xl flex items-center gap-3 border border-slate-50 active:scale-95 transition-all group">
                        <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <span className="material-symbols-outlined text-sky-500">bolt</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">XP</p>
                            <span className="text-xl font-black text-slate-800">{child.xp}</span>
                        </div>
                    </button>
                </div>
            </header>

            {/* Menu Principal de Herói (Grid) */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => onNavigate('kingdom_explorer')}
                    className="col-span-2 h-32 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl active:scale-95 transition-all group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[120px]">explore</span>
                    </div>
                    <div className="relative z-10 flex flex-col justify-center h-full">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Explorar</h2>
                        <h3 className="text-2xl font-black">Sonhos Mágicos</h3>
                    </div>
                    <span className="absolute bottom-6 right-6 material-symbols-outlined text-3xl animate-float">travel_explore</span>
                </button>

                <button 
                    onClick={() => onNavigate('tasks')}
                    className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-all"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">task_alt</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Missões</span>
                </button>

                <button 
                    onClick={() => onNavigate('dream_gallery')}
                    className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center gap-2 active:scale-95 transition-all"
                >
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">cloud_done</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sonhos</span>
                </button>
            </section>

            {/* Treinamento de Hoje (Tasks Rápidas) */}
            <section className="mb-8">
                <div className="flex items-center justify-between px-2 mb-4">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treinamento de Hoje ⚔️</h2>
                    <button onClick={() => onNavigate('request_mission')} className="text-[8px] font-black text-sky-500 uppercase bg-sky-50 px-3 py-1 rounded-full">+ Pedir Missão</button>
                </div>
                
                <div className="space-y-3">
                    {activeTasks.length === 0 ? (
                        <div className="bg-white/50 rounded-[2.5rem] py-10 px-6 text-center border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-slate-300 text-4xl mb-3">auto_awesome</span>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-tight">Você concluiu tudo!<br/>Pode pedir uma missão extra.</p>
                        </div>
                    ) : (
                        activeTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="bg-white rounded-[1.8rem] p-4 shadow-md border border-slate-100 flex items-center gap-4 animate-pop-in active:scale-95 transition-all" onClick={() => onNavigate('tasks')}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${task.category === 'study' ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-500'}`}>
                                    <span className="material-symbols-outlined text-2xl">{task.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-sm truncate">{task.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">+{task.reward} moedas</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Calendário e Outros */}
            <section className="mb-8">
                <ActivityCalendar completions={child.taskCompletions || []} />
            </section>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onNavigate('store')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">storefront</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Loja</span>
                </button>
                <button onClick={() => onNavigate('achievements')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
                    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">emoji_events</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Medalhas</span>
                </button>
            </div>
        </div>
    );
};

export default ChildDashboard;
