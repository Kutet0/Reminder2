/**
 * Point d'entrée principal de l'application Electron
 * Main Process - Gère le cycle de vie de l'application
 */

import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/mainWindow';
import { TrayManager } from './tray';
import { registerIPCHandlers, unregisterIPCHandlers } from './ipc/handlers';
import { SchedulerService } from './services/scheduler';
import { SettingsStorage } from './services/storage';

// Variable globale pour la fenêtre principale
let mainWindow: BrowserWindow | null = null;

/**
 * Crée l'application
 */
async function createApp() {
    // Créer la fenêtre principale
    mainWindow = createMainWindow();

    // Créer l'icône de la barre système
    TrayManager.create(mainWindow);

    // Enregistrer les gestionnaires IPC
    registerIPCHandlers(mainWindow);

    // Démarrer le scheduler de notifications
    SchedulerService.start(mainWindow);

    // Configurer le lancement au démarrage si activé
    const settings = SettingsStorage.get();
    app.setLoginItemSettings({
        openAtLogin: settings.general.launchAtStartup
    });

    console.log('[App] Application started successfully');
}

/**
 * Événement : L'application est prête
 */
app.whenReady().then(() => {
    createApp();

    // Sur macOS, recréer la fenêtre si l'application est activée sans fenêtre
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createApp();
        } else if (mainWindow) {
            mainWindow.show();
        }
    });
});

/**
 * Événement : Toutes les fenêtres sont fermées
 */
app.on('window-all-closed', () => {
    // Sur macOS, ne pas quitter l'application quand toutes les fenêtres sont fermées
    if (process.platform !== 'darwin') {
        // Sur Windows et Linux, quitter complètement
        app.quit();
    }
});

/**
 * Événement : L'application va quitter
 */
app.on('will-quit', () => {
    // Nettoyer avant de quitter
    SchedulerService.stop();
    TrayManager.destroy();
    unregisterIPCHandlers();

    console.log('[App] Application closed');
});

/**
 * Événement : Seconde instance détectée
 * Empêche le lancement de multiples instances
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Si une seconde instance est lancée, afficher la fenêtre principale
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

/**
 * Configuration de sécurité
 */
app.on('web-contents-created', (_event, contents) => {
    // Bloquer la navigation vers des URLs externes
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Autoriser seulement les URLs de développement et locales
        if (parsedUrl.origin !== 'http://localhost:5173' &&
            parsedUrl.protocol !== 'file:') {
            event.preventDefault();
        }
    });

    // Bloquer l'ouverture de nouvelles fenêtres
    contents.setWindowOpenHandler(({ url }) => {
        // Autoriser seulement Google OAuth
        if (url.startsWith('https://accounts.google.com/')) {
            return { action: 'allow' };
        }
        return { action: 'deny' };
    });
});

// Désactiver le menu par défaut en production
if (!process.env.VITE_DEV_SERVER_URL) {
    app.on('ready', () => {
        const { Menu } = require('electron');
        Menu.setApplicationMenu(null);
    });
}
