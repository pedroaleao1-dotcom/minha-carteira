
import React from 'react';
import { Dream, Member, DreamStep } from '../types';

interface Props {
    member: Member;
    selectedDreamId?: string;
    onSelectDream: (id: string) => void;
    onCompleteStep: (dreamId: string, stepId: string) => void;
    onBack: () => void;
}

const JourneyPath: React.FC<Props> = ({ member, selectedDreamId, onSelectDream, onCompleteStep, onBack }) => {
    const activeDream = member.dreams.find(d => d.id === selectedDreamId) || member.dreams.find(d => d.status === 'active');
    const steps: DreamStep[] = [...(activeDream?.steps || [])].sort((a, b) => a.orderIndex - b.orderIndex);

    return (
        <div className="flex-1 flex flex-col bg-[#0f172a] min-h-screen overflow-hidden relative">
            {/* Fundo de Mundo Mágico */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/50 via-slate-900 to-slate-950"></div>
                
                {/* Nebulosas Decorativas */}
                <div className="absolute top-[20%] left-[-10%] w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <header className="relative z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between shadow-2xl">
                <button onClick={onBack} className="w-10 h-10 bg-white/5 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all border border-white/10">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center flex-1 px-4">
                    <h1 className="text-[8px] font-black text-sky-400 uppercase tracking-[0.3em] mb-0.5">Mapa dos Sonhos</h1>
                    <h2 className="text-xs font-black text-white uppercase truncate">
                        {activeDream?.title || 'Explorando...'}
                    </h2>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-amber-400 text-xs fill-1">monetization_on</span>
                    <span className="text-xs font-black text-white">{member.coins}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto relative scroll-smooth custom-scrollbar">
                {steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 px-12 text-center gap-6 animate-pop-in">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center shadow-inner">
                            <span className="material-symbols-outlined text-5xl opacity-20">map</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                            O Mestre está conjurando<br/>este mapa lendário...
                        </p>
                    </div>
                ) : (
                    <div className="relative min-h-[1500px] py-20 w-full">
                        {/* SVG de Conexão Dinâmico */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
                                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                            {steps.map((step, i) => {
                                if (i === 0) return null;
                                const prev = steps[i - 1];
                                
                                return (
                                    <path 
                                        key={`path-${i}`}
                                        d={`M ${prev.xPos}% ${prev.yPos}% L ${step.xPos}% ${step.yPos}%`}
                                        stroke="url(#pathGradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray="1, 20"
                                        className="animate-pulse"
                                    />
                                );
                            })}
                        </svg>

                        {/* Nodos da Jornada */}
                        {steps.map((step, index) => {
                            const isLocked = index > 0 && !steps[index - 1].isCompleted;
                            const isNext = index === 0 || (steps[index-1].isCompleted && !step.isCompleted);
                            
                            return (
                                <div 
                                    key={step.id} 
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pop-in z-20"
                                    style={{ 
                                        left: `${step.xPos}%`, 
                                        top: `${step.yPos}%`,
                                        animationDelay: `${index * 150}ms` 
                                    }}
                                >
                                    <div className="relative">
                                        {/* Brilho de Próxima Missão */}
                                        {isNext && (
                                            <div className="absolute inset-0 bg-sky-400/30 blur-2xl rounded-full animate-ping"></div>
                                        )}

                                        <button 
                                            disabled={isLocked}
                                            onClick={() => {
                                                if (step.isCompleted) {
                                                    activeDream && onSelectDream(activeDream.id);
                                                } else {
                                                    activeDream && onCompleteStep(activeDream.id, step.id);
                                                }
                                            }}
                                            className={`
                                                relative w-20 h-20 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 z-10
                                                ${step.isCompleted 
                                                    ? 'bg-emerald-500 shadow-[0_10px_0_0_#065f46] scale-90' 
                                                    : isLocked 
                                                        ? 'bg-slate-800 shadow-[0_10px_0_0_#0f172a] opacity-60 grayscale' 
                                                        : 'bg-sky-500 shadow-[0_10px_0_0_#0369a1] hover:-translate-y-1 active:translate-y-1 active:shadow-none'}
                                            `}
                                        >
                                            <span className={`material-symbols-outlined text-3xl text-white ${step.isCompleted ? 'fill-1' : ''}`}>
                                                {step.isCompleted ? 'check' : isLocked ? 'lock' : step.icon}
                                            </span>
                                            
                                            {/* Recompensas Flutuantes */}
                                            {!isLocked && !step.isCompleted && (
                                                <div className="absolute -top-6 -right-6 flex flex-col gap-1 items-end z-30">
                                                    <div className="bg-amber-400 text-white text-[8px] font-black px-2.5 py-1 rounded-full border-2 border-slate-950 shadow-xl animate-bounce">
                                                        +{step.xpReward} XP
                                                    </div>
                                                    {step.coinReward > 0 && (
                                                        <div className="bg-emerald-400 text-white text-[8px] font-black px-2.5 py-1 rounded-full border-2 border-slate-950 shadow-xl animate-bounce" style={{ animationDelay: '200ms' }}>
                                                            +{step.coinReward} 🪙
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {/* Rótulo da Missão */}
                                    <div className={`
                                        mt-6 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-xl transition-all
                                        ${step.isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : isLocked ? 'bg-slate-900/40 border-white/5' : 'bg-sky-500/10 border-sky-500/20'}
                                    `}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest text-center leading-none ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Bandeira Final */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-dashed border-slate-700">
                                <span className="material-symbols-outlined text-slate-600 text-3xl">flag</span>
                            </div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">O Destino Final</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default JourneyPath;
