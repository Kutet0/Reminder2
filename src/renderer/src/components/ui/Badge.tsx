/**
 * Composant Badge - Badge pour catégories et statuts
 */

import React from 'react';
import './Badge.css';
import type { ReminderCategory } from '@shared/types/reminder';
import { CATEGORY_COLORS } from '@shared/constants';

export interface BadgeProps {
    category: ReminderCategory;
    showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ category, showIcon = true }) => {
    const colors = CATEGORY_COLORS[category];

    return (
        <span
            className="badge"
            style={{
                background: colors.bg,
                borderColor: colors.border,
                color: colors.text
            }}
        >
            {showIcon && <span className="badge-icon">{colors.icon}</span>}
            <span className="badge-text">{getCategoryLabel(category)}</span>
        </span>
    );
};

function getCategoryLabel(category: ReminderCategory): string {
    const labels: Record<ReminderCategory, string> = {
        personal: 'Personnel',
        work: 'Travail',
        health: 'Santé',
        other: 'Autre'
    };

    return labels[category];
}
