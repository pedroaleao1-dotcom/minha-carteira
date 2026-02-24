
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
        <div className="flex-1 flex flex-col bg-[#0f172a] min-h-screen pb-32 overflow-y-auto relative">
            {/* Efeitos de Fundo */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-sky-500/10 to-transparent"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md p-6 flex items-center justify-between border-b border-white/5">
                <button onClick={onBack} className="w-10 h-10 bg-white/5 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">Explorar o Reino</h1>
                    <h2 className="text-sm font-black text-white uppercase">Reinos Mágicos</h2>
                </div>
                <div className="w-10 h-10"></div>
            </header>

            <main className="p-6 relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center py-20 opacity-30">
                        <span className="material-symbols-outlined text-4xl animate-spin text-sky-500">sync</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {templates.length === 0 ? (
                            <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-sky-500 text-4xl opacity-50">map</span>
                                </div>
                                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] px-12 leading-relaxed">
                                    Nenhum reino descoberto.<br/>Peça para o Mestre desenhar um novo mapa!
                                </p>
                            </div>
                        ) : (
                            templates.map((template, idx) => {
                                const hasStarted = member.dreams.some(d => d.templateId === template.id);
                                
                                return (
                                    <button 
                                        key={template.id}
                                        onClick={() => onSelectTemplate(template)}
                                        className={`
                                            group relative bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border-2 transition-all active:scale-95 text-left flex flex-col gap-4 overflow-hidden animate-pop-in
                                            ${hasStarted ? 'border-sky-500 shadow-sky-500/10' : 'border-white/5'}
                                        `}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        {/* Icon Decorativo de Fundo */}
                                        <div className="absolute -top-6 -right-6 opacity-[0.03] transform group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[150px]">{template.icon}</span>
                                        </div>

                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-xl border-2 border-white/5 ${hasStarted ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                <span className="material-symbols-outlined text-3xl font-black">{template.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tighter truncate group-hover:text-sky-400 transition-colors">{template.title}</h3>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">
                                                        {template.steps.length} Missões
                                                    </span>
                                                    {hasStarted && (
                                                        <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-lg animate-pulse">
                                                            Em Curso
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex justify-between items-center bg-white/5 p-4 rounded-[1.5rem] border border-white/5 group-hover:bg-sky-500/10 transition-colors">
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Acessar Reino</span>
                                            <span className="material-symbols-outlined text-sky-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
