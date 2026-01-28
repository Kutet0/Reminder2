# 🔔 Reminder Pro - Application de Rappels Nouvelle Génération

Une solution de productivité desktop qui combine la puissance d'Electron avec la beauté de React pour offrir une expérience de rappel fluide, esthétique et hautement personnalisable.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Electron](https://img.shields.io/badge/electron-28.0.0-9feaf9.svg)
![React](https://img.shields.io/badge/react-19.0.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3.0-3178c6.svg)

## ✨ Fonctionnalités

### 🎯 Vue Tableau de Bord
- **Statistiques en temps réel** : Aujourd'hui, Cette Semaine, Ce Mois, Total Actifs
- **Rappels à venir** : Les 5 prochains rappels classés par proximité temporelle
- **Ajout rapide** : Créez un nouveau rappel en un clic

### 📋 Gestion des Rappels
- **Filtrage intelligent** : Tous / Actifs / Terminés
- **Cartes visuelles** : Design glassmorphism avec catégories colorées
- **Actions rapides** : Marquer comme terminé, modifier, supprimer
- **Catégories** : Personnel 🏠, Travail 💼, Santé ❤️, Autre 📌

### 📅 Vue Calendrier
- **Grille de 42 jours** : Visualisation complète avec contexte des mois adjacents
- **Navigation fluide** : Passage entre les mois avec animations
- **Sidebar de détails** : Liste des rappels pour le jour sélectionné

### 🔔 Système de Notifications
- **Pop-up personnalisé** : Fenêtre stylisée en bas à droite (non-intrusive)
- **Snooze intelligent** : Reportez vos rappels (5 min par défaut, configurable)
- **Alertes sonores** : Sons système natifs (Windows/macOS)
- **Vérification active** : Check toutes les 30 secondes pour une précision maximale

### 🔄 Synchronisation Google Calendar
- **OAuth2 sécurisé** : Authentification officielle Google
- **Import d'événements** : Transformez vos événements Google en rappels locaux
- **Bidirectionnel** : Créez des événements Google depuis l'app (optionnel)

### ⚙️ Paramètres Avancés
- **Lancement au démarrage** : Démarrage automatique avec Windows/macOS
- **Temps de prévention** : Soyez alerté X minutes avant l'heure
- **Gestion des sons** : Activation/désactivation globale

### 🎨 Design **Glassmorphism** avec Palette "Midnight Indigo"
- Effets de transparence et de flou d'arrière-plan
- Dégradés violet/indigo (#6366f1 → #8b5cf6)
- Animations fluides avec Framer Motion
- Barre de titre personnalisée

## 🚀 Installation

### Prérequis
- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **npm** ou **yarn**

### Installation des dépendances

```bash
npm install
```

## 💻 Développement

### Lancer l'application en mode développement

```bash
npm run dev
```

Cette commande lance :
- Le serveur Vite pour le hot-reload du renderer
- L'application Electron avec rechargement automatique

### Structure des commandes

```bash
npm run dev          # Mode développement
npm run build        # Build de production (Windows/macOS)
npm run preview      # Prévisualiser le build
npm run lint         # Vérifier le code avec ESLint
npm run type-check   # Vérification TypeScript
```

## 📦 Build & Distribution

### Build pour Windows

```bash
npm run build:win
```

Génère :
- `dist/Reminder-Pro-Setup-2.0.0.exe` (Installeur NSIS)
- `dist/Reminder-Pro-2.0.0-portable.exe` (Version portable)

### Build pour macOS

```bash
npm run build:mac
```

Génère :
- `dist/Reminder-Pro-2.0.0.dmg`
- `dist/Reminder-Pro-2.0.0-arm64.dmg` (Apple Silicon)

## 🔐 Configuration Google Calendar

### 1️⃣ Obtenir les credentials OAuth2

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'**API Google Calendar**
4. Créez des **Identifiants OAuth 2.0** :
   - Type : Application de bureau (Desktop App)
   - Téléchargez le fichier JSON

### 2️⃣ Configuration dans l'application

1. Ouvrez l'application Reminder Pro
2. Allez dans **Paramètres** → **Synchronisation**
3. Cliquez sur **Connecter Google Calendar**
4. Suivez le processus d'authentification OAuth
5. Autorisez l'accès à votre calendrier

**Note de sécurité** : Les tokens sont stockés de manière chiffrée dans le dossier de données de l'application.

## 📁 Stockage des Données

### Windows
```
%APPDATA%\Reminder2\
├── reminders.json
├── settings.json
└── sync-cache.json
```

### macOS
```
~/Library/Application Support/Reminder2/
├── reminders.json
├── settings.json
└── sync-cache.json
```

## 🛠️ Technologies Utilisées

| Technologie | Version | Description |
|------------|---------|-------------|
| **Electron** | 28.x | Framework pour applications desktop |
| **React** | 19.x | Bibliothèque UI |
| **TypeScript** | 5.3.x | Typage statique |
| **Vite** | 5.x | Build tool ultra-rapide |
| **Framer Motion** | 11.x | Animations fluides |
| **react-router-dom** | 6.x | Routing |
| **date-fns** | 3.x | Manipulation de dates |
| **electron-store** | 8.x | Stockage local persistant |
| **electron-updater** | 6.x | Auto-updates |

## 🏗️ Architecture

Consultez [ARCHITECTURE.md](./ARCHITECTURE.md) pour une documentation complète de l'architecture du projet.

### Aperçu rapide

```
┌─────────────────────────────┐
│   React UI (Renderer)       │
│   - Dashboard, Calendar...  │
└──────────┬──────────────────┘
           │ IPC (contextBridge)
           ↓
┌─────────────────────────────┐
│   Electron Main Process     │
│   - Storage, Sync, Notif... │
└─────────────────────────────┘
```

## 🎯 Roadmap

- [x] **v2.0** - Release initiale avec toutes les fonctionnalités de base
- [ ] **v2.1** - Thèmes personnalisables (clair/sombre/auto)
- [ ] **v2.2** - Rappels récurrents (quotidien, hebdomadaire, mensuel)
- [ ] **v2.3** - Support multi-langues (FR, EN, ES, DE)
- [ ] **v2.4** - Export/Import de données (JSON, CSV)
- [ ] **v2.5** - Intégration Outlook/iCloud Calendar

## 🐛 Rapport de Bugs

Si vous rencontrez un problème :
1. Vérifiez si le problème existe déjà dans les **Issues**
2. Créez une nouvelle issue avec :
   - Description détaillée
   - Étapes de reproduction
   - Captures d'écran si applicable
   - Version de l'OS et de l'application

## 📄 Licence

MIT License - Voir [LICENSE](./LICENSE) pour plus de détails.

## 🙏 Remerciements

- Design inspiré par les tendances **Glassmorphism** modernes
- Icônes by [Lucide Icons](https://lucide.dev/)
- Sons système natifs Windows/macOS

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue GitHub.

---

**Fait avec ❤️ et beaucoup de ☕**