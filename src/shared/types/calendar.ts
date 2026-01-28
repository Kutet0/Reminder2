/**
 * Types pour la synchronisation Google Calendar
 */

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone?: string;
    };
    end: {
        dateTime: string;
        timeZone?: string;
    };
}

export interface GoogleCalendarCredentials {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

export interface GoogleOAuthTokens {
    access_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

export interface SyncResult {
    success: boolean;
    importedCount: number;
    errors?: string[];
    lastSync: string;
}
