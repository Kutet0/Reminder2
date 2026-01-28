/**
 * Déclarations TypeScript globales pour le renderer
 */

import type { ElectronAPI } from '../../preload/index';

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };
