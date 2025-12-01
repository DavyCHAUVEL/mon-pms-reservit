# Guide - Page de Connexion (Login)

## 📋 Vue d'ensemble

La page de connexion (`/login`) permet au personnel de l'hôtel de s'authentifier pour accéder au dashboard.

## 🎯 Fonctionnalités

### Authentification Supabase
- Utilise `supabase.auth.signInWithPassword()`
- Authentification sécurisée avec email + mot de passe
- Gestion des sessions automatique

### Validation
- ✅ Vérification que les champs ne sont pas vides
- ✅ Validation du format email (regex)
- ✅ Messages d'erreur personnalisés selon le type d'erreur

### UX/UI
- Design centré et épuré
- Icônes pour chaque champ (Mail, Lock)
- État de chargement avec spinner
- Messages d'erreur en rouge avec icône
- Bouton "Retour à l'accueil" discret

## 🧪 Comment tester

### Prérequis

**Important**: Vous devez avoir un utilisateur dans Supabase Auth.

#### Option A : Créer un utilisateur via l'interface Supabase

1. Aller sur votre projet Supabase
2. Cliquer sur **"Authentication"** dans le menu latéral
3. Cliquer sur **"Add user"** → **"Create new user"**
4. Entrer :
   - Email : `admin@monpms.com`
   - Password : `test123456`
5. Cliquer sur **"Create user"**

#### Option B : Créer un utilisateur via SQL

```sql
-- Dans Supabase SQL Editor
-- Note: Le mot de passe sera hashé automatiquement
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@monpms.com',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### Scénarios de test

#### Test 1 : Connexion réussie

1. **Accéder à la page**
   ```
   http://localhost:3000/login
   ```

2. **Entrer les identifiants**
   - Email : `admin@monpms.com`
   - Mot de passe : `test123456`

3. **Cliquer sur "Se connecter"**

4. **Vérifier**
   - Le bouton affiche "Connexion en cours..." avec spinner
   - Vous êtes redirigé vers `/dashboard`
   - Vous voyez le tableau de bord

#### Test 2 : Email invalide

1. Entrer un email mal formaté : `test@`
2. Cliquer sur "Se connecter"
3. **Résultat** : Message d'erreur rouge "Adresse email invalide"

#### Test 3 : Champs vides

1. Laisser les champs vides
2. Cliquer sur "Se connecter"
3. **Résultat** : Message d'erreur "Veuillez remplir tous les champs"

#### Test 4 : Identifiants incorrects

1. Entrer un email : `wrong@email.com`
2. Entrer un mot de passe : `wrongpassword`
3. Cliquer sur "Se connecter"
4. **Résultat** : Message d'erreur "Email ou mot de passe incorrect"

#### Test 5 : Bouton retour

1. Cliquer sur "Retour à l'accueil" en haut à gauche
2. **Résultat** : Redirection vers la page d'accueil (`/`)

## 🔐 Sécurité

### Ce qui est implémenté
- ✅ Validation côté client (email, champs requis)
- ✅ Authentification via Supabase Auth (sécurisée)
- ✅ Hashage automatique du mot de passe par Supabase
- ✅ Sessions gérées par Supabase
- ✅ Pas de stockage du mot de passe en clair

### Messages d'erreur personnalisés
```typescript
"Invalid login credentials" → "Email ou mot de passe incorrect"
"Email not confirmed" → "Veuillez confirmer votre email"
Autre → Message d'erreur brut de Supabase
```

## 🎨 Design

### Couleurs
- **Fond** : Gradient bleu clair → indigo
- **Card** : Blanc avec ombre
- **Bouton primaire** : Indigo 600 → 700 au hover
- **Erreur** : Rouge 50 (fond) / Rouge 800 (texte)

### Composants
- Input avec icônes (Mail, Lock)
- État disabled avec opacité
- Spinner de chargement
- Icône AlertCircle pour les erreurs

### Responsive
- Max-width 28rem (448px)
- Padding adaptatif
- Fonctionne sur mobile et desktop

## 🔄 Flux utilisateur

```
Page d'accueil (/)
    ↓
Clic sur "Se connecter (Staff)"
    ↓
Page de login (/login)
    ↓
Saisie email + mot de passe
    ↓
Clic sur "Se connecter"
    ↓
[Si succès] → Dashboard (/dashboard)
[Si erreur] → Message d'erreur affiché
```

## 📝 Code important

### Fonction d'authentification

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password: password,
})

if (error) {
  // Gestion des erreurs
  setError("Email ou mot de passe incorrect")
  return
}

// Redirection si succès
router.push("/dashboard")
```

### Validation email

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  setError("Adresse email invalide")
  return
}
```

## 🐛 Dépannage

### "Email ou mot de passe incorrect"
- Vérifier que l'utilisateur existe dans Supabase Auth
- Vérifier que le mot de passe est correct
- Aller dans Authentication → Users pour voir la liste

### Pas de redirection après connexion
- Ouvrir la console (F12) pour voir les logs
- Vérifier que `router.push("/dashboard")` est appelé
- Vérifier les erreurs dans la console

### La page ne charge pas
- Vérifier que Supabase est configuré (`.env.local`)
- Vérifier les logs dans la console
- Vérifier la connexion internet

## 💡 Améliorations futures

- [ ] Lien "Mot de passe oublié"
- [ ] Inscription de nouveaux utilisateurs
- [ ] Confirmation d'email après inscription
- [ ] 2FA (authentification à deux facteurs)
- [ ] Remember me (se souvenir de moi)
- [ ] Limite de tentatives de connexion
- [ ] Logs d'audit des connexions

## 🔗 Navigation

Depuis la page d'accueil :
- Bouton vert → `/book` (réservation publique)
- Bouton bleu → `/login` (connexion staff)

Depuis la page de login :
- "Retour à l'accueil" → `/`
- Après connexion → `/dashboard`

## 📞 Support

En cas de problème :
1. Vérifier la console (F12) pour les erreurs
2. Vérifier que l'utilisateur existe dans Supabase
3. Vérifier les variables d'environnement
4. Consulter `pms-hotelier.md` pour plus d'infos

