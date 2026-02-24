
import React, { useState, useRef } from 'react';
import { Dream, DreamStep, JourneyTemplate } from '../types';

interface Props {
    dream?: Dream;
    template?: JourneyTemplate;
    onSave: (steps: DreamStep[], title?: string) => void;
    onBack: () => void;
}

const STEP_ICONS = ['star', 'bolt', 'auto_awesome', 'menu_book', 'sports_esports', 'pets', 'rocket_launch', 'celebration', 'diamond', 'castle', 'map', 'shield'];

const MapEditor: React.FC<Props> = ({ dream, template, onSave, onBack }) => {
    const [steps, setSteps] = useState<DreamStep[]>(template?.steps || dream?.steps || []);
    const [title, setTitle] = useState(template?.title || dream?.title || '');
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

        if (selectedStepId) {
            // Se tem um passo selecionado, move ele para o novo clique
            updateStep(selectedStepId, { xPos: x, yPos: y });
        } else {
            // Se não tem nada selecionado, cria um novo passo
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
        <div className="flex-1 flex flex-col bg-slate-950 min-h-screen text-white overflow-hidden">
            <header className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-900/90 backdrop-blur-md z-50">
                <button onClick={onBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex-1 mx-4">
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent border-b border-white/10 text-center font-black uppercase text-amber-500 tracking-widest text-sm outline-none focus:border-amber-500 w-full"
                        placeholder="Nome do Reino"
                    />
                </div>
                <button 
                    onClick={() => onSave(steps, title)}
                    className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    Salvar
                </button>
            </header>

            <div className="flex-1 relative flex flex-col">
                {/* Dica de Uso */}
                <div className="absolute top-4 left-0 right-0 z-20 pointer-events-none flex justify-center">
                    <p className="bg-amber-500/20 backdrop-blur-md text-amber-500 border border-amber-500/30 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                        {selectedStepId ? "Toque no mapa para MOVER o passo" : "Toque no mapa para CRIAR um passo"}
                    </p>
                </div>

                {/* Canvas do Mapa */}
                <div 
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="flex-1 relative cursor-crosshair overflow-hidden bg-slate-950"
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '10% 10%'
                    }}
                >
                    {/* Linhas Conectoras */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {steps.length > 1 && steps.sort((a,b) => a.orderIndex - b.orderIndex).map((step, i) => {
                            if (i === 0) return null;
                            const prev = steps[i - 1];
                            return (
                                <line 
                                    key={`line-${i}`}
                                    x1={`${prev.xPos}%`} y1={`${prev.yPos}%`}
                                    x2={`${step.xPos}%`} y2={`${step.yPos}%`}
                                    stroke="rgba(251, 191, 36, 0.15)"
                                    strokeWidth="3"
                                    strokeDasharray="10,10"
                                />
                            );
                        })}
                    </svg>

                    {/* Passos */}
                    {steps.map((step) => (
                        <div 
                            key={step.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform ${selectedStepId === step.id ? 'z-40 scale-125' : 'z-10'}`}
                            style={{ left: `${step.xPos}%`, top: `${step.yPos}%` }}
                            onClick={(e) => { e.stopPropagation(); setSelectedStepId(step.id); }}
                        >
                            <div className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border-4 transition-all
                                ${selectedStepId === step.id ? 'bg-amber-500 border-white' : 'bg-slate-800 border-slate-700/50'}
                            `}>
                                <span className={`material-symbols-outlined text-2xl ${selectedStepId === step.id ? 'text-slate-950' : 'text-slate-500'}`}>
                                    {step.icon}
                                </span>
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter border border-white/5">
                                {step.title}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Painel de Edição (Somente se selecionado) */}
                {selectedStep && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 p-6 rounded-t-[2.5rem] shadow-2xl z-50 animate-pop-in">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Passo #{selectedStep.orderIndex + 1}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => removeStep(selectedStep.id)} className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                    <button onClick={() => setSelectedStepId(null)} className="w-8 h-8 bg-white/5 text-slate-400 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                            </div>
                            
                            <input 
                                type="text"
                                value={selectedStep.title}
                                onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                                className="w-full bg-slate-800 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none focus:border-amber-500"
                                placeholder="O que fazer aqui?"
                            />

                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Mudar Ícone</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {STEP_ICONS.map(i => (
                                        <button 
                                            key={i}
                                            onClick={() => updateStep(selectedStep.id, { icon: i })}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${selectedStep.icon === i ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">{i}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedStepId(null)}
                                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all"
                            >
                                Confirmar Posição
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapEditor;
