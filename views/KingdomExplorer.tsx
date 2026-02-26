
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

            <header className="sticky top-0 z-50 bg-slate-900/40 backdrop-blur-xl p-6 flex items-center justify-between border-b border-white/5">
                <button onClick={onBack} className="w-12 h-12 bg-white/5 text-white rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-slate-400">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em]">Explorar o Reino</h1>
                    <h2 className="text-sm font-black text-white uppercase tracking-tight">Reinos Mágicos</h2>
                </div>
                <div className="w-12 h-12 flex flex-col items-center justify-center bg-sky-500/10 rounded-2xl border border-sky-500/20">
                    <span className="material-symbols-outlined text-sky-400 text-lg">bolt</span>
                    <span className="text-[9px] font-black text-white">{member.xp}</span>
                </div>
            </header>

            <div className="bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-2 shadow-inner">
                Faça missões para ganhar XP e avançar nos mapas!
            </div>

            <main className="p-8 relative z-10 space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center py-20 opacity-30">
                        <span className="material-symbols-outlined text-5xl animate-spin text-sky-500">sync</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {templates.length === 0 ? (
                            <div className="text-center py-24 bg-white/5 rounded-[3.5rem] border-2 border-dashed border-white/10 flex flex-col items-center animate-pop-in">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner">
                                    <span className="material-symbols-outlined text-sky-500 text-5xl opacity-50">map</span>
                                </div>
                                <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] px-12 leading-relaxed">
                                    Nenhum reino descoberto.<br/>
                                    <span className="text-sky-500/50">Peça para o Mestre desenhar um novo mapa!</span>
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
                                            group relative bg-slate-900/50 backdrop-blur-md rounded-[3rem] p-8 shadow-2xl border-2 transition-all active:scale-95 text-left flex flex-col gap-6 overflow-hidden animate-pop-in
                                            ${hasStarted ? 'border-sky-500/50 shadow-sky-500/10' : 'border-white/5'}
                                        `}
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        {/* Brilho de Fundo */}
                                        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-40 ${hasStarted ? 'bg-sky-500' : 'bg-slate-500'}`}></div>

                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center shrink-0 shadow-2xl border-4 transition-all ${hasStarted ? 'bg-sky-500 border-white text-white rotate-6' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                                                <span className="material-symbols-outlined text-4xl font-black">{template.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-white text-xl leading-tight uppercase tracking-tight truncate group-hover:text-sky-400 transition-colors">{template.title}</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                        {template.steps.length} Missões
                                                    </span>
                                                    {hasStarted && (
                                                        <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-lg animate-pulse">
                                                            Em Curso
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex justify-between items-center bg-white/5 p-5 rounded-[2rem] border border-white/5 group-hover:bg-sky-500/20 transition-all group-hover:border-sky-500/30">
                                            <span className="text-[11px] font-black text-sky-400 uppercase tracking-[0.2em]">Acessar Reino</span>
                                            <div className="w-10 h-10 bg-sky-500/10 rounded-full flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                                                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </div>
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
