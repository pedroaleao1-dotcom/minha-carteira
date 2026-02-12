
import React, { useState, useEffect } from 'react';
import { JourneyTemplate } from '../types';
import { fetchJourneyTemplates, pushJourneyTemplate, deleteJourneyTemplate } from '../services/supabase';

interface Props {
    onEditTemplate: (template: JourneyTemplate) => void;
    onBack: () => void;
}

const ManageTemplates: React.FC<Props> = ({ onEditTemplate, onBack }) => {
    const [templates, setTemplates] = useState<JourneyTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setIsLoading(true);
        const data = await fetchJourneyTemplates();
        setTemplates(data);
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
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            <header className="p-6 pt-10 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 border-b border-slate-100">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-sky-600">Mapas do Reino</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Modelos Globais de Jornada</p>
                </div>
                <button onClick={handleCreate} className="w-12 h-12 bg-sky-600 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined">add_location_alt</span>
                </button>
            </header>

            <main className="p-6 space-y-6 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center py-20 opacity-30">
                        <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {templates.map(t => (
                            <div key={t.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 animate-pop-in">
                                <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter truncate">{t.title}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.steps.length} Passos definidos</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onEditTemplate(t)}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-sky-50 hover:text-sky-500"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-red-50 hover:text-red-500"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {templates.length === 0 && !isLoading && (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center">
                        <span className="material-symbols-outlined text-6xl">map</span>
                        <p className="font-black uppercase tracking-widest text-xs mt-4">Nenhum mapa global criado</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageTemplates;
