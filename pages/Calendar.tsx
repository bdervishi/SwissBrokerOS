import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { MOCK_EVENTS } from '../constants';
import { CalendarEvent, EventType, RelatedEntityType } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus,
  Clock,
  Briefcase,
  AlertTriangle,
  Cake,
  CheckCircle
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
      // JS returns 0 for Sunday, we want 0 for Monday to align with Swiss standard
      let day = new Date(year, month, 1).getDay();
      return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
      setCurrentDate(new Date());
  }

  const handleEventClick = (event: CalendarEvent) => {
    switch (event.relatedType) {
        case RelatedEntityType.CLIENT:
            navigate(`/client/${event.relatedId}`);
            break;
        case RelatedEntityType.POLICY:
            navigate(`/policy/${event.relatedId}`);
            break;
        case RelatedEntityType.MORTGAGE:
            navigate(`/mortgage/${event.relatedId}`);
            break;
        case RelatedEntityType.PARTNER:
            navigate(`/partner/${event.relatedId}`);
            break;
        default:
            // Could open a modal details here
            alert(`Event: ${event.title}\n${event.description || ''}`);
    }
  };

  // Generate Calendar Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days: (number | null)[] = [];
  // Padding for start of month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
      "Januar", "Februar", "März", "April", "Mai", "Juni", 
      "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const getEventsForDay = (day: number) => {
      return MOCK_EVENTS.filter(e => 
          e.start.getDate() === day && 
          e.start.getMonth() === month && 
          e.start.getFullYear() === year
      );
  };

  const getEventStyles = (type: EventType) => {
      switch (type) {
          case EventType.MEETING:
              return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-l-2 border-blue-500';
          case EventType.DEADLINE:
              return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-l-2 border-red-500';
          case EventType.TASK:
              return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-l-2 border-slate-500';
          case EventType.BIRTHDAY:
              return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-l-2 border-amber-500';
          default:
              return 'bg-slate-100 text-slate-700';
      }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
        case EventType.MEETING: return <Briefcase size={12} />;
        case EventType.DEADLINE: return <AlertTriangle size={12} />;
        case EventType.TASK: return <CheckCircle size={12} />;
        case EventType.BIRTHDAY: return <Cake size={12} />;
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CalendarIcon className="text-brand-600" />
                    Terminkalender
                </h1>
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="px-4 font-semibold text-slate-900 dark:text-slate-100 w-32 text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
                <Button variant="outline" size="sm" onClick={handleToday}>Heute</Button>
            </div>
            <Button icon={<Plus size={18} />}>Neuer Termin</Button>
        </div>

        {/* Calendar Grid Container */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                    <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr flex-1">
                {days.map((day, index) => {
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const events = day ? getEventsForDay(day) : [];

                    return (
                        <div 
                            key={index} 
                            className={`
                                min-h-[100px] border-b border-r border-slate-100 dark:border-slate-800 p-2 relative group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                                ${!day ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}
                                ${(index + 1) % 7 === 0 ? 'border-r-0' : ''} /* Remove right border for last col */
                            `}
                        >
                            {day && (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`
                                            w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                                            ${isToday ? 'bg-brand-600 text-white' : 'text-slate-700 dark:text-slate-300'}
                                        `}>
                                            {day}
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-brand-600 transition-opacity">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        {events.map(event => (
                                            <div 
                                                key={event.id}
                                                onClick={() => handleEventClick(event)}
                                                className={`
                                                    text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1.5 truncate
                                                    ${getEventStyles(event.type)}
                                                `}
                                                title={event.title}
                                            >
                                                <span className="shrink-0">{getEventIcon(event.type)}</span>
                                                <span className="truncate font-medium">{event.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </Layout>
  );
};