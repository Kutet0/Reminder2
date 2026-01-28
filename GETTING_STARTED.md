# 🚀 Guide de Démarrage Rapide - Reminder Pro

## ⚡ Installation Rapide

### 1. Installer les dépendances

```bash
npm install --legacy-peer-deps
```

> **Note** : L'option `--legacy-peer-deps` est utilisée pour assurer la compatibilité de toutes les dépendances.

### 2. Lancer en mode développement

```bash
npm run dev
```

L'application Electron se lancera automatiquement avec le hot-reload activé.

### 3. Build pour production

**Windows :**
```bash
npm run build:win
```

**macOS :**
```bash
npm run build:mac
```

Les exécutables seront dans le dossier `dist/`.

## 📁 Structure du Projet

```
Reminder2/
├── src/
│   ├── main/           # Process principal Electron
│   ├── renderer/       # Application React
│   ├── preload/        # Bridge sécurisé
│   └── shared/         # Types et constantes partagés
├── README.md
├── ARCHITECTURE.md     # Documentation architecture
├── GOOGLE_CALENDAR_SETUP.md  # Guide Google Calendar
└── package.json
```

## 🎯 Fonctionnalités Principales

### ✅ Déjà Implémentées

- ✅ **Architecture Electron + React + TypeScript**
- ✅ **Design Glassmorphism avec palette Midnight Indigo**
- ✅ **Système de stockage local sécurisé**
- ✅ **Service de notifications personnalisées**
- ✅ **Scheduler de vérification des rappels (30s)**
- ✅ **Dashboard avec statistiques en temps réel**
- ✅ **Gestion complète des rappels (CRUD)**
- ✅ **Filtrage des rappels (Tous/Actifs/Terminés)**
- ✅ **Catégories colorées (Personnel, Travail, Santé, Autre)**
- ✅ **Paramètres personnalisables**
- ✅ **Barre de titre personnalisée**
- ✅ **Navigation avec React Router**
- ✅ **Icône système tray**
- ✅ **Service Google Calendar (structure complète)**

### 🚧 À Compléter

- 🚧 **Vue Calendrier** (grille de 42 jours)
- 🚧 **Formulaire d'ajout/édition de rappel** (modal)
- 🚧 **Rappels récurrents**
- 🚧 **Thèmes personnalisables**
- 🚧 **Multi-langues**

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance l'app en mode développement |
| `npm run build` | Build complet (toutes plateformes) |
| `npm run build:win` | Build pour Windows |
| `npm run build:mac` | Build pour macOS |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérifier le code avec ESLint |
| `npm run type-check` | Vérifier les types TypeScript |

## 🎨 Design System

### Palette de Couleurs

```css
--primary-600: #6366f1    /* Indigo principal */
--primary-700: #4f46e5    /* Indigo foncé */
--purple-500: #8b5cf6     /* Violet accent */
--purple-600: #7c3aed     /* Violet profond */
```

### Glassmorphism

```css
background: rgba(15, 23, 42, 0.7);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## 🔔 Système de Notifications

Les notifications sont vérifiées toutes les 30 secondes. Quand un rappel arrive à son heure :

1. Une fenêtre personnalisée apparaît (bas droite par défaut)
2. Un son système est joué (si activé)
3. L'utilisateur peut :
   - **Reporter** (snooze 5 min par défaut)
   - **Marquer comme terminé**
   - **Fermer** (sera redemandé)

## 📊 Stockage des Données

Les données sont stockées localement dans :

**Windows :**
```
%APPDATA%\Reminder2\
```

**macOS :**
```
~/Library/Application Support/Reminder2/
```

Fichiers :
- `reminders.json` - Base de données des rappels
- `settings.json` - Paramètres utilisateur
- `google_tokens.enc` - Tokens Google Calendar (chiffrés)

## 🔐 Google Calendar

Pour activer la synchronisation Google Calendar :

1. Suivez le guide complet dans `GOOGLE_CALENDAR_SETUP.md`
2. Configurez vos credentials OAuth2
3. Dans l'app : **Paramètres** → **Synchronisation** → **Se connecter**

## 🐛 Débogage

### Mode Développement

En mode dev, les DevTools Electron sont automatiquement ouverts.

### Logs

Les logs sont accessibles :
- Console DevTools
- Terminal où l'app est lancée

### Problèmes Courants

**L'app ne démarre pas :**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Erreurs TypeScript :**
```bash
npm run type-check
```

**Build échoue :**
- Vérifiez que les icônes existent dans `build/`
- Vérifiez les permissions d'écriture

## 📝 Prochaines Étapes

### Priorité 1 : Compléter les Fonctionnalités de Base

1. **Créer le composant Modal** pour l'ajout/édition de rappels
2. **Implémenter la vue Calendrier** avec grille interactive
3. **Tester la synchronisation Google Calendar**

### Priorité 2 : Améliorer l'UX

1. Animations plus fluides avec Framer Motion
2. Feedback visuel pour les actions
3. Notifications toast pour les succès/erreurs

### Priorité 3 : Fonctionnalités Avancées

1. Rappels récurrents (quotidien, hebdomadaire, mensuel)
2. Export/Import de données
3. Raccourcis clavier
4. Recherche et filtres avancés

## 🤝 Contribution

Pour contribuer au projet :

1. Créez une branche depuis `main`
2. Faites vos modifications
3. Testez localement avec `npm run dev`
4. Vérifiez les types avec `npm run type-check`
5. Créez une Pull Request

## 📚 Documentation

- **ARCHITECTURE.md** - Architecture détaillée du projet
- **GOOGLE_CALENDAR_SETUP.md** - Configuration Google Calendar
- **README.md** - Documentation générale

## 💡 Tips

### Développement Rapide

```bash
# Terminal 1 : Watcher TypeScript
npm run type-check -- --watch

# Terminal 2 : App
npm run dev
```

### Créer des Icônes

Utilisez un outil comme [Electron Icon Maker](https://github.com/jaretburkett/electron-icon-maker) :

```bash
npx electron-icon-maker --input=icon.png --output=build
```

### Performance

- Les rappels sont chargés au démarrage
- Le scheduler vérifie seulement les rappels actifs
- Les notifications sont fermées automatiquement après 30s

## ❓ FAQ

**Q: Comment changer la fréquence de vérification des rappels ?**

R: Modifiez `SCHEDULER_INTERVAL` dans `src/shared/constants/index.ts`

**Q: Comment changer le thème ?**

R: Les couleurs sont dans `src/renderer/src/styles/global.css`

**Q: Comment ajouter une nouvelle catégorie ?**

R: 
1. Ajoutez-la dans `src/shared/types/reminder.ts`
2. Ajoutez sa couleur dans `src/shared/constants/index.ts`

**Q: L'app fonctionne-t-elle hors ligne ?**

R: Oui ! Seule la synchronisation Google Calendar nécessite Internet.

---

**Fait avec ❤️ - Bonne création !** 🚀
