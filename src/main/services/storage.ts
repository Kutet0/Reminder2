/**
 * Service de stockage local
 * Utilise electron-store pour persister les données de manière sécurisée
 */

import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import type { Reminder, CreateReminderInput, UpdateReminderInput, ReminderStats } from '../../shared/types/reminder';
import type { Settings } from '../../shared/types/settings';
import { DEFAULT_SETTINGS } from '../../shared/types/settings';
import { STORAGE_KEYS } from '../../shared/constants';

// Configuration des stores
const remindersStore = new Store<{ reminders: Reminder[] }>({
    name: STORAGE_KEYS.REMINDERS,
    defaults: {
        reminders: []
    }
});

const settingsStore = new Store<{ settings: Settings }>({
    name: STORAGE_KEYS.SETTINGS,
    defaults: {
        settings: DEFAULT_SETTINGS
    }
});

/**
 * Service de gestion des rappels
 */
export class ReminderStorage {
    /**
     * Récupère tous les rappels
     */
    static getAll(): Reminder[] {
        return remindersStore.get('reminders', []);
    }

    /**
     * Récupère un rappel par ID
     */
    static getById(id: string): Reminder | undefined {
        const reminders = this.getAll();
        return reminders.find(r => r.id === id);
    }

    /**
     * Crée un nouveau rappel
     */
    static create(input: CreateReminderInput): Reminder {
        const now = new Date().toISOString();
        const reminder: Reminder = {
            id: uuidv4(),
            ...input,
            completed: false,
            createdAt: now,
            updatedAt: now
        };

        const reminders = this.getAll();
        reminders.push(reminder);
        remindersStore.set('reminders', reminders);

        return reminder;
    }

    /**
     * Met à jour un rappel existant
     */
    static update(input: UpdateReminderInput): Reminder | null {
        const reminders = this.getAll();
        const index = reminders.findIndex(r => r.id === input.id);

        if (index === -1) {
            return null;
        }

        const updatedReminder: Reminder = {
            ...reminders[index],
            ...input,
            updatedAt: new Date().toISOString()
        };

        reminders[index] = updatedReminder;
        remindersStore.set('reminders', reminders);

        return updatedReminder;
    }

    /**
     * Supprime un rappel
     */
    static delete(id: string): boolean {
        const reminders = this.getAll();
        const filtered = reminders.filter(r => r.id !== id);

        if (filtered.length === reminders.length) {
            return false; // Aucun rappel supprimé
        }

        remindersStore.set('reminders', filtered);
        return true;
    }

    /**
     * Calcule les statistiques des rappels
     */
    static getStats(): ReminderStats {
        const reminders = this.getAll();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats: ReminderStats = {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            activeTotal: 0
        };

        reminders.forEach(reminder => {
            if (reminder.completed) return;

            const reminderDate = new Date(reminder.dateTime);
            stats.activeTotal++;

            if (reminderDate >= today && reminderDate < new Date(today.getTime() + 86400000)) {
                stats.today++;
            }

            if (reminderDate >= weekStart) {
                stats.thisWeek++;
            }

            if (reminderDate >= monthStart) {
                stats.thisMonth++;
            }
        });

        return stats;
    }

    /**
     * Récupère les rappels actifs à venir
     */
    static getUpcoming(limit: number = 5): Reminder[] {
        const reminders = this.getAll();
        const now = new Date();

        return reminders
            .filter(r => !r.completed && new Date(r.dateTime) > now)
            .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
            .slice(0, limit);
    }

    /**
     * Récupère les rappels pour une date spécifique
     */
    static getByDate(date: Date): Reminder[] {
        const reminders = this.getAll();
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nextDate = new Date(targetDate.getTime() + 86400000);

        return reminders.filter(r => {
            const reminderDate = new Date(r.dateTime);
            return reminderDate >= targetDate && reminderDate < nextDate;
        });
    }

    /**
     * Snooze un rappel (reporte son heure)
     */
    static snooze(id: string, minutes: number): Reminder | null {
        const reminder = this.getById(id);
        if (!reminder) return null;

        const newDateTime = new Date(new Date(reminder.dateTime).getTime() + minutes * 60000);
        return this.update({
            id,
            dateTime: newDateTime.toISOString(),
            snoozedUntil: newDateTime.toISOString()
        });
    }
}

/**
 * Service de gestion des paramètres
 */
export class SettingsStorage {
    /**
     * Récupère les paramètres
     */
    static get(): Settings {
        return settingsStore.get('settings', DEFAULT_SETTINGS);
    }

    /**
     * Met à jour les paramètres
     */
    static update(updates: Partial<Settings>): Settings {
        const current = this.get();
        const updated: Settings = {
            general: { ...current.general, ...updates.general },
            notifications: { ...current.notifications, ...updates.notifications },
            sync: { ...current.sync, ...updates.sync }
        };

        settingsStore.set('settings', updated);
        return updated;
    }

    /**
     * Réinitialise les paramètres par défaut
     */
    static reset(): Settings {
        settingsStore.set('settings', DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }
}
