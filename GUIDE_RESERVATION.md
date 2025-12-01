# Guide - Page de Réservation Publique

## 📋 Vue d'ensemble

La page de réservation publique (`/book`) permet aux clients de réserver une chambre en ligne sans authentification.

## 🎯 Fonctionnalités

### 1. **Sélection des dates**
- Input type date pour l'arrivée et le départ
- Par défaut : Aujourd'hui → Demain
- Calcul automatique du nombre de nuits
- Validation : La date de départ doit être après l'arrivée

### 2. **Filtrage intelligent des chambres**
- Récupération de toutes les chambres disponibles
- Vérification des chevauchements de réservations
- Seules les chambres libres sont affichées

### 3. **Affichage du prix**
- Prix par nuit affiché
- **Prix total calculé** : `prix_per_night × nombre_de_nuits`
- Mise en avant du prix total dans un encadré vert

### 4. **Processus de réservation**
1. Clic sur le bouton "RÉSERVER"
2. Prompt pour le nom du client
3. Prompt pour l'email (avec validation)
4. Insertion dans Supabase avec `status: 'confirmed'`
5. Message de confirmation détaillé
6. Redirection vers la page d'accueil

## 🧪 Comment tester

### Prérequis
✅ Tables créées dans Supabase (hotels, rooms, bookings)
✅ Au moins un hôtel dans la table `hotels`
✅ Au moins une chambre dans la table `rooms`

### Étapes de test

#### Test 1 : Réservation basique

1. **Ouvrir la page**
   ```
   http://localhost:3000/book
   ```

2. **Vérifier l'affichage**
   - Le nom de l'hôtel apparaît en haut
   - Les dates sont pré-remplies (aujourd'hui et demain)
   - Le nombre de nuits est affiché (1 par défaut)
   - Les chambres disponibles s'affichent

3. **Modifier les dates**
   - Changer la date de départ à J+3
   - Vérifier que le nombre de nuits passe à 3
   - Vérifier que le prix total est multiplié par 3

4. **Réserver une chambre**
   - Cliquer sur "RÉSERVER" sur une chambre
   - Entrer un nom : "Jean Dupont"
   - Entrer un email : "jean.dupont@example.com"
   - Voir le message de confirmation
   - Être redirigé vers la page d'accueil

5. **Vérifier dans le Planning**
   - Aller sur `http://localhost:3000/dashboard/calendar`
   - La réservation doit apparaître en VERT (confirmed)
   - Le nom "Jean Dupont" doit être visible

#### Test 2 : Filtrage des chambres occupées

1. **Créer une réservation qui occupe une chambre**
   ```sql
   -- Dans Supabase SQL Editor
   INSERT INTO bookings (
     room_id,
     customer_name,
     check_in,
     check_out,
     status
   ) VALUES (
     (SELECT id FROM rooms LIMIT 1),
     'Marie Martin',
     CURRENT_DATE + INTERVAL '2 days',
     CURRENT_DATE + INTERVAL '5 days',
     'confirmed'
   );
   ```

2. **Tester le filtrage**
   - Sur `/book`, sélectionner des dates qui chevauchent (ex: J+1 à J+4)
   - La chambre occupée ne doit PAS apparaître
   - Changer les dates pour éviter le chevauchement (ex: J+5 à J+7)
   - La chambre doit réapparaître

#### Test 3 : Validation des données

1. **Date invalide**
   - Essayer de mettre la date de départ AVANT l'arrivée
   - Message d'erreur : "La date de départ doit être après la date d'arrivée"

2. **Email invalide**
   - Réserver une chambre
   - Entrer un email sans @ : "test"
   - Message d'erreur : "Adresse email invalide"

3. **Champs vides**
   - Cliquer sur "Annuler" dans le prompt du nom
   - La réservation doit être annulée

## 🔍 Logique de chevauchement

La logique utilisée pour détecter les chevauchements est :

```typescript
// Il y a conflit si :
// - Notre arrivée < Leur départ ET
// - Notre départ > Leur arrivée
const conflict = checkIn < booking.check_out && checkOut > booking.check_in
```

### Exemples

| Réservation existante | Dates demandées | Chevauchement ? |
|----------------------|-----------------|-----------------|
| 10/12 → 15/12 | 08/12 → 12/12 | ✅ OUI |
| 10/12 → 15/12 | 12/12 → 17/12 | ✅ OUI |
| 10/12 → 15/12 | 11/12 → 14/12 | ✅ OUI |
| 10/12 → 15/12 | 08/12 → 10/12 | ❌ NON (arrivée = départ existant) |
| 10/12 → 15/12 | 15/12 → 17/12 | ❌ NON (départ existant = arrivée) |
| 10/12 → 15/12 | 16/12 → 18/12 | ❌ NON (après) |

## 📊 Calcul du prix

```typescript
const nights = calculateNights(checkIn, checkOut)
const totalPrice = room.price_per_night * nights
```

**Exemple :**
- Prix par nuit : 9 000 FCFA
- Séjour : 3 nuits
- **Prix total : 27 000 FCFA**

## 🗄️ Structure de la réservation insérée

```typescript
{
  room_id: "uuid-de-la-chambre",
  customer_name: "Jean Dupont",
  customer_email: "jean.dupont@example.com",
  check_in: "2025-12-10",
  check_out: "2025-12-13",
  status: "confirmed",        // Toujours confirmé pour apparaître dans le planning
  total_price: 27000,
  notes: "Réservation en ligne - 3 nuit(s)"
}
```

## 🎨 Design

- **Gradient de fond** : Bleu clair → Indigo
- **Cartes blanches** avec ombres
- **En-tête de carte** : Gradient Indigo → Violet
- **Prix total** : Encadré vert avec bordure
- **Bouton RÉSERVER** : Grand bouton Indigo avec icône
- **Responsive** : Grid adaptatif (1 à 3 colonnes)

## 🚀 Accès depuis la page d'accueil

La page d'accueil (`/`) a maintenant deux boutons :
1. 🟢 **"Réserver une chambre"** → `/book` (pour les clients)
2. 🔵 **"Se connecter (Staff)"** → Dashboard (pour le personnel)

## 🐛 Dépannage

### "Aucune chambre disponible"
- Vérifier que des chambres existent dans la table `rooms`
- Vérifier que leur `status` est `'available'`
- Essayer des dates différentes

### La réservation ne s'insère pas
- Ouvrir la console (F12) pour voir les logs détaillés
- Vérifier que la table `bookings` existe
- Vérifier les politiques RLS

### Le prix ne se calcule pas correctement
- Vérifier que `price_per_night` existe dans la table `rooms`
- Vérifier dans la console les valeurs de `nights` et `totalPrice`

## 💡 Améliorations futures

- [ ] Remplacer les `window.prompt` par une belle modale
- [ ] Ajouter un champ téléphone
- [ ] Formulaire de paiement en ligne
- [ ] Email de confirmation automatique
- [ ] Système de compte client
- [ ] Historique des réservations client
- [ ] Possibilité d'annuler une réservation

## 📞 Support

Pour toute question, consulter :
- `pms-hotelier.md` - Documentation complète
- Console navigateur (F12) - Logs détaillés
- Table Editor Supabase - Vérifier les données

