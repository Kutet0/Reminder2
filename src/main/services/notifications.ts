/**
 * Service de gestion des notifications
 * Gère les fenêtres de notification personnalisées et les sons système
 */

import { BrowserWindow, screen, shell } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from '../../shared/constants';
import type { Reminder } from '../../shared/types/reminder';
import type { NotificationSettings } from '../../shared/types/settings';

export class NotificationService {
    private static notificationWindows: Map<string, BrowserWindow> = new Map();

    /**
     * Affiche une notification pour un rappel
     */
    static show(reminder: Reminder, settings: NotificationSettings): void {
        console.log(`[Notifications] Showing notification for: ${reminder.title}`);

        // Éviter les doublons
        if (this.notificationWindows.has(reminder.id)) {
            return;
        }

        // Jouer le son si activé
        if (settings.soundEnabled) {
            this.playNotificationSound();
        }

        // Créer la fenêtre de notification personnalisée
        const notificationWindow = this.createNotificationWindow(reminder, settings.position);
        this.notificationWindows.set(reminder.id, notificationWindow);

        // Auto-fermeture après 30 secondes
        setTimeout(() => {
            this.close(reminder.id);
        }, 30000);

        // Nettoyer quand la fenêtre est fermée
        notificationWindow.on('closed', () => {
            this.notificationWindows.delete(reminder.id);
        });
    }

    /**
     * Crée une fenêtre de notification
     */
    private static createNotificationWindow(
        reminder: Reminder,
        position: NotificationSettings['position']
    ): BrowserWindow {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

        // Calculer la position selon les préférences
        const positions = {
            'top-right': { x: screenWidth - WINDOW_CONFIG.NOTIFICATION.width - 20, y: 20 },
            'bottom-right': { x: screenWidth - WINDOW_CONFIG.NOTIFICATION.width - 20, y: screenHeight - WINDOW_CONFIG.NOTIFICATION.height - 20 },
            'top-left': { x: 20, y: 20 },
            'bottom-left': { x: 20, y: screenHeight - WINDOW_CONFIG.NOTIFICATION.height - 20 }
        };

        const pos = positions[position];

        const window = new BrowserWindow({
            width: WINDOW_CONFIG.NOTIFICATION.width,
            height: WINDOW_CONFIG.NOTIFICATION.height,
            x: pos.x,
            y: pos.y,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../preload/index.js')
            }
        });

        // Charger la page de notification avec les données du rappel
        if (process.env.VITE_DEV_SERVER_URL) {
            window.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#/notification`);
        } else {
            window.loadFile(path.join(__dirname, '../../dist/index.html'), { hash: 'notification' });
        }

        // Envoyer les données du rappel une fois la page chargée
        window.webContents.on('did-finish-load', () => {
            window.webContents.send('notification:data', reminder);
            window.show();

            // Animation d'apparition (slide in)
            window.setOpacity(0);
            let opacity = 0;
            const fadeIn = setInterval(() => {
                opacity += 0.1;
                window.setOpacity(opacity);
                if (opacity >= 1) {
                    clearInterval(fadeIn);
                }
            }, 30);
        });

        // Éviter que la fenêtre ne prenne le focus
        window.setAlwaysOnTop(true, 'floating');
        window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

        return window;
    }

    /**
     * Ferme une notification spécifique
     */
    static close(reminderId: string): void {
        const window = this.notificationWindows.get(reminderId);
        if (window && !window.isDestroyed()) {
            // Animation de disparition
            let opacity = 1;
            const fadeOut = setInterval(() => {
                opacity -= 0.1;
                if (opacity <= 0 || window.isDestroyed()) {
                    clearInterval(fadeOut);
                    if (!window.isDestroyed()) {
                        window.close();
                    }
                } else {
                    window.setOpacity(opacity);
                }
            }, 30);
        }
        this.notificationWindows.delete(reminderId);
    }

    /**
     * Ferme toutes les notifications
     */
    static closeAll(): void {
        this.notificationWindows.forEach((window, id) => {
            if (!window.isDestroyed()) {
                window.close();
            }
        });
        this.notificationWindows.clear();
    }

    /**
     * Joue le son de notification système
     */
    private static playNotificationSound(): void {
        // Sur Windows, utilise le son système
        if (process.platform === 'win32') {
            shell.beep();
        } else if (process.platform === 'darwin') {
            // Sur macOS, utilise le son système par défaut
            shell.beep();
        } else {
            // Sur Linux, essaie de jouer un son
            shell.beep();
        }
    }

    /**
     * Vérifie si une notification est affichée pour un rappel
     */
    static isShowing(reminderId: string): boolean {
        return this.notificationWindows.has(reminderId);
    }
}
