
import React, { useState } from 'react';
import { Member } from '../types';

interface Props {
    members: Member[];
    onSelect: (id: string) => void;
    onAddNew: () => void;
}

const RoleSelection: React.FC<Props> = ({ members, onSelect, onAddNew }) => {
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
        <div className="flex-1 flex flex-col items-center pt-20 px-8 relative min-h-screen">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-10 border-4 border-amber-400 animate-float">
                <span className="material-symbols-outlined text-amber-400 text-3xl font-black fill-1">rocket_launch</span>
            </div>

            <h1 className="text-[32px] font-black text-[#1e293b] text-center leading-[1.1] mb-16">
                Quem vai<br/>brincar hoje?
            </h1>

            <div className="grid grid-cols-2 gap-x-6 gap-y-12 w-full max-w-xs pb-12">
                {members.map(member => (
                    <div key={member.id} className="flex flex-col items-center">
                        <button 
                            onClick={() => handleMemberClick(member)}
                            className="w-full aspect-square bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-3 flex items-center justify-center active:scale-95 transition-all relative group"
                        >
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 relative">
                                <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                                
                                {/* Badges baseados no tipo */}
                                <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-md ${
                                    member.badge === 'star' ? 'bg-amber-400' : 
                                    member.badge === 'heart' ? 'bg-pink-400' : 
                                    member.badge === 'settings' ? 'bg-slate-700' : 'bg-slate-400'
                                }`}>
                                    <span className="material-symbols-outlined text-white text-[16px] font-black fill-1">
                                        {member.badge === 'star' ? 'star' : 
                                         member.badge === 'heart' ? 'favorite' : 
                                         member.badge === 'settings' ? 'settings' : 'person'}
                                    </span>
                                </div>
                            </div>
                        </button>
                        <span className="mt-3 font-black text-slate-500 text-lg">{member.name}</span>
                    </div>
                ))}

                {/* Botão Novo Ativado */}
                <div className="flex flex-col items-center">
                    <button 
                        onClick={onAddNew}
                        className="w-full aspect-square bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center active:scale-95 transition-all hover:bg-slate-50"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">add</span>
                        </div>
                    </button>
                    <span className="mt-3 font-black text-slate-300 text-lg">Novo</span>
                </div>
            </div>

            {/* PIN Input Overlay */}
            {showPinOverlay && (
                <div className="absolute bottom-10 left-0 right-0 px-6 flex flex-col items-center z-50">
                    <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border-2 border-white flex flex-col items-center">
                        <span className="material-symbols-outlined text-slate-400 mb-4">lock</span>
                        <p className="text-slate-500 font-bold text-xs text-center mb-6 px-4">Digite o PIN para entrar na área dos pais</p>
                        
                        <div className="flex gap-4 mb-10">
                            {[0,1,2,3].map(i => (
                                <div 
                                    key={i} 
                                    className={`w-4 h-4 rounded-full border-2 border-slate-200 transition-all ${pin.length > i ? 'bg-[#2b8cee] border-[#2b8cee] scale-125' : 'bg-white'}`}
                                />
                            ))}
                        </div>

                        {/* Teclado numérico invisível */}
                        <div className="grid grid-cols-3 gap-6 opacity-0 absolute pointer-events-none">
                            {[1,2,3,4,5,6,7,8,9,0].map(n => (
                                <button key={n} onClick={() => handlePinDigit(n.toString())}>{n}</button>
                            ))}
                        </div>
                        
                        <div className="flex flex-col items-center">
                             <button onClick={() => handlePinDigit("1")} className="text-[#2b8cee] font-black text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">help</span>
                                Esqueceu a senha?
                             </button>
                             <button onClick={() => setShowPinOverlay(null)} className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleSelection;
