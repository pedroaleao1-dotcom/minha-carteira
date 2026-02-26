
import React from 'react';
import { TaskCompletion } from '../types';

interface Props {
    completions: TaskCompletion[];
    onSelectDay?: (day: number, completions: TaskCompletion[]) => void;
    selectedDay?: number | null;
}

const ActivityCalendar: React.FC<Props> = React.memo(({ completions, onSelectDay, selectedDay }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Gerar dias do mês atual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);

    const getCompletionsForDay = (day: number) => {
        return completions.filter(c => {
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
                    <span className="text-[8px] font-black text-slate-400 uppercase">Atividade</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[8px] font-black text-slate-300 uppercase py-1">{d}</div>
                ))}
                
                {blanks.map(b => <div key={`b-${b}`} />)}
                
                {days.map(day => {
                    const dayCompletions = getCompletionsForDay(day);
                    const completed = dayCompletions.length > 0;
                    const isToday = day === today.getDate();
                    const isSelected = selectedDay === day;

                    return (
                        <button 
                            key={day}
                            disabled={!onSelectDay}
                            onClick={() => onSelectDay?.(day, dayCompletions)}
                            className={`
                                aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all relative
                                ${completed ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-50 text-slate-400'}
                                ${isToday && !completed ? 'border-2 border-sky-400' : ''}
                                ${isSelected ? 'scale-110 ring-4 ring-emerald-200 z-10' : 'hover:scale-105'}
                                ${!onSelectDay ? 'cursor-default' : 'active:scale-95'}
                            `}
                        >
                            {day}
                            {dayCompletions.length > 1 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white rounded-full flex items-center justify-center text-[8px] border border-white">
                                    {dayCompletions.length}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

export default ActivityCalendar;
