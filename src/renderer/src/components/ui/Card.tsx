/**
 * Composant Card - Carte glassmorphism réutilisable
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'light' | 'glow';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    hover = false,
    className = '',
    ...props
}) => {
    const classes = [
        'card',
        `card-${variant}`,
        `card-padding-${padding}`,
        hover && 'card-hover',
        className
    ].filter(Boolean).join(' ');

    const Component = hover ? motion.div : 'div';
    const motionProps = hover ? {
        whileHover: { scale: 1.02, y: -4 },
        transition: { duration: 0.2 }
    } : {};

    return (
        <Component className={classes} {...motionProps} {...props}>
            {children}
        </Component>
    );
};
