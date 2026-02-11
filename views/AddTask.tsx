
import React, { useState } from 'react';
import { Task, Member, TaskFrequency, TaskCategory } from '../types';

interface Props {
    members: Member[];
    onAdd: (task: Omit<Task, 'id' | 'status'>) => void;
    onBack: () => void;
}

const CATEGORIES: { id: TaskCategory, icon: string, label: string }[] = [
    { id: 'chore', icon: 'cleaning_services', label: 'Casa' },
    { id: 'study', icon: 'menu_book', label: 'Estudo' },
    { id: 'health', icon: 'health_and_safety', label: 'Saúde' },
    { id: 'fitness', icon: 'sports_soccer', label: 'Esporte' }
];

const ICONS = ['cleaning_services', 'menu_book', 'restaurant', 'category', 'pets', 'eco', 'brush', 'sports_soccer', 'calculate', 'history_edu', 'translate'];

const AddTask: React.FC<Props> = ({ members, onAdd, onBack }) => {
    const [title, setTitle] = useState('');
    const [reward, setReward] = useState(20);
    const [icon, setIcon] = useState('cleaning_services');
    const [frequency, setFrequency] = useState<TaskFrequency>('once');
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
                <button onClick={onBack} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700">
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
                        placeholder="Ex: Resolver 10 contas de somar"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-sky-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Frequência</label>
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            <button 
                                onClick={() => setFrequency('once')}
                                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${frequency === 'once' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400'}`}
                            >Única</button>
                            <button 
                                onClick={() => setFrequency('daily')}
                                className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${frequency === 'daily' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                            >Diária</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Moedas</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={reward}
                                onChange={(e) => setReward(Number(e.target.value))}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 font-black text-amber-600 outline-none"
                            />
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 text-sm fill-1">monetization_on</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria</label>
                    <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${category === cat.id ? 'bg-sky-500 border-sky-400 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                            >
                                <span className="material-symbols-outlined text-xl mb-1">{cat.icon}</span>
                                <span className="text-[8px] font-black uppercase">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quem vai realizar?</label>
                    <div className="flex flex-wrap gap-4 px-2">
                        {members.map(member => {
                            const isSelected = assignedTo.includes(member.id);
                            return (
                                <button
                                    key={member.id}
                                    onClick={() => toggleMember(member.id)}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className={`relative w-14 h-14 rounded-full border-4 transition-all ${isSelected ? 'border-sky-500 scale-110' : 'border-slate-50 opacity-40 grayscale'}`}>
                                        <img src={member.avatar} className="w-full h-full object-cover rounded-full" />
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-sky-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                                <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>{member.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button 
                    disabled={!isFormValid}
                    onClick={() => onAdd({ title, reward, xp: reward * 2, icon, frequency, category, assignedTo })}
                    className="w-full bg-sky-500 text-white py-5 rounded-3xl font-black text-lg shadow-[0_6px_0_0_#0369a1] active-press disabled:opacity-50 mt-4 uppercase tracking-widest"
                >
                    Publicar Missão 🚀
                </button>
            </main>
        </div>
    );
};
