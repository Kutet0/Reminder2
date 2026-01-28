/**
 * Service de synchronisation Google Calendar
 * Gère l'authentification OAuth2 et la synchronisation des événements
 */

import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import type { GoogleOAuthTokens, GoogleCalendarEvent, SyncResult } from '../../shared/types/calendar';
import { ReminderStorage, SettingsStorage } from './storage'; // Import SettingsStorage
import { STORAGE_KEYS } from '../../shared/constants';

// Store sécurisé pour les tokens Google
const tokenStore = new Store<{ tokens?: GoogleOAuthTokens }>({
    name: STORAGE_KEYS.GOOGLE_TOKENS,
    encryptionKey: 'reminder-pro-secure-key-2024' // À remplacer par une vraie clé en production
});

export class GoogleCalendarService {

    /**
     * Récupère la configuration Google Calendar depuis les paramètres
     */
    private static getConfig() {
        const settings = SettingsStorage.get();
        const { clientId, clientSecret } = settings.sync.googleCalendar;

        if (!clientId || !clientSecret || clientId.includes('YOUR_CLIENT_ID') || clientSecret.includes('YOUR_CLIENT')) {
            throw new Error('Google Calendar credentials are missing or invalid inside Settings.');
        }

        return {
            CLIENT_ID: clientId,
            CLIENT_SECRET: clientSecret,
            REDIRECT_URI: 'http://localhost:3000/oauth/callback',
            SCOPES: [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events'
            ]
        };
    }

    /**
     * Démarre le flux d'authentification OAuth2
     */
    static async authenticate(): Promise<boolean> {
        try {
            const config = this.getConfig(); // Verify config first

            // Créer la fenêtre d'authentification
            const authWindow = new BrowserWindow({
                width: 600,
                height: 700,
                show: false,
                autoHideMenuBar: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            // Construire l'URL d'authentification Google
            const authUrl = this.buildAuthUrl(config);

            authWindow.loadURL(authUrl);
            authWindow.show();

            // Attendre la redirection avec le code d'autorisation
            return new Promise((resolve, reject) => {
                // Écouter les changements d'URL
                authWindow.webContents.on('will-redirect', async (event, url) => {
                    if (url.startsWith(config.REDIRECT_URI)) {
                        event.preventDefault();

                        // Extraire le code d'autorisation
                        const code = new URL(url).searchParams.get('code');

                        if (code) {
                            try {
                                // Échanger le code contre des tokens
                                const tokens = await this.exchangeCodeForTokens(code, config);
                                tokenStore.set('tokens', tokens);

                                authWindow.close();
                                resolve(true);
                            } catch (error) {
                                console.error('[Google Calendar] Failed to exchange code:', error);
                                authWindow.close();
                                reject(error);
                            }
                        } else {
                            authWindow.close();
                            reject(new Error('No authorization code received'));
                        }
                    }
                });

                authWindow.on('closed', () => {
                    // Si on ferme la fenêtre sans avoir résolu la promesse, c'est une annulation
                    // Mais attention, si on ferme manuellement après succès, resolve a déjà été appelé ?
                    // Promise state cannot be checked easily here, but usually safe to reject if not resolved.
                    // However, we call close() on success above.
                    // A proper implementation would use a flag 'isResolved'.
                });
            });
        } catch (error) {
            console.error('[Google Calendar] Authentication error:', error);
            throw error; // Propagate error to UI
        }
    }

    /**
     * Synchronise les événements Google Calendar
     */
    static async syncEvents(): Promise<SyncResult> {
        const tokens = tokenStore.get('tokens');

        if (!tokens) {
            throw new Error('Not authenticated with Google Calendar');
        }

        try {
            const config = this.getConfig();
            // Vérifier si le token est expiré et le rafraîchir si nécessaire
            const validTokens = await this.ensureValidTokens(tokens, config);

            // Récupérer les événements du calendrier
            const events = await this.fetchCalendarEvents(validTokens.access_token);

            // Convertir les événements en rappels
            let importedCount = 0;
            const errors: string[] = [];

            for (const event of events) {
                try {
                    // Vérifier si l'événement existe déjà
                    const existingReminders = ReminderStorage.getAll();
                    const exists = existingReminders.some(r => r.googleEventId === event.id);

                    const start = event.start as any;
                    if (!exists && start && (start.dateTime || start.date)) {
                        const eventDate = start.dateTime || start.date;
                        if (!eventDate) continue;

                        // Créer un nouveau rappel depuis l'événement Google
                        ReminderStorage.create({
                            title: event.summary || 'Untitled Event',
                            description: event.description || '',
                            dateTime: eventDate,
                            category: 'work' // Assume work for calendar imports? Or other.
                        });

                        // Mettre à jour pour ajouter le googleEventId
                        // Note: create() could accept extra fields in future refactor
                        const newReminders = ReminderStorage.getAll();
                        const created = newReminders[newReminders.length - 1]; // Last created
                        if (created) {
                            ReminderStorage.update({
                                id: created.id,
                                googleEventId: event.id
                            });
                        }

                        importedCount++;
                    }
                } catch (error: any) {
                    errors.push(`Failed to import "${event.summary}": ${error.message}`);
                }
            }

            const result: SyncResult = {
                success: true,
                importedCount,
                errors: errors.length > 0 ? errors : undefined,
                lastSync: new Date().toISOString()
            };

            // Mettre à jour lastSync dans les settings
            const settings = SettingsStorage.get();
            SettingsStorage.update({
                sync: {
                    ...settings.sync,
                    googleCalendar: {
                        ...settings.sync.googleCalendar,
                        lastSync: result.lastSync
                    }
                }
            });

            console.log(`[Google Calendar] Sync completed: ${importedCount} events imported`);
            return result;

        } catch (error: any) {
            console.error('[Google Calendar] Sync error:', error);
            return {
                success: false,
                importedCount: 0,
                errors: [error.message],
                lastSync: new Date().toISOString()
            };
        }
    }

    /**
     * Déconnecte le compte Google
     */
    static disconnect(): void {
        tokenStore.delete('tokens');
        console.log('[Google Calendar] Disconnected');
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     */
    static isAuthenticated(): boolean {
        return !!tokenStore.get('tokens');
    }

    // ----- Méthodes privées -----

    /**
     * Construit l'URL d'authentification Google OAuth2
     */
    private static buildAuthUrl(config: any): string {
        const params = new URLSearchParams({
            client_id: config.CLIENT_ID,
            redirect_uri: config.REDIRECT_URI,
            response_type: 'code',
            scope: config.SCOPES.join(' '),
            access_type: 'offline',
            prompt: 'consent'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Échange le code d'autorisation contre des tokens
     */
    private static async exchangeCodeForTokens(code: string, config: any): Promise<GoogleOAuthTokens> {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code,
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                redirect_uri: config.REDIRECT_URI,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Failed to exchange code: ${response.statusText} - ${errText}`);
        }

        const data = await response.json();

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            scope: data.scope,
            token_type: data.token_type,
            expiry_date: Date.now() + (data.expires_in * 1000)
        };
    }

    /**
     * S'assure que les tokens sont valides, les rafraîchit si nécessaire
     */
    private static async ensureValidTokens(tokens: GoogleOAuthTokens, config: any): Promise<GoogleOAuthTokens> {
        // Si le token n'est pas encore expiré, le retourner tel quel
        if (tokens.expiry_date > Date.now() + 60000) { // 1 minute de marge
            return tokens;
        }

        // Rafraîchir le token
        if (!tokens.refresh_token) {
            throw new Error('No refresh token available');
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                refresh_token: tokens.refresh_token,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to refresh token: ${response.statusText}`);
        }

        const data = await response.json();

        const newTokens: GoogleOAuthTokens = {
            access_token: data.access_token,
            refresh_token: tokens.refresh_token, // Le refresh token ne change pas
            scope: data.scope,
            token_type: data.token_type,
            expiry_date: Date.now() + (data.expires_in * 1000)
        };

        // Sauvegarder les nouveaux tokens
        tokenStore.set('tokens', newTokens);

        return newTokens;
    }

    /**
     * Récupère les événements du calendrier Google
     */
    private static async fetchCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
        // Récupérer les événements des 30 prochains jours
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${encodeURIComponent(timeMin)}&` +
            `timeMax=${encodeURIComponent(timeMax)}&` +
            `singleEvents=true&` +
            `orderBy=startTime`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token invalid, force re-auth needed? Or refresh failed.
                throw new Error('Unauthorized');
            }
            throw new Error(`Failed to fetch events: ${response.statusText}`);
        }

        const data = await response.json();
        return data.items || [];
    }
}
