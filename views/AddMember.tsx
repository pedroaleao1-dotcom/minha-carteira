
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Member, UserRole } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Props {
    memberToEdit?: Member | null;
    onSave: (member: Omit<Member, 'id' | 'level' | 'xp' | 'coins' | 'dreams' | 'tasks' | 'achievements' | 'redemptions' | 'history' | 'notifications' | 'taskCompletions'>) => void;
    onBack: () => void;
}

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/buddy/svg?seed=Buddy&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/willow/svg?seed=Willow&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Robo&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/big-ears/svg?seed=Buster&backgroundColor=c0aede',
];

const AddMember: React.FC<Props> = ({ memberToEdit, onSave, onBack }) => {
    const [name, setName] = useState(memberToEdit?.name || '');
    const [role, setRole] = useState<UserRole>(memberToEdit?.role || 'child');
    const [avatar, setAvatar] = useState(memberToEdit?.avatar || PRESET_AVATARS[0]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAIAvatar = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        {
                            text: `A cute, high-quality, 3D animated style avatar for a kid's game. Character description: ${aiPrompt}. The background should be a solid soft color. Square aspect ratio.`,
                        },
                    ],
                },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const base64Data = part.inlineData.data;
                    setAvatar(`data:image/png;base64,${base64Data}`);
                    break;
                }
            }
        } catch (error) {
            console.error("Erro ao gerar avatar:", error);
            alert("O Reino está com muita neblina agora! Tente novamente em instantes.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!name.trim()) return;
        
        onSave({
            name,
            role,
            avatar,
            badge: role === 'child' ? 'star' : 'settings',
            updatedAt: Date.now()
        });
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50 min-h-screen">
            <header className="flex items-center justify-between mb-10 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">{memberToEdit ? 'Editar Integrante' : 'Novo Integrante'}</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-8 flex-1 overflow-y-auto pb-12">
                {/* Seleção de Papel */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => setRole('child')}
                        className={`flex-1 p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-2 ${role === 'child' ? 'bg-pink-500 border-white text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 grayscale'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'child' ? 'bg-white/20' : 'bg-slate-50'}`}>
                            <span className="material-symbols-outlined text-3xl fill-1">rocket_launch</span>
                        </div>
                        <span className="font-black uppercase tracking-widest text-[10px]">Herói</span>
                    </button>
                    <button 
                        onClick={() => setRole('parent')}
                        className={`flex-1 p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-2 ${role === 'parent' ? 'bg-blue-600 border-white text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 grayscale'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'parent' ? 'bg-white/20' : 'bg-slate-50'}`}>
                            <span className="material-symbols-outlined text-3xl fill-1">shield</span>
                        </div>
                        <span className="font-black uppercase tracking-widest text-[10px]">Mentor</span>
                    </button>
                </div>

                {/* Nome */}
                <div className="space-y-3 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Qual o nome do herói?</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Davi, Bia, Papai..."
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 font-black text-slate-800 outline-none focus:border-pink-500 transition-colors text-lg"
                    />
                </div>

                {/* Avatares */}
                <div className="space-y-4 bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Escolha o Visual</label>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {PRESET_AVATARS.map((url, i) => (
                            <button 
                                key={i}
                                onClick={() => setAvatar(url)}
                                className={`aspect-square rounded-full overflow-hidden border-4 transition-all ${avatar === url ? 'border-pink-500 scale-110 shadow-lg' : 'border-slate-50 opacity-40 hover:opacity-100'}`}
                            >
                                <img src={url} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                        {avatar && !PRESET_AVATARS.includes(avatar) && (
                            <button 
                                className="aspect-square rounded-full overflow-hidden border-4 border-pink-500 scale-110 shadow-lg"
                            >
                                <img src={avatar} className="w-full h-full object-cover" alt="Custom AI Avatar" />
                            </button>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ou crie com Magia (IA)</label>
                        <div className="mt-3 flex gap-2">
                            <input 
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Ex: Um herói com capa azul e óculos..."
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-pink-500 transition-colors"
                            />
                            <button 
                                onClick={generateAIAvatar}
                                disabled={isGenerating || !aiPrompt.trim()}
                                className="bg-pink-500 text-white px-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">magic_button</span>
                                )}
                                {isGenerating ? 'Criando...' : 'Gerar'}
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    disabled={!name.trim()}
                    onClick={handleSave}
                    className="w-full bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-[0_8px_0_0_#059669] active-press disabled:opacity-50 disabled:grayscale transition-all mt-4 flex items-center justify-center gap-3"
                >
                    <span className="material-symbols-outlined text-2xl font-black">{memberToEdit ? 'save' : 'check_circle'}</span>
                    {memberToEdit ? 'SALVAR ALTERAÇÕES' : 'ENTRAR NA AVENTURA!'}
                </button>
            </main>
        </div>
    );
};

export default AddMember;
