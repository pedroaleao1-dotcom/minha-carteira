
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
    const [targetCoins, setTargetCoins] = useState(dream?.targetAmount || 500);
    const [targetXp, setTargetXp] = useState(dream?.totalXpTarget || 1000);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<'edit' | 'move'>('edit');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, duration: string}[]>([]);

    React.useEffect(() => {
        const newStars = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            duration: (Math.random() * 3 + 2) + 's'
        }));
        setStars(newStars);
    }, []);

    const autoOrganize = () => {
        if (steps.length === 0) return;
        const sorted = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);
        const newSteps = sorted.map((step, i) => {
            // Zig-zag path
            const x = 50 + (Math.sin(i * 1.2) * 25);
            const y = 10 + (i * (80 / Math.max(1, steps.length - 1)));
            return {
                ...step,
                xPos: Number(x.toFixed(2)),
                yPos: Number(y.toFixed(2))
            };
        });
        setSteps(newSteps);
    };

    const dragStartPos = useRef<{ x: number, y: number } | null>(null);
    const dragStartOffset = useRef<{ x: number, y: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const generateWithAI = async () => {
        if (!title.trim()) {
            alert("Dê um nome à Jornada primeiro!");
            return;
        }
        setIsGenerating(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Create a magical adventure journey for a child.
                Dream: "${title}"
                Theme: "${theme || 'adventure'}"
                Total Coins to Earn: ${targetCoins}
                Total XP to Earn: ${targetXp}
                
                Create exactly 6 adventure steps (milestones).
                Return a JSON array of objects with: 
                - title: creative mission title (max 25 chars) in Portuguese
                - icon: one of [${STEP_ICONS.join(', ')}]
                - xpReward: integer (distribute ${targetXp} total across all steps)
                - coinReward: integer (distribute ${targetCoins} total across all steps)
                - xPos: number 10-90 (suggest positions that form a logical path)
                - yPos: number 10-90 (suggest positions that form a logical path)
                Ensure steps follow a logical path towards the final goal.`,
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
        
        if (activeTool === 'edit') {
            setSelectedStepId(id === selectedStepId ? null : id);
            return;
        }

        const step = steps.find(s => s.id === id);
        if (!step || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = (step.xPos / 100) * rect.width;
        const currentY = (step.yPos / 100) * rect.height;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setDraggedStepId(id);
        setIsDragging(false);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        dragStartOffset.current = { x: mouseX - currentX, y: mouseY - currentY };
        
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggedStepId || !canvasRef.current || !dragStartPos.current || !dragStartOffset.current) return;

        const dist = Math.sqrt(
            Math.pow(e.clientX - dragStartPos.current.x, 2) + 
            Math.pow(e.clientY - dragStartPos.current.y, 2)
        );

        if (dist > 3) {
            setIsDragging(true);
            const rect = canvasRef.current.getBoundingClientRect();
            
            // Calculate new position considering the initial offset to prevent "jumping"
            const newXpx = (e.clientX - rect.left) - dragStartOffset.current.x;
            const newYpx = (e.clientY - rect.top) - dragStartOffset.current.y;
            
            // Convert back to percentage with high precision
            const x = Math.min(Math.max(0, (newXpx / rect.width) * 100), 100);
            const y = Math.min(Math.max(0, (newYpx / rect.height) * 100), 100);
            
            updateStep(draggedStepId, { 
                xPos: Number(x.toFixed(2)), 
                yPos: Number(y.toFixed(2)) 
            });
        }
    };

    const handlePointerUp = (e: React.PointerEvent, id: string) => {
        if (draggedStepId) {
            setDraggedStepId(null);
            setIsDragging(false);
            dragStartPos.current = null;
            dragStartOffset.current = null;
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    const addNewStep = () => {
        const lastStep = steps[steps.length - 1];
        // Position it below the last step or at the top if none
        const newY = lastStep ? Math.min(lastStep.yPos + 5, 95) : 10;
        const newX = 50;

        const newStep: DreamStep = {
            id: Math.random().toString(36).substr(2, 9),
            title: `Nova Missão ${steps.length + 1}`,
            isCompleted: false,
            orderIndex: steps.length,
            xpReward: 50,
            coinReward: 0,
            xPos: newX,
            yPos: newY,
            icon: 'star',
            updatedAt: Date.now()
        };
        setSteps([...steps, newStep]);
        setSelectedStepId(newStep.id);
        
        // Scroll to the new step if possible
        if (canvasRef.current && canvasRef.current.parentElement) {
            const scrollPos = (newY / 100) * 1500 - 200;
            canvasRef.current.parentElement.scrollTo({ top: scrollPos, behavior: 'smooth' });
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

    // Auto-scroll to selected step
    React.useEffect(() => {
        if (selectedStepId && canvasRef.current && canvasRef.current.parentElement) {
            const step = steps.find(s => s.id === selectedStepId);
            if (step) {
                const container = canvasRef.current.parentElement;
                const stepY = (step.yPos / 100) * 1500;
                container.scrollTo({
                    top: stepY - container.clientHeight / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedStepId]);

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
                        placeholder="NOME DO SONHO"
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
                        <div className="absolute top-16 right-0 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-[60] animate-pop-in">
                            <h4 className="text-[10px] font-black uppercase text-pink-400 tracking-[0.2em] mb-4">Gerador de Jornada</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Tema (Opcional)</label>
                                    <input 
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        placeholder="Ex: Espaço, Piratas, Doces..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-pink-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Moedas</label>
                                        <input 
                                            type="number"
                                            value={targetCoins}
                                            onChange={(e) => setTargetCoins(Number(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Total XP</label>
                                        <input 
                                            type="number"
                                            value={targetXp}
                                            onChange={(e) => setTargetXp(Number(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>
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
                <div className="fixed top-24 left-0 right-0 z-[60] pointer-events-none flex justify-center px-6">
                    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${activeTool === 'move' ? 'bg-sky-500' : 'bg-slate-600'}`}></span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${activeTool === 'move' ? 'text-sky-400' : 'text-slate-500'}`}>
                                {activeTool === 'move' ? 'Modo Movimento Ativo' : 'Selecione Mover para ajustar'}
                            </span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${activeTool === 'edit' ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${activeTool === 'edit' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {activeTool === 'edit' ? 'Modo Edição Ativo' : 'Selecione Editar para configurar'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Toolbar Lateral de Ferramentas */}
                <div className={`fixed left-6 transition-all duration-500 z-[100] pointer-events-auto flex flex-col gap-3 ${selectedStep && !isDragging ? 'bottom-[420px]' : 'bottom-10'}`}>
                    <button 
                        onPointerDown={(e) => { e.stopPropagation(); setActiveTool('edit'); setDraggedStepId(null); }}
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all border ${activeTool === 'edit' ? 'bg-emerald-500 text-white border-emerald-400 scale-110' : 'bg-slate-900/95 text-slate-400 border-white/10 hover:bg-slate-800'}`}
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        <span className="text-[5px] font-black uppercase tracking-tighter mt-0.5">Editar</span>
                    </button>
                    <button 
                        onPointerDown={(e) => { e.stopPropagation(); setActiveTool('move'); setSelectedStepId(null); }}
                        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all border ${activeTool === 'move' ? 'bg-sky-500 text-white border-sky-400 scale-110' : 'bg-slate-900/95 text-slate-400 border-white/10 hover:bg-slate-800'}`}
                    >
                        <span className="material-symbols-outlined text-lg">open_with</span>
                        <span className="text-[5px] font-black uppercase tracking-tighter mt-0.5">Mover</span>
                    </button>
                    <div className="w-full h-px bg-white/10 my-0.5"></div>
                    <button 
                        onPointerDown={(e) => { e.stopPropagation(); autoOrganize(); }}
                        className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center bg-slate-900/95 text-amber-500 border border-white/10 shadow-2xl hover:bg-slate-800 active:scale-90 transition-all"
                        title="Organizar Automaticamente"
                    >
                        <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                        <span className="text-[5px] font-black uppercase tracking-tighter mt-0.5">Auto</span>
                    </button>
                    <button 
                        onPointerDown={(e) => { e.stopPropagation(); addNewStep(); }}
                        className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center bg-slate-900/95 text-sky-500 border border-white/10 shadow-2xl hover:bg-slate-800 active:scale-90 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add_location_alt</span>
                        <span className="text-[5px] font-black uppercase tracking-tighter mt-0.5">Novo</span>
                    </button>
                </div>

                {/* Canvas do Mapa */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] relative">
                    <div 
                        ref={canvasRef}
                        onPointerMove={handlePointerMove}
                        className="relative cursor-default bg-[#020617] min-h-[1500px] w-full"
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
                        <div className="absolute top-3/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                        {/* Estrelas */}
                        {stars.map(star => (
                            <div 
                                key={star.id}
                                className="star animate-twinkle"
                                style={{ 
                                    left: `${star.x}%`, 
                                    top: `${star.y}%`, 
                                    width: `${star.size}px`, 
                                    height: `${star.size}px`,
                                    '--duration': star.duration
                                } as any}
                            />
                        ))}

                        {/* Linhas Conectoras */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            {steps.length > 1 && [...steps].sort((a,b) => a.orderIndex - b.orderIndex).map((step, i) => {
                                if (i === 0) return null;
                                const prev = steps.find(s => s.orderIndex === i - 1);
                                if (!prev) return null;
                                return (
                                    <g key={`line-group-${i}`}>
                                        {/* Glow effect line */}
                                        <path 
                                            d={`M ${prev.xPos}% ${prev.yPos}% L ${step.xPos}% ${step.yPos}%`}
                                            stroke="#38bdf8"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeOpacity="0.1"
                                            filter="url(#glow)"
                                        />
                                        <path 
                                            d={`M ${prev.xPos}% ${prev.yPos}% L ${step.xPos}% ${step.yPos}%`}
                                            stroke="url(#lineGradient)"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray="12, 12"
                                            className="animate-dash-flow"
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Passos */}
                        {steps.map((step) => (
                            <div 
                                key={step.id}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 
                                    ${draggedStepId === step.id ? 'z-50 duration-0 scale-110 opacity-70' : 'z-20 transition-all duration-300'} 
                                    ${selectedStepId === step.id ? 'scale-125' : 'hover:scale-110'}
                                    ${activeTool === 'move' ? 'cursor-move' : 'cursor-pointer'}
                                `}
                                style={{ left: `${step.xPos}%`, top: `${step.yPos}%` }}
                                onPointerDown={(e) => handlePointerDown(e, step.id)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={(e) => handlePointerUp(e, step.id)}
                            >
                                <div className={`
                                    w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl border-4 transition-all duration-300 relative
                                    ${selectedStepId === step.id 
                                        ? 'bg-gradient-to-br from-sky-400 to-sky-600 border-white shadow-sky-500/50 rotate-12 scale-110' 
                                        : 'bg-slate-900/80 backdrop-blur-sm border-white/10 hover:border-sky-500/50'}
                                `}>
                                    {/* Aura effect for selected step */}
                                    {selectedStepId === step.id && (
                                        <div className="absolute inset-0 rounded-[2rem] bg-sky-400 blur-xl opacity-40 animate-pulse"></div>
                                    )}
                                    
                                    <span className={`material-symbols-outlined text-3xl font-black relative z-10 ${selectedStepId === step.id ? 'text-white' : 'text-slate-500'}`}>
                                        {step.icon}
                                    </span>
                                    
                                    {/* Badge de Ordem */}
                                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-sky-500 z-20">
                                        <span className="text-[10px] font-black text-sky-600">{step.orderIndex + 1}</span>
                                    </div>
                                </div>
                                <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 shadow-2xl transition-all ${selectedStepId === step.id ? 'text-sky-400 border-sky-500/30 scale-110' : 'text-slate-400'}`}>
                                    {step.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Painel de Edição (Somente se selecionado) */}
                {selectedStep && !isDragging && (
                    <div className="fixed bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[90] animate-slide-up max-w-lg mx-auto">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                                        <span className="material-symbols-outlined text-sky-500 text-base font-black">edit_location</span>
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase text-sky-400 tracking-[0.2em]">Passo #{selectedStep.orderIndex + 1}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => removeStep(selectedStep.id)} className="w-9 h-9 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-90 border border-red-500/20">
                                        <span className="material-symbols-outlined text-base">delete</span>
                                    </button>
                                    <button onClick={() => setSelectedStepId(null)} className="w-9 h-9 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center border border-white/10">
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">Título</label>
                                <input 
                                    type="text"
                                    value={selectedStep.title}
                                    onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs font-bold outline-none focus:border-sky-500 transition-all"
                                    placeholder="O que o herói deve fazer?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">Moedas</label>
                                    <input 
                                        type="number"
                                        value={selectedStep.coinReward || 0}
                                        onChange={(e) => updateStep(selectedStep.id, { coinReward: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs font-bold outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">XP</label>
                                    <input 
                                        type="number"
                                        value={selectedStep.xpReward}
                                        onChange={(e) => updateStep(selectedStep.id, { xpReward: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs font-bold outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-2">Ícone</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                                    {STEP_ICONS.map(i => (
                                        <button 
                                            key={i}
                                            onClick={() => updateStep(selectedStep.id, { icon: i })}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all border-2 ${selectedStep.icon === i ? 'bg-sky-500 border-white text-white scale-110 shadow-lg shadow-sky-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10'}`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{i}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedStepId(null)}
                                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all tracking-widest"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapEditor;
