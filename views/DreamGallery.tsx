
import React from 'react';
import { Dream } from '../types';

interface Props {
    dreams: Dream[];
    onSelect: (id: string) => void;
    onAdd: () => void;
    onBack: () => void;
}

const DreamGallery: React.FC<Props> = ({ dreams, onSelect, onAdd, onBack }) => {
    return (
        <div className="flex-1 flex flex-col p-6 pb-24">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Cofre de Metas</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6">
                    {dreams.map(dream => {
                        const progress = Math.round((dream.currentAmount / dream.targetAmount) * 100);
                        const isPending = dream.status === 'proposal';
                        
                        return (
                            <button 
                                key={dream.id}
                                onClick={() => onSelect(dream.id)}
                                className={`bg-white rounded-[2rem] p-5 shadow-xl border-2 flex gap-4 text-left group active:scale-[0.98] transition-all relative overflow-hidden ${isPending ? 'border-dashed border-slate-200' : 'border-white'}`}
                            >
                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:bg-blue-50 transition-colors ${isPending ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-[#2b8cee]'}`}>
                                    <span className="material-symbols-outlined text-4xl fill-1">{dream.icon}</span>
                                </div>
                                
                                <div className="flex-1 py-1">
                                    <h3 className={`font-black text-lg mb-1 ${isPending ? 'text-slate-400' : 'text-slate-800'}`}>{dream.title}</h3>
                                    
                                    {isPending ? (
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-400 text-xs animate-pulse">hourglass_top</span>
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Aguardando Mestre</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1 mb-3">
                                                <span className="material-symbols-outlined text-amber-500 text-xs fill-1">monetization_on</span>
                                                <span className="text-xs font-black text-slate-500">{dream.currentAmount} / {dream.targetAmount}</span>
                                            </div>
                                            
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {!isPending && progress >= 100 && (
                                    <div className="absolute top-2 right-2 bg-amber-400 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-bounce">
                                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    <button 
                        onClick={onAdd}
                        className="w-full py-8 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#2b8cee] hover:text-[#2b8cee] transition-all bg-white/30"
                    >
                        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </div>
                        <span className="font-black uppercase tracking-widest text-xs">Novo Sonho</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default DreamGallery;
