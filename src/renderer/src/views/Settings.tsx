/**
 * Settings - Vue des paramètres
 */

import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import './Settings.css';

export const Settings = () => {
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

                    <div className="setting-description" style={{ marginBottom: '20px', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                        Pour synchroniser vos rappels avec Google Calendar, vous devez fournir vos propres identifiants API (Client ID et Client Secret).
                        <br />
                        <a href="#" style={{ color: 'var(--primary-400)', textDecoration: 'underline' }}>Comment obtenir ces clés ?</a>
                    </div>

                    <div className="setting-item-column" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Client ID</label>
                        <input
                            type="text"
                            className="settings-input"
                            value={settings.sync.googleCalendar.clientId || ''}
                            onChange={(e) => {
                                updateSettings({
                                    sync: {
                                        ...settings.sync,
                                        googleCalendar: {
                                            ...settings.sync.googleCalendar,
                                            clientId: e.target.value
                                        }
                                    }
                                });
                            }}
                            placeholder="Ex: 123456789-abcde.apps.googleusercontent.com"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                background: 'var(--slate-900)',
                                border: '1px solid var(--slate-700)',
                                color: 'var(--slate-100)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div className="setting-item-column" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Client Secret</label>
                        <input
                            type="password"
                            className="settings-input"
                            value={settings.sync.googleCalendar.clientSecret || ''}
                            onChange={(e) => {
                                updateSettings({
                                    sync: {
                                        ...settings.sync,
                                        googleCalendar: {
                                            ...settings.sync.googleCalendar,
                                            clientSecret: e.target.value
                                        }
                                    }
                                });
                            }}
                            placeholder="Ex: GOCSPX-..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                background: 'var(--slate-900)',
                                border: '1px solid var(--slate-700)',
                                color: 'var(--slate-100)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div className="setting-actions" style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="primary" onClick={async () => {
                            try {
                                const success = await window.electronAPI.calendar.authenticate();
                                if (success) {
                                    alert('Connexion réussie à Google Calendar !');
                                    // Recharger les settings pour voir la mise à jour (si besoin) à faire plus tard
                                } else {
                                    alert('La connexion a échoué ou a été annulée.');
                                }
                            } catch (error) {
                                console.error(error);
                                alert('Erreur lors de la connexion : ' + error);
                            }
                        }}>
                            Se connecter à Google
                        </Button>
                        <Button variant="ghost" onClick={async () => {
                            try {
                                await window.electronAPI.calendar.disconnect();
                                alert('Déconnecté de Google Calendar.');
                            } catch (e) {
                                console.error(e);
                            }
                        }}>
                            Se déconnecter
                        </Button>
                    </div>

                    {settings.sync.googleCalendar.lastSync && (
                        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            Dernière synchro : {new Date(settings.sync.googleCalendar.lastSync).toLocaleString()}
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
};
