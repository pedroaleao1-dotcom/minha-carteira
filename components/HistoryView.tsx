
import React from 'react';
import { Transaction } from '../types';

interface Props {
    title: string;
    icon: string;
    colorClass: string; // e.g., 'amber' for gold, 'sky' for XP
    transactions: Transaction[];
    onBack: () => void;
    balance: number;
    balanceLabel: string;
    tip?: string;
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const HistoryView: React.FC<Props> = React.memo(({ 
    title, 
    icon, 
    colorClass, 
    transactions, 
    onBack, 
    balance, 
    balanceLabel,
    tip 
}) => {
    const bgGradient = `bg-gradient-to-b from-${colorClass}-400 to-${colorClass}-500`;
    const iconColor = `text-${colorClass}-500`;
    const borderColor = `border-${colorClass}-100`;
    const tipBg = `bg-${colorClass}-400`;
    const tipText = `text-${colorClass}-500`;

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            {/* Header com Saldo Gigante */}
            <div className={`${bgGradient} p-8 pt-12 rounded-b-[4rem] shadow-xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
                    <span className="material-symbols-outlined text-[120px] text-white select-none">{icon}</span>
                </div>
                
                <header className="flex items-center justify-between mb-8 relative z-10">
                    <button onClick={onBack} className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md active:scale-90 transition-all border border-white/30">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-white font-black text-lg uppercase tracking-widest">{title}</h1>
                    <div className="w-12 h-12"></div>
                </header>

                <div className="flex flex-col items-center relative z-10">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-4 border-4 border-white/50 animate-pulse">
                        <span className={`material-symbols-outlined ${iconColor} text-6xl fill-1`}>{icon}</span>
                    </div>
                    <h2 className="text-6xl font-black text-white drop-shadow-lg">{balance}</h2>
                    <p className="text-white/80 font-black text-xs uppercase tracking-[0.3em] mt-2">{balanceLabel}</p>
                </div>
            </div>

            <main className="flex-1 p-6 -mt-8 relative z-20 space-y-6">
                {tip && (
                    <div className={`bg-white rounded-[2.5rem] p-6 shadow-xl border ${borderColor} flex gap-4 items-center`}>
                        <div className={`w-12 h-12 ${tipBg} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 rotate-3`}>
                            <span className="material-symbols-outlined">lightbulb</span>
                        </div>
                        <div>
                            <p className={`text-[10px] font-black ${tipText} uppercase tracking-widest`}>Dica do Mestre:</p>
                            <p className="text-slate-700 text-xs font-bold italic">"{tip}"</p>
                        </div>
                    </div>
                )}

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Histórico de Aventuras</h3>
                    <div className="space-y-3 pb-32">
                        {transactions.length > 0 ? (
                            transactions.map(tx => (
                                <div key={tx.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 group hover:scale-[1.02] transition-transform">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                                        tx.type === 'reward' ? 'bg-emerald-50 text-emerald-500' : 
                                        tx.type === 'purchase' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'
                                    }`}>
                                        <span className="material-symbols-outlined text-2xl">{tx.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{tx.title}</h4>
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                                            {formatDate(tx.timestamp)} • {tx.type === 'reward' ? 'Conquista' : tx.type === 'purchase' ? 'Prêmio' : 'Investimento'}
                                        </p>
                                    </div>
                                    <div className={`font-black text-lg ${tx.amount >= 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 opacity-30">
                                <span className="material-symbols-outlined text-6xl mb-4">history</span>
                                <p className="font-black uppercase tracking-widest text-xs">Sem Histórico</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Botão Flutuante com z-index corrigido */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-[100]">
                <div className="max-w-md mx-auto flex justify-center">
                    <div className="bg-slate-900 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md opacity-90 pointer-events-auto">
                        <span className="text-xs font-black uppercase tracking-widest">Saldo Atual:</span>
                        <div className="flex items-center gap-1">
                            <span className={`material-symbols-outlined ${iconColor.replace('text-', 'text-')} text-sm fill-1`}>{icon}</span>
                            <span className="font-black text-lg">{balance}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default HistoryView;
