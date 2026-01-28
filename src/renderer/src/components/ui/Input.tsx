/**
 * Composant Input - Champ de saisie stylisé
 */

import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, fullWidth = false, className = '', ...props }, ref) => {
        const wrapperClasses = [
            'input-wrapper',
            fullWidth && 'input-full-width',
            error && 'input-error'
        ].filter(Boolean).join(' ');

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label className="input-label">{label}</label>
                )}

                <div className="input-container">
                    {icon && (
                        <span className="input-icon">{icon}</span>
                    )}

                    <input
                        ref={ref}
                        className={`input ${icon ? 'input-with-icon' : ''} ${className}`}
                        {...props}
                    />
                </div>

                {error && (
                    <span className="input-error-text">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
