/**
 * Hook personnalisé pour gérer les paramètres
 */

import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@shared/types/settings';

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les paramètres
    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await window.electronAPI.settings.get();
            setSettings(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load settings');
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Mettre à jour les paramètres
    const updateSettings = useCallback(async (updates: Partial<Settings>) => {
        try {
            const updated = await window.electronAPI.settings.update(updates);
            setSettings(updated);
            return updated;
        } catch (err: any) {
            setError(err.message || 'Failed to update settings');
            throw err;
        }
    }, []);

    // Charger au montage
    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    return {
        settings,
        loading,
        error,
        updateSettings,
        refresh: loadSettings
    };
}
