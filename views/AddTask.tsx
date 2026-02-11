
import React, { useState } from 'react';
import { Task, Member, TaskFrequency, TaskCategory } from '../types';

interface Props {
    members: Member[];
    onAdd: (task: Omit<Task, 'id' | 'status'>) => void;
    onBack: () => void;
}

const CATEGORIES: { id: TaskCategory, icon: string, label: string, color: string }[] = [
    { id: 'study', icon: 'menu_book', label: 'Estudo', color: 'bg-indigo-500' },
    { id: 'chore', icon: 'cleaning_services', label: 'Casa', color: 'bg-amber-500' },
    { id: 'health', icon: 'health_and_safety', label: 'Saúde', color: 'bg-emerald-500' },
    { id: 'fitness', icon: 'sports_soccer', label: 'Esporte', color: 'bg-rose-500' }
];

const AddTask: React.FC<Props> = ({ members, onAdd, onBack }) => {
    const [title, setTitle] = useState('');
    const [reward, setReward] = useState(20);
    const [frequency, setFrequency] = useState<TaskFrequency>('once');
    const [recurrenceText, setRecurrenceText] = useState('');
    const [category, setCategory] = useState<TaskCategory>('chore');
    const [assignedTo, setAssignedTo] = useState<string[]>([]);

    const toggleMember = (id: string) => {
        setAssignedTo(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const isFormValid = title.trim() !== '' && assignedTo.length > 0;

    return (
        <div className="flex-1 flex flex-col p-6 bg-white min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest">Nova Missão</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-6 overflow-y-auto pb-12">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Título da Missão</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Ler 10 páginas de um livro"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-sky-500"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Área de Conhecimento</label>
                    <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${category === cat.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' : 'bg-white border-slate-100 text-slate-400'}`}
                            >
                                <span className={`material-symbols-outlined ${category === cat.id ? 'text-white' : 'text-slate-300'}`}>{cat.icon}</span>
                                <span className="text-[10px] font-black uppercase">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Frequência</label>
                        <div className="flex bg-white p-1 rounded-2xl border border-slate-100">
                            {(['once', 'daily', 'custom'] as TaskFrequency[]).map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setFrequency(f)}
                                    className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${frequency === f ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400'}`}
                                >
                                    {f === 'once' ? 'Única' : f === 'daily' ? 'Diária' : 'Custom'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {frequency === 'custom' && (
                        <div className="animate-pop-in">
                            <input 
                                type="text" 
                                value={recurrenceText}
                                onChange={(e) => setRecurrenceText(e.target.value)}
                                placeholder="Ex: A cada 15 dias"
                                className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Recompensa</label>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    value={reward}
                                    onChange={(e) => setReward(Number(e.target.value))}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 pl-12 font-black text-amber-600 outline-none"
                                />
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 fill-1">monetization_on</span>
                            </div>
                            <div className="bg-white px-4 py-4 rounded-2xl border-2 border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] font-black text-blue-500">+{reward * 2}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase">XP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Designar Heróis</label>
                    <div className="flex flex-wrap gap-4 px-2">
                        {members.map(member => {
                            const isSelected = assignedTo.includes(member.id);
                            return (
                                <button
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className={`relative w-16 h-16 rounded-full border-4 transition-all ${isSelected ? 'border-sky-500 scale-110 shadow-lg' : 'border-slate-50 opacity-40 grayscale'}`}>
                                        <img src={member.avatar} className="w-full h-full object-cover rounded-full" />
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-sky-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                <span className="material-symbols-outlined text-[12px] font-black">check</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>{member.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button 
                    disabled={!isFormValid}
                    onClick={() => onAdd({ 
                        title, 
                        reward, 
                        xp: reward * 2, 
                        icon: CATEGORIES.find(c => c.id === category)?.icon || 'task', 
                        frequency, 
                        category, 
                        assignedTo,
                        recurrenceText: frequency === 'custom' ? recurrenceText : undefined
                    })}
                    className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[0_8px_0_0_#000] active-press disabled:opacity-50 mt-4 uppercase tracking-widest transition-all"
                >
                    Forjar Missão ⚡
                </button>
            </main>
        </div>
    );
};

export default AddTask;
