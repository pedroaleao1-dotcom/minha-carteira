
import React, { useState, useEffect } from 'react';
import { Dream } from '../types';
import { getMasterTip } from '../services/gemini';

interface Props {
    dream: Dream;
    coins: number;
    onAddCoins: (amount: number) => void;
    onBack: () => void;
}

const DreamDetails: React.FC<Props> = ({ dream, coins, onAddCoins, onBack }) => {
    const [tip, setTip] = useState<string>("Carregando dica do Mestre...");
    const progressPercent = Math.round((dream.currentAmount / dream.targetAmount) * 100);
    const missing = dream.targetAmount - dream.currentAmount;

    useEffect(() => {
        getMasterTip(`Economizando para um objetivo: ${dream.title}`).then(setTip);
    }, [dream.title]);

    const handleAdd = () => {
        const amount = Math.min(10, coins);
        if (amount > 0) onAddCoins(amount);
    };

    return (
        <div className="flex-1 flex flex-col p-6">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Detalhes do Sonho</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="flex-1 flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[280px] mb-8 group">
                    <div className="absolute inset-0 bg-white rounded-[4rem] shadow-2xl overflow-hidden border-8 border-white p-4">
                        <div className="relative w-full h-full bg-slate-50 rounded-[3rem] overflow-hidden flex items-center justify-center">
                            <span className="material-symbols-outlined text-[120px] text-slate-200 fill-1 absolute">{dream.icon}</span>
                            
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-emerald-400 transition-all duration-1000 flex items-center justify-center overflow-hidden"
                                style={{ height: `${progressPercent}%` }}
                            >
                                <span className="material-symbols-outlined text-[120px] text-white/50 fill-1">{dream.icon}</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white font-black px-5 py-2 rounded-full shadow-lg border-4 border-white animate-bounce">
                        {progressPercent}%
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-800 text-center mb-2">{dream.title}</h2>
                <div className="bg-white rounded-full px-6 py-2 shadow-sm border border-slate-100 mb-8">
                    {missing > 0 ? (
                        <p className="text-slate-500 font-bold text-sm">Faltam <span className="text-emerald-500 font-black">{missing} moedas</span>!</p>
                    ) : (
                        <p className="text-emerald-500 font-black text-sm uppercase tracking-widest">Sonho Conquistado! 🏆</p>
                    )}
                </div>

                <div className="w-full bg-[#ffd900]/10 border-2 border-[#ffd900]/20 rounded-[2.5rem] p-6 mb-8 relative overflow-hidden">
                    <div className="flex gap-4 items-start relative z-10">
                        <div className="w-12 h-12 bg-[#ffd900] rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-6">
                            <span className="material-symbols-outlined text-white">auto_awesome</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[#ffd900] uppercase tracking-widest mb-1">Mestre dos Sonhos diz:</p>
                            <p className="text-slate-700 font-bold leading-snug italic">"{tip}"</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto w-full space-y-4 flex flex-col items-center">
                    <button 
                        disabled={coins === 0 || progressPercent >= 100}
                        onClick={handleAdd}
                        className={`w-full py-6 rounded-full text-white font-black text-xl flex items-center justify-center gap-3 transition-all ${coins > 0 && progressPercent < 100 ? 'bg-amber-400 chunky-shadow-yellow active-press' : 'bg-slate-200 cursor-not-allowed text-slate-400'}`}
                    >
                        <span className="text-2xl">💰</span> PÔR 10 MOEDAS
                    </button>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sua Carteira: {coins} moedas</p>
                </div>
            </main>
        </div>
    );
};

export default DreamDetails;
