/**
 * Gestionnaires IPC - Communication Main <-> Renderer
 * Gère toutes les requêtes du renderer process
 */

import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { ReminderStorage, SettingsStorage } from '../services/storage';
import { GoogleCalendarService } from '../services/calendar';
import { SchedulerService } from '../services/scheduler';
import type { CreateReminderInput, UpdateReminderInput } from '../../shared/types/reminder';
import type { Settings } from '../../shared/types/settings';

/**
 * Enregistre tous les gestionnaires IPC
 */
export function registerIPCHandlers(mainWindow: BrowserWindow): void {
    // ========== Reminders ==========

    ipcMain.handle(IPC_CHANNELS.GET_REMINDERS, async () => {
        try {
            return ReminderStorage.getAll();
        } catch (error: any) {
            console.error('[IPC] GET_REMINDERS error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.CREATE_REMINDER, async (_event, data: CreateReminderInput) => {
        try {
            const reminder = ReminderStorage.create(data);

            // Notifier le renderer du changement
            mainWindow.webContents.send('reminders:changed', ReminderStorage.getAll());

            return reminder;
        } catch (error: any) {
            console.error('[IPC] CREATE_REMINDER error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.UPDATE_REMINDER, async (_event, data: UpdateReminderInput) => {
        try {
            const reminder = ReminderStorage.update(data);

            if (!reminder) {
                throw new Error('Reminder not found');
            }

            // Si le rappel a été modifié (date/heure), réinitialiser sa notification
            if (data.dateTime) {
                SchedulerService.resetNotification(data.id);
            }

            // Notifier le renderer du changement
            mainWindow.webContents.send('reminders:changed', ReminderStorage.getAll());

            return reminder;
        } catch (error: any) {
            console.error('[IPC] UPDATE_REMINDER error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.DELETE_REMINDER, async (_event, id: string) => {
        try {
            const success = ReminderStorage.delete(id);

            if (!success) {
                throw new Error('Reminder not found');
            }

            // Fermer la notification si elle est affichée
            SchedulerService.resetNotification(id);

            // Notifier le renderer du changement
            mainWindow.webContents.send('reminders:changed', ReminderStorage.getAll());

            return true;
        } catch (error: any) {
            console.error('[IPC] DELETE_REMINDER error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.GET_STATS, async () => {
        try {
            return ReminderStorage.getStats();
        } catch (error: any) {
            console.error('[IPC] GET_STATS error:', error);
            throw error;
        }
    });

    // ========== Settings ==========

    ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
        try {
            return SettingsStorage.get();
        } catch (error: any) {
            console.error('[IPC] GET_SETTINGS error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.UPDATE_SETTINGS, async (_event, updates: Partial<Settings>) => {
        try {
            const settings = SettingsStorage.update(updates);

            // Si les paramètres de notification ont changé, redémarrer le scheduler
            if (updates.notifications) {
                SchedulerService.stop();
                SchedulerService.start(mainWindow);
            }

            return settings;
        } catch (error: any) {
            console.error('[IPC] UPDATE_SETTINGS error:', error);
            throw error;
        }
    });

    // ========== Google Calendar ==========

    ipcMain.handle(IPC_CHANNELS.GOOGLE_AUTH, async () => {
        try {
            return await GoogleCalendarService.authenticate();
        } catch (error: any) {
            console.error('[IPC] GOOGLE_AUTH error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.GOOGLE_SYNC, async () => {
        try {
            const result = await GoogleCalendarService.syncEvents();

            // Si des événements ont été importés, notifier le renderer
            if (result.importedCount > 0) {
                mainWindow.webContents.send('reminders:changed', ReminderStorage.getAll());
            }

            return result;
        } catch (error: any) {
            console.error('[IPC] GOOGLE_SYNC error:', error);
            throw error;
        }
    });

    ipcMain.handle(IPC_CHANNELS.GOOGLE_DISCONNECT, async () => {
        try {
            GoogleCalendarService.disconnect();
        } catch (error: any) {
            console.error('[IPC] GOOGLE_DISCONNECT error:', error);
            throw error;
        }
    });

    // ========== Window Controls ==========

    ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
        mainWindow.minimize();
    });

    ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
        // Minimiser dans la barre des tâches au lieu de fermer
        const settings = SettingsStorage.get();
        if (settings.general.minimizeToTray) {
            mainWindow.hide();
        } else {
            mainWindow.close();
        }
    });

    // ========== Notifications ==========

    ipcMain.on(IPC_CHANNELS.SNOOZE_REMINDER, (_event, id: string, minutes: number) => {
        try {
            const reminder = ReminderStorage.snooze(id, minutes);

            if (reminder) {
                // Réinitialiser la notification pour qu'elle se déclenche à nouveau
                SchedulerService.resetNotification(id);

                // Notifier le renderer du changement
                mainWindow.webContents.send('reminders:changed', ReminderStorage.getAll());
            }
        } catch (error: any) {
            console.error('[IPC] SNOOZE_REMINDER error:', error);
        }
    });

    ipcMain.on(IPC_CHANNELS.COMPLETE_REMINDER, (_event, id: string) => {
        try {
            ReminderStorage.update({ id, completed: true });

            // Fermer la notification
            SchedulerService.resetNotification(id);

            // Notifier le renderer du changement
            mainWindow.webContents.send('reminders:changed', ReminderStorage.getAll());
        } catch (error: any) {
            console.error('[IPC] COMPLETE_REMINDER error:', error);
        }
    });

    ipcMain.on(IPC_CHANNELS.CLOSE_NOTIFICATION, (_event, id: string) => {
        try {
            // Fermer simplement la notification
            // Elle restera dans 'notifiedReminders' du Scheduler donc ne se réaffichera pas tout de suite
            // (sauf si l'app est redémarrée, mais c'est le comportement attendu)
            const { NotificationService } = require('../services/notifications');
            NotificationService.close(id);
        } catch (error: any) {
            console.error('[IPC] CLOSE_NOTIFICATION error:', error);
        }
    });

    console.log('[IPC] All handlers registered');
}

/**
 * Nettoie tous les gestionnaires IPC
 */
export function unregisterIPCHandlers(): void {
    Object.values(IPC_CHANNELS).forEach(channel => {
        ipcMain.removeHandler(channel);
        ipcMain.removeAllListeners(channel);
    });

    console.log('[IPC] All handlers unregistered');
}
