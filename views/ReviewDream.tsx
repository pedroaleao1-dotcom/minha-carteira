
import React, { useState } from 'react';
import { Dream, Task } from '../types';

interface Props {
    dream: Dream;
    onConfirm: (dreamId: string, realAmount: number, tasks: Omit<Task, 'id' | 'status'>[]) => void;
    onBack: () => void;
}

// Fix: Added assignedTo: [] to satisfy Task interface requirements
const METAS_SUGESTOES: Omit<Task, 'id' | 'status'>[] = [
    { title: 'Ajudar na Limpeza', reward: 30, xp: 60, icon: 'cleaning_services', assignedTo: [] },
    { title: 'Ler 30 Minutos', reward: 20, xp: 40, icon: 'auto_stories', assignedTo: [] },
    { title: 'Arrumar os Brinquedos', reward: 15, xp: 30, icon: 'category', assignedTo: [] },
    { title: 'Comer Vegetais', reward: 10, xp: 20, icon: 'restaurant', assignedTo: [] },
];

const ReviewDream: React.FC<Props> = ({ dream, onConfirm, onBack }) => {
    const [realAmount, setRealAmount] = useState(dream.estimatedAmount || 100);
    const [selectedMetas, setSelectedMetas] = useState<Omit<Task, 'id' | 'status'>[]>([]);

    // Fixed: meta now correctly includes 'xp' from METAS_SUGESTOES
    const toggleMeta = (meta: Omit<Task, 'id' | 'status'>) => {
        if (selectedMetas.find(m => m.title === meta.title)) {
            setSelectedMetas(selectedMetas.filter(m => m.title !== meta.title));
        } else {
            setSelectedMetas([...selectedMetas, meta]);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Revisar Sonho</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-6 flex-1 overflow-y-auto pb-12">
                {/* Visualização do Pedido */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-emerald-100">
                    <div className="flex gap-4 mb-6">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-emerald-50 shadow-md">
                            <img src={dream.imageUrl || "https://picsum.photos/200"} className="w-full h-full object-cover" alt="Sonho" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-slate-800 leading-tight">{dream.title}</h2>
                            <p className="text-xs text-slate-500 font-bold mt-1">A criança estimou {dream.estimatedAmount} moedas.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Qual o valor real em moedas?</label>
                        <div className="flex items-center gap-4 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <input 
                                type="number" 
                                value={realAmount}
                                onChange={(e) => setRealAmount(Number(e.target.value))}
                                className="flex-1 bg-transparent font-black text-2xl text-emerald-600 outline-none"
                            />
                            <span className="material-symbols-outlined text-amber-500 fill-1">monetization_on</span>
                        </div>
                    </div>
                </div>

                {/* Criador de Metas */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-2">Definir Metas Iniciais</h3>
                    <p className="text-[10px] text-slate-400 font-bold px-2">Selecione tarefas que ajudarão a conquistar este sonho:</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {METAS_SUGESTOES.map(meta => {
                            const isSelected = selectedMetas.find(m => m.title === meta.title);
                            return (
                                <button 
                                    key={meta.title}
                                    onClick={() => toggleMeta(meta)}
                                    className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${isSelected ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-[1.02]' : 'bg-white border-slate-100 text-slate-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined">{meta.icon}</span>
                                        <span className="font-bold text-sm">{meta.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-black">+{meta.reward}</span>
                                        <span className="material-symbols-outlined text-xs fill-1">monetization_on</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button 
                    disabled={realAmount <= 0}
                    onClick={() => onConfirm(dream.id, realAmount, selectedMetas)}
                    className="w-full bg-[#2b8cee] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-[0_8px_0_0_#1a6ac4] active-press flex items-center justify-center gap-3"
                >
                    <span className="material-symbols-outlined">rocket_launch</span> ATIVAR PLANO MÁGICO
                </button>
            </main>
        </div>
    );
};

export default ReviewDream;