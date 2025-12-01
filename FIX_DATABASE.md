# 🔧 Correction de la Base de Données

## 🚨 Problème identifié

Votre erreur : `Could not find the 'price' column of 'rooms' in the schema cache`

Cela signifie que votre table `rooms` n'a pas la bonne structure.

## 📋 Diagnostic

### Étape 1 : Vérifier la structure actuelle

1. Aller sur Supabase
2. Cliquer sur **"Table Editor"** 
3. Sélectionner la table **"rooms"**
4. Noter quelles colonnes existent actuellement

### Étape 2 : Vérifier la table hotels

1. Dans "Table Editor", vérifier si la table **"hotels"** existe
2. Noter le type de la colonne `id` (probablement UUID : `00000000-0000-0000-0000-000000000000`)

## 🔄 Solution : Recréer les tables proprement

### Option A : Script complet (RECOMMANDÉ - efface tout et recrée)

**⚠️ ATTENTION : Cela supprimera toutes les données existantes !**

```sql
-- ========================================
-- SUPPRESSION DES TABLES EXISTANTES
-- ========================================

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

-- ========================================
-- CRÉATION DE LA TABLE HOTELS
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

-- Index
CREATE INDEX idx_hotels_name ON hotels(name);

-- RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des hôtels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Insertion publique des hôtels" ON hotels FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification publique des hôtels" ON hotels FOR UPDATE USING (true);
CREATE POLICY "Suppression publique des hôtels" ON hotels FOR DELETE USING (true);

-- ========================================
-- CRÉATION DE LA TABLE ROOMS
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

-- Index
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);

-- RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des chambres" ON rooms FOR SELECT USING (true);
CREATE POLICY "Insertion publique des chambres" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification publique des chambres" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Suppression publique des chambres" ON rooms FOR DELETE USING (true);

-- ========================================
-- CRÉATION DE LA TABLE BOOKINGS
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

-- Index
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Contrainte
ALTER TABLE bookings ADD CONSTRAINT check_dates CHECK (end_date > start_date);

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique des réservations" ON bookings FOR SELECT USING (true);
CREATE POLICY "Insertion publique des réservations" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification publique des réservations" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Suppression publique des réservations" ON bookings FOR DELETE USING (true);
```

### Option B : Ajouter les colonnes manquantes (si vous voulez garder les données)

**Utilisez SEULEMENT si vous voulez conserver les données existantes**

```sql
-- Vérifier d'abord quelles colonnes manquent
-- Puis ajouter selon le besoin :

-- Si la colonne price n'existe pas
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 9000;

-- Si la colonne type n'existe pas
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'double';

-- Si la colonne status n'existe pas
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'disponible';

-- Si la colonne hotel_id n'existe pas et que hotels existe
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE;

-- Si hotel_id existe mais est NULL, mettre à jour avec le premier hôtel
-- (Attention : modifier l'UUID selon votre hôtel existant)
UPDATE rooms 
SET hotel_id = (SELECT id FROM hotels LIMIT 1) 
WHERE hotel_id IS NULL;

-- Ajouter les contraintes si nécessaire
ALTER TABLE rooms ALTER COLUMN hotel_id SET NOT NULL;

-- Ajouter les index
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
```

## 🚀 Instructions d'application

### Pour l'Option A (recommandé) :

1. Aller sur Supabase → **SQL Editor**
2. Cliquer sur **"New query"**
3. Copier-coller le script de l'Option A
4. Cliquer sur **"Run"**
5. Vérifier dans **"Table Editor"** que les trois tables sont bien créées avec toutes les colonnes :
   - **hotels** : id (uuid), name, address, city, country, phone, email, created_at
   - **rooms** : id (uuid), name, type, price_per_night, status, hotel_id, created_at
   - **bookings** : id (uuid), room_id, customer_name, customer_email, customer_phone, start_date, end_date, status, total_price, notes, created_at

### Pour l'Option B :

1. D'abord, vérifier dans "Table Editor" quelles colonnes manquent
2. Aller dans **SQL Editor**
3. Copier seulement les commandes `ALTER TABLE` dont vous avez besoin
4. Exécuter

## 🧪 Tester après correction

1. Actualiser la page de l'application (F5)
2. Ouvrir la console (F12)
3. Cliquer sur "Ajouter une chambre test"
4. Vous devriez voir :
```
🚀 Début de l'ajout d'une chambre test...
🔍 Recherche d'un hôtel existant...
✅ Hôtel trouvé avec ID: xxx-xxx-xxx
🛏️ Insertion de la chambre: {...}
✅ Chambre ajoutée avec succès!
```

## 📊 Vérifier les données

Après avoir ajouté une chambre :
1. Aller sur Supabase → **Table Editor**
2. Sélectionner la table **"rooms"**
3. Vous devriez voir vos chambres avec toutes les colonnes : name, type, price_per_night, status, hotel_id

Vous pouvez aussi vérifier la table **"bookings"** pour voir les réservations (vide au début).

## ⚠️ Note importante

Votre table `hotels` utilise des **UUID** (identifiants universels) au lieu de **BIGINT**. C'est très bien et c'est même recommandé ! Le code de l'application fonctionne avec les deux types.

ID trouvé dans vos logs : `00000000-0000-0000-0000-000000000000`

## 🆘 Si ça ne fonctionne toujours pas

Envoyez-moi une capture ou copie de :
1. La structure de votre table `rooms` (colonnes visibles dans Table Editor)
2. Les nouveaux messages d'erreur dans la console (F12)

