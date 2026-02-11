
import React from 'react';
import { Member } from '../types';

interface Props {
    child: Member;
    onNavigate: (view: any) => void;
    onOpenDream: (id: string) => void;
    onLogout: () => void;
}

const ChildDashboard: React.FC<Props> = ({ child, onNavigate, onOpenDream, onLogout }) => {
    const dailyTasks = child.tasks.filter(t => t.frequency === 'daily' && t.status === 'todo');
    const studyTasks = child.tasks.filter(t => t.category === 'study' && t.status === 'todo');

    return (
        <div className="flex-1 flex flex-col p-6 pb-24">
            <header className="flex flex-col items-center mb-8 pt-4">
                <div className="w-full flex justify-between items-center mb-4">
                    <button onClick={onLogout} className="text-slate-400 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-1 active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="text-[10px] font-black uppercase">Sair</span>
                    </button>
                    <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden">
                        <img src={child.avatar} className="w-full h-full object-cover" />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-black text-slate-800">Olá, {child.name}! 👋</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="bg-sky-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full">Nível {child.level}</span>
                        <span className="bg-amber-400 text-white text-[10px] font-black px-3 py-0.5 rounded-full">Explorer</span>
                    </div>
                </div>

                <button 
                    onClick={() => onNavigate('wallet')}
                    className="w-full bg-white rounded-[2rem] p-4 shadow-xl flex items-center justify-between border border-slate-100 active:scale-95 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-500 fill-1">monetization_on</span>
                        </div>
                        <span className="text-2xl font-black text-slate-800">{child.coins}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Ver Carteira</span>
                </button>
            </header>

            {/* Acesso à Trilha Principal */}
            <section className="mb-10">
                <button 
                    onClick={() => onNavigate('journey')}
                    className="w-full aspect-[16/7] bg-gradient-to-br from-sky-400 to-indigo-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl active:scale-95 transition-all group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-8xl">map</span>
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <h2 className="text-2xl font-black mb-1">Minha Trilha</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Avance para o próximo sonho!</p>
                    </div>
                </button>
            </section>

            {/* Missões Diárias */}
            {(dailyTasks.length > 0 || studyTasks.length > 0) && (
                <section className="mb-8 space-y-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Desafios de Hoje ⚡</h2>
                    <div className="space-y-3">
                        {[...dailyTasks, ...studyTasks].slice(0, 3).map(task => (
                            <div key={task.id} className="bg-white rounded-[1.5rem] p-4 shadow-md border border-slate-100 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${task.category === 'study' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    <span className="material-symbols-outlined">{task.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 text-sm">{task.title}</h3>
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">+{task.reward} moedas</span>
                                </div>
                                <button onClick={() => onNavigate('tasks')} className="w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center active:scale-90">
                                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onNavigate('tasks')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl text-sky-500">checklist</span>
                    <span className="text-[10px] font-black uppercase text-slate-500">Missões</span>
                </button>
                <button onClick={() => onNavigate('store')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl text-purple-500">storefront</span>
                    <span className="text-[10px] font-black uppercase text-slate-500">Loja</span>
                </button>
            </div>
        </div>
    );
};
