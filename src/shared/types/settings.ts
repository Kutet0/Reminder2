/**
 * Types pour les paramètres de l'application
 */

export interface Settings {
    general: GeneralSettings;
    notifications: NotificationSettings;
    sync: SyncSettings;
}

export interface GeneralSettings {
    launchAtStartup: boolean;
    minimizeToTray: boolean;
    language: 'fr' | 'en';
    theme: 'dark' | 'light' | 'auto';
}

export interface NotificationSettings {
    enabled: boolean;
    soundEnabled: boolean;
    advanceNoticeMinutes: number; // Minutes avant l'heure du rappel
    snoozeTimeMinutes: number; // Durée par défaut pour le snooze
    position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export interface SyncSettings {
    googleCalendar: {
        enabled: boolean;
        autoSync: boolean;
        syncInterval: number; // Minutes
        lastSync?: string; // ISO 8601
    };
}

export const DEFAULT_SETTINGS: Settings = {
    general: {
        launchAtStartup: false,
        minimizeToTray: true,
        language: 'fr',
        theme: 'dark'
    },
    notifications: {
        enabled: true,
        soundEnabled: true,
        advanceNoticeMinutes: 0,
        snoozeTimeMinutes: 5,
        position: 'bottom-right'
    },
    sync: {
        googleCalendar: {
            enabled: false,
            autoSync: false,
            syncInterval: 30
        }
    }
};
