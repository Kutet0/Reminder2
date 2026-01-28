/**
 * Reminders - Vue de gestion des rappels
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useReminders } from '../hooks/useReminders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import './Reminders.css';
import type { Reminder } from '@shared/types/reminder';

type FilterStatus = 'all' | 'active' | 'completed';

export const Reminders: React.FC = () => {
    const { reminders, loading, deleteReminder, completeReminder } = useReminders();
    const [filter, setFilter] = useState<FilterStatus>('all');

    const filteredReminders = reminders.filter(r => {
        if (filter === 'active') return !r.completed;
        if (filter === 'completed') return r.completed;
        return true;
    });

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) {
            try {
                await deleteReminder(id);
            } catch (error) {
                console.error('Error deleting reminder:', error);
            }
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await completeReminder(id);
        } catch (error) {
            console.error('Error completing reminder:', error);
        }
    };

    if (loading) {
        return <div className="reminders"><h2>Chargement...</h2></div>;
    }

    return (
        <div className="reminders">
            <motion.div
                className="reminders-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1>Mes Rappels</h1>
                    <p className="reminders-subtitle">
                        Gérez tous vos rappels en un seul endroit
                    </p>
                </div>

                <Button variant="primary" icon={<Plus size={20} />}>
                    Nouveau Rappel
                </Button>
            </motion.div>

            <div className="reminders-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Tous ({reminders.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'active' ? 'filter-btn-active' : ''}`}
                    onClick={() => setFilter('active')}
                >
                    Actifs ({reminders.filter(r => !r.completed).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'filter-btn-active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Terminés ({reminders.filter(r => r.completed).length})
                </button>
            </div>

            <div className="reminders-list">
                {filteredReminders.length === 0 ? (
                    <Card padding="lg">
                        <div className="empty-state">
                            <p>Aucun rappel trouvé</p>
                        </div>
                    </Card>
                ) : (
                    filteredReminders.map((reminder, index) => (
                        <motion.div
                            key={reminder.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`reminder-card ${reminder.completed ? 'reminder-card-completed' : ''}`}>
                                <div className="reminder-card-header">
                                    <Badge category={reminder.category} />
                                    <div className="reminder-card-actions">
                                        {!reminder.completed && (
                                            <button
                                                className="action-btn action-btn-success"
                                                onClick={() => handleComplete(reminder.id)}
                                                title="Marquer comme terminé"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        <button className="action-btn" title="Modifier">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="action-btn action-btn-danger"
                                            onClick={() => handleDelete(reminder.id)}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="reminder-card-body">
                                    <h3 className="reminder-card-title">{reminder.title}</h3>
                                    {reminder.description && (
                                        <p className="reminder-card-description">{reminder.description}</p>
                                    )}
                                    <div className="reminder-card-time">
                                        📅 {format(new Date(reminder.dateTime), 'PPpp', { locale: fr })}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
