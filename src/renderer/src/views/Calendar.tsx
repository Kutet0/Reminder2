/**
 * Calendar - Vue calendrier (Version simplifiée)
 */

import React from 'react';
import { Card } from '../components/ui/Card';
import './Calendar.css';

export const Calendar: React.FC = () => {
    return (
        <div className="calendar-view">
            <div className="calendar-header">
                <h1>Calendrier</h1>
                <p className="calendar-subtitle">
                    Vue calendrier des rappels (à implémenter)
                </p>
            </div>

            <Card padding="lg">
                <div className="empty-state">
                    <p>🗓️ Vue calendrier en cours de développement...</p>
                </div>
            </Card>
        </div>
    );
};
