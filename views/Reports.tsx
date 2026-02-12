
import React, { useState, useEffect } from 'react';
import { Member, TaskCompletion } from '../types';
import ActivityCalendar from '../components/ActivityCalendar';
import { getMasterTip } from '../services/gemini';

interface Props {
    members: Member[];
    onBack: () => void;
}

const Reports: React.FC<Props> = ({ members, onBack }) => {
    const [selectedChildId, setSelectedChildId] = useState<string>(members[0]?.id || '');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [dayCompletions, setDayCompletions] = useState<TaskCompletion[]>([]);
    const [aiInsight, setAiInsight] = useState<string>("Invocando a sabedoria do Mestre...");

    const selectedChild = members.find(m => m.id === selectedChildId);

    useEffect(() => {
        if (selectedChild) {
            const lastTasks = selectedChild.taskCompletions.slice(-5).map(c => c.taskTitle).join(', ');
            const context = `Análise de desempenho do herói ${selectedChild.name}. Nível: ${selectedChild.level}. Últimas missões: ${lastTasks}. Dê um conselho motivador e pedagógico para os pais.`;
            getMasterTip(context).then(setAiInsight);
        }
    }, [selectedChildId]);

    const handleSelectDay = (day: number, completions: TaskCompletion[]) => {
        setSelectedDay(day === selectedDay ? null : day);
        setDayCompletions(completions);
    };

    if (!selectedChild) return null;

    const totalCoins = selectedChild.taskCompletions.reduce((acc, c) => acc + c.rewardCoins, 0);
    const avgPerDay = (selectedChild.taskCompletions.length / 30).toFixed(1);

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            <header className="p-6 pt-10 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 border-b border-slate-100">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-emerald-600">Relatórios</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Visão de Mentor</p>
                </div>
                <div className="w-12 h-12"></div>
            </header>

            <main className="p-6 space-y-8 flex-1 overflow-y-auto pb-32">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {members.map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setSelectedChildId(m.id); setSelectedDay(null); }}
                            className={`flex flex-col items-center gap-3 shrink-0 transition-all ${selectedChildId === m.id ? 'scale-110' : 'opacity-30 grayscale'}`}
                        >
                            <div className={`relative w-16 h-16 rounded-full border-4 p-0.5 ${selectedChildId === m.id ? 'border-emerald-500 shadow-xl' : 'border-white'}`}>
                                <img src={m.avatar} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <span className={`text-[10px] font-black uppercase ${selectedChildId === m.id ? 'text-emerald-600' : 'text-slate-400'}`}>{m.name}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><span className="material-symbols-outlined fill-1">monetization_on</span></div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Ganho</p>
                            <p className="text-xl font-black text-slate-800">{totalCoins}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><span className="material-symbols-outlined">bolt</span></div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Média Diária</p>
                            <p className="text-xl font-black text-slate-800">{avgPerDay}</p>
                        </div>
                    </div>
                </div>

                {/* Novo: Progresso de Jornadas */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Jornadas em Curso</h3>
                    <div className="space-y-3">
                        {selectedChild.dreams.filter(d => d.status === 'active').map(dream => {
                            const completedSteps = dream.steps?.filter(s => s.isCompleted).length || 0;
                            const totalSteps = dream.steps?.length || 1;
                            const percent = Math.round((completedSteps / totalSteps) * 100);
                            
                            return (
                                <div key={dream.id} className="bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sky-500 text-sm">{dream.icon}</span>
                                            <span className="text-[10px] font-black text-slate-700 uppercase">{dream.title}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-sky-600">{percent}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {selectedChild.dreams.filter(d => d.status === 'active').length === 0 && (
                            <p className="text-center py-4 text-[9px] text-slate-300 font-bold uppercase">Sem jornadas ativas</p>
                        )}
                    </div>
                </section>

                <section className="bg-emerald-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
                    <div className="flex gap-4 items-start relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                            <span className="material-symbols-outlined text-white">auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-100">Visão do Mestre</h3>
                            <p className="text-xs font-bold leading-relaxed italic text-white/90">"{aiInsight}"</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapa de Atividade</h3>
                    <ActivityCalendar completions={selectedChild.taskCompletions} onSelectDay={handleSelectDay} selectedDay={selectedDay} />
                </section>
            </main>
        </div>
    );
};

export default Reports;
