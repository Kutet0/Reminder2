# 🔐 Configuration Google Calendar - Guide Complet

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un compte Google
- Accès à [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Étapes de Configuration

### 1️⃣ Créer un Projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Sélectionner un projet"** en haut
3. Cliquez sur **"Nouveau projet"**
4. Donnez un nom à votre projet (ex: "Reminder Pro App")
5. Cliquez sur **"Créer"**

### 2️⃣ Activer l'API Google Calendar

1. Dans le menu latéral, allez dans **"APIs et services"** → **"Bibliothèque"**
2. Recherchez **"Google Calendar API"**
3. Cliquez sur l'API Google Calendar
4. Cliquez sur **"Activer"**

### 3️⃣ Créer des Identifiants OAuth 2.0

1. Dans le menu latéral, allez dans **"APIs et services"** → **"Identifiants"**
2. Cliquez sur **"Créer des identifiants"** → **"ID client OAuth"**
3. Si c'est votre première fois, configurez l'écran de consentement :
   - Type d'application : **Externe**
   - Nom de l'application : **Reminder Pro**
   - Adresse e-mail de l'assistance utilisateur : Votre email
   - Domaine de la page d'accueil de l'application : (laisser vide pour le moment)
   - Adresse e-mail du développeur : Votre email
   - Cliquez sur **"Enregistrer et continuer"**

4. Ajouter les scopes :
   - Cliquez sur **"Ajouter ou supprimer des scopes"**
   - Recherchez et ajoutez :
     - `.../auth/calendar.readonly`
     - `.../auth/calendar.events`
   - Cliquez sur **"Mettre à jour"** puis **"Enregistrer et continuer"**

5. Utilisateurs de test :
   - Ajoutez votre adresse email comme utilisateur de test
   - Cliquez sur **"Enregistrer et continuer"**

6. Revenez dans **"Identifiants"**
7. Cliquez sur **"Créer des identifiants"** → **"ID client OAuth"**
8. Type d'application : **Application de bureau**
9. Nom : **Reminder Pro Desktop**
10. Cliquez sur **"Créer"**

### 4️⃣ Récupérer les Credentials

Une fois créé, vous verrez une popup avec :
- **ID client** (commence par quelque chose comme `123456-abc.apps.googleusercontent.com`)
- **Code secret du client**

**IMPORTANT** : Gardez ces informations en sécurité !

### 5️⃣ Configurer l'Application

Vous avez deux options pour configurer les credentials :

#### Option A : Variables d'Environnement (Recommandé pour le développement)

1. Créez un fichier `.env` à la racine du projet :
   ```env
   GOOGLE_CLIENT_ID=votre_client_id_ici
   GOOGLE_CLIENT_SECRET=votre_secret_ici
   ```

2. Redémarrez l'application

#### Option B : Modifier le Code Directement (Pour la distribution)

1. Ouvrez le fichier `src/main/services/calendar.ts`
2. Remplacez les valeurs dans `GOOGLE_CONFIG` :
   ```typescript
   const GOOGLE_CONFIG = {
     CLIENT_ID: 'votre_client_id_ici',
     CLIENT_SECRET: 'votre_secret_ici',
     // ...
   };
   ```

### 6️⃣ Utiliser la Synchronisation

1. Lancez l'application Reminder Pro
2. Allez dans **Paramètres** (⚙️)
3. Section **Synchronisation Google Calendar**
4. Cliquez sur **"Se connecter"**
5. Une fenêtre de navigateur s'ouvrira
6. Connectez-vous avec votre compte Google
7. Autorisez l'accès à votre calendrier
8. La fenêtre se fermera automatiquement
9. Votre compte est maintenant connecté ! 🎉

### 7️⃣ Synchroniser les Événements

Une fois connecté, vous pouvez :
- Cliquer sur **"Synchroniser maintenant"** pour importer vos événements
- Activer la **synchronisation automatique** pour synchroniser toutes les X minutes
- Les événements Google Calendar apparaîtront comme des rappels dans l'application

## 🔒 Sécurité

### Stockage des Tokens

Les tokens d'authentification sont stockés de manière sécurisée avec `electron-store` et sont chiffrés localement.

**Attention** : 
- Ne partagez jamais votre `CLIENT_SECRET`
- Ne commitez jamais le fichier `.env` sur Git
- Pour la distribution publique, utilisez des variables d'environnement système

### Révocation de l'Accès

Si vous souhaitez révoquer l'accès de l'application :

1. Allez sur [Google Account Permissions](https://myaccount.google.com/permissions)
2. Trouvez **"Reminder Pro"**
3. Cliquez sur **"Supprimer l'accès"**

Dans l'application, allez dans **Paramètres** → **Déconnecter Google Calendar**

## ❓ Dépannage

### "OAuth credentials not configured"

**Solution** : Vérifiez que vous avez bien configuré les credentials (voir étape 5)

### "Failed to authenticate"

**Solutions possibles** :
1. Vérifiez que l'API Google Calendar est activée
2. Vérifiez que votre compte est ajouté comme utilisateur de test
3. Vérifiez que les scopes sont correctement configurés

### "Failed to fetch events"

**Solutions possibles** :
1. Vérifiez votre connexion Internet
2. Vérifiez que l'accès n'a pas été révoqué
3. Essayez de vous déconnecter et vous reconnecter

### Limite de quota

Google impose des quotas sur l'utilisation de l'API. Par défaut, c'est 1 million de requêtes par jour, ce qui est largement suffisant pour une utilisation personnelle.

## 📚 Ressources

- [Documentation Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 pour Applications Desktop](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Cloud Console](https://console.cloud.google.com/)

## 💡 Conseils

1. **Utilisez différents projets** pour le développement et la production
2. **Configurez des quotas** pour éviter les abus
3. **Surveillez l'utilisation** dans la Google Cloud Console
4. **Testez d'abord** avec un calendrier de test

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub avec le tag `google-calendar`
