
import React from 'react';
import { Dream, Member } from '../types';

interface Props {
    member: Member;
    onSelectDream: (id: string) => void;
    onBack: () => void;
}

const JourneyPath: React.FC<Props> = ({ member, onSelectDream, onBack }) => {
    const activeDreams = member.dreams.filter(d => d.status === 'active');

    return (
        <div className="flex-1 flex flex-col bg-sky-50 min-h-screen pb-32">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100 p-6 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-sm font-black text-sky-900 uppercase tracking-widest">Trilha do Herói</h1>
                <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    <span className="material-symbols-outlined text-amber-500 text-xs fill-1">monetization_on</span>
                    <span className="text-xs font-black text-amber-700">{member.coins}</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center pt-10 px-6">
                <div className="w-full max-w-xs relative">
                    {/* Linha da Trilha */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-4 bg-sky-200 rounded-full"></div>

                    <div className="flex flex-col gap-20 relative z-10">
                        {activeDreams.length > 0 ? activeDreams.map((dream, index) => {
                            const isLeft = index % 2 === 0;
                            const progress = (dream.currentAmount / dream.targetAmount) * 100;
                            
                            return (
                                <div key={dream.id} className={`flex w-full items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <button 
                                        onClick={() => onSelectDream(dream.id)}
                                        className="relative group active:scale-90 transition-transform"
                                    >
                                        {/* Progress Ring */}
                                        <div className="absolute -inset-4 rounded-full border-8 border-sky-200"></div>
                                        <div 
                                            className="absolute -inset-4 rounded-full border-8 border-emerald-400 border-t-transparent border-l-transparent transition-all duration-1000"
                                            style={{ transform: `rotate(${progress * 3.6}deg)` }}
                                        ></div>

                                        <div className="w-24 h-24 bg-white rounded-full shadow-xl border-4 border-white overflow-hidden flex items-center justify-center relative">
                                            {dream.imageUrl ? (
                                                <img src={dream.imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-sky-400 fill-1">{dream.icon}</span>
                                            )}
                                            
                                            {progress >= 100 && (
                                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-4xl font-black drop-shadow-md">check</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? 'left-full ml-8' : 'right-full mr-8'} w-32`}>
                                            <h3 className="font-black text-sky-900 text-xs uppercase leading-tight">{dream.title}</h3>
                                            <div className="h-1.5 w-full bg-sky-200 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )
                        }) : (
                            <div className="flex flex-col items-center py-20 text-sky-300">
                                <span className="material-symbols-outlined text-6xl mb-4">map</span>
                                <p className="font-black uppercase text-xs">Nenhum sonho na trilha</p>
                            </div>
                        )}

                        {/* Nodo de Unidade Final / Baú */}
                        <div className="flex justify-center mt-10">
                            <div className="w-28 h-28 bg-amber-400 rounded-[2.5rem] shadow-2xl border-4 border-white flex items-center justify-center animate-bounce">
                                <span className="material-symbols-outlined text-white text-5xl fill-1">redeem</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JourneyPath;
