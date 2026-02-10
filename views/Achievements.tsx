
import React from 'react';
import { Achievement } from '../types';

interface Props {
    achievements: Achievement[];
    onBack: () => void;
}

const Achievements: React.FC<Props> = ({ achievements, onBack }) => {
    return (
        <div className="flex-1 flex flex-col p-6 bg-[#f8fafc] min-h-screen">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Minhas Medalhas</h1>
                <div className="w-12 h-12"></div>
            </header>

            <div className="bg-gradient-to-br from-amber-400/20 to-amber-500/10 rounded-[2.5rem] p-6 mb-10 border-2 border-amber-200/50 flex items-center gap-5 shadow-inner">
                <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center text-white shadow-lg shrink-0 rotate-3 border-4 border-white">
                    <span className="material-symbols-outlined text-4xl fill-1">emoji_events</span>
                </div>
                <div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight">Quase lá!</h3>
                    <p className="text-xs text-slate-600 font-bold leading-snug">Conclua mais 2 missões para desbloquear o ranking de elite!</p>
                </div>
            </div>

            <main className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto pb-12">
                {achievements.map((ach, index) => (
                    <div 
                        key={ach.id}
                        className={`flex flex-col items-center p-8 rounded-[3.5rem] bg-white border-4 transition-all relative overflow-hidden group animate-pop-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Brilho de fundo para conquistadas */}
                        {ach.earned && (
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none"></div>
                        )}

                        <div className={`relative w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${
                            ach.earned 
                                ? 'bg-gradient-to-tr from-amber-100 to-amber-50 shadow-xl shadow-amber-100/50 border-4 border-amber-200' 
                                : 'bg-slate-50 border-4 border-slate-100'
                        }`}>
                            {/* Ícone Gigante */}
                            <span className={`material-symbols-outlined text-6xl transition-all ${
                                ach.earned 
                                    ? 'text-amber-500 fill-1 drop-shadow-md animate-float' 
                                    : 'text-slate-200'
                            }`}>
                                {ach.icon}
                            </span>
                            
                            {/* Selo de Verificado em destaque */}
                            {ach.earned && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-sm font-black">check</span>
                                </div>
                            )}

                            {/* Ícone de Cadeado para bloqueadas */}
                            {!ach.earned && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/40 rounded-full backdrop-blur-[1px]">
                                    <span className="material-symbols-outlined text-slate-300 text-3xl">lock</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-center relative z-10">
                            <h3 className={`font-black text-xs mb-2 uppercase tracking-[0.15em] transition-colors ${
                                ach.earned ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                                {ach.title}
                            </h3>
                            
                            <p className={`text-[10px] leading-relaxed font-bold italic transition-colors px-2 ${
                                ach.earned ? 'text-slate-500' : 'text-slate-300'
                            }`}>
                                "{ach.description}"
                            </p>
                        </div>

                        {/* Indicador de Status Inferior */}
                        <div className="mt-6 flex items-center gap-2">
                            {ach.earned ? (
                                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    Conquistada
                                </div>
                            ) : (
                                <div className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200/50">
                                    Bloqueada
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default Achievements;
