/**
 * Preload Script - Bridge sécurisé entre Main et Renderer
 * Utilise contextBridge pour exposer uniquement les API nécessaires
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { Reminder, CreateReminderInput, UpdateReminderInput, ReminderStats } from '../shared/types/reminder';
import type { Settings } from '../shared/types/settings';
import type { SyncResult } from '../shared/types/calendar';

// API exposée au renderer process
const electronAPI = {
    // Reminders
    reminders: {
        getAll: (): Promise<Reminder[]> =>
            ipcRenderer.invoke(IPC_CHANNELS.GET_REMINDERS),

        create: (data: CreateReminderInput): Promise<Reminder> =>
            ipcRenderer.invoke(IPC_CHANNELS.CREATE_REMINDER, data),

        update: (data: UpdateReminderInput): Promise<Reminder> =>
            ipcRenderer.invoke(IPC_CHANNELS.UPDATE_REMINDER, data),

        delete: (id: string): Promise<void> =>
            ipcRenderer.invoke(IPC_CHANNELS.DELETE_REMINDER, id),

        getStats: (): Promise<ReminderStats> =>
            ipcRenderer.invoke(IPC_CHANNELS.GET_STATS),

        // Écouter les changements de rappels
        onRemindersChanged: (callback: (reminders: Reminder[]) => void) => {
            const subscription = (_event: any, reminders: Reminder[]) => callback(reminders);
            ipcRenderer.on('reminders:changed', subscription);
            return () => ipcRenderer.removeListener('reminders:changed', subscription);
        }
    },

    // Settings
    settings: {
        get: (): Promise<Settings> =>
            ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),

        update: (settings: Partial<Settings>): Promise<Settings> =>
            ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, settings)
    },

    // Google Calendar
    calendar: {
        authenticate: (): Promise<boolean> =>
            ipcRenderer.invoke(IPC_CHANNELS.GOOGLE_AUTH),

        sync: (): Promise<SyncResult> =>
            ipcRenderer.invoke(IPC_CHANNELS.GOOGLE_SYNC),

        disconnect: (): Promise<void> =>
            ipcRenderer.invoke(IPC_CHANNELS.GOOGLE_DISCONNECT)
    },

    // Window Controls
    window: {
        minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
        maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
        close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE)
    },

    // Notifications
    notifications: {
        show: (reminder: Reminder) =>
            ipcRenderer.send(IPC_CHANNELS.SHOW_NOTIFICATION, reminder),

        snooze: (id: string, minutes: number) =>
            ipcRenderer.send(IPC_CHANNELS.SNOOZE_REMINDER, id, minutes),

        complete: (id: string) =>
            ipcRenderer.send(IPC_CHANNELS.COMPLETE_REMINDER, id),

        // Écouter les notifications entrantes
        onNotification: (callback: (reminder: Reminder) => void) => {
            const subscription = (_event: any, reminder: Reminder) => callback(reminder);
            ipcRenderer.on('notification:trigger', subscription);
            return () => ipcRenderer.removeListener('notification:trigger', subscription);
        }
    },

    // Méthodes pour la fenêtre de notification dédiée
    onNotificationData: (callback: (data: Reminder) => void) => {
        const subscription = (_event: any, data: Reminder) => callback(data);
        ipcRenderer.on('notification:data', subscription);
        return () => ipcRenderer.removeListener('notification:data', subscription);
    },

    closeNotification: (id: string) => ipcRenderer.send(IPC_CHANNELS.CLOSE_NOTIFICATION, id)
};

// Type de l'API pour TypeScript
export type ElectronAPI = typeof electronAPI;

// Exposer l'API au renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
