
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Dream, DreamStep, JourneyTemplate } from '../types';

interface Props {
    dream?: Dream;
    template?: JourneyTemplate;
    onSave: (steps: DreamStep[], title?: string) => void;
    onBack: () => void;
}

const STEP_ICONS = ['star', 'bolt', 'auto_awesome', 'menu_book', 'sports_esports', 'pets', 'rocket_launch', 'celebration', 'diamond', 'castle', 'map', 'shield', 'forest', 'water', 'mountain', 'local_fire_department'];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MapEditor: React.FC<Props> = ({ dream, template, onSave, onBack }) => {
    const [steps, setSteps] = useState<DreamStep[]>(template?.steps || dream?.steps || []);
    const [title, setTitle] = useState(template?.title || dream?.title || '');
    const [theme, setTheme] = useState('');
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const generateWithAI = async () => {
        if (!title.trim()) {
            alert("Dê um nome ao Reino primeiro!");
            return;
        }
        setIsGenerating(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Create 5 adventure steps for a children's journey titled "${title}" with the theme "${theme || 'adventure'}". 
                Return a JSON array of objects with: 
                - title: short creative title (max 20 chars) in Portuguese
                - icon: one of [${STEP_ICONS.join(', ')}]
                - xpReward: number between 50 and 150
                - xPos: number 10-90 (suggest positions that form a logical path)
                - yPos: number 10-90 (suggest positions that form a logical path)
                Ensure steps follow a logical path.`,
                config: { responseMimeType: 'application/json' }
            });

            const aiSteps = JSON.parse(response.text);
            const formattedSteps: DreamStep[] = aiSteps.map((s: any, i: number) => ({
                id: Math.random().toString(36).substr(2, 9),
                ...s,
                isCompleted: false,
                orderIndex: i,
                updatedAt: Date.now()
            }));
            setSteps(formattedSteps);
            setShowAIPanel(false);
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("A magia falhou! Tente desenhar manualmente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.stopPropagation();
        setSelectedStepId(id);
        setDraggedStepId(id);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggedStepId || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate percentage and snap to 2.5% grid for precision but smoothness
        const x = Math.min(Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 40) * 2.5), 100);
        const y = Math.min(Math.max(0, Math.round(((e.clientY - rect.top) / rect.height) * 40) * 2.5), 100);

        updateStep(draggedStepId, { xPos: x, yPos: y });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (draggedStepId) {
            setDraggedStepId(null);
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (draggedStepId) return; // Don't create if we were dragging
        if (!canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 40) * 2.5;
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 40) * 2.5;

        if (!selectedStepId) {
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
        <div className="flex-1 flex flex-col bg-[#020617] min-h-screen text-white overflow-hidden font-sans">
            <header className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-50">
                <button onClick={onBack} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
                <div className="flex-1 mx-6">
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent border-b-2 border-white/5 text-center font-black uppercase text-sky-400 tracking-[0.2em] text-lg outline-none focus:border-sky-500 w-full transition-all"
                        placeholder="NOME DO REINO"
                    />
                </div>
                <div className="flex gap-3 relative">
                    <button 
                        onClick={() => setShowAIPanel(!showAIPanel)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${showAIPanel ? 'bg-pink-500 text-white border-pink-400' : 'bg-pink-500/10 text-pink-500 border-pink-500/20'}`}
                        title="Gerar com IA"
                    >
                        <span className="material-symbols-outlined fill-1">magic_button</span>
                    </button>
                    
                    {showAIPanel && (
                        <div className="absolute top-16 right-0 w-72 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-[60] animate-pop-in">
                            <h4 className="text-[10px] font-black uppercase text-pink-400 tracking-[0.2em] mb-4">Gerador de Reinos</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Tema da Aventura</label>
                                    <input 
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        placeholder="Ex: Espaço, Piratas, Doces..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-pink-500 transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={generateWithAI}
                                    disabled={isGenerating}
                                    className="w-full py-3 bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                                    )}
                                    {isGenerating ? 'Criando Magia...' : 'Gerar Passos'}
                                </button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => onSave(steps, title)}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">save</span>
                        Salvar
                    </button>
                </div>
            </header>

            <div className="flex-1 relative flex flex-col">
                {/* Dica de Uso */}
                <div className="absolute top-6 left-0 right-0 z-20 pointer-events-none flex justify-center">
                    <p className="bg-sky-500/10 backdrop-blur-md text-sky-400 border border-sky-500/20 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl">
                        {selectedStepId ? "Toque no mapa para MOVER o passo" : "Toque no mapa para CRIAR um passo"}
                    </p>
                </div>

                {/* Canvas do Mapa */}
                <div 
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onPointerMove={handlePointerMove}
                    className="flex-1 relative cursor-crosshair overflow-hidden bg-[#020617]"
                    style={{ 
                        backgroundImage: `
                            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0),
                            linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px, 80px 80px, 80px 80px'
                    }}
                >
                    {/* Borda de Visão do Mapa */}
                    <div className="absolute inset-4 border-2 border-white/5 rounded-[3rem] pointer-events-none z-0"></div>
                    
                    {/* Brilhos de Fundo */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                    {/* Linhas Conectoras */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                        {steps.length > 1 && [...steps].sort((a,b) => a.orderIndex - b.orderIndex).map((step, i) => {
                            if (i === 0) return null;
                            const prev = steps.find(s => s.orderIndex === i - 1);
                            if (!prev) return null;
                            return (
                                <line 
                                    key={`line-${i}`}
                                    x1={`${prev.xPos}%`} y1={`${prev.yPos}%`}
                                    x2={`${step.xPos}%`} y2={`${step.yPos}%`}
                                    stroke="url(#lineGradient)"
                                    strokeWidth="4"
                                    strokeDasharray="12,12"
                                    className="animate-shimmer"
                                />
                            );
                        })}
                    </svg>

                    {/* Passos */}
                    {steps.map((step) => (
                        <div 
                            key={step.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${selectedStepId === step.id ? 'z-40 scale-125' : 'z-10 hover:scale-110'} ${draggedStepId === step.id ? 'duration-0 cursor-grabbing' : 'cursor-grab'}`}
                            style={{ left: `${step.xPos}%`, top: `${step.yPos}%` }}
                            onPointerDown={(e) => handlePointerDown(e, step.id)}
                            onPointerUp={handlePointerUp}
                        >
                            <div className={`
                                w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 transition-all duration-300
                                ${selectedStepId === step.id 
                                    ? 'bg-sky-500 border-white shadow-sky-500/40 rotate-12' 
                                    : 'bg-slate-900 border-white/10 hover:border-sky-500/50'}
                            `}>
                                <span className={`material-symbols-outlined text-3xl font-black ${selectedStepId === step.id ? 'text-white' : 'text-slate-500'}`}>
                                    {step.icon}
                                </span>
                                
                                {/* Badge de Ordem */}
                                <div className="absolute -top-2 -left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-sky-500">
                                    <span className="text-[10px] font-black text-sky-600">{step.orderIndex + 1}</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 shadow-xl">
                                {step.title}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Painel de Edição (Somente se selecionado) */}
                {selectedStep && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 p-8 rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-50 animate-slide-up">
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                                        <span className="material-symbols-outlined text-sky-500 text-lg font-black">edit_location</span>
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase text-sky-400 tracking-[0.2em]">Editando Passo #{selectedStep.orderIndex + 1}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => removeStep(selectedStep.id)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-90 border border-red-500/20">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                    <button onClick={() => setSelectedStepId(null)} className="w-10 h-10 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center border border-white/10">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Título da Missão</label>
                                <input 
                                    type="text"
                                    value={selectedStep.title}
                                    onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-sm font-bold outline-none focus:border-sky-500 transition-all"
                                    placeholder="O que o herói deve fazer?"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Ícone Mágico</label>
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                                    {STEP_ICONS.map(i => (
                                        <button 
                                            key={i}
                                            onClick={() => updateStep(selectedStep.id, { icon: i })}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all border-2 ${selectedStep.icon === i ? 'bg-sky-500 border-white text-white scale-110 shadow-xl shadow-sky-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10'}`}
                                        >
                                            <span className="material-symbols-outlined text-2xl">{i}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedStepId(null)}
                                className="w-full py-5 bg-white text-slate-950 rounded-[1.8rem] font-black text-xs uppercase shadow-2xl active:scale-95 transition-all tracking-widest"
                            >
                                Confirmar Passo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapEditor;
