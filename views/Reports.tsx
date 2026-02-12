
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
            const context = `Análise de desempenho do herói ${selectedChild.name}. 
            Nível atual: ${selectedChild.level}. 
            Últimas missões: ${lastTasks || 'Nenhuma recente'}. 
            Total de missões: ${selectedChild.taskCompletions.length}. 
            Dê um conselho motivador e pedagógico para os pais.`;
            
            getMasterTip(context).then(setAiInsight);
        }
    }, [selectedChildId]);

    const handleSelectDay = (day: number, completions: TaskCompletion[]) => {
        setSelectedDay(day === selectedDay ? null : day);
        setDayCompletions(completions);
    };

    if (!selectedChild) return null;

    // Calcular estatísticas simples
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
                {/* Seletor de Crianças Estilizado */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {members.map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setSelectedChildId(m.id); setSelectedDay(null); }}
                            className={`flex flex-col items-center gap-3 shrink-0 transition-all ${selectedChildId === m.id ? 'scale-110' : 'opacity-30 grayscale'}`}
                        >
                            <div className={`relative w-16 h-16 rounded-full border-4 p-0.5 ${selectedChildId === m.id ? 'border-emerald-500 shadow-xl' : 'border-white'}`}>
                                <img src={m.avatar} className="w-full h-full object-cover rounded-full" alt={m.name} />
                                {selectedChildId === m.id && (
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pop-in">
                                        <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-black uppercase ${selectedChildId === m.id ? 'text-emerald-600' : 'text-slate-400'}`}>{m.name}</span>
                        </button>
                    ))}
                </div>

                {/* Grid de Analytics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                            <span className="material-symbols-outlined fill-1">monetization_on</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Riqueza Total</p>
                            <p className="text-xl font-black text-slate-800">{totalCoins}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                            <span className="material-symbols-outlined">bolt</span>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Ritmo Heróico</p>
                            <p className="text-xl font-black text-slate-800">{avgPerDay}<span className="text-[10px] text-slate-300 ml-1">m/dia</span></p>
                        </div>
                    </div>
                </div>

                {/* Insight Mágico do Mestre */}
                <section className="animate-pop-in">
                    <div className="bg-emerald-600 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex gap-4 items-start relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                                <span className="material-symbols-outlined text-white animate-float">psychology</span>
                            </div>
                            <div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-emerald-100">Conselho do Mestre</h3>
                                <p className="text-xs font-bold leading-relaxed italic text-white/90">"{aiInsight}"</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Calendário de Atividades */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mapa de Atividade Mensal</h3>
                        <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded-full">30 Dias</span>
                    </div>
                    <ActivityCalendar 
                        completions={selectedChild.taskCompletions} 
                        onSelectDay={handleSelectDay}
                        selectedDay={selectedDay}
                    />
                </section>

                {/* Pergaminho de Atividades do Dia */}
                {selectedDay && (
                    <section className="animate-pop-in space-y-4 pb-12">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pergaminho de {selectedDay}</h3>
                            <button onClick={() => setSelectedDay(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-all">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        
                        {dayCompletions.length > 0 ? (
                            <div className="space-y-3">
                                {dayCompletions.map(c => (
                                    <div key={c.id} className="bg-white rounded-[1.8rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 group">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tighter">{c.taskTitle}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[8px] font-black text-amber-500 uppercase">+{c.rewardCoins} moedas</span>
                                                <span className="text-[8px] font-black text-blue-500 uppercase">+{c.rewardXp} XP</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[8px] font-black text-slate-300 uppercase">Concluído às</p>
                                            <p className="text-xs font-black text-slate-800">
                                                {new Date(c.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/40 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200">
                                <span className="material-symbols-outlined text-slate-200 text-4xl mb-4">bedtime</span>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Descanso heróico total neste dia.</p>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Reports;
