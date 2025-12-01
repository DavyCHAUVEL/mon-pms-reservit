# Guide de Configuration Supabase

## 📋 Étapes à suivre pour configurer Supabase

### 1. Créer un compte Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur "Start your project"
3. Se connecter ou créer un compte

### 2. Créer un nouveau projet

1. Cliquer sur "New Project"
2. Remplir les informations:
   - **Name**: Mon PMS Hotelier (ou le nom de votre choix)
   - **Database Password**: Choisir un mot de passe fort
   - **Region**: Choisir la région la plus proche
3. Cliquer sur "Create new project"
4. Attendre quelques minutes pendant la création du projet

### 3. Créer les tables `hotels` et `rooms`

1. Dans le menu latéral, cliquer sur **"SQL Editor"**
2. Cliquer sur **"New query"**
3. Copier-coller le script SQL ci-dessous:

```sql
-- ========================================
-- ÉTAPE 1: Création de la table Hotels
-- ========================================

CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ========================================
-- ÉTAPE 3: Création de la table Bookings
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

-- Index pour optimiser les requêtes
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Contrainte pour s'assurer que end_date > start_date
ALTER TABLE bookings ADD CONSTRAINT check_dates CHECK (end_date > start_date);

-- Activation de Row Level Security pour bookings
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

4. Cliquer sur **"Run"** en bas à droite
5. Vous devriez voir le message "Success. No rows returned"

### 4. Récupérer les clés API

1. Dans le menu latéral, cliquer sur **"Project Settings"** (icône engrenage)
2. Cliquer sur **"API"** dans le sous-menu
3. Copier les informations suivantes:
   - **Project URL** (sous "Config")
   - **anon public** (sous "Project API keys")

### 5. Configurer l'application

1. À la racine de votre projet, créer un fichier `.env.local`
2. Coller vos clés Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_publique
```

3. Remplacer les valeurs par vos vraies clés

### 6. Vérifier l'installation

1. Redémarrer le serveur de développement:
```bash
npm run dev
```

2. Accéder à l'application: `http://localhost:3000/dashboard/rooms`

3. Cliquer sur **"Ajouter une chambre test"**

4. Si tout fonctionne, vous devriez voir une nouvelle chambre apparaître !

## 🔍 Vérifier les données dans Supabase

1. Retourner sur Supabase
2. Cliquer sur **"Table Editor"** dans le menu latéral
3. Vous devriez voir trois tables: **"hotels"**, **"rooms"** et **"bookings"**
4. Sélectionner la table **"rooms"** pour voir les chambres ajoutées
5. Sélectionner la table **"hotels"** pour voir l'hôtel créé automatiquement
6. Sélectionner la table **"bookings"** pour voir les réservations (vide au début)

**Note:** L'application crée automatiquement un hôtel "Mon Hôtel Test" si aucun hôtel n'existe lors de l'ajout de la première chambre.

## 🧪 Ajouter une réservation de test (optionnel)

Pour tester la vue Planning, vous pouvez ajouter une réservation de test :

1. Dans Supabase, aller sur **"SQL Editor"**
2. Cliquer sur **"New query"**
3. Copier-coller ce script :

```sql
INSERT INTO bookings (
  room_id,
  customer_name,
  customer_email,
  customer_phone,
  start_date,
  end_date,
  status,
  total_price,
  notes
) VALUES (
  (SELECT id FROM rooms LIMIT 1),
  'Jean Dupont',
  'jean.dupont@example.com',
  '+33 6 12 34 56 78',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '3 days',
  'confirmed',
  27000,
  'Réservation de test'
);
```

4. Cliquer sur **"Run"**
5. Aller sur `http://localhost:3000/dashboard/calendar`
6. Vous devriez voir la réservation dans le planning ! 🎉

## ⚠️ Notes de Sécurité

**IMPORTANT**: Les politiques RLS actuelles permettent à tout le monde de lire, écrire et modifier les données. C'est pratique pour le développement, mais **NON SÉCURISÉ pour la production**.

Pour sécuriser en production:
1. Implémenter l'authentification Supabase
2. Modifier les politiques RLS pour utiliser `auth.uid() IS NOT NULL`
3. Restreindre les actions selon les rôles utilisateurs

## 🐛 Dépannage

### Erreur "table hotels does not exist" ou "table rooms does not exist"
- Vérifier que vous avez bien exécuté TOUT le script SQL (hotels ET rooms)
- Vérifier dans "Table Editor" que les tables "hotels" et "rooms" existent
- Si une seule table existe, supprimer et recréer les deux en exécutant tout le script

### Erreur "hotel_id violates foreign key constraint"
- Cela signifie que la table hotels n'existe pas ou est vide
- L'application devrait créer automatiquement un hôtel, mais vérifiez que le script SQL complet a été exécuté

### Erreur de connexion à Supabase
- Vérifier que les clés dans `.env.local` sont correctes
- Vérifier qu'il n'y a pas d'espaces avant ou après les clés
- Redémarrer le serveur de développement après modification du `.env.local`

### Les chambres ne s'affichent pas
- Ouvrir la console du navigateur (F12) pour voir les erreurs
- Vérifier que les politiques RLS sont bien configurées
- Vérifier la connexion internet

## 📞 Besoin d'aide ?

Consulter la documentation officielle de Supabase: [docs.supabase.com](https://docs.supabase.com)

