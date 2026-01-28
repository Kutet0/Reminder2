/**
 * Icône de la barre système (System Tray)
 * Permet de minimiser l'application et d'y accéder rapidement
 */

import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';

export class TrayManager {
    private static tray: Tray | null = null;

    /**
     * Crée l'icône de la barre système
     */
    static create(mainWindow: BrowserWindow): Tray {
        // Charger l'icône (pour simplifier, on utilise une icône générique ici)
        // Dans un vrai projet, utilisez vos propres icônes
        let icon;
        if (process.platform === 'win32') {
            icon = nativeImage.createFromPath(path.join(__dirname, '../../../build/icon.ico'));
        } else {
            icon = nativeImage.createFromPath(path.join(__dirname, '../../../build/icon.png'));
        }

        // Si l'icône n'existe pas, créer une icône par défaut
        if (icon.isEmpty()) {
            icon = nativeImage.createEmpty();
        }

        this.tray = new Tray(icon);
        this.tray.setToolTip('Reminder Pro');

        // Créer le menu contextuel
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Afficher',
                click: () => {
                    mainWindow.show();
                    mainWindow.focus();
                }
            },
            {
                label: 'Nouveau rappel',
                click: () => {
                    mainWindow.show();
                    mainWindow.focus();
                    // Envoyer un événement pour ouvrir le formulaire de création
                    mainWindow.webContents.send('tray:new-reminder');
                }
            },
            { type: 'separator' },
            {
                label: 'Paramètres',
                click: () => {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('tray:open-settings');
                }
            },
            { type: 'separator' },
            {
                label: 'Quitter',
                click: () => {
                    app.quit();
                }
            }
        ]);

        this.tray.setContextMenu(contextMenu);

        // Double-clic pour afficher la fenêtre
        this.tray.on('double-click', () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        });

        console.log('[Tray] Created');
        return this.tray;
    }

    /**
     * Met à jour l'icône du tray
     */
    static updateIcon(iconPath: string): void {
        if (this.tray) {
            const icon = nativeImage.createFromPath(iconPath);
            this.tray.setImage(icon);
        }
    }

    /**
     * Met à jour le tooltip
     */
    static updateTooltip(text: string): void {
        if (this.tray) {
            this.tray.setToolTip(text);
        }
    }

    /**
     * Affiche une notification via le tray (Windows seulement)
     */
    static displayBalloon(title: string, content: string): void {
        if (this.tray && process.platform === 'win32') {
            this.tray.displayBalloon({
                title,
                content
            });
        }
    }

    /**
     * Détruit le tray
     */
    static destroy(): void {
        if (this.tray) {
            this.tray.destroy();
            this.tray = null;
            console.log('[Tray] Destroyed');
        }
    }
}
