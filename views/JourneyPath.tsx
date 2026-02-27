
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
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800 overflow-hidden relative font-sans">
            {/* Fundo Claro e Divertido */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-sky-100/50 via-slate-50 to-white"></div>
                
                {/* Manchas Decorativas */}
                <div className="absolute top-[10%] left-[-5%] w-64 h-64 bg-sky-300/20 blur-[80px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-80 h-80 bg-emerald-300/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-5 flex items-center justify-between shadow-sm">
                <button onClick={onBack} className="w-10 h-10 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-slate-200">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center flex-1 px-4">
                    <h1 className="text-[8px] font-black text-sky-500 uppercase tracking-[0.3em] mb-0.5">Mapa dos Sonhos</h1>
                    <h2 className="text-xs font-black text-slate-800 uppercase truncate">
                        {activeDream?.title || 'Explorando...'}
                    </h2>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                    <span className="material-symbols-outlined text-amber-500 text-xs fill-1">monetization_on</span>
                    <span className="text-xs font-black text-amber-600">{member.coins}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto relative scroll-smooth custom-scrollbar">
                {steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 px-12 text-center gap-6 animate-pop-in">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center shadow-inner border border-slate-200">
                            <span className="material-symbols-outlined text-5xl text-slate-300">map</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed text-slate-500">
                            O Mestre está conjurando<br/>este mapa lendário...
                        </p>
                    </div>
                ) : (
                    <div className="relative min-h-[1500px] py-20 w-full">
                        {/* SVG de Conexão Dinâmico */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            <defs>
                                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.2" />
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
                                            <div className="absolute inset-0 bg-sky-200/50 blur-2xl rounded-full animate-ping"></div>
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
                                                relative w-20 h-20 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 z-10 border-4
                                                ${step.isCompleted 
                                                    ? 'bg-emerald-500 border-emerald-600 shadow-[0_8px_0_0_#059669] scale-95' 
                                                    : isLocked 
                                                        ? 'bg-slate-200 border-slate-300 text-slate-400 shadow-[0_8px_0_0_#cbd5e1] opacity-70 grayscale' 
                                                        : 'bg-sky-400 border-sky-500 text-white shadow-[0_8px_0_0_#0284c7] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_0px_0_0_#0284c7]'}
                                            `}
                                        >
                                            <span className={`material-symbols-outlined text-3xl ${step.isCompleted ? 'text-white fill-1' : isLocked ? 'text-slate-400' : 'text-white'}`}>
                                                {step.isCompleted ? 'check' : isLocked ? 'lock' : step.icon}
                                            </span>
                                            
                                            {/* Recompensas Flutuantes */}
                                            {!isLocked && !step.isCompleted && (
                                                <div className="absolute -top-6 -right-6 flex flex-col gap-1 items-end z-30">
                                                    <div className="bg-amber-400 text-white text-[8px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow-md animate-bounce">
                                                        +{step.xpReward} XP
                                                    </div>
                                                    {step.coinReward > 0 && (
                                                        <div className="bg-emerald-400 text-white text-[8px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow-md animate-bounce" style={{ animationDelay: '200ms' }}>
                                                            +{step.coinReward} 🪙
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                    
                                    {/* Rótulo da Missão */}
                                    <div className={`
                                        mt-6 px-4 py-2 rounded-2xl border shadow-sm transition-all
                                        ${step.isCompleted ? 'bg-emerald-50 border-emerald-200' : isLocked ? 'bg-slate-100 border-slate-200' : 'bg-white border-sky-200 shadow-sky-100'}
                                    `}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest text-center leading-none ${step.isCompleted ? 'text-emerald-700' : isLocked ? 'text-slate-500' : 'text-sky-600'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Bandeira Final */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-60">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-dashed border-slate-300 shadow-sm">
                                <span className="material-symbols-outlined text-slate-400 text-3xl">flag</span>
                            </div>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">O Destino Final</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default JourneyPath;
