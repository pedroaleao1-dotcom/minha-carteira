
import React from 'react';
import { TaskCompletion } from '../types';

interface Props {
    completions: TaskCompletion[];
}

const ActivityCalendar: React.FC<Props> = ({ completions }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Gerar dias do mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);

    const isDayCompleted = (day: number) => {
        return completions.some(c => {
            const date = new Date(c.completedAt);
            return date.getDate() === day && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 w-full">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{monthNames[currentMonth]} {currentYear}</h3>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase">Missões</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                    <div key={d} className="text-center text-[8px] font-black text-slate-300 uppercase py-1">{d}</div>
                ))}
                
                {blanks.map(b => <div key={`b-${b}`} />)}
                
                {days.map(day => {
                    const completed = isDayCompleted(day);
                    const isToday = day === today.getDate();

                    return (
                        <div 
                            key={day}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all
                                ${completed ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400'}
                                ${isToday && !completed ? 'border-2 border-sky-400' : ''}
                            `}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityCalendar;
