
import React from 'react';
import { Dream, Member, DreamStep } from '../types';

interface Props {
    member: Member;
    onSelectDream: (id: string) => void;
    onBack: () => void;
}

const JourneyPath: React.FC<Props> = ({ member, onSelectDream, onBack }) => {
    // Pegamos o primeiro sonho ativo para mostrar a trilha detalhada dele
    const activeDream = member.dreams.find(d => d.status === 'active');
    
    // Passos reais vindos do banco
    const steps: DreamStep[] = activeDream?.steps || [];

    return (
        <div className="flex-1 flex flex-col bg-sky-50 min-h-screen pb-32 overflow-y-auto">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-100 p-6 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-sm">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Caminho do Herói</h1>
                    <h2 className="text-sm font-black text-slate-800 uppercase truncate max-w-[150px]">
                        {activeDream?.title || 'Buscando Sonho...'}
                    </h2>
                </div>
                <div className="flex items-center gap-2 bg-amber-400 px-3 py-1.5 rounded-full shadow-md border-2 border-white">
                    <span className="material-symbols-outlined text-white text-xs fill-1">monetization_on</span>
                    <span className="text-xs font-black text-white">{member.coins}</span>
                </div>
            </header>

            <main className="flex-1 relative" style={{ minHeight: '1000px' }}>
                {steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 text-slate-400 opacity-50 px-12 text-center gap-4">
                        <span className="material-symbols-outlined text-6xl">map</span>
                        <p className="text-xs font-black uppercase tracking-widest">Seus pais ainda estão forjando o mapa da sua jornada!</p>
                    </div>
                ) : (
                    <div className="w-full relative h-full">
                        {/* Linha Sinuosa Conectora */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                            {steps.length > 1 && steps.map((step, i) => {
                                if (i === 0) return null;
                                const prev = steps[i - 1];
                                const x1 = `${prev.xPos}%`;
                                const y1 = prev.yPos + 40;
                                const x2 = `${step.xPos}%`;
                                const y2 = step.yPos + 40;
                                
                                return (
                                    <path 
                                        key={`line-${i}`}
                                        d={`M ${x1} ${y1} Q ${parseFloat(x1)+10}% ${y1+50} ${x2} ${y2}`}
                                        fill="none" 
                                        stroke="#38bdf8" 
                                        strokeWidth="8" 
                                        strokeLinecap="round" 
                                        strokeDasharray="1, 15"
                                    />
                                );
                            })}
                        </svg>

                        {/* Renderização dos Nodos Customizados */}
                        {steps.map((step, index) => {
                            const isLocked = index > 0 && !steps[index - 1].isCompleted;
                            
                            return (
                                <div 
                                    key={step.id} 
                                    className="absolute flex flex-col items-center animate-pop-in"
                                    style={{ 
                                        left: `${step.xPos}%`, 
                                        top: `${step.yPos}px`, 
                                        transform: 'translate(-50%, -50%)',
                                        animationDelay: `${index * 150}ms` 
                                    }}
                                >
                                    <button 
                                        disabled={isLocked}
                                        onClick={() => activeDream && onSelectDream(activeDream.id)}
                                        className={`
                                            relative w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-300
                                            ${step.isCompleted ? 'bg-emerald-500 shadow-[0_6px_0_0_#059669]' : isLocked ? 'bg-slate-300 shadow-[0_6px_0_0_#94a3b8]' : 'bg-sky-500 shadow-[0_6px_0_0_#0369a1] active:translate-y-1 active:shadow-none'}
                                        `}
                                    >
                                        <span className={`material-symbols-outlined text-2xl text-white ${step.isCompleted ? 'fill-1' : ''}`}>
                                            {step.isCompleted ? 'check_circle' : isLocked ? 'lock' : step.icon}
                                        </span>
                                        
                                        {!isLocked && !step.isCompleted && (
                                            <div className="absolute -top-3 -right-3 bg-amber-400 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                                                +{step.xpReward} XP
                                            </div>
                                        )}
                                    </button>
                                    
                                    <div className="mt-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-sky-100 shadow-sm max-w-[120px]">
                                        <p className={`text-[8px] font-black uppercase tracking-tighter text-center leading-none ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Baú de Recompensa Final - Posicionado abaixo do último nodo */}
                        {steps.length > 0 && (
                            <div 
                                className="absolute flex flex-col items-center animate-float"
                                style={{ 
                                    left: `${steps[steps.length - 1].xPos}%`, 
                                    top: `${steps[steps.length - 1].yPos + 150}px`,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                <button 
                                    className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] shadow-[0_10px_0_0_#d97706] flex items-center justify-center border-4 border-white/20 active:translate-y-1 active:shadow-none transition-all"
                                >
                                    <span className="material-symbols-outlined text-white text-4xl fill-1 drop-shadow-lg">redeem</span>
                                </button>
                                <p className="text-center mt-4 font-black text-amber-600 uppercase text-[9px] tracking-[0.2em]">Meta Final</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default JourneyPath;
