/**
 * TitleBar - Barre de titre personnalisée pour Electron
 * Remplace la barre de titre native avec un design intégré
 */

import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import './TitleBar.css';

export const TitleBar: React.FC = () => {
    const handleMinimize = () => {
        window.electronAPI.window.minimize();
    };

    const handleMaximize = () => {
        window.electronAPI.window.maximize();
    };

    const handleClose = () => {
        window.electronAPI.window.close();
    };

    return (
        <div className="titlebar drag-region">
            <div className="titlebar-content">
                <div className="titlebar-title">
                    <span className="titlebar-icon">🔔</span>
                    <span className="titlebar-text gradient-text">Reminder Pro</span>
                </div>

                <div className="titlebar-controls no-drag">
                    <button
                        className="titlebar-button"
                        onClick={handleMinimize}
                        title="Réduire"
                    >
                        <Minus size={16} />
                    </button>

                    <button
                        className="titlebar-button"
                        onClick={handleMaximize}
                        title="Agrandir"
                    >
                        <Square size={14} />
                    </button>

                    <button
                        className="titlebar-button titlebar-button-close"
                        onClick={handleClose}
                        title="Fermer"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
