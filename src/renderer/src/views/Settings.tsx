/**
 * Settings - Vue des paramètres
 */

import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import './Settings.css';

export const Settings: React.FC = () => {
    const { settings, loading, updateSettings } = useSettings();

    if (loading || !settings) {
        return <div className="settings-view"><h2>Chargement...</h2></div>;
    }

    const handleToggle = async (section: keyof typeof settings, key: string, value: boolean) => {
        try {
            await updateSettings({
                [section]: {
                    ...settings[section],
                    [key]: value
                }
            });
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    return (
        <div className="settings-view">
            <div className="settings-header">
                <h1>Paramètres</h1>
                <p className="settings-subtitle">
                    Personnalisez votre expérience
                </p>
            </div>

            <div className="settings-sections">
                <Card padding="lg">
                    <h2 className="settings-section-title">⚙️ Général</h2>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Démarrage automatique</h3>
                            <p>Lancer l'application au démarrage de l'ordinateur</p>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.general.launchAtStartup}
                                onChange={(e) => handleToggle('general', 'launchAtStartup', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Minimiser dans la barre des tâches</h3>
                            <p>Garder l'application en arrière-plan</p>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.general.minimizeToTray}
                                onChange={(e) => handleToggle('general', 'minimizeToTray', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </Card>

                <Card padding="lg">
                    <h2 className="settings-section-title">🔔 Notifications</h2>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Activer les notifications</h3>
                            <p>Recevoir des alertes pour vos rappels</p>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.enabled}
                                onChange={(e) => handleToggle('notifications', 'enabled', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Sons des notifications</h3>
                            <p>Jouer un son lors des notifications</p>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={settings.notifications.soundEnabled}
                                onChange={(e) => handleToggle('notifications', 'soundEnabled', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </Card>

                <Card padding="lg">
                    <h2 className="settings-section-title">🔄 Synchronisation Google Calendar</h2>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h3>Google Calendar</h3>
                            <p>Synchronisez vos événements Google Calendar</p>
                        </div>
                        <Button variant="secondary">
                            Se connecter
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
