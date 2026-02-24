
import React from 'react';
import { Dream, Member, DreamStep } from '../types';

interface Props {
    member: Member;
    selectedDreamId?: string;
    onSelectDream: (id: string) => void;
    onBack: () => void;
}

const JourneyPath: React.FC<Props> = ({ member, selectedDreamId, onSelectDream, onBack }) => {
    const activeDream = member.dreams.find(d => d.id === selectedDreamId) || member.dreams.find(d => d.status === 'active');
    const steps: DreamStep[] = activeDream?.steps || [];

    return (
        <div className="flex-1 flex flex-col bg-[#0f172a] min-h-screen overflow-hidden">
            {/* Atmosfera do Reino */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <header className="relative z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-6 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 bg-white/5 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Mapa do Reino</h1>
                    <h2 className="text-sm font-black text-white uppercase truncate max-w-[150px]">
                        {activeDream?.title || 'Explorando...'}
                    </h2>
                </div>
                <div className="flex items-center gap-2 bg-amber-500 px-3 py-1.5 rounded-full shadow-lg border-2 border-white/10">
                    <span className="material-symbols-outlined text-white text-xs fill-1">monetization_on</span>
                    <span className="text-xs font-black text-white">{member.coins}</span>
                </div>
            </header>

            <main className="flex-1 relative">
                {steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 px-12 text-center gap-4 animate-pop-in">
                        <span className="material-symbols-outlined text-6xl opacity-20">map</span>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            O Mestre ainda está desenhando este mapa lendário...
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full relative p-10">
                        {/* Caminho Mágico (Linhas Curvas SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {steps.length > 1 && steps.sort((a,b) => a.orderIndex - b.orderIndex).map((step, i) => {
                                if (i === 0) return null;
                                const prev = steps[i - 1];
                                // Desenha uma curva suave entre os pontos
                                const x1 = prev.xPos;
                                const y1 = prev.yPos;
                                const x2 = step.xPos;
                                const y2 = step.yPos;
                                return (
                                    <line 
                                        key={`path-${i}`}
                                        x1={`${x1}%`} y1={`${y1}%`}
                                        x2={`${x2}%`} y2={`${y2}%`}
                                        stroke="rgba(56, 189, 248, 0.2)"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray="1, 12"
                                        className="animate-pulse"
                                    />
                                );
                            })}
                        </svg>

                        {/* Nodos do Mapa */}
                        {steps.map((step, index) => {
                            const isLocked = index > 0 && !steps[index - 1].isCompleted;
                            
                            return (
                                <div 
                                    key={step.id} 
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pop-in"
                                    style={{ 
                                        left: `${step.xPos}%`, 
                                        top: `${step.yPos}%`,
                                        animationDelay: `${index * 100}ms` 
                                    }}
                                >
                                    <button 
                                        disabled={isLocked}
                                        onClick={() => activeDream && onSelectDream(activeDream.id)}
                                        className={`
                                            relative w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500
                                            ${step.isCompleted ? 'bg-emerald-500 shadow-[0_8px_0_0_#065f46]' : isLocked ? 'bg-slate-800 opacity-60' : 'bg-sky-500 shadow-[0_8px_0_0_#0369a1] active:translate-y-1 active:shadow-none'}
                                        `}
                                    >
                                        <span className={`material-symbols-outlined text-2xl text-white ${step.isCompleted ? 'fill-1' : ''}`}>
                                            {step.isCompleted ? 'check' : isLocked ? 'lock' : step.icon}
                                        </span>
                                        
                                        {!isLocked && !step.isCompleted && (
                                            <div className="absolute -top-3 -right-3 bg-amber-400 text-white text-[7px] font-black px-2 py-1 rounded-full border-2 border-slate-900 shadow-xl animate-bounce">
                                                +{step.xpReward} XP
                                            </div>
                                        )}
                                    </button>
                                    
                                    <div className="mt-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 shadow-2xl">
                                        <p className={`text-[8px] font-black uppercase tracking-tighter text-center leading-none ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default JourneyPath;
