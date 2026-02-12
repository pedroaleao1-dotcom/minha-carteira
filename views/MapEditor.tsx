
import React, { useState, useRef, useEffect } from 'react';
import { Dream, DreamStep, JourneyTemplate } from '../types';

interface Props {
    dream?: Dream; // Para jornada individual
    template?: JourneyTemplate; // Para jornada global
    onSave: (steps: DreamStep[], title?: string) => void;
    onBack: () => void;
}

const STEP_ICONS = ['star', 'bolt', 'auto_awesome', 'menu_book', 'sports_esports', 'pets', 'rocket_launch', 'celebration', 'diamond'];

const MapEditor: React.FC<Props> = ({ dream, template, onSave, onBack }) => {
    const [steps, setSteps] = useState<DreamStep[]>(template?.steps || dream?.steps || []);
    const [title, setTitle] = useState(template?.title || dream?.title || '');
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        
        if (e.target === canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const y = Math.round(e.clientY - rect.top);

            const newStep: DreamStep = {
                id: Math.random().toString(36).substr(2, 9),
                title: `Passo ${steps.length + 1}`,
                isCompleted: false,
                orderIndex: steps.length,
                xpReward: 50,
                xPos: x,
                yPos: y,
                icon: 'star',
                updatedAt: Date.now()
            };
            
            setSteps([...steps, newStep]);
            setSelectedStepId(newStep.id);
        }
    };

    const updateStep = (id: string, updates: Partial<DreamStep>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeStep = (id: string) => {
        setSteps(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, orderIndex: i })));
        setSelectedStepId(null);
    };

    const selectedStep = steps.find(s => s.id === selectedStepId);

    return (
        <div className="flex-1 flex flex-col bg-slate-900 min-h-screen text-white">
            <header className="p-6 flex items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="text-center flex-1 mx-4">
                    {template ? (
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-b border-white/20 text-center font-black uppercase text-amber-500 tracking-widest text-xs outline-none focus:border-amber-500 w-full"
                            placeholder="Nome do Mapa Global"
                        />
                    ) : (
                        <>
                            <h1 className="text-xs font-black uppercase text-amber-500 tracking-widest">Editor de Jornada</h1>
                            <p className="text-[10px] text-slate-500 font-bold truncate max-w-[150px] mx-auto">{dream?.title}</p>
                        </>
                    )}
                </div>
                <button 
                    onClick={() => onSave(steps, title)}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    Salvar
                </button>
            </header>

            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div 
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="flex-1 bg-slate-950 grid-bg opacity-40 relative cursor-crosshair overflow-y-auto"
                    style={{ minHeight: '1500px', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {steps.length > 1 && steps.map((step, i) => {
                            if (i === 0) return null;
                            const prev = steps[i - 1];
                            const x1 = `${prev.xPos}%`;
                            const y1 = prev.yPos + 40;
                            const x2 = `${step.xPos}%`;
                            const y2 = step.yPos + 40;
                            
                            return (
                                <line 
                                    key={`line-${i}`}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="rgba(251, 191, 36, 0.2)"
                                    strokeWidth="4"
                                    strokeDasharray="8,8"
                                />
                            );
                        })}
                    </svg>

                    {steps.map((step) => (
                        <div 
                            key={step.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all cursor-move`}
                            style={{ left: `${step.xPos}%`, top: `${step.yPos}px` }}
                            onClick={(e) => { e.stopPropagation(); setSelectedStepId(step.id); }}
                        >
                            <div className={`
                                w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 transition-all
                                ${selectedStepId === step.id ? 'bg-amber-500 border-white scale-125 z-40' : 'bg-slate-800 border-slate-700'}
                            `}>
                                <span className={`material-symbols-outlined text-2xl ${selectedStepId === step.id ? 'text-slate-950' : 'text-slate-500'}`}>
                                    {step.icon}
                                </span>
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
                                {step.title}
                            </div>
                        </div>
                    ))}

                    <div className="absolute top-10 left-0 right-0 text-center pointer-events-none opacity-50">
                        <p className="text-[10px] text-white font-black uppercase tracking-[0.3em]">Toque no fundo para criar novos caminhos</p>
                    </div>
                </div>

                {selectedStep && (
                    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 p-6 rounded-t-[3rem] shadow-2xl z-50 animate-slide-up">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase text-amber-500">Configurar Passo #{selectedStep.orderIndex + 1}</h3>
                                <button onClick={() => removeStep(selectedStep.id)} className="text-red-400 p-2"><span className="material-symbols-outlined text-sm">delete</span></button>
                            </div>
                            
                            <input 
                                type="text"
                                value={selectedStep.title}
                                onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-amber-500"
                                placeholder="Título do Passo"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-500 uppercase ml-1">XP Recompensa</label>
                                    <input 
                                        type="number"
                                        value={selectedStep.xpReward}
                                        onChange={(e) => updateStep(selectedStep.id, { xpReward: Number(e.target.value) })}
                                        className="w-full bg-slate-800 border border-white/5 rounded-xl p-3 text-xs font-black text-blue-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Posição X (%)</label>
                                    <input 
                                        type="range" min="10" max="90"
                                        value={selectedStep.xPos}
                                        onChange={(e) => updateStep(selectedStep.id, { xPos: Number(e.target.value) })}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {STEP_ICONS.map(i => (
                                    <button 
                                        key={i}
                                        onClick={() => updateStep(selectedStep.id, { icon: i })}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${selectedStep.icon === i ? 'bg-white text-slate-950 scale-110 shadow-lg' : 'bg-slate-800 text-slate-500'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{i}</span>
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setSelectedStepId(null)}
                                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95"
                            >
                                Confirmar Passo
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MapEditor;
