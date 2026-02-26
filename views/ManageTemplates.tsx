
import React, { useState, useEffect } from 'react';
import { JourneyTemplate, Member } from '../types';
import { fetchJourneyTemplates, deleteJourneyTemplate } from '../services/supabase';
import { db } from '../services/db';

interface Props {
    onEditTemplate: (template: JourneyTemplate) => void;
    onEditHeroMap: (dreamId: string) => void;
    onAddDream: (memberId: string) => void;
    onDeleteDream: (memberId: string, dreamId: string) => void;
    onApplyTemplate: (template: JourneyTemplate, memberId: string) => void;
    onBack: () => void;
}

const ManageTemplates: React.FC<Props> = ({ onEditTemplate, onEditHeroMap, onAddDream, onDeleteDream, onApplyTemplate, onBack }) => {
    const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<JourneyTemplate | null>(null);

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

    const handleCreateTemplate = () => {
        const newT: JourneyTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Novo Modelo de Mapa',
            icon: 'map',
            steps: [],
            updatedAt: Date.now()
        };
        onEditTemplate(newT);
    };

    const handleDeleteTemplate = async (id: string) => {
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
                    <h1 className="text-lg font-black uppercase tracking-widest text-sky-600">Gestão de Sonhos</h1>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Mapas & Objetivos</p>
                </div>
                <div className="w-12 h-12"></div>
            </header>

            <main className="p-6 space-y-12 flex-1 overflow-y-auto pb-32">
                {/* Seção 1: Jornadas Ativas dos Heróis */}
                <section className="animate-pop-in">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sonhos dos Heróis</h2>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8">
                        {members.map(child => {
                            const activeJourneys = child.dreams;
                            
                            return (
                                <div key={child.id} className="bg-white rounded-[3rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={child.avatar} className="w-14 h-14 rounded-full border-4 border-sky-100 shadow-md" />
                                            </div>
                                            <div>
                                                <span className="font-black text-sm text-slate-800 uppercase tracking-tight">{child.name}</span>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activeJourneys.length} Sonho{activeJourneys.length !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onAddDream(child.id)}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-xs">add_circle</span>
                                            Novo Sonho
                                        </button>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        {activeJourneys.map(dream => (
                                            <div key={dream.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-[1.8rem] border border-slate-100 group hover:bg-sky-50 transition-colors">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                                                        <span className="material-symbols-outlined text-sky-500 text-xl">{dream.icon}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight block truncate">{dream.title}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-sky-500 rounded-full" 
                                                                    style={{ width: `${dream.steps && dream.steps.length > 0 ? (dream.steps.filter(s => s.isCompleted).length / dream.steps.length) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-400">
                                                                {dream.steps && dream.steps.length > 0 
                                                                    ? `${Math.round((dream.steps.filter(s => s.isCompleted).length / dream.steps.length) * 100)}%`
                                                                    : 'Sem Mapa'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button 
                                                        onClick={() => onEditHeroMap(dream.id)}
                                                        className="w-10 h-10 bg-white text-sky-600 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center active:scale-90 transition-all hover:bg-sky-600 hover:text-white"
                                                        title="Editar Mapa"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit_location</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteDream(child.id, dream.id)}
                                                        className="w-10 h-10 bg-white text-red-400 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center active:scale-90 transition-all hover:bg-red-500 hover:text-white"
                                                        title="Excluir Sonho"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {activeJourneys.length === 0 && (
                                            <p className="text-[9px] text-slate-300 font-black uppercase text-center py-4 italic">Nenhum sonho plantado...</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Seção 2: Modelos Globais (Templates) */}
                <section className="animate-pop-in" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Modelos de Mapa</h2>
                        <button onClick={handleCreateTemplate} className="text-[9px] font-black text-sky-500 bg-sky-50 px-3 py-1 rounded-full uppercase tracking-widest">+ Novo Modelo</button>
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
                                            onClick={() => setSelectedTemplateForAssign(t)}
                                            className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-emerald-600 hover:text-white"
                                            title="Usar este Modelo"
                                        >
                                            <span className="material-symbols-outlined text-lg">auto_awesome</span>
                                        </button>
                                        <button 
                                            onClick={() => onEditTemplate(t)}
                                            className="w-11 h-11 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-sky-600 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTemplate(t.id)}
                                            className="w-11 h-11 bg-red-50 text-red-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Modal de Atribuição de Modelo */}
            {selectedTemplateForAssign && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTemplateForAssign(null)}></div>
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-pop-in">
                        <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-tight">Usar Modelo</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Escolha o herói para receber este mapa:</p>
                        
                        <div className="space-y-3 mb-8">
                            {members.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => {
                                        onApplyTemplate(selectedTemplateForAssign, member.id);
                                        setSelectedTemplateForAssign(null);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-sky-50 hover:border-sky-200 transition-all active:scale-95 group"
                                >
                                    <img src={member.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                    <span className="font-black text-slate-700 uppercase tracking-tight text-xs">{member.name}</span>
                                    <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-sky-500">arrow_forward_ios</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setSelectedTemplateForAssign(null)}
                            className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTemplates;
