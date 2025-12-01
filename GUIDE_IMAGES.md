# Guide - Upload d'Images des Chambres

## 📋 Vue d'ensemble

Le système permet maintenant d'uploader des photos pour chaque chambre. Les images sont stockées dans Supabase Storage et les URLs sont sauvegardées dans la base de données.

## 🗄️ Configuration requise

### Étape 1 : Ajouter la colonne `image_url` à la table `rooms`

```sql
-- Dans Supabase SQL Editor
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rooms_image_url ON rooms(image_url);
```

### Étape 2 : Créer le bucket de stockage `room-images`

1. **Aller sur votre projet Supabase**
2. **Cliquer sur "Storage"** dans le menu latéral
3. **Cliquer sur "New bucket"**
4. **Configurer le bucket :**
   - Name: `room-images`
   - Public bucket: ✅ **OUI** (cocher la case)
   - File size limit: 5 MB
   - Allowed MIME types: `image/*`
5. **Cliquer sur "Create bucket"**

### Étape 3 : Configurer les politiques de sécurité

```sql
-- Politique pour permettre l'upload (INSERT)
CREATE POLICY "Permettre upload des images de chambres"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'room-images');

-- Politique pour permettre la lecture (SELECT)
CREATE POLICY "Permettre lecture des images de chambres"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'room-images');

-- Politique pour permettre la mise à jour (UPDATE)
CREATE POLICY "Permettre mise à jour des images de chambres"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'room-images');

-- Politique pour permettre la suppression (DELETE)
CREATE POLICY "Permettre suppression des images de chambres"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'room-images');
```

**Note:** Ces politiques sont ouvertes pour le développement. En production, ajoutez `auth.uid() IS NOT NULL`.

## 🎯 Fonctionnalités implémentées

### Dashboard (`/dashboard/rooms`)

1. **Modale d'ajout de chambre**
   - Formulaire avec nom, type, prix
   - Zone de drag & drop pour l'image
   - Prévisualisation avant upload
   - Validation (type fichier, taille max 5MB)

2. **Upload d'image**
   - Upload vers Supabase Storage bucket `room-images`
   - Génération d'un nom de fichier unique
   - Récupération de l'URL publique
   - Sauvegarde de l'URL dans `rooms.image_url`

3. **Affichage**
   - Image en haut de chaque carte de chambre
   - Placeholder avec icône si pas d'image
   - Effet hover sur l'image

### Page publique (`/book`)

1. **Affichage des chambres**
   - Grande image attractive (264px de hauteur)
   - Effet zoom au hover
   - Overlay gradient avec le nom
   - Placeholder élégant si pas d'image

## 🧪 Comment tester

### Test 1 : Ajouter une chambre avec photo

1. **Aller sur** `http://localhost:3000/dashboard/rooms`
2. **Cliquer** sur "Ajouter une chambre"
3. **Remplir** le formulaire :
   - Nom : "Suite Présidentielle"
   - Type : "Suite"
   - Prix : 25000
4. **Uploader une image** :
   - Cliquer sur la zone d'upload
   - Sélectionner une image (JPG, PNG, WEBP)
   - Voir la prévisualisation
5. **Cliquer** sur "Créer"
6. **Vérifier** :
   - La chambre apparaît avec l'image
   - L'image est visible dans la grille

### Test 2 : Voir les images côté client

1. **Aller sur** `http://localhost:3000/book`
2. **Vérifier** que les chambres avec images sont affichées
3. **Passer la souris** sur une image → Effet zoom
4. **Les chambres sans images** ont un placeholder élégant

### Test 3 : Vérifier dans Supabase Storage

1. **Aller sur Supabase → Storage**
2. **Cliquer sur le bucket** `room-images`
3. **Voir les images** uploadées
4. **Vérifier les URLs** dans Table Editor → `rooms` → colonne `image_url`

## 🔐 Sécurité

### Validation côté client
- ✅ Type de fichier (images seulement)
- ✅ Taille max 5MB
- ✅ Prévisualisation avant upload

### Stockage Supabase
- ✅ Bucket public (lecture seule)
- ✅ Nom de fichier unique (pas de conflit)
- ✅ Cache-Control pour performances

### Production (à faire plus tard)
- [ ] Restreindre l'upload aux utilisateurs authentifiés
- [ ] Compression automatique des images
- [ ] Formats optimisés (WebP)
- [ ] CDN pour la distribution

## 📁 Structure des fichiers uploadés

```
Bucket: room-images/
├── abc123-1701432000000.jpg
├── def456-1701432100000.png
└── ghi789-1701432200000.webp
```

**Format du nom :** `{random}-{timestamp}.{extension}`

## 🎨 Design

### Dashboard
```
┌────────────────────────┐
│ [Image ou Placeholder] │
│                        │
├────────────────────────┤
│ Chambre 101            │
│ Type: double           │
│ 9000 FCFA / nuit       │
│ [Disponible]           │
└────────────────────────┘
```

### Page publique
```
┌────────────────────────┐
│                        │
│     [Grande Image]     │
│                        │
│  Gradient + Nom ▼      │
├────────────────────────┤
│ Type: double           │
│ Prix total: 27000 FCFA │
│ [RÉSERVER]             │
└────────────────────────┘
```

## 💡 Code important

### Upload d'image

```typescript
const uploadImage = async (file: File): Promise<string | null> => {
  // Nom unique
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  
  // Upload
  await supabase.storage
    .from("room-images")
    .upload(fileName, file)
  
  // URL publique
  const { data } = supabase.storage
    .from("room-images")
    .getPublicUrl(fileName)
  
  return data.publicUrl
}
```

### Insertion avec image

```typescript
const newRoom = {
  name: "Suite 101",
  type: "suite",
  price_per_night: 25000,
  status: "available",
  hotel_id: hotelId,
  image_url: imageUrl,  // URL de Supabase Storage
}

await supabase.from("rooms").insert([newRoom])
```

## 🐛 Dépannage

### L'upload échoue
**Erreur:** "Failed to upload"
- Vérifier que le bucket `room-images` existe
- Vérifier que le bucket est PUBLIC
- Vérifier les politiques de sécurité

### L'image ne s'affiche pas
**Problème:** URL cassée
- Vérifier l'URL dans Table Editor
- Vérifier que le fichier existe dans Storage
- Ouvrir l'URL dans un nouvel onglet

### "413 Payload Too Large"
**Problème:** Image trop volumineuse
- La limite est 5MB
- Compresser l'image avant upload
- Utiliser un format optimisé (WebP)

### Pas de prévisualisation
**Problème:** FileReader ne fonctionne pas
- Vérifier que c'est bien un fichier image
- Vérifier la console pour les erreurs
- Tester avec une autre image

## 📊 Types de fichiers supportés

| Format | Extension | Supporté | Recommandé |
|--------|-----------|----------|------------|
| JPEG   | .jpg .jpeg | ✅ | ✅ |
| PNG    | .png      | ✅ | ✅ |
| WebP   | .webp     | ✅ | ✅✅ (optimal) |
| GIF    | .gif      | ✅ | ❌ (lourd) |
| SVG    | .svg      | ✅ | ❌ (non raster) |

## 🚀 Améliorations futures

- [ ] Redimensionnement automatique (thumbnails)
- [ ] Compression automatique
- [ ] Galerie de plusieurs images par chambre
- [ ] Édition d'image intégrée (crop, rotate)
- [ ] Drag & drop multiple
- [ ] Indicateur de progression d'upload
- [ ] Lazy loading des images
- [ ] Format WebP automatique

## 📞 Support

Pour toute question :
- Consulter `pms-hotelier.md`
- Vérifier la console (F12) pour les logs
- Vérifier Storage dans Supabase
- Vérifier les politiques RLS

