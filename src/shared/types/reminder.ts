/**
 * Types principaux pour les rappels
 */

export type ReminderCategory = 'personal' | 'work' | 'health' | 'other';

export interface Reminder {
    id: string;
    title: string;
    description: string;
    dateTime: string; // ISO 8601 format
    category: ReminderCategory;
    completed: boolean;
    snoozedUntil?: string; // ISO 8601 format
    googleEventId?: string; // ID de l'événement Google Calendar
    createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
}

export interface CreateReminderInput {
    title: string;
    description: string;
    dateTime: string;
    category: ReminderCategory;
}

export interface UpdateReminderInput {
    id: string;
    title?: string;
    description?: string;
    dateTime?: string;
    category?: ReminderCategory;
    completed?: boolean;
}

export interface ReminderStats {
    today: number;
    thisWeek: number;
    thisMonth: number;
    activeTotal: number;
}

export interface ReminderFilter {
    status: 'all' | 'active' | 'completed';
    category?: ReminderCategory;
    dateRange?: {
        start: string;
        end: string;
    };
}
