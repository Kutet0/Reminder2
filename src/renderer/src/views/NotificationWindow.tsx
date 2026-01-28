/**
 * NotificationWindow - Fenêtre de notification personnalisée
 * Affiche un rappel avec un design glassmorphism
 */

import React, { useEffect, useState } from 'react';
import { Bell, Clock, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Reminder } from '@shared/types/reminder';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './NotificationWindow.css';

export const NotificationWindow: React.FC = () => {
    const [reminder, setReminder] = useState<Reminder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Assurer que le fond est transparent pour le glassmorphism
        document.documentElement.style.backgroundColor = 'transparent'; // HTML
        document.body.style.backgroundColor = 'transparent'; // Body
        const root = document.getElementById('root');
        if (root) root.style.backgroundColor = 'transparent'; // React Root

        // Écouter les données du rappel depuis le main process
        const unsubscribe = window.electronAPI.onNotificationData((data: Reminder) => {
            console.log('[NotificationWindow] Received reminder data:', data);
            setReminder(data);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleSnooze = () => {
        if (!reminder) return;

        console.log('[NotificationWindow] Snoozing reminder for 5 minutes');
        window.electronAPI.notifications.snooze(reminder.id, 5);
        // La fenêtre se fermera automatiquement car le main process envoie un événement resetNotification
        // Mais par sécurité on peut fermer
        window.electronAPI.closeNotification(reminder.id);
    };

    const handleComplete = () => {
        if (!reminder) return;

        console.log('[NotificationWindow] Marking reminder as complete');
        window.electronAPI.notifications.complete(reminder.id);
        // Le main process fermera la notification
        window.electronAPI.closeNotification(reminder.id);
    };

    const handleClose = () => {
        if (reminder) {
            window.electronAPI.closeNotification(reminder.id);
        }
    };

    if (loading) {
        return (
            <div className="notification-window">
                <div className="notification-content">
                    <div className="notification-header">
                        <Bell size={24} className="notification-icon" />
                        <h2>Rappel</h2>
                    </div>
                    <p className="notification-loading">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!reminder) {
        return (
            <div className="notification-window">
                <div className="notification-content">
                    <p>Aucun rappel</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-window">
            <div className="notification-content">
                <button className="notification-close" onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className="notification-header">
                    <Bell size={24} className="notification-icon" />
                    <h2>Rappel</h2>
                </div>

                <div className="notification-body">
                    <div className="notification-badge">
                        <Badge category={reminder.category} />
                    </div>

                    <h3 className="notification-title">{reminder.title}</h3>

                    {reminder.description && (
                        <p className="notification-description">{reminder.description}</p>
                    )}

                    <div className="notification-time">
                        <Clock size={16} />
                        <span>{format(new Date(reminder.dateTime), 'PPp', { locale: fr })}</span>
                    </div>
                </div>

                <div className="notification-actions">
                    <Button
                        variant="ghost"
                        onClick={handleSnooze}
                        icon={<Clock size={18} />}
                    >
                        Reporter (5 min)
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleComplete}
                        icon={<span>✓</span>}
                    >
                        Terminé
                    </Button>
                </div>
            </div>
        </div>
    );
};
