
import React, { useState } from 'react';
import { Member } from '../types';

interface Props {
    members: Member[];
    onSelect: (id: string) => void;
    onAddNew: () => void;
    isLoading?: boolean;
}

const RoleSelection: React.FC<Props> = ({ members, onSelect, onAddNew, isLoading }) => {
    const [pin, setPin] = useState<string[]>([]);
    const [showPinOverlay, setShowPinOverlay] = useState<string | null>(null);

    const handleMemberClick = (member: Member) => {
        if (member.role === 'parent') {
            setShowPinOverlay(member.id);
            setPin([]);
        } else {
            onSelect(member.id);
        }
    };

    const handlePinDigit = (digit: string) => {
        if (pin.length < 4) {
            const newPin = [...pin, digit];
            setPin(newPin);
            if (newPin.length === 4 && showPinOverlay) {
                // Simulação de verificação de PIN (correto: 1234)
                setTimeout(() => {
                    onSelect(showPinOverlay);
                    setShowPinOverlay(null);
                }, 300);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center pt-20 px-8 relative min-h-screen bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-10 border-4 border-amber-400 animate-float">
                <span className="material-symbols-outlined text-amber-400 text-3xl font-black fill-1">rocket_launch</span>
            </div>

            <h1 className="text-[32px] font-black text-[#1e293b] text-center leading-[1.1] mb-2">
                Quem vai brincar
            </h1>
            <h2 className="text-[32px] font-black text-pink-500 text-center leading-[1.1] mb-4">
                hoje?
            </h2>
            <p className="text-slate-400 font-bold text-sm mb-16 text-center">Escolha seu perfil para começar</p>

            {isLoading ? (
                <div className="flex flex-col items-center gap-4 opacity-50">
                    <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Invocando Heróis...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-8 gap-y-12 w-full max-w-xs pb-32">
                    {members.map(member => (
                        <div key={member.id} className="flex flex-col items-center animate-pop-in">
                            <button 
                                onClick={() => handleMemberClick(member)}
                                className="w-full aspect-square bg-white rounded-full shadow-xl border-4 border-white p-1 flex items-center justify-center active:scale-95 transition-all relative group"
                            >
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                                    
                                    <div className={`absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                                        member.badge === 'star' ? 'bg-amber-400' : 
                                        member.badge === 'heart' ? 'bg-pink-400' : 
                                        member.badge === 'settings' ? 'bg-blue-500' : 'bg-slate-400'
                                    }`}>
                                        <span className="material-symbols-outlined text-white text-[20px] font-black fill-1">
                                            {member.badge === 'star' ? 'star' : 
                                             member.badge === 'heart' ? 'favorite' : 
                                             member.badge === 'settings' ? 'shield' : 'person'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                            <span className="mt-4 font-black text-slate-800 text-xl">{member.name}</span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                member.badge === 'star' ? 'text-amber-500' : 
                                member.badge === 'heart' ? 'text-pink-500' : 
                                member.badge === 'settings' ? 'text-blue-500' : 'text-slate-400'
                            }`}>
                                {member.role === 'parent' ? 'Herói' : member.badge === 'star' ? 'Estrela' : 'Coração'}
                            </span>
                        </div>
                    ))}

                    <div className="flex flex-col items-center animate-pop-in">
                        <button 
                            onClick={onAddNew}
                            className="w-full aspect-square bg-white rounded-full shadow-sm border-4 border-dashed border-slate-200 flex items-center justify-center active:scale-95 transition-all hover:bg-slate-50 group"
                        >
                            <div className="w-12 h-12 flex items-center justify-center text-pink-500">
                                <span className="material-symbols-outlined text-5xl font-black">add</span>
                            </div>
                        </button>
                        <span className="mt-4 font-black text-pink-500 text-xl">Novo Herói</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Adicionar</span>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Mock */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-pink-500">
                    <span className="material-symbols-outlined fill-1">grid_view</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Início</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">emoji_events</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Ranking</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Ajustes</span>
                </button>
            </div>

            {members.length === 0 && !isLoading && (
                <div className="mt-8 text-center px-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O Reino está vazio! Toque em "Novo" para começar a aventura.</p>
                </div>
            )}

            {/* PIN Input Overlay */}
            {showPinOverlay && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end animate-pop-in">
                    <div className="w-full bg-white rounded-t-[3rem] p-10 shadow-2xl flex flex-col items-center animate-slide-up">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-8 opacity-50" />
                        
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-pink-500 text-3xl fill-1">family_restroom</span>
                        </div>
                        
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Acesso dos Pais</h2>
                        <p className="text-slate-400 font-bold text-xs text-center mb-10 px-8 leading-relaxed">
                            Digite seu PIN de 4 dígitos para gerenciar perfis e configurações.
                        </p>
                        
                        <div className="flex gap-4 mb-12">
                            {[0,1,2,3].map(i => (
                                <div 
                                    key={i} 
                                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                                        pin.length > i 
                                        ? 'bg-pink-500 border-pink-500 scale-110 shadow-lg shadow-pink-200' 
                                        : 'bg-white border-slate-100'
                                    }`}
                                >
                                    {pin.length > i && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-xs mb-10">
                            {[1,2,3,4,5,6,7,8,9].map(n => (
                                <button key={n} onClick={() => handlePinDigit(n.toString())} className="h-16 bg-slate-50 rounded-full font-black text-slate-700 text-xl active:scale-90 transition-all hover:bg-slate-100">{n}</button>
                            ))}
                            <button onClick={() => setPin([])} className="h-16 flex items-center justify-center text-slate-300 active:scale-90 transition-all">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                            <button onClick={() => handlePinDigit("0")} className="h-16 bg-slate-50 rounded-full font-black text-slate-700 text-xl active:scale-90 transition-all hover:bg-slate-100">0</button>
                            <button onClick={() => setPin(prev => prev.slice(0, -1))} className="h-16 flex items-center justify-center text-slate-300 active:scale-90 transition-all">
                                <span className="material-symbols-outlined">backspace</span>
                            </button>
                        </div>
                        
                        <button onClick={() => setShowPinOverlay(null)} className="w-full bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSelection;
