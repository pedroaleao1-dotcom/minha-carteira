
import React, { useState } from 'react';
import { StoreItem, Member } from '../types';

interface Props {
    members: Member[];
    onAdd: (item: Omit<StoreItem, 'id'>) => void;
    onBack: () => void;
}

const ICONS = ['sports_esports', 'restaurant', 'icecream', 'bedtime', 'attractions', 'movie', 'park', 'celebration'];
const COLORS = [
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Blue', class: 'bg-blue-600' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Emerald', class: 'bg-emerald-500' },
    { name: 'Amber', class: 'bg-amber-500' },
];

const AddStoreItem: React.FC<Props> = ({ members, onAdd, onBack }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(50);
    const [icon, setIcon] = useState('sports_esports');
    const [color, setColor] = useState('bg-indigo-500');
    const [assignedTo, setAssignedTo] = useState<string[]>([]);

    const children = members.filter(m => m.role === 'child');

    const toggleMember = (id: string) => {
        setAssignedTo(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const isFormValid = title.trim() !== '' && assignedTo.length > 0;

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-800 text-center flex-1">Novo Prêmio</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-8 overflow-y-auto pb-12">
                {/* Nome e Preço */}
                <div className="space-y-6 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do Prêmio</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: 15 min extras de TV"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Preço (Moedas)</label>
                        <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
                            <input 
                                type="range" min="10" max="500" step="10"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="bg-amber-100 px-4 py-2 rounded-xl flex items-center gap-1 border border-amber-200 shadow-sm">
                                <span className="material-symbols-outlined text-amber-500 text-sm fill-1">monetization_on</span>
                                <span className="font-black text-amber-600">{price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quem pode comprar */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Quem pode comprar? 🦸‍♂️</label>
                    <div className="flex flex-wrap gap-4 px-2">
                        {children.map(child => {
                            const isSelected = assignedTo.includes(child.id);
                            return (
                                <button
                                    key={child.id}
                                    onClick={() => toggleMember(child.id)}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={`relative w-16 h-16 rounded-full border-4 transition-all duration-300 ${isSelected ? 'border-purple-500 scale-110 shadow-lg' : 'border-white opacity-50 grayscale'}`}>
                                        <img src={child.avatar} alt={child.name} className="w-full h-full object-cover rounded-full" />
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                                <span className="material-symbols-outlined text-[14px] font-black">check</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-purple-600' : 'text-slate-400'}`}>
                                        {child.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {assignedTo.length === 0 && (
                        <p className="text-[9px] text-red-400 font-bold italic ml-2">Selecione pelo menos um herói!</p>
                    )}
                </div>

                {/* Estilo e Ícone */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cor do Card</label>
                        <div className="flex flex-wrap gap-3 px-2">
                            {COLORS.map(c => (
                                <button 
                                    key={c.class}
                                    onClick={() => setColor(c.class)}
                                    className={`w-10 h-10 rounded-2xl border-4 transition-all ${c.class} ${color === c.class ? 'border-slate-800 scale-110 shadow-lg' : 'border-white opacity-40'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Escolha o Ícone</label>
                        <div className="grid grid-cols-4 gap-3">
                            {ICONS.map(i => (
                                <button 
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`aspect-square rounded-[1.5rem] flex items-center justify-center transition-all ${icon === i ? 'bg-purple-500 text-white shadow-lg scale-110 rotate-3' : 'bg-white text-slate-300 border border-slate-100 hover:text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-2xl">{i}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button 
                    disabled={!isFormValid}
                    onClick={() => onAdd({ title, price, icon, color, assignedTo })}
                    className="w-full bg-purple-500 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-[0_8px_0_0_#7e22ce] active-press disabled:opacity-50 disabled:grayscale transition-all mt-4 flex items-center justify-center gap-3"
                >
                    <span className="material-symbols-outlined text-2xl">redeem</span>
                    SALVAR PRÊMIO 🎁
                </button>
            </main>
        </div>
    );
};

export default AddStoreItem;
