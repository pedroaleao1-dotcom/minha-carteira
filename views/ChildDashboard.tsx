
import React from 'react';
import { Member } from '../types';
import ActivityCalendar from '../components/ActivityCalendar';

interface Props {
    child: Member;
    onNavigate: (view: any) => void;
    onOpenDream: (id: string) => void;
    onLogout: () => void;
    onChangeProfile: () => void;
}

const ChildDashboard: React.FC<Props> = ({ child, onNavigate, onOpenDream, onLogout, onChangeProfile }) => {
    // Puxa as tarefas pendentes
    const activeTasks = child.tasks.filter(t => t.status === 'todo');
    
    // Identifica o Sonho Ativo (ex: o primeiro que não foi concluído e tem maior prioridade)
    // Aqui usamos uma lógica simples: pega o primeiro sonho ativo que tem progresso > 0, ou pega o primeiro sonho da lista
    const activeDreams = child.dreams.filter(d => d.status === 'active');
    const mainDream = activeDreams.find(d => d.currentAmount > 0) || activeDreams[0];

    // Identifica o Reino Ativo (qualquer sonho que esteja atrelado a um template/mapa de jornada)
    const activeJourneyDream = activeDreams.find(d => d.templateId);
    
    // Calcula progresso se houver sonho
    const dreamProgress = mainDream ? Math.min(100, Math.round((mainDream.currentAmount / mainDream.targetAmount) * 100)) : 0;

    return (
        <div className="flex-1 flex flex-col p-6 pb-24 bg-slate-50 min-h-screen">
            {/* Header: Status e Perfil */}
            <header className="flex flex-col items-center mb-6 pt-4">
                <div className="w-full flex justify-between items-center mb-6">
                    <div className="flex gap-2 items-center">
                        <button onClick={onChangeProfile} className="text-slate-400 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 active:scale-90 transition-all">
                            <span className="material-symbols-outlined text-lg">group</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Perfis</span>
                        </button>
                        <button onClick={onLogout} className="text-red-400 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 active:scale-90 transition-all">
                            <span className="material-symbols-outlined text-lg">logout</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Sair</span>
                        </button>
                    </div>
                    
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

            {/* Cards Vivos de Progresso */}
            <section className="flex flex-col gap-4 mb-8">
                
                {/* 1. O Sonho Ativo (Se Houver) */}
                {mainDream ? (
                    <button 
                        onClick={() => onNavigate('dream_gallery')}
                        className="w-full bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-slate-50 text-left active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                        {/* Fundo Decorativo */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
                        
                        <div className="flex items-start justify-between relative z-10 mb-4">
                            <div>
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="material-symbols-outlined text-[10px] text-emerald-500">star</span>
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Seu Maior Sonho</h2>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 leading-tight">{mainDream.title}</h3>
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                                <span className="material-symbols-outlined text-3xl font-black">{mainDream.icon}</span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-amber-500 fill-1">monetization_on</span>
                                    <span className="font-black text-slate-700">{mainDream.currentAmount}</span>
                                    <span className="text-[10px] font-bold text-slate-400">/ {mainDream.targetAmount}</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-500">{dreamProgress}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${dreamProgress}%` }}></div>
                            </div>
                        </div>
                    </button>
                ) : (
                    <button 
                        onClick={() => onNavigate('dream_gallery')}
                        className="w-full bg-slate-100/50 rounded-[2.5rem] p-6 border-4 border-dashed border-slate-200 text-center active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">add_task</span>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Definir um Sonho</h3>
                    </button>
                )}

                {/* 2. Reinos / Aventuras (XP) */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onNavigate('kingdom_explorer')}
                        className={`bg-gradient-to-br ${activeJourneyDream ? 'from-sky-500 to-indigo-600 text-white' : 'from-slate-800 to-slate-900 text-white'} rounded-[2.5rem] p-5 shadow-lg active:scale-95 transition-all relative overflow-hidden group`}
                    >
                        <div className="absolute -top-4 -right-4 text-white/5 group-hover:scale-125 transition-transform duration-500 transform rotate-12">
                            <span className="material-symbols-outlined text-8xl">explore</span>
                        </div>
                        <div className="relative z-10 flex flex-col items-start text-left h-full justify-between">
                            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">
                                {activeJourneyDream ? 'Jornada Atual' : 'Reinos Mágicos'}
                            </h2>
                            <div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined text-2xl">{activeJourneyDream ? 'map' : 'travel_explore'}</span>
                                </div>
                                <h3 className="font-black leading-tight text-sm">
                                    {activeJourneyDream ? activeJourneyDream.title : 'Explorar Mapa'}
                                </h3>
                            </div>
                        </div>
                    </button>

                    {/* Botão de Missões (Fallback para lista de missões completas) */}
                    <button 
                        onClick={() => onNavigate('tasks')}
                        className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 active:scale-95 transition-all flex flex-col justify-between items-start text-left"
                    >
                        <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Histórico</h2>
                        <div>
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-2xl">task_alt</span>
                            </div>
                            <h3 className="font-black text-slate-800 text-sm">Ver Todas<br/>as Missões</h3>
                        </div>
                    </button>
                </div>
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
