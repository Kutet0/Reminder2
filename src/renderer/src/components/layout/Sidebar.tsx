/**
 * Sidebar - Navigation latérale
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bell, Calendar, Settings } from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { path: '/reminders', icon: Bell, label: 'Mes Rappels' },
    { path: '/calendar', icon: Calendar, label: 'Calendrier' },
    { path: '/settings', icon: Settings, label: 'Paramètres' }
];

export const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span className="sidebar-link-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};
