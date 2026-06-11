import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useCalendarEvents, useProfiles } from '../src/hooks/useData';
import { calendarService } from '../src/services/calendar';
import { notificationsService } from '../src/services/notifications';
import { CalendarEvent, EventType, RelatedEntityType, User } from '../types';
import { useNavigate } from 'react-router-dom';
import { HandoverDialog } from '../components/team/HandoverDialog';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Briefcase,
  AlertTriangle,
  Cake,
  CheckCircle,
  ArrowRightLeft,
  User as UserIcon
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: events, refetch } = useCalendarEvents(user?.tenantId);
  const { data: team } = useProfiles(user?.tenantId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scope, setScope] = useState<'MINE' | 'TEAM'>('MINE');

  // Event detail + handover
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  const ownerName = (id?: string | null) => {
    const u = (team as User[]).find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : null;
  };

  const handleHandover = async (toUserId: string, toUserName: string, note: string) => {
    if (!selectedEvent) return;
    await calendarService.reassign(selectedEvent.id, toUserId);
    await notificationsService.create({
      tenantId: user?.tenantId,
      recipientId: toUserId,
      actorId: user?.id,
      type: 'HANDOVER_EVENT',
      title: 'Termin übergeben',
      body: `${user?.firstName} ${user?.lastName} hat dir «${selectedEvent.title}» übergeben${note ? `: ${note}` : '.'}`,
      link: '/calendar',
      relatedType: 'EVENT',
      relatedId: selectedEvent.id,
    });
    setSelectedEvent(null);
    refetch();
  };

  // New-event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '09:00', type: EventType.MEETING as EventType });

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.date) return;
    setSavingEvent(true);
    try {
      const start = new Date(`${eventForm.date}T${eventForm.time || '09:00'}`);
      await calendarService.create({
        title: eventForm.title.trim(),
        start,
        end: start,
        type: eventForm.type,
        relatedType: 'NONE',
        relatedId: '',
        isAllDay: false,
        tenantId: user?.tenantId,
        userId: user?.id,
      } as any);
      setIsEventModalOpen(false);
      setEventForm({ title: '', date: '', time: '09:00', type: EventType.MEETING });
      refetch();
    } finally {
      setSavingEvent(false);
    }
  };

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

  const openRelated = (event: CalendarEvent) => {
    switch (event.relatedType) {
        case RelatedEntityType.CLIENT: navigate(`/client/${event.relatedId}`); break;
        case RelatedEntityType.POLICY: navigate(`/policy/${event.relatedId}`); break;
        case RelatedEntityType.MORTGAGE: navigate(`/mortgage/${event.relatedId}`); break;
        case RelatedEntityType.PARTNER: navigate(`/partner/${event.relatedId}`); break;
    }
  };
  const hasRelated = (e: CalendarEvent) =>
    e.relatedId && [RelatedEntityType.CLIENT, RelatedEntityType.POLICY, RelatedEntityType.MORTGAGE, RelatedEntityType.PARTNER].includes(e.relatedType as RelatedEntityType);

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

  // Mine = events I own or that have no explicit owner (legacy/seed).
  const scopedEvents = events.filter(e => scope === 'TEAM' || !e.userId || e.userId === user?.id);

  const getEventsForDay = (day: number) => {
      return scopedEvents.filter(e =>
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
            <div className="flex items-center gap-2">
                <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
                    <button onClick={() => setScope('MINE')} className={`px-3 py-1 rounded text-sm font-medium ${scope === 'MINE' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500'}`}>Meine</button>
                    <button onClick={() => setScope('TEAM')} className={`px-3 py-1 rounded text-sm font-medium ${scope === 'TEAM' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-slate-500'}`}>Team</button>
                </div>
                <Button icon={<Plus size={18} />} onClick={() => setIsEventModalOpen(true)}>Neuer Termin</Button>
            </div>
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
                                                onClick={() => setSelectedEvent(event)}
                                                className={`
                                                    text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1.5 truncate
                                                    ${getEventStyles(event.type)}
                                                `}
                                                title={`${event.title}${scope === 'TEAM' && ownerName(event.userId) ? ` · ${ownerName(event.userId)}` : ''}`}
                                            >
                                                <span className="shrink-0">{getEventIcon(event.type)}</span>
                                                <span className="truncate font-medium">{event.title}</span>
                                                {scope === 'TEAM' && event.userId && event.userId !== user?.id && (
                                                    <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-white/60 dark:bg-black/30 text-[8px] font-bold flex items-center justify-center" title={ownerName(event.userId) || ''}>
                                                        {(ownerName(event.userId) || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                )}
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

      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title="Neuer Termin" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Titel *</label>
            <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Datum *</label>
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Zeit</label>
              <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Typ</label>
            <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as EventType })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
              {Object.values(EventType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)} disabled={savingEvent}>Abbrechen</Button>
            <Button onClick={handleCreateEvent} disabled={savingEvent}>{savingEvent ? 'Speichere…' : 'Termin erstellen'}</Button>
          </div>
        </div>
      </Modal>

      {/* EVENT DETAIL + HANDOVER */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Termin" maxWidth="max-w-md">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-lg ${getEventStyles(selectedEvent.type)}`}>{getEventIcon(selectedEvent.type)}</span>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedEvent.title}</h3>
                <p className="text-xs text-slate-500">{selectedEvent.start.toLocaleString('de-CH')}</p>
              </div>
            </div>
            {selectedEvent.description && <p className="text-sm text-slate-600 dark:text-slate-300">{selectedEvent.description}</p>}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UserIcon size={14} />
              <span>Zuständig: <strong>{ownerName(selectedEvent.userId) || 'nicht zugewiesen'}</strong>{selectedEvent.userId === user?.id ? ' (Sie)' : ''}</span>
            </div>
            <div className="flex justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {hasRelated(selectedEvent)
                ? <Button variant="outline" onClick={() => openRelated(selectedEvent)}>Datensatz öffnen</Button>
                : <span />}
              <Button icon={<ArrowRightLeft size={16} />} onClick={() => setIsHandoverOpen(true)}>An Kollegen übergeben</Button>
            </div>
          </div>
        )}
      </Modal>

      <HandoverDialog
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        title="Termin übergeben"
        subjectLabel={selectedEvent?.title || ''}
        tenantId={user?.tenantId}
        currentUserId={selectedEvent?.userId ?? user?.id}
        onConfirm={async (toId, _name, note) => { await handleHandover(toId, _name, note); setIsHandoverOpen(false); }}
      />
    </Layout>
  );
};