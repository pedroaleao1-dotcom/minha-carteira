
import React from 'react';
import { Member } from '../types';

interface Props {
    members: Member[];
    onEdit: (member: Member) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    onBack: () => void;
}

const ManageMembers: React.FC<Props> = ({ members, onEdit, onDelete, onAdd, onBack }) => {
    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
            <header className="p-6 pt-10 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 border-b border-slate-100">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black uppercase tracking-widest text-indigo-600">Gestão do Reino</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Administrar Heróis & Mentores</p>
                </div>
                <button onClick={onAdd} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined">person_add</span>
                </button>
            </header>

            <main className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
                <div className="space-y-4">
                    {members.map(member => (
                        <div key={member.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 group animate-pop-in">
                            <div className="relative">
                                <img src={member.avatar} className="w-16 h-16 rounded-full border-4 border-slate-50 shadow-inner object-cover" alt={member.name} />
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md ${member.role === 'parent' ? 'bg-slate-800' : 'bg-blue-500'}`}>
                                    <span className="material-symbols-outlined text-[10px] text-white">
                                        {member.role === 'parent' ? 'shield' : 'rocket_launch'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-tighter truncate">{member.name}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {member.role === 'parent' ? 'Mentor do Reino' : `Herói Nível ${member.level}`}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onEdit(member)}
                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-indigo-50 hover:text-indigo-500"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button 
                                    onClick={() => onDelete(member.id)}
                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-red-50 hover:text-red-500"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center">
                        <span className="material-symbols-outlined text-6xl">group_off</span>
                        <p className="font-black uppercase tracking-widest text-xs mt-4">Nenhum habitante encontrado</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageMembers;
