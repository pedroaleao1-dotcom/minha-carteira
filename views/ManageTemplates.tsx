
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
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-sky-600">Hub de Mapas</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Gestão Global & Jornadas</p>
                </div>
                <button onClick={handleCreate} className="w-12 h-12 bg-sky-600 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined">add_location_alt</span>
                </button>
            </header>

            <main className="p-6 space-y-10 flex-1 overflow-y-auto">
                {/* Seção 1: Jornadas Ativas dos Heróis */}
                <section>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Jornadas em Curso ⚔️</h2>
                    <div className="space-y-4">
                        {members.map(child => {
                            const activeJourneys = child.dreams.filter(d => d.status === 'active');
                            if (activeJourneys.length === 0) return null;
                            
                            return (
                                <div key={child.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                                        <img src={child.avatar} className="w-10 h-10 rounded-full border-2 border-sky-100" />
                                        <span className="font-black text-xs text-slate-800 uppercase">{child.name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {activeJourneys.map(dream => (
                                            <div key={dream.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-sky-500">{dream.icon}</span>
                                                    <span className="text-[10px] font-bold text-slate-600">{dream.title}</span>
                                                </div>
                                                <button 
                                                    onClick={() => onEditHeroMap(dream.id)}
                                                    className="bg-sky-500 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase shadow-md active:scale-95 transition-all"
                                                >
                                                    Editar Mapa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {members.every(m => m.dreams.filter(d => d.status === 'active').length === 0) && (
                            <p className="text-center py-6 text-[10px] font-bold text-slate-300 uppercase italic">Nenhum herói em jornada no momento...</p>
                        )}
                    </div>
                </section>

                {/* Seção 2: Modelos Globais (Templates) */}
                <section>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Modelos do Reino (Master)</h2>
                    {isLoading ? (
                        <div className="flex flex-col items-center py-10 opacity-30">
                            <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map(t => (
                                <div key={t.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 group">
                                    <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter truncate">{t.title}</h3>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.steps.length} Missões Fixas</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEditTemplate(t)}
                                            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(t.id)}
                                            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default ManageTemplates;
