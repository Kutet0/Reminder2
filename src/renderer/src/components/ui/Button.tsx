/**
 * Composant Button - Bouton réutilisable avec variantes
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full-width',
        loading && 'btn-loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            className={classes}
            disabled={disabled || loading}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            {...props}
        >
            {loading && (
                <span className="btn-spinner"></span>
            )}

            {!loading && icon && iconPosition === 'left' && (
                <span className="btn-icon btn-icon-left">{icon}</span>
            )}

            <span className="btn-content">{children}</span>

            {!loading && icon && iconPosition === 'right' && (
                <span className="btn-icon btn-icon-right">{icon}</span>
            )}
        </motion.button>
    );
};
