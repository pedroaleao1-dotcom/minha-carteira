
import React, { useState, useEffect } from 'react';
import { JourneyTemplate, Member } from '../types';
import { fetchJourneyTemplates, deleteJourneyTemplate } from '../services/supabase';
import { db } from '../services/db';

interface Props {
    onEditTemplate: (template: JourneyTemplate) => void;
    onEditHeroMap: (dreamId: string) => void;
    onBack: () => void;
}

const ManageTemplates: React.FC<Props> = ({ onEditTemplate, onEditHeroMap, onBack }) => {
    const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setIsLoading(true);
        const [templateData, memberData] = await Promise.all([
            fetchJourneyTemplates(),
            db.members.toArray()
        ]);
        setTemplates(templateData);
        setMembers(memberData.filter(m => m.role === 'child'));
        setIsLoading(false);
    };

    const handleCreate = () => {
        const newT: JourneyTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Novo Mapa do Reino',
            icon: 'map',
            steps: [],
            updatedAt: Date.now()
        };
        onEditTemplate(newT);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este modelo de mapa?")) return;
        await deleteJourneyTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24">
            <header className="p-6 pt-10 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 border-b border-slate-100">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all border border-slate-100">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-sky-600">Hub de Mapas</h1>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Gestão de Jornadas</p>
                </div>
                <button onClick={handleCreate} className="w-12 h-12 bg-sky-600 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all shadow-sky-200">
                    <span className="material-symbols-outlined font-black">add_location_alt</span>
                </button>
            </header>

            <main className="p-6 space-y-12 flex-1 overflow-y-auto pb-32">
                {/* Seção 1: Jornadas Ativas dos Heróis */}
                <section className="animate-pop-in">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Jornadas em Curso</h2>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {members.map(child => {
                            const activeJourneys = child.dreams.filter(d => d.status === 'active');
                            if (activeJourneys.length === 0) return null;
                            
                            return (
                                <div key={child.id} className="bg-white rounded-[3rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                                    {/* Decor de Fundo */}
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-50 rounded-full opacity-50 blur-2xl"></div>
                                    
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="relative">
                                            <img src={child.avatar} className="w-14 h-14 rounded-full border-4 border-sky-100 shadow-md" />
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-[12px] font-black">shield</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-black text-sm text-slate-800 uppercase tracking-tight">{child.name}</span>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activeJourneys.length} Reino{activeJourneys.length > 1 ? 's' : ''} Explorando</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        {activeJourneys.map(dream => (
                                            <div key={dream.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-[1.8rem] border border-slate-100 group hover:bg-sky-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                                                        <span className="material-symbols-outlined text-sky-500 text-xl">{dream.icon}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{dream.title}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-sky-500 rounded-full" 
                                                                    style={{ width: `${(dream.steps.filter(s => s.isCompleted).length / dream.steps.length) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400">{Math.round((dream.steps.filter(s => s.isCompleted).length / dream.steps.length) * 100)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => onEditHeroMap(dream.id)}
                                                    className="w-10 h-10 bg-white text-sky-600 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center active:scale-90 transition-all hover:bg-sky-600 hover:text-white"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit_location</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {members.every(m => m.dreams.filter(d => d.status === 'active').length === 0) && (
                            <div className="text-center py-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                                <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">explore_off</span>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhum herói em jornada no momento...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Seção 2: Modelos Globais (Templates) */}
                <section className="animate-pop-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Modelos do Reino</h2>
                        <span className="text-[9px] font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-widest">{templates.length} Mapas</span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center py-10 opacity-30">
                            <span className="material-symbols-outlined text-3xl animate-spin text-sky-500">sync</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map(t => (
                                <div key={t.id} className="bg-white rounded-[2.2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                    <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner">
                                        <span className="material-symbols-outlined text-3xl font-black">{t.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight truncate">{t.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full">
                                                {t.steps.length} Missões
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEditTemplate(t)}
                                            className="w-11 h-11 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-sky-600 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(t.id)}
                                            className="w-11 h-11 bg-red-50 text-red-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {templates.length === 0 && (
                                <button 
                                    onClick={handleCreate}
                                    className="py-12 bg-white rounded-[3rem] border-2 border-dashed border-sky-100 flex flex-col items-center group active:scale-95 transition-all"
                                >
                                    <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-sky-400 text-3xl">add_location_alt</span>
                                    </div>
                                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Criar Primeiro Mapa</p>
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ManageTemplates;
