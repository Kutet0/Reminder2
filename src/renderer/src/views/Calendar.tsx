import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useReminders } from '../hooks/useReminders';
import './Calendar.css';

export const Calendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const { reminders } = useReminders();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await window.electronAPI.calendar.sync();
            if (result.success) {
                console.log('Sync réussie', result);
            } else {
                console.error('Erreur sync', result.errors);
                if (result.errors && result.errors.some((e: string) => e.includes('Not authenticated'))) {
                    alert("Vous n'êtes pas connecté à Google Calendar. Allez dans les Paramètres.");
                } else {
                    alert("Erreur lors de la synchronisation : " + (result.errors?.[0] || 'Inconnue'));
                }
            }
        } catch (error) {
            console.error('Sync failed', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Générer les jours à afficher
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lundi
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarboard = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    // Navigation
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    // Filtrer les rappels pour un jour donné
    const getRemindersForDay = (day: Date) => {
        return reminders.filter(reminder => isSameDay(new Date(reminder.dateTime), day));
    };

    return (
        <div className="calendar-view">
            <div className="calendar-header">
                <div className="calendar-title-group">
                    <h1>Calendrier</h1>
                    <div className="flex gap-2 items-center">
                        <p className="calendar-subtitle">
                            Gérez vos rappels au fil du temps
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSync}
                            disabled={isSyncing}
                            title="Synchroniser avec Google Calendar"
                            style={{ marginLeft: '10px' }}
                        >
                            <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
                        </Button>
                    </div>
                </div>

                <div className="calendar-controls">
                    <Button variant="ghost" onClick={prevMonth} icon={<ChevronLeft size={20} />} />
                    <h2>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
                    <Button variant="ghost" onClick={nextMonth} icon={<ChevronRight size={20} />} />
                    <Button variant="ghost" onClick={goToToday} style={{ marginLeft: '10px' }}>
                        Aujourd'hui
                    </Button>
                </div>
            </div>

            <div className="calendar-container">
                <div className="week-days">
                    {weekDays.map(day => (
                        <div key={day} className="week-day">{day}</div>
                    ))}
                </div>

                <div className="days-grid">
                    {calendarboard.map((day, idx) => {
                        const dayReminders = getRemindersForDay(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);

                        return (
                            <div
                                key={idx}
                                className={`calendar-day 
                                    ${!isSameMonth(day, monthStart) ? 'other-month' : ''} 
                                    ${isToday(day) ? 'today' : ''}
                                    ${isSelected ? 'selected' : ''}
                                `}
                                onClick={() => setSelectedDate(day)}
                            >
                                <span className="day-number">{format(day, 'd')}</span>

                                <div className="day-reminders">
                                    {dayReminders.slice(0, 3).map(reminder => (
                                        <div key={reminder.id} className={`mini-reminder ${reminder.category}`}>
                                            {format(new Date(reminder.dateTime), 'HH:mm')} {reminder.title}
                                        </div>
                                    ))}
                                    {dayReminders.length > 3 && (
                                        <div className="mini-reminder more">
                                            +{dayReminders.length - 3} autres
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div className="selected-day-details">
                    <Card title={`Rappels du ${format(selectedDate, 'd MMMM yyyy', { locale: fr })}`}>
                        {getRemindersForDay(selectedDate).length > 0 ? (
                            <div className="reminders-list">
                                {getRemindersForDay(selectedDate).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map(reminder => (
                                    <div key={reminder.id} className="reminder-item-row" style={{ padding: '10px', borderBottom: '1px solid var(--slate-700)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className={`category-dot ${reminder.category}`} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'currentColor' }}></div>
                                        <Clock size={16} className="text-slate-400" />
                                        <span className="font-mono text-slate-300">
                                            {format(new Date(reminder.dateTime), 'HH:mm')}
                                        </span>
                                        <span className={`font-medium ${reminder.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                            {reminder.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400">Aucun rappel prévu pour ce jour.</p>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};
