/**
 * Hook personnalisé pour gérer les rappels
 */

import { useState, useEffect, useCallback } from 'react';
import type { Reminder, CreateReminderInput, UpdateReminderInput, ReminderStats } from '@shared/types/reminder';

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [stats, setStats] = useState<ReminderStats>({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        activeTotal: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les rappels au montage
    const loadReminders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await window.electronAPI.reminders.getAll();
            setReminders(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load reminders');
            console.error('Error loading reminders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les statistiques
    const loadStats = useCallback(async () => {
        try {
            const data = await window.electronAPI.reminders.getStats();
            setStats(data);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    }, []);

    // Créer un rappel
    const createReminder = useCallback(async (input: CreateReminderInput) => {
        try {
            const reminder = await window.electronAPI.reminders.create(input);
            // Ne pas modifier l'état ici - le listener onRemindersChanged va le faire
            // setReminders(prev => [...prev, reminder]);
            await loadStats();
            return reminder;
        } catch (err: any) {
            setError(err.message || 'Failed to create reminder');
            throw err;
        }
    }, [loadStats]);

    // Mettre à jour un rappel
    const updateReminder = useCallback(async (input: UpdateReminderInput) => {
        try {
            const reminder = await window.electronAPI.reminders.update(input);
            // Ne pas modifier l'état ici - le listener onRemindersChanged va le faire
            // setReminders(prev =>
            //     prev.map(r => r.id === reminder.id ? reminder : r)
            // );
            await loadStats();
            return reminder;
        } catch (err: any) {
            setError(err.message || 'Failed to update reminder');
            throw err;
        }
    }, [loadStats]);

    // Supprimer un rappel
    const deleteReminder = useCallback(async (id: string) => {
        try {
            await window.electronAPI.reminders.delete(id);
            // Ne pas modifier l'état ici - le listener onRemindersChanged va le faire
            // setReminders(prev => prev.filter(r => r.id !== id));
            await loadStats();
        } catch (err: any) {
            setError(err.message || 'Failed to delete reminder');
            throw err;
        }
    }, [loadStats]);

    // Marquer comme terminé
    const completeReminder = useCallback(async (id: string) => {
        try {
            await updateReminder({ id, completed: true });
        } catch (err) {
            console.error('Error completing reminder:', err);
            throw err;
        }
    }, [updateReminder]);

    // Charger au montage
    useEffect(() => {
        loadReminders();
        loadStats();
    }, [loadReminders, loadStats]);

    // Écouter les changements de rappels depuis le main process
    useEffect(() => {
        const unsubscribe = window.electronAPI.reminders.onRemindersChanged((updatedReminders) => {
            setReminders(updatedReminders);
            loadStats();
        });

        return unsubscribe;
    }, [loadStats]);

    return {
        reminders,
        stats,
        loading,
        error,
        createReminder,
        updateReminder,
        deleteReminder,
        completeReminder,
        refresh: loadReminders
    };
}
