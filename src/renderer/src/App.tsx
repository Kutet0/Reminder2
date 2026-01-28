/**
 * Composant racine de l'application
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Reminders } from './views/Reminders';
import { Calendar } from './views/Calendar';
import { Settings } from './views/Settings';
import { NotificationWindow } from './views/NotificationWindow';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Route spéciale pour la fenêtre de notification (sans layout) */}
                <Route path="/notification" element={<NotificationWindow />} />

                {/* Routes normales avec layout */}
                <Route path="*" element={
                    <div className="app">
                        <TitleBar />

                        <div className="app-body">
                            <Sidebar />

                            <main className="app-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/reminders" element={<Reminders />} />
                                    <Route path="/calendar" element={<Calendar />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </main>
                        </div>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;
