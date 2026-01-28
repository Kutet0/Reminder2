# 🏗️ Architecture - Reminder Pro

## 📁 Structure du Projet

```
Reminder2/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts            # Point d'entrée principal
│   │   ├── windows/            # Gestion des fenêtres
│   │   │   ├── mainWindow.ts   # Fenêtre principale
│   │   │   └── notificationWindow.ts  # Fenêtre de notification
│   │   ├── services/           # Services backend
│   │   │   ├── storage.ts      # Gestion du stockage local
│   │   │   ├── calendar.ts     # Synchronisation Google Calendar
│   │   │   ├── notifications.ts # Système de notifications
│   │   │   └── scheduler.ts    # Vérification des rappels
│   │   ├── ipc/                # IPC Handlers
│   │   │   └── handlers.ts     # Tous les handlers IPC
│   │   └── tray.ts             # Icône systray
│   │
│   ├── renderer/               # React Application
│   │   ├── src/
│   │   │   ├── App.tsx         # Composant racine
│   │   │   ├── main.tsx        # Point d'entrée React
│   │   │   ├── components/     # Composants réutilisables
│   │   │   │   ├── ui/         # Composants UI de base
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   └── Badge.tsx
│   │   │   │   ├── layout/     # Composants de mise en page
│   │   │   │   │   ├── TitleBar.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   └── Container.tsx
│   │   │   │   └── reminder/   # Composants spécifiques aux rappels
│   │   │   │       ├── ReminderCard.tsx
│   │   │   │       ├── ReminderForm.tsx
│   │   │   │       └── ReminderList.tsx
│   │   │   ├── views/          # Vues principales
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Reminders.tsx
│   │   │   │   ├── Calendar.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── hooks/          # Custom React Hooks
│   │   │   │   ├── useReminders.ts
│   │   │   │   ├── useSettings.ts
│   │   │   │   └── useCalendar.ts
│   │   │   ├── contexts/       # React Contexts
│   │   │   │   └── AppContext.tsx
│   │   │   ├── utils/          # Utilitaires
│   │   │   │   ├── date.ts
│   │   │   │   └── format.ts
│   │   │   └── styles/         # Styles globaux
│   │   │       └── global.css
│   │   ├── notification.html   # Page de notification
│   │   ├── notification.tsx    # Script de notification
│   │   └── index.html          # Page principale
│   │
│   ├── preload/                # Preload Scripts
│   │   └── index.ts            # Bridge sécurisé
│   │
│   └── shared/                 # Code partagé
│       ├── types/              # Types TypeScript
│       │   ├── reminder.ts
│       │   ├── settings.ts
│       │   └── calendar.ts
│       └── constants/          # Constantes
│           └── index.ts
│
├── electron-builder.json       # Configuration du build
├── package.json
├── tsconfig.json              # Config TypeScript principale
├── tsconfig.main.json         # Config pour le main process
├── tsconfig.preload.json      # Config pour le preload
├── vite.config.ts             # Config Vite
└── README.md
```

## 🔄 Flux de Communication

### Main Process ↔️ Renderer Process

```
┌─────────────────────────────┐
│   Renderer (React)          │
│   - Interface utilisateur   │
│   - Gestion d'état          │
└──────────┬──────────────────┘
           │
           │ IPC (contextBridge)
           ↓
┌─────────────────────────────┐
│   Preload Script            │
│   - Bridge sécurisé         │
│   - Exposition contrôlée    │
└──────────┬──────────────────┘
           │
           │ IPC Handlers
           ↓
┌─────────────────────────────┐
│   Main Process              │
│   - Gestion des fenêtres    │
│   - Stockage des données    │
│   - Notifications système   │
│   - Synchronisation cloud   │
└─────────────────────────────┘
```

## 🎨 Architecture des Composants React

```
App
├── TitleBar (Barre de titre personnalisée)
├── Sidebar (Navigation)
└── Routes
    ├── Dashboard
    │   ├── StatsCards
    │   ├── UpcomingReminders
    │   └── QuickAddButton
    ├── Reminders
    │   ├── FilterTabs
    │   ├── ReminderList
    │   └── ReminderCard
    ├── Calendar
    │   ├── CalendarGrid
    │   ├── MonthNavigation
    │   └── DayDetailsSidebar
    └── Settings
        ├── GeneralSettings
        ├── NotificationSettings
        └── SyncSettings
```

## 💾 Stockage des Données

### Structure des fichiers de données

```
%APPDATA%/Reminder2/  (Windows)
~/Library/Application Support/Reminder2/  (macOS)
├── reminders.json      # Base de données des rappels
├── settings.json       # Paramètres utilisateur
└── sync-cache.json     # Cache de synchronisation
```

### Format des données

**Reminder Object:**
```typescript
{
  id: string;
  title: string;
  description: string;
  dateTime: string;  // ISO 8601
  category: 'personal' | 'work' | 'health' | 'other';
  completed: boolean;
  snoozedUntil?: string;
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🔔 Système de Notifications

### Processus de vérification

```
┌──────────────────────────────┐
│  Scheduler (30s interval)    │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│  Check reminders in range    │
│  (current time ± advance)    │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│  Create notification window  │
│  + Play system sound         │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│  User action:                │
│  - Close (mark as shown)     │
│  - Snooze (update dateTime)  │
│  - Complete (mark as done)   │
└──────────────────────────────┘
```

## 🔐 Sécurité

### OAuth2 Google Calendar

1. **Stockage des tokens** : Utilisation de `electron-store` avec encryption
2. **Flux d'authentification** :
   - Ouverture d'une fenêtre BrowserWindow pour Google OAuth
   - Interception du callback URL
   - Stockage sécurisé du refresh token
   - Renouvellement automatique de l'access token

### Context Isolation

- Le `preload.ts` utilise `contextBridge` pour exposer uniquement les API nécessaires
- Pas d'accès direct à `require()` ou `process` depuis le renderer
- Validation de toutes les entrées utilisateur côté main process

## 🚀 Build & Distribution

### Builds disponibles

- **Windows** : `.exe` (installeur NSIS) + portable
- **macOS** : `.dmg` + `.app`

### Auto-Update

- Utilisation de `electron-updater`
- Vérification au démarrage
- Téléchargement en arrière-plan
- Installation au prochain redémarrage

## 📊 Gestion d'État

### React Context API

- **AppContext** : État global de l'application
- **Synchronisation** : Utilisation d'IPC pour synchroniser avec le main process
- **Optimistic Updates** : Mise à jour immédiate de l'UI, rollback en cas d'erreur

## 🎭 Animations

### Framer Motion

- **Page transitions** : Slide et fade
- **Modal animations** : Scale et fade
- **List animations** : Stagger children
- **Micro-interactions** : Hover, tap, drag

## 🎨 Design System

### Palette Midnight Indigo

```css
--primary-600: #6366f1;    /* Indigo principal */
--primary-700: #4f46e5;    /* Indigo foncé */
--purple-500: #8b5cf6;     /* Violet accent */
--purple-600: #7c3aed;     /* Violet profond */

--glass-bg: rgba(15, 23, 42, 0.8);
--glass-border: rgba(255, 255, 255, 0.1);
--backdrop-blur: 20px;
```

### Glassmorphism

```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--backdrop-blur));
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}
```
