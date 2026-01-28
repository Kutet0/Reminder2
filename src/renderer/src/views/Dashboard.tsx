/**
 * Dashboard - Vue du tableau de bord
 * Affiche les statistiques et les prochains rappels
 */

import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle2, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ReminderForm } from '../components/reminder/ReminderForm';
import { useReminders } from '../hooks/useReminders';
import type { CreateReminderInput } from '@shared/types/reminder';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { reminders, stats, createReminder, loading } = useReminders();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateReminder = async (data: CreateReminderInput) => {
        setIsCreating(true);
        try {
            await createReminder(data);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la création du rappel:', error);
        } finally {
            setIsCreating(false);
        }
    };

    // Obtenir les 5 prochains rappels
    const upcoming = reminders
        .filter((r) => !r.completed && new Date(r.dateTime) > new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 5);

    const statCards = [
        { label: "Aujourd'hui", value: stats.today, icon: Calendar, color: '#6366f1' },
        { label: 'Cette Semaine', value: stats.thisWeek, icon: Clock, color: '#8b5cf6' },
        { label: 'Ce Mois', value: stats.thisMonth, icon: Bell, color: '#a78bfa' },
        { label: 'Total Actifs', value: stats.activeTotal, icon: CheckCircle2, color: '#c084fc' }
    ];

    if (loading) {
        return (
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Chargement...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <motion.div
                className="dashboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="dashboard-subtitle">
                        Bienvenue ! Voici un aperçu de vos rappels.
                    </p>
                </div>

                <Button
                    variant="primary"
                    icon={<Plus size={20} />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Nouveau Rappel
                </Button>
            </motion.div>

            <motion.div
                className="stats-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <Card className="stat-card" hover>
                            <div className="stat-icon" style={{ color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="section-title">📌 Prochains Rappels</h2>

                {upcoming.length === 0 ? (
                    <Card padding="lg">
                        <div className="empty-state">
                            <Bell size={48} style={{ color: 'var(--slate-600)' }} />
                            <p>Aucun rappel à venir</p>
                            <Button
                                variant="primary"
                                icon={<Plus size={16} />}
                                onClick={() => setIsModalOpen(true)}
                            >
                                Créer un rappel
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="upcoming-list">
                        {upcoming.map((reminder, index) => (
                            <motion.div
                                key={reminder.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                            >
                                <Card className="upcoming-card" hover padding="md">
                                    <div className="upcoming-card-main">
                                        <Badge category={reminder.category} />
                                        <div className="upcoming-card-content">
                                            <h3 className="upcoming-card-title">{reminder.title}</h3>
                                            {reminder.description && (
                                                <p className="upcoming-card-description">{reminder.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="upcoming-card-time">
                                        <Clock size={16} />
                                        <span>{format(new Date(reminder.dateTime), 'PPp', { locale: fr })}</span>
                                        <span className="upcoming-card-relative">
                                            {formatDistanceToNow(new Date(reminder.dateTime), { locale: fr, addSuffix: true })}
                                        </span>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Modal de création de rappel */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nouveau Rappel"
                maxWidth="md"
            >
                <ReminderForm
                    onSubmit={handleCreateReminder}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isCreating}
                />
            </Modal>
        </div>
    );
};
