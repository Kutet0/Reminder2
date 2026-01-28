/**
 * Service de planification et vérification des rappels
 * Vérifie toutes les 30 secondes les rappels à déclencher
 * Updated: 2026-01-28 - Added grace period for notifications
 */

import { BrowserWindow } from 'electron';
import { ReminderStorage, SettingsStorage } from './storage';
import { NotificationService } from './notifications';
import type { Reminder } from '../../shared/types/reminder';
import { TIME_CONSTANTS } from '../../shared/constants';

export class SchedulerService {
    private static interval: NodeJS.Timeout | null = null;
    private static notifiedReminders: Set<string> = new Set();
    private static mainWindow: BrowserWindow | null = null;

    /**
     * Démarre le scheduler
     */
    static start(mainWindow: BrowserWindow): void {
        this.mainWindow = mainWindow;

        // Arrêter le scheduler existant si présent
        this.stop();

        // Vérifier immédiatement
        this.checkReminders();

        // Puis vérifier toutes les 30 secondes
        this.interval = setInterval(() => {
            this.checkReminders();
        }, TIME_CONSTANTS.SCHEDULER_INTERVAL);

        console.log('[Scheduler] Started - checking every 30 seconds');
    }

    /**
     * Arrête le scheduler
     */
    static stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('[Scheduler] Stopped');
        }
    }

    /**
     * Vérifie les rappels à déclencher
     */
    private static checkReminders(): void {
        const reminders = ReminderStorage.getAll();
        const settings = SettingsStorage.get();
        const now = new Date();

        console.log(`[Scheduler] Checking reminders... Found ${reminders.length} total reminders`);

        // Si les notifications sont désactivées, ne rien faire
        if (!settings.notifications.enabled) {
            console.log('[Scheduler] Notifications disabled in settings');
            return;
        }

        const activeReminders = reminders.filter(r => !r.completed);
        console.log(`[Scheduler] ${activeReminders.length} active reminders`);

        reminders.forEach(reminder => {
            // Ignorer les rappels terminés
            if (reminder.completed) {
                return;
            }

            // Ignorer les rappels déjà notifiés
            if (this.notifiedReminders.has(reminder.id)) {
                console.log(`[Scheduler] Already notified: ${reminder.title}`);
                return;
            }

            const reminderTime = new Date(reminder.dateTime);
            const advanceMs = settings.notifications.advanceNoticeMinutes * 60 * 1000;
            const triggerTime = new Date(reminderTime.getTime() - advanceMs);

            // Donner une marge de 60 secondes après l'heure du rappel
            // pour s'assurer de ne pas rater la notification entre 2 checks
            const gracePeriodMs = 60 * 1000; // 1 minute
            const endTime = new Date(reminderTime.getTime() + gracePeriodMs);

            console.log(`[Scheduler] Reminder "${reminder.title}": 
  - Reminder time: ${reminderTime.toISOString()}
  - Trigger time: ${triggerTime.toISOString()} (${settings.notifications.advanceNoticeMinutes} min advance)
  - End time: ${endTime.toISOString()} (grace period)
  - Now: ${now.toISOString()}
  - Should trigger: ${now >= triggerTime && now <= endTime}`);

            // Vérifier si le moment est venu de notifier (avec marge de grâce)
            if (now >= triggerTime && now <= endTime) {
                this.triggerNotification(reminder, settings.notifications);
            }
        });

        // Nettoyer les rappels notifiés qui sont maintenant passés
        this.cleanupNotifiedReminders();
    }

    /**
     * Déclenche une notification pour un rappel
     */
    private static triggerNotification(reminder: Reminder, settings: any): void {
        console.log(`[Scheduler] Triggering notification for: ${reminder.title}`);

        // Marquer comme notifié
        this.notifiedReminders.add(reminder.id);

        // Afficher la notification
        NotificationService.show(reminder, settings);

        // Envoyer un événement au renderer process
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('notification:trigger', reminder);
        }
    }

    /**
     * Nettoie les rappels notifiés obsolètes
     */
    private static cleanupNotifiedReminders(): void {
        const reminders = ReminderStorage.getAll();
        const now = new Date();

        // Garder seulement les IDs des rappels futurs non terminés
        const activeReminderIds = new Set(
            reminders
                .filter(r => !r.completed && new Date(r.dateTime) > now)
                .map(r => r.id)
        );

        // Supprimer les IDs qui ne sont plus pertinents
        this.notifiedReminders.forEach(id => {
            if (!activeReminderIds.has(id)) {
                this.notifiedReminders.delete(id);
            }
        });
    }

    /**
     * Réinitialise l'état de notification pour un rappel
     * (utile quand un rappel est mis à jour ou snoozé)
     */
    static resetNotification(reminderId: string): void {
        this.notifiedReminders.delete(reminderId);

        // Fermer la notification si elle est affichée
        NotificationService.close(reminderId);
    }

    /**
     * Réinitialise tous les états de notification
     */
    static resetAll(): void {
        this.notifiedReminders.clear();
        NotificationService.closeAll();
    }
}
