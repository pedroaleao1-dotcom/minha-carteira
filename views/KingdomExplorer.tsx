
import React, { useState, useEffect } from 'react';
import { JourneyTemplate, Member } from '../types';
import { fetchJourneyTemplates } from '../services/supabase';

interface Props {
    member: Member;
    onSelectTemplate: (template: JourneyTemplate) => void;
    onBack: () => void;
}

const KingdomExplorer: React.FC<Props> = ({ member, onSelectTemplate, onBack }) => {
    const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const data = await fetchJourneyTemplates();
            setTemplates(data);
            setIsLoading(false);
        };
        load();
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-[#e0f2fe] min-h-screen pb-32">
            {/* Grid Estilizado de Mapa Mundi */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0369a1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md p-6 flex items-center justify-between border-b border-sky-100">
                <button onClick={onBack} className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-sm">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">Explorar o Reino</h1>
                    <h2 className="text-sm font-black text-slate-800 uppercase">Mapas Lendários</h2>
                </div>
                <div className="w-10 h-10"></div>
            </header>

            <main className="p-6 relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center py-20 opacity-30">
                        <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {templates.length === 0 ? (
                            <div className="text-center py-20 bg-white/50 rounded-[3rem] border-4 border-dashed border-sky-200">
                                <span className="material-symbols-outlined text-sky-300 text-6xl mb-4">map</span>
                                <p className="text-sky-500 font-black uppercase text-xs tracking-widest px-8">O Reino ainda está sendo mapeado pelos seus pais...</p>
                            </div>
                        ) : (
                            templates.map((template) => {
                                const hasStarted = member.dreams.some(d => d.templateId === template.id);
                                
                                return (
                                    <button 
                                        key={template.id}
                                        onClick={() => onSelectTemplate(template)}
                                        className={`group relative bg-white rounded-[2.5rem] p-6 shadow-xl border-4 transition-all active:scale-95 text-left flex flex-col gap-4 overflow-hidden ${hasStarted ? 'border-sky-400' : 'border-white'}`}
                                    >
                                        {/* Background Decor */}
                                        <div className="absolute -top-6 -right-6 opacity-5 transform group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[120px]">{template.icon}</span>
                                        </div>

                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${hasStarted ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <span className="material-symbols-outlined text-3xl font-black">{template.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tighter truncate">{template.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{template.steps.length} Missões</span>
                                                    {hasStarted && (
                                                        <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Em Curso</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-sky-50 transition-colors">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ver Mapa Completo</span>
                                            <span className="material-symbols-outlined text-sky-500">arrow_forward</span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default KingdomExplorer;
