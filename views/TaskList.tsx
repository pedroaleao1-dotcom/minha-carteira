
import React from 'react';
import { Task } from '../types';

interface Props {
    tasks: Task[];
    onComplete: (id: string) => void;
    onBack: () => void;
}

const TaskList: React.FC<Props> = ({ tasks, onComplete, onBack }) => {
    return (
        <div className="flex-1 flex flex-col p-6">
            <header className="flex items-center justify-between mb-8 pt-4">
                <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-700 active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-800">Minhas Missões</h1>
                <div className="w-12 h-12"></div>
            </header>

            <main className="space-y-4 overflow-y-auto pb-12">
                {tasks.map(task => (
                    <div 
                        key={task.id}
                        className={`bg-white rounded-[1.5rem] p-5 border-2 flex items-center gap-4 transition-all shadow-md ${task.status === 'completed' ? 'opacity-50 grayscale border-slate-100' : 'border-white'}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${task.status === 'completed' ? 'bg-slate-100' : 'bg-blue-50'}`}>
                            <span className={`material-symbols-outlined text-3xl ${task.status === 'completed' ? 'text-slate-400' : 'text-[#2b8cee]'}`}>
                                {task.icon}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-800 leading-tight">{task.title}</h3>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[10px] font-black text-emerald-500 uppercase">+{task.reward} MOEDAS</span>
                                <span className="text-[10px] font-black text-blue-400 uppercase">+{task.xp} XP</span>
                            </div>
                        </div>
                        {task.status === 'todo' && (
                            <button 
                                onClick={() => onComplete(task.id)}
                                className="bg-emerald-500 text-white font-black px-4 py-2 rounded-full text-xs chunky-shadow-green active-press uppercase"
                            >
                                Concluir
                            </button>
                        )}
                        {task.status === 'pending' && (
                            <div className="text-amber-500 flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined animate-spin text-sm">history</span>
                                <span className="text-[8px] font-black uppercase">Aguardando</span>
                            </div>
                        )}
                        {task.status === 'completed' && (
                            <div className="text-emerald-500">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                        )}
                    </div>
                ))}
            </main>
        </div>
    );
};

export default TaskList;
