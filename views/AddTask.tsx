
import React, { useState } from 'react';
import { Task } from '../types';

interface Props {
    onAdd: (task: Omit<Task, 'id' | 'status'>) => void;
    onBack: () => void;
}

const ICONS = ['cleaning_services', 'menu_book', 'restaurant', 'category', 'pets', 'eco', 'brush', 'sports_soccer'];

const AddTask: React.FC<Props> = ({ onAdd, onBack }) => {
    const [title, setTitle] = useState('');
    const [reward, setReward] = useState(20);
    const [icon, setIcon] = useState('cleaning_services');

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-800 text-center flex-1">Nova Missão</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">O que fazer?</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Arrumar brinquedos"
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-[#2b8cee]"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Valor da Recompensa</label>
                    <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border-2 border-slate-100">
                        <input 
                            type="range" 
                            min="5" 
                            max="200" 
                            step="5"
                            value={reward}
                            onChange={(e) => setReward(Number(e.target.value))}
                            className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2b8cee]"
                        />
                        <div className="bg-amber-100 px-4 py-2 rounded-xl flex items-center gap-1 border border-amber-200">
                            <span className="material-symbols-outlined text-amber-500 text-sm fill-1">monetization_on</span>
                            <span className="font-black text-amber-600">{reward}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Escolha um Ícone</label>
                    <div className="grid grid-cols-4 gap-3">
                        {ICONS.map(i => (
                            <button 
                                key={i}
                                onClick={() => setIcon(i)}
                                className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${icon === i ? 'bg-[#2b8cee] text-white shadow-lg scale-110' : 'bg-white text-slate-400 border border-slate-100'}`}
                            >
                                <span className="material-symbols-outlined">{i}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    disabled={!title}
                    // Fix: Added assignedTo: [] to match Omit<Task, 'id' | 'status'>
                    onClick={() => onAdd({ title, reward, xp: reward * 2, icon, assignedTo: [] })}
                    className="w-full bg-[#2b8cee] text-white py-5 rounded-3xl font-black text-xl shadow-[0_6px_0_0_#1a6ac4] active-press disabled:opacity-50 mt-8"
                >
                    CRIAR MISSÃO 🚀
                </button>
            </main>
        </div>
    );
};

export default AddTask;
