/**
 * Gestion de la fenêtre principale
 */

import { BrowserWindow } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from '../../shared/constants';

export function createMainWindow(): BrowserWindow {
    const mainWindow = new BrowserWindow({
        width: WINDOW_CONFIG.MAIN.width,
        height: WINDOW_CONFIG.MAIN.height,
        minWidth: WINDOW_CONFIG.MAIN.minWidth,
        minHeight: WINDOW_CONFIG.MAIN.minHeight,
        frame: false, // Sans bordure pour barre de titre personnalisée
        transparent: true, // Pour le glassmorphism
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/index.js')
        },
        show: false // Ne pas afficher immédiatement
    });

    // Charger l'application
    if (process.env.VITE_DEV_SERVER_URL) {
        console.log('[MainWindow] Loading URL:', process.env.VITE_DEV_SERVER_URL);
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Ouvrir DevTools en mode développement
        mainWindow.webContents.openDevTools();
    } else {
        const filePath = path.join(__dirname, '../../dist/index.html');
        console.log('[MainWindow] Loading file:', filePath);
        mainWindow.loadFile(filePath);
    }

    // Afficher immédiatement pour le debug
    mainWindow.show();

    // Logs d'erreur
    mainWindow.webContents.on('did-fail-load', (_event: any, errorCode: number, errorDescription: string) => {
        console.error('[MainWindow] Failed to load:', errorCode, errorDescription);
    });

    mainWindow.webContents.on('console-message', (_event: any, _level: number, message: string) => {
        console.log('[Renderer]', message);
    });

    // Afficher la fenêtre quand elle est prête
    mainWindow.once('ready-to-show', () => {
        console.log('[MainWindow] Ready to show');
        mainWindow.show();
    });

    // Empêcher la fermeture de la fenêtre (minimiser dans le tray à la place)
    mainWindow.on('close', (event: any) => {
        if (!mainWindow.isDestroyed()) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    return mainWindow;
}
