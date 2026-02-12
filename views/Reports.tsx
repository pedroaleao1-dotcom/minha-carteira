
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
    const [aiInsight, setAiInsight] = useState<string>("Analisando jornada...");

    const selectedChild = members.find(m => m.id === selectedChildId);

    useEffect(() => {
        if (selectedChild) {
            getMasterTip(`Análise de desempenho para os pais sobre o herói ${selectedChild.name} que concluiu ${selectedChild.taskCompletions.length} missões totalizando nível ${selectedChild.level}. Seja encorajador e dê uma dica técnica de educação.`).then(setAiInsight);
        }
    }, [selectedChildId]);

    const handleSelectDay = (day: number, completions: TaskCompletion[]) => {
        setSelectedDay(day === selectedDay ? null : day);
        setDayCompletions(completions);
    };

    if (!selectedChild) return null;

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            <header className="p-6 pt-10 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-30">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-emerald-600">Relatórios</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Visão de Mentor</p>
                </div>
                <div className="w-12 h-12"></div>
            </header>

            <main className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
                {/* Seletor de Crianças */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {members.map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setSelectedChildId(m.id); setSelectedDay(null); }}
                            className={`flex flex-col items-center gap-2 shrink-0 transition-all ${selectedChildId === m.id ? 'scale-110' : 'opacity-40 grayscale'}`}
                        >
                            <div className={`w-14 h-14 rounded-full border-4 ${selectedChildId === m.id ? 'border-emerald-500 shadow-lg' : 'border-white'}`}>
                                <img src={m.avatar} className="w-full h-full object-cover rounded-full" alt={m.name} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-800">{m.name}</span>
                        </button>
                    ))}
                </div>

                {/* Resumo de Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 fill-1">monetization_on</span>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase">Ganhos do Mês</p>
                            <p className="text-lg font-black text-slate-800">{selectedChild.coins}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">bolt</span>
                        <div className="text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase">XP Acumulado</p>
                            <p className="text-lg font-black text-slate-800">{selectedChild.xp}</p>
                        </div>
                    </div>
                </div>

                {/* Insight da IA */}
                <div className="bg-emerald-50 rounded-[2.5rem] p-6 border border-emerald-100 flex gap-4 items-center">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg animate-float">
                        <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Análise do Mestre</p>
                        <p className="text-slate-700 text-[11px] font-bold leading-snug italic">"{aiInsight}"</p>
                    </div>
                </div>

                {/* Monitor de Desempenho (Calendário Interativo) */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Monitor de Desempenho</h3>
                    <ActivityCalendar 
                        completions={selectedChild.taskCompletions} 
                        onSelectDay={handleSelectDay}
                        selectedDay={selectedDay}
                    />
                    <p className="text-[9px] text-center text-slate-400 font-bold italic">Toque em um dia para ver o que aconteceu!</p>
                </section>

                {/* Detalhamento do Dia Selecionado */}
                {selectedDay && (
                    <section className="animate-pop-in space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico do Dia {selectedDay}</h3>
                            <button onClick={() => setSelectedDay(null)} className="text-[8px] font-black text-red-500 uppercase">Fechar</button>
                        </div>
                        
                        {dayCompletions.length > 0 ? (
                            <div className="space-y-3">
                                {dayCompletions.map(c => (
                                    <div key={c.id} className="bg-white rounded-[1.8rem] p-4 shadow-md border border-slate-50 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
                                            <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-xs">{c.taskTitle}</h4>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase">+{c.rewardCoins} Moedas / +{c.rewardXp} XP</p>
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase">
                                            {new Date(c.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/50 rounded-[2rem] p-8 text-center border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nenhuma atividade registrada neste dia.</p>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Reports;
