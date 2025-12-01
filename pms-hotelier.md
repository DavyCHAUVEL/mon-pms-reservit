# Mon PMS Hôtelier - Documentation du Projet

## 📋 Vue d'ensemble

**Mon PMS Hôtelier** est un système de gestion de réservation hôtelière (Property Management System) de type SaaS, inspiré de Reservit. Ce projet vise à fournir une solution complète pour la gestion des réservations, des clients, des chambres et des services hôteliers.

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework**: Next.js 14+ (App Router)
- **Langage**: TypeScript (strict mode activé)
- **Styling**: TailwindCSS
- **Composants UI**: Shadcn/UI (à intégrer)
- **Backend/Auth**: Supabase
- **Icônes**: Lucide-React
- **Gestionnaire de paquets**: npm

### Structure du Projet

```
pms-hotelier/
├── app/                           # Dossier principal Next.js App Router
│   ├── layout.tsx                # Layout racine de l'application
│   ├── page.tsx                  # Page d'accueil avec boutons
│   ├── globals.css               # Styles globaux avec Tailwind
│   ├── login/
│   │   └── page.tsx              # Page de connexion (Staff)
│   ├── book/
│   │   └── page.tsx              # Page de réservation publique
│   └── dashboard/                # Section Dashboard (Staff)
│       ├── layout.tsx            # Layout avec Sidebar navigation
│       ├── page.tsx              # Vue d'ensemble (statistiques)
│       ├── rooms/
│       │   └── page.tsx          # Gestion des chambres
│       ├── calendar/
│       │   └── page.tsx          # Planning Timeline (14 jours)
│       └── settings/             # Paramètres (à créer)
├── utils/
│   └── supabase/
│       └── client.ts             # Configuration du client Supabase
├── components/                   # Composants réutilisables (à créer)
├── .env.example                  # Template des variables d'environnement
├── package.json                  # Dépendances du projet
├── tsconfig.json                 # Configuration TypeScript (strict)
├── tailwind.config.ts            # Configuration TailwindCSS
└── next.config.js                # Configuration Next.js
```

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env.local` à la racine avec les clés suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**Note**: Ces valeurs doivent être remplies avec vos identifiants Supabase.

### Installation

```bash
npm install
```

### Démarrage du serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📦 Dépendances Principales

### Production
- `next`: ^14.2.0 - Framework React
- `react`: ^18.3.1 - Bibliothèque UI
- `react-dom`: ^18.3.1 - Rendu React
- `@supabase/supabase-js`: ^2.39.0 - Client Supabase
- `lucide-react`: ^0.344.0 - Icônes

### Développement
- `typescript`: ^5.3.3 - Langage typé
- `@types/node`, `@types/react`, `@types/react-dom` - Types TypeScript
- `tailwindcss`: ^3.4.1 - Framework CSS
- `autoprefixer`, `postcss` - Outils CSS
- `eslint`, `eslint-config-next` - Linting

## 🗄️ Schéma de Base de Données

### Tables Principales (À créer dans Supabase)

#### 1. `users` (Utilisateurs)
- Gérée par Supabase Auth
- Champs personnalisés à ajouter selon les besoins

#### 2. `hotels` (Hôtels)
```sql
-- Table pour la gestion des hôtels
CREATE TABLE hotels (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,                    -- Nom de l'hôtel
  address TEXT,                          -- Adresse de l'hôtel
  city TEXT,                             -- Ville
  country TEXT,                          -- Pays
  phone TEXT,                            -- Téléphone
  email TEXT,                            -- Email de contact
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_hotels_name ON hotels(name);
```

**Champs:**
- `id`: Identifiant unique UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- `name`: Nom de l'hôtel
- `address`: Adresse complète (optionnel)
- `city`: Ville (optionnel)
- `country`: Pays (optionnel)
- `phone`: Numéro de téléphone (optionnel)
- `email`: Email de contact (optionnel)
- `created_at`: Date de création de l'enregistrement

#### 3. `rooms` (Chambres)
```sql
-- Table pour la gestion des chambres
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Utilise UUID au lieu de BIGSERIAL
  name TEXT NOT NULL,                    -- Nom de la chambre (ex: "Chambre 101")
  type TEXT NOT NULL,                    -- Type de chambre (simple, double, suite, etc.)
  price_per_night INTEGER NOT NULL,      -- Prix par nuit en FCFA
  status TEXT NOT NULL DEFAULT 'available', -- Statut: 'available' ou 'occupied'
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE, -- Référence à l'hôtel (UUID)
  image_url TEXT,                        -- URL de l'image de la chambre (Supabase Storage)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
```

**Champs:**
- `id`: Identifiant unique UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
- `name`: Nom de la chambre (ex: "Chambre 101")
- `type`: Type de chambre (simple, double, suite, deluxe, etc.)
- `price_per_night`: Prix par nuit en FCFA
- `status`: Statut de disponibilité ("available" ou "occupied")
- `hotel_id`: Clé étrangère UUID vers la table hotels (CASCADE en cas de suppression)
- `image_url`: URL publique de l'image (Supabase Storage bucket 'room-images')
- `created_at`: Date de création de l'enregistrement

#### 4. `bookings` (Réservations)
```sql
-- Table pour la gestion des réservations
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,              -- Nom du client
  customer_email TEXT,                      -- Email du client
  customer_phone TEXT,                      -- Téléphone du client
  start_date DATE NOT NULL,                 -- Date d'arrivée (YYYY-MM-DD)
  end_date DATE NOT NULL,                   -- Date de départ (YYYY-MM-DD)
  status TEXT NOT NULL DEFAULT 'pending',   -- Statut: 'pending', 'confirmed', 'cancelled'
  total_price INTEGER,                      -- Prix total de la réservation
  notes TEXT,                               -- Notes/commentaires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Contrainte pour s'assurer que end_date > start_date
ALTER TABLE bookings ADD CONSTRAINT check_dates CHECK (end_date > start_date);
```

**Champs:**
- `id`: Identifiant unique UUID
- `room_id`: Clé étrangère vers la table rooms
- `customer_name`: Nom complet du client
- `customer_email`: Email du client (optionnel)
- `customer_phone`: Téléphone du client (optionnel)
- `start_date`: Date d'arrivée au format DATE
- `end_date`: Date de départ au format DATE
- `status`: Statut de la réservation ("pending", "confirmed", "cancelled")
- `total_price`: Prix total calculé (optionnel)
- `notes`: Notes ou commentaires sur la réservation (optionnel)
- `created_at`: Date de création de l'enregistrement

#### 5. `customers` (Clients)
```sql
-- À définir
```

## 🚀 Fonctionnalités Prévues

### Phase 1 - Authentification & Base
- [x] Initialisation du projet Next.js 14+
- [x] Configuration TypeScript strict
- [x] Configuration TailwindCSS
- [x] Configuration Supabase client
- [x] Page d'accueil avec boutons navigation
- [x] Layout Dashboard avec Sidebar navigation
- [x] Page Vue d'ensemble avec statistiques
- [x] Page de login avec Supabase Auth
- [x] Validation et messages d'erreur
- [x] Redirection après authentification
- [ ] Logout fonctionnel
- [ ] Protection des routes (middleware)
- [ ] Gestion complète des sessions utilisateur

### Phase 2 - Gestion des Chambres
- [x] Interface de gestion des chambres
- [x] Affichage des chambres en grille (cards)
- [x] Récupération des chambres depuis Supabase
- [x] Modale formulaire d'ajout de chambre
- [x] Upload de photos vers Supabase Storage
- [x] Affichage des images des chambres (dashboard + public)
- [x] Prévisualisation avant upload
- [x] Validation des fichiers (type, taille)
- [x] Placeholder élégant si pas d'image
- [ ] Modification des chambres existantes
- [ ] Suppression de chambres
- [ ] Filtres par type et statut
- [ ] Recherche de chambres

### Phase 3 - Planning et Réservations
- [x] Vue Timeline sur 14 jours
- [x] Grille avec chambres et dates
- [x] Affichage des réservations avec barres colorées
- [x] Légende des statuts (confirmé, en attente)
- [x] Scroll horizontal pour petits écrans
- [x] Page de réservation publique pour les clients
- [x] Sélection de dates avec calcul de nuits
- [x] Filtrage des chambres disponibles (anti-chevauchement)
- [x] Calcul du prix total
- [x] Création de réservations depuis la page publique
- [ ] Modification des réservations existantes (dashboard)
- [ ] Annulation de réservations (dashboard)
- [ ] Détails d'une réservation en modal
- [ ] Gestion des check-in/check-out

### Phase 4 - Gestion Clients
- [ ] Base de données clients
- [ ] Historique des réservations
- [ ] Préférences clients

### Phase 5 - Fonctionnalités Avancées
- [ ] Tableau de bord analytique
- [ ] Rapports et statistiques
- [ ] Gestion des paiements
- [ ] Notifications par email
- [ ] Multi-hôtels pour un même compte

## 📝 Migrations de Base de Données

### Migration 001 - Création tables Hotels et Rooms
**Date**: 1er décembre 2025

```sql
-- ========================================
-- ÉTAPE 1: Création de la table Hotels
-- ========================================

CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Utilise UUID au lieu de BIGSERIAL
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_hotels_name ON hotels(name);

-- Activation de Row Level Security pour hotels
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Lecture publique (temporaire pour développement)
CREATE POLICY "Lecture publique des hôtels" ON hotels
  FOR SELECT
  USING (true);

-- Politique RLS: Insertion publique (temporaire pour développement)
CREATE POLICY "Insertion publique des hôtels" ON hotels
  FOR INSERT
  WITH CHECK (true);

-- Politique RLS: Modification publique (temporaire pour développement)
CREATE POLICY "Modification publique des hôtels" ON hotels
  FOR UPDATE
  USING (true);

-- Politique RLS: Suppression publique (temporaire pour développement)
CREATE POLICY "Suppression publique des hôtels" ON hotels
  FOR DELETE
  USING (true);

-- ========================================
-- ÉTAPE 2: Création de la table Rooms
-- ========================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponible',
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);

-- Activation de Row Level Security pour rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Lecture publique (temporaire pour développement)
CREATE POLICY "Lecture publique des chambres" ON rooms
  FOR SELECT
  USING (true);

-- Politique RLS: Insertion publique (temporaire pour développement)
CREATE POLICY "Insertion publique des chambres" ON rooms
  FOR INSERT
  WITH CHECK (true);

-- Politique RLS: Modification publique (temporaire pour développement)
CREATE POLICY "Modification publique des chambres" ON rooms
  FOR UPDATE
  USING (true);

-- Politique RLS: Suppression publique (temporaire pour développement)
CREATE POLICY "Suppression publique des chambres" ON rooms
  FOR DELETE
  USING (true);
```

**Instructions d'application:**
1. Se connecter à votre projet Supabase
2. Aller dans "SQL Editor"
3. Copier-coller TOUT le script ci-dessus
4. Cliquer sur "Run" pour exécuter
5. Vérifier dans "Table Editor" que les tables `hotels` et `rooms` sont créées

**Note importante:** Les politiques RLS sont ouvertes pour le développement. En production, sécurisez-les avec `auth.uid() IS NOT NULL`.

### Migration 002 - Création table Bookings
**Date**: 1er décembre 2025

```sql
-- ========================================
-- CRÉATION DE LA TABLE BOOKINGS (Réservations)
-- ========================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_price INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Contrainte pour s'assurer que end_date > start_date
ALTER TABLE bookings ADD CONSTRAINT check_dates CHECK (end_date > start_date);

-- Activation de Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Politique RLS: Lecture publique (temporaire pour développement)
CREATE POLICY "Lecture publique des réservations" ON bookings
  FOR SELECT
  USING (true);

-- Politique RLS: Insertion publique (temporaire pour développement)
CREATE POLICY "Insertion publique des réservations" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Politique RLS: Modification publique (temporaire pour développement)
CREATE POLICY "Modification publique des réservations" ON bookings
  FOR UPDATE
  USING (true);

-- Politique RLS: Suppression publique (temporaire pour développement)
CREATE POLICY "Suppression publique des réservations" ON bookings
  FOR DELETE
  USING (true);
```

**Instructions d'application:**
1. Se connecter à votre projet Supabase
2. Aller dans "SQL Editor"
3. Cliquer sur "New query"
4. Copier-coller le script ci-dessus
5. Cliquer sur "Run" pour exécuter
6. Vérifier dans "Table Editor" que la table `bookings` est créée

**Note:** Cette migration doit être exécutée APRÈS la Migration 001 (hotels et rooms doivent exister).

## 🎨 Design System

### Palette de Couleurs
- **Primaire**: Indigo (indigo-600, indigo-700)
- **Fond**: Gradient bleu clair (blue-50 to indigo-100)
- **Texte**: Gris (gray-900, gray-600)
- **Fond carte**: Blanc

### Composants UI
- Utilisation de Shadcn/UI pour les composants réutilisables
- Design moderne et professionnel
- Interface responsive

## 📚 Conventions de Code

### TypeScript
- Mode strict activé
- Typage explicite obligatoire
- Pas de `any` sauf cas exceptionnels

### Commentaires
- Commentaires détaillés pour chaque ligne importante
- Documentation des fonctions et composants
- Explication de la logique métier

### Nommage
- Composants: PascalCase
- Fonctions: camelCase
- Constantes: UPPER_SNAKE_CASE
- Fichiers: kebab-case ou PascalCase selon le type

## 🔐 Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) à configurer sur toutes les tables
- Variables d'environnement pour les secrets
- Validation des entrées utilisateur

## 🎯 Fonctionnalités Implémentées

### Dashboard
- ✅ Layout avec Sidebar navigation (Vue d'ensemble, Chambres, Planning, Paramètres)
- ✅ Page Vue d'ensemble avec cartes de statistiques
- ✅ Navigation entre les pages du dashboard
- ✅ Bouton de déconnexion (UI seulement)

### Gestion des Chambres
- ✅ Page de gestion des chambres avec interface moderne
- ✅ Modale professionnelle pour ajouter des chambres
- ✅ Formulaire complet (nom, type, prix, photo)
- ✅ Upload de photos vers Supabase Storage
- ✅ Bucket `room-images` pour stocker les images
- ✅ Prévisualisation de l'image avant upload
- ✅ Validation (type fichier, taille max 5MB)
- ✅ Génération d'URL publiques automatique
- ✅ Affichage des images dans les cards
- ✅ Placeholder avec icône si pas d'image
- ✅ Récupération des chambres depuis Supabase en temps réel
- ✅ Affichage en grille responsive avec cards
- ✅ Badge de statut (vert = disponible, rouge = occupée)
- ✅ Affichage du prix en FCFA
- ✅ Gestion des états de chargement

### Planning Timeline
- ✅ Vue Timeline sur 14 jours (J à J+13)
- ✅ Grille avec chambres en lignes et dates en colonnes
- ✅ Récupération des réservations depuis Supabase
- ✅ Barres colorées pour les réservations (vert = confirmé, orange = en attente)
- ✅ Affichage du nom du client dans les barres
- ✅ Légende des statuts
- ✅ Scroll horizontal pour petits écrans
- ✅ Mise en surbrillance de la date du jour
- ✅ Bouton d'actualisation des données
- ✅ Gestion des états de chargement

### Authentification
- ✅ Page de login (`/login`) avec design moderne
- ✅ Formulaire email + mot de passe
- ✅ Authentification via Supabase Auth (`signInWithPassword`)
- ✅ Validation des champs (email, présence)
- ✅ Messages d'erreur personnalisés
- ✅ État de chargement avec spinner
- ✅ Redirection vers `/dashboard` après connexion
- ✅ Bouton retour vers l'accueil
- ✅ Design cohérent avec le reste de l'application

### Page de Réservation Publique
- ✅ Route publique `/book` accessible sans authentification
- ✅ Récupération automatique de l'hôtel
- ✅ Sélecteur de dates (arrivée/départ) avec input type date
- ✅ Calcul automatique du nombre de nuits
- ✅ Filtrage intelligent des chambres disponibles
- ✅ Détection des chevauchements de réservations
- ✅ **Affichage des photos des chambres (grande image attractive)**
- ✅ **Effet zoom au hover pour donner envie**
- ✅ **Overlay gradient avec nom de la chambre**
- ✅ Affichage du prix total calculé (prix/nuit × nombre de nuits)
- ✅ Cartes de chambres avec design moderne
- ✅ Formulaire de réservation (nom + email via prompts)
- ✅ Validation des données (dates, email)
- ✅ Insertion automatique dans Supabase avec status 'confirmed'
- ✅ Message de confirmation détaillé
- ✅ Redirection automatique vers la page d'accueil

## 📈 Prochaines Étapes

1. ✅ ~~Installer les dépendances avec `npm install`~~
2. ⚠️ **ACTION REQUISE**: Remplir les variables d'environnement dans `.env.local`
3. ⚠️ **ACTION REQUISE**: Créer les tables dans Supabase (voir Migrations)
4. ⚠️ **ACTION REQUISE**: Créer le bucket `room-images` dans Supabase Storage (voir GUIDE_IMAGES.md)
5. ⚠️ **ACTION REQUISE**: Ajouter la colonne `image_url` à la table rooms
6. ✅ ~~Page de réservation publique~~
7. ✅ ~~Upload de photos des chambres~~
8. 🔜 Implémenter le logout
9. 🔜 Protection des routes (middleware)
10. 🔜 Ajouter les fonctionnalités CRUD complètes pour les chambres
11. 🔜 Gestion avancée des réservations (modification, annulation)
12. 🔜 Créer la page des paramètres
13. 🔜 Système de notifications par email

## 🚀 Guide de Démarrage Rapide

### Étape 1: Configuration Supabase
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans "SQL Editor" et exécuter les Migrations 001 et 002
4. Copier les clés API depuis "Project Settings > API"

### Étape 2: Configuration de l'application
1. Créer le fichier `.env.local` à la racine du projet
2. Ajouter vos clés Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_publique
```

### Étape 3: Démarrer l'application
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000`

### Étape 4: Tester les fonctionnalités

**A. Réservation publique (Client)**
1. Accéder à: `http://localhost:3000/book`
2. Sélectionner les dates d'arrivée et de départ
3. Choisir une chambre disponible
4. Cliquer sur "RÉSERVER"
5. Entrer nom et email
6. Voir le message de confirmation

**B. Dashboard (Staff)**
1. Accéder à la page de login: `http://localhost:3000/login`
2. Se connecter avec vos identifiants Supabase
3. Accéder au dashboard: `http://localhost:3000/dashboard`
4. Aller dans "Chambres" → Ajouter des chambres test
5. Aller dans "Planning" → Voir les réservations sur 14 jours

**Note**: Pour créer un utilisateur de test, voir `GUIDE_LOGIN.md`

---

**Date de création**: 1er décembre 2025
**Dernière mise à jour**: 1er décembre 2025
**Version**: 0.2.0

