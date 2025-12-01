# Migration - Création de la table Bookings

## 📋 Prérequis

**IMPORTANT :** Avant d'exécuter ce script, vous devez avoir créé les tables `hotels` et `rooms` (voir `SETUP_SUPABASE.md` ou `FIX_DATABASE.md`).

## 🚀 Script SQL à exécuter

### Étapes :

1. Aller sur Supabase
2. Cliquer sur **"SQL Editor"** dans le menu latéral
3. Cliquer sur **"New query"**
4. Copier-coller le script ci-dessous
5. Cliquer sur **"Run"**

### Script :

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

## ✅ Vérification

Après avoir exécuté le script :

1. Aller dans **"Table Editor"**
2. Vous devriez voir la table **"bookings"**
3. Cliquer dessus pour voir sa structure :
   - ✅ id (uuid)
   - ✅ room_id (uuid)
   - ✅ customer_name (text)
   - ✅ customer_email (text)
   - ✅ customer_phone (text)
   - ✅ start_date (date)
   - ✅ end_date (date)
   - ✅ status (text)
   - ✅ total_price (int4)
   - ✅ notes (text)
   - ✅ created_at (timestamptz)

## 🧪 Tester avec des données de test

Vous pouvez ajouter une réservation de test avec ce script :

```sql
-- Insérer une réservation de test
-- (Remplacez 'votre-room-id' par un ID de chambre existant)

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
  (SELECT id FROM rooms LIMIT 1),  -- Prend la première chambre disponible
  'Jean Dupont',
  'jean.dupont@example.com',
  '+33 6 12 34 56 78',
  CURRENT_DATE,                     -- Aujourd'hui
  CURRENT_DATE + INTERVAL '3 days', -- Dans 3 jours
  'confirmed',
  27000,                            -- 3 nuits x 9000 FCFA
  'Réservation de test'
);
```

Puis allez sur l'application : `http://localhost:3000/dashboard/calendar`

Vous devriez voir la réservation apparaître dans le planning ! 🎉

## 📊 Structure de la table

### Colonnes

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique de la réservation |
| `room_id` | UUID | Référence à la chambre réservée |
| `customer_name` | TEXT | Nom complet du client |
| `customer_email` | TEXT | Email du client (optionnel) |
| `customer_phone` | TEXT | Téléphone du client (optionnel) |
| `start_date` | DATE | Date d'arrivée (YYYY-MM-DD) |
| `end_date` | DATE | Date de départ (YYYY-MM-DD) |
| `status` | TEXT | Statut : 'pending', 'confirmed', 'cancelled' |
| `total_price` | INTEGER | Prix total en FCFA (optionnel) |
| `notes` | TEXT | Notes ou commentaires (optionnel) |
| `created_at` | TIMESTAMPTZ | Date de création de la réservation |

### Statuts disponibles

- **`pending`** : En attente de confirmation (orange dans le planning)
- **`confirmed`** : Confirmée (vert dans le planning)
- **`cancelled`** : Annulée (n'apparaît pas dans le planning)

### Contraintes

- ✅ `end_date` doit être APRÈS `start_date`
- ✅ `room_id` doit référencer une chambre existante
- ✅ Si une chambre est supprimée, ses réservations sont également supprimées (CASCADE)

## 🔐 Sécurité

**⚠️ IMPORTANT :** Les politiques RLS actuelles sont ouvertes pour le développement. En production, vous devrez les sécuriser :

```sql
-- En production, remplacer par :
CREATE POLICY "Lecture authentifiée" ON bookings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

## 🐛 Dépannage

### Erreur : "relation rooms does not exist"
➡️ Vous devez d'abord créer la table `rooms`. Voir `SETUP_SUPABASE.md`

### Erreur : "duplicate key value violates unique constraint"
➡️ La table existe déjà. Pas besoin de la recréer.

### La réservation n'apparaît pas dans le planning
1. Vérifier que `status` est 'pending' ou 'confirmed' (pas 'cancelled')
2. Vérifier que la date `start_date` est dans les 14 prochains jours
3. Actualiser la page du planning (bouton "Actualiser")
4. Vérifier la console (F12) pour voir les logs

## 📞 Besoin d'aide ?

Consultez :
- `pms-hotelier.md` pour la documentation complète
- `FIX_DATABASE.md` pour recréer toutes les tables
- La console du navigateur (F12) pour les logs détaillés

