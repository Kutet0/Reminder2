/**
 * ReminderForm - Formulaire de création/édition de rappel
 */

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar, Clock, Tag } from 'lucide-react';
import type { CreateReminderInput, ReminderCategory } from '@shared/types/reminder';
import { CATEGORY_COLORS } from '@shared/constants';
import './ReminderForm.css';

interface ReminderFormProps {
    onSubmit: (data: CreateReminderInput) => void;
    onCancel: () => void;
    initialData?: CreateReminderInput;
    isLoading?: boolean;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<CreateReminderInput>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        dateTime: initialData?.dateTime || new Date().toISOString(),
        category: initialData?.category || 'personal'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    console.log('[ReminderForm] Rendered with formData:', formData);
    console.log('[ReminderForm] Title value:', formData.title);

    // Formater la date pour l'input date (YYYY-MM-DD)
    const getDateValue = () => {
        const date = new Date(formData.dateTime);
        return date.toISOString().split('T')[0];
    };

    // Formater l'heure pour l'input time (HH:MM)
    const getTimeValue = () => {
        const date = new Date(formData.dateTime);
        return date.toTimeString().slice(0, 5);
    };

    const handleDateChange = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        const currentTime = new Date(formData.dateTime);
        const newDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            currentTime.getHours(),
            currentTime.getMinutes()
        );
        setFormData({ ...formData, dateTime: newDate.toISOString() });
    };

    const handleTimeChange = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const currentDate = new Date(formData.dateTime);
        currentDate.setHours(parseInt(hours), parseInt(minutes));
        setFormData({ ...formData, dateTime: currentDate.toISOString() });
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Le titre est requis';
        }

        const selectedDate = new Date(formData.dateTime);
        if (selectedDate < new Date()) {
            newErrors.dateTime = 'La date doit être dans le futur';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[ReminderForm] Submit with data:', formData);

        if (validate()) {
            onSubmit(formData);
        }
    };

    const categories: Array<{ value: ReminderCategory; label: string }> = [
        { value: 'personal', label: 'Personnel' },
        { value: 'work', label: 'Travail' },
        { value: 'health', label: 'Santé' },
        { value: 'other', label: 'Autre' }
    ];

    return (
        <form className="reminder-form" onSubmit={handleSubmit}>
            <Input
                label="Titre *"
                placeholder="Ex: Rendez-vous chez le dentiste"
                value={formData.title}
                onChange={(e) => {
                    console.log('[ReminderForm] Title onChange:', e.target.value);
                    setFormData({ ...formData, title: e.target.value });
                }}
                error={errors.title}
                fullWidth
                autoFocus
            />

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    className="form-textarea"
                    placeholder="Ajoutez des détails..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                />
            </div>

            <div className="form-row">
                <Input
                    label="Date *"
                    type="date"
                    value={getDateValue()}
                    onChange={(e) => handleDateChange(e.target.value)}
                    error={errors.dateTime}
                    icon={<Calendar size={18} />}
                    fullWidth
                />

                <Input
                    label="Heure *"
                    type="time"
                    value={getTimeValue()}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    icon={<Clock size={18} />}
                    fullWidth
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    <Tag size={16} />
                    Catégorie
                </label>
                <div className="category-grid">
                    {categories.map((cat) => {
                        const colors = CATEGORY_COLORS[cat.value];
                        const isSelected = formData.category === cat.value;

                        return (
                            <button
                                key={cat.value}
                                type="button"
                                className={`category-btn ${isSelected ? 'category-btn-active' : ''}`}
                                style={{
                                    background: isSelected ? colors.bg : 'transparent',
                                    borderColor: colors.border,
                                    color: isSelected ? colors.text : 'var(--slate-400)'
                                }}
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                            >
                                <span>{colors.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="form-actions">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Annuler
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                >
                    Créer le rappel
                </Button>
            </div>
        </form>
    );
};
