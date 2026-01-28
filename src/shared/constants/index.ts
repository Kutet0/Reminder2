/**
 * Constantes de l'application
 */

// IPC Channels
export const IPC_CHANNELS = {
    // Reminders
    GET_REMINDERS: 'reminders:get',
    CREATE_REMINDER: 'reminders:create',
    UPDATE_REMINDER: 'reminders:update',
    DELETE_REMINDER: 'reminders:delete',
    GET_STATS: 'reminders:stats',

    // Settings
    GET_SETTINGS: 'settings:get',
    UPDATE_SETTINGS: 'settings:update',

    // Calendar Sync
    GOOGLE_AUTH: 'calendar:google-auth',
    GOOGLE_SYNC: 'calendar:google-sync',
    GOOGLE_DISCONNECT: 'calendar:google-disconnect',

    // Window Controls
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_CLOSE: 'window:close',

    // Notifications
    SHOW_NOTIFICATION: 'notification:show',
    SNOOZE_REMINDER: 'notification:snooze',
    COMPLETE_REMINDER: 'notification:complete',
    CLOSE_NOTIFICATION: 'notification:close'
} as const;

// Category Colors (Midnight Indigo Palette)
export const CATEGORY_COLORS = {
    personal: {
        bg: 'rgba(139, 92, 246, 0.2)', // Purple
        border: 'rgba(139, 92, 246, 0.5)',
        text: '#a78bfa',
        icon: '🏠'
    },
    work: {
        bg: 'rgba(99, 102, 241, 0.2)', // Indigo
        border: 'rgba(99, 102, 241, 0.5)',
        text: '#818cf8',
        icon: '💼'
    },
    health: {
        bg: 'rgba(236, 72, 153, 0.2)', // Pink
        border: 'rgba(236, 72, 153, 0.5)',
        text: '#f472b6',
        icon: '❤️'
    },
    other: {
        bg: 'rgba(148, 163, 184, 0.2)', // Slate
        border: 'rgba(148, 163, 184, 0.5)',
        text: '#94a3b8',
        icon: '📌'
    }
} as const;

// Time Constants
export const TIME_CONSTANTS = {
    SCHEDULER_INTERVAL: 30000, // 30 seconds
    DEFAULT_SNOOZE_MINUTES: 5,
    DEFAULT_ADVANCE_NOTICE_MINUTES: 0,
    SYNC_INTERVAL_MINUTES: 30
} as const;

// Window Dimensions
export const WINDOW_CONFIG = {
    MAIN: {
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600
    },
    NOTIFICATION: {
        width: 400,
        height: 280
    }
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    REMINDERS: 'reminders',
    SETTINGS: 'settings',
    GOOGLE_TOKENS: 'google_tokens',
    SYNC_CACHE: 'sync_cache'
} as const;
