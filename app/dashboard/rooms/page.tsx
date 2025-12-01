"use client"

// Importation des hooks React
import { useEffect, useState, FormEvent, ChangeEvent } from "react"
// Importation des icônes Lucide
import { Bed, Plus, DollarSign, RefreshCw, X, Image as ImageIcon, Upload, Trash2, Pencil } from "lucide-react"
// Importation du client Supabase
import { supabase } from "@/utils/supabase/client"

// Définition du type TypeScript pour une chambre
type Room = {
  id: string | number
  name: string
  type: string
  price_per_night: number
  status: "available" | "occupied"
  hotel_id?: string | number
  image_url?: string  // URL de l'image uploadée
  created_at: string
}

export default function RoomsPage() {
  // State pour stocker la liste des chambres
  const [rooms, setRooms] = useState<Room[]>([])
  // State pour gérer l'état de chargement
  const [loading, setLoading] = useState(true)
  // State pour l'ajout d'une chambre
  const [adding, setAdding] = useState(false)
  // State pour afficher/masquer la modale
  const [showModal, setShowModal] = useState(false)
  // State pour la chambre en cours d'édition (null = création, objet = édition)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  // State pour le formulaire
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    type: "double",
  })
  // State pour le fichier image sélectionné
  const [imageFile, setImageFile] = useState<File | null>(null)
  // State pour la prévisualisation de l'image
  const [imagePreview, setImagePreview] = useState<string>("")

  // Fonction pour récupérer la liste des chambres depuis Supabase
  const fetchRooms = async () => {
    try {
      setLoading(true)
      
      // Requête pour récupérer toutes les chambres, triées par nom
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("name", { ascending: true })

      // Gestion des erreurs
      if (error) {
        console.error("❌ Erreur lors de la récupération des chambres:", error)
        return
      }

      // Mise à jour du state avec les données récupérées
      setRooms(data || [])
    } catch (error) {
      console.error("❌ Erreur:", error)
    } finally {
      // Fin du chargement
      setLoading(false)
    }
  }

  // Fonction pour gérer la sélection d'une image
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("⚠️ Veuillez sélectionner un fichier image")
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ L'image est trop volumineuse (max 5MB)")
      return
    }

    // Stocker le fichier
    setImageFile(file)
    
    // Créer une prévisualisation
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Fonction pour uploader l'image vers Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      console.log("📤 Upload de l'image:", fileName)

      // Upload vers le bucket 'room-images'
      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("❌ Erreur lors de l'upload:", uploadError)
        throw uploadError
      }

      // Récupérer l'URL publique de l'image
      const { data: publicUrlData } = supabase.storage
        .from("room-images")
        .getPublicUrl(filePath)

      console.log("✅ Image uploadée avec succès:", publicUrlData.publicUrl)
      return publicUrlData.publicUrl
    } catch (error) {
      console.error("❌ Erreur lors de l'upload d'image:", error)
      return null
    }
  }

  // Fonction pour ouvrir la modale en mode création
  const handleOpenCreateModal = () => {
    // Réinitialiser tout
    setEditingRoom(null)
    setFormData({ name: "", price: "", type: "double" })
    setImageFile(null)
    setImagePreview("")
    setShowModal(true)
  }

  // Fonction pour ouvrir la modale en mode édition
  const handleOpenEditModal = (room: Room) => {
    // Pré-remplir le formulaire avec les données de la chambre
    setEditingRoom(room)
    setFormData({
      name: room.name,
      price: room.price_per_night.toString(),
      type: room.type,
    })
    // Si la chambre a une image, l'afficher en prévisualisation
    if (room.image_url) {
      setImagePreview(room.image_url)
    } else {
      setImagePreview("")
    }
    setImageFile(null)
    setShowModal(true)
  }

  // Fonction pour supprimer une chambre
  const handleDelete = async (room: Room) => {
    // Demander confirmation
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer la chambre "${room.name}" ?\n\nCette action est irréversible.`
    )
    
    if (!confirmed) return

    try {
      console.log("🗑️ Suppression de la chambre:", room.name)

      // Supprimer de Supabase
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", room.id)

      if (error) {
        console.error("❌ Erreur lors de la suppression:", error)
        alert(`Erreur: ${error.message}`)
        return
      }

      console.log("✅ Chambre supprimée avec succès")
      
      // Rafraîchir la liste
      await fetchRooms()
      
    } catch (error) {
      console.error("❌ Erreur inattendue:", error)
      alert("Une erreur inattendue s'est produite")
    }
  }

  // Fonction pour gérer la soumission du formulaire (création OU édition)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validation des champs
    if (!formData.name || !formData.price) {
      alert("⚠️ Veuillez remplir tous les champs obligatoires")
      return
    }

    const price = parseInt(formData.price)
    if (isNaN(price) || price <= 0) {
      alert("⚠️ Le prix doit être un nombre positif")
      return
    }

    try {
      setAdding(true)
      
      // MODE ÉDITION
      if (editingRoom) {
        console.log("✏️ Modification de la chambre:", editingRoom.name)
        
        // Uploader une nouvelle image si le fichier a changé
        let imageUrl = editingRoom.image_url || null
        if (imageFile) {
          const newImageUrl = await uploadImage(imageFile)
          if (newImageUrl) {
            imageUrl = newImageUrl
          } else {
            alert("⚠️ Erreur lors de l'upload de l'image, mais la modification continuera")
          }
        }

        // Mettre à jour la chambre
        const updatedRoom = {
          name: formData.name,
          type: formData.type,
          price_per_night: price,
          image_url: imageUrl,
        }

        const { error: updateError } = await supabase
          .from("rooms")
          .update(updatedRoom)
          .eq("id", editingRoom.id)

        if (updateError) {
          console.error("❌ Erreur lors de la modification:", updateError)
          alert(`Erreur: ${updateError.message}`)
          return
        }

        console.log("✅ Chambre modifiée avec succès!")
        
        // Réinitialiser et fermer
        setFormData({ name: "", price: "", type: "double" })
        setImageFile(null)
        setImagePreview("")
        setEditingRoom(null)
        setShowModal(false)
        
        // Rafraîchir la liste
        await fetchRooms()
        return
      }
      
      // MODE CRÉATION (code existant)
      
      // ÉTAPE 1: Récupérer ou créer un hôtel
      let hotelId: string | number | null = null
      
      console.log("🔍 Recherche d'un hôtel existant...")
      const { data: existingHotels, error: fetchError } = await supabase
        .from("hotels")
        .select("id")
        .limit(1)
      
      if (fetchError) {
        console.error("❌ Erreur:", fetchError)
        alert(`Erreur lors de la recherche d'hôtels: ${fetchError.message}`)
        return
      }
      
      if (existingHotels && existingHotels.length > 0) {
        hotelId = existingHotels[0].id
        console.log(`✅ Hôtel trouvé avec ID: ${hotelId}`)
      } else {
        console.log("🏨 Création d'un hôtel...")
        const { data: newHotel, error: createHotelError } = await supabase
          .from("hotels")
          .insert([{ name: "Mon Hôtel Test" }])
          .select()
        
        if (createHotelError) {
          console.error("❌ Erreur:", createHotelError)
          alert(`Erreur lors de la création de l'hôtel: ${createHotelError.message}`)
          return
        }
        
        if (newHotel && newHotel.length > 0) {
          hotelId = newHotel[0].id
          console.log(`✅ Hôtel créé avec ID: ${hotelId}`)
        }
      }
      
      if (!hotelId) {
        alert("❌ Impossible de récupérer l'ID de l'hôtel")
        return
      }

      // ÉTAPE 2: Uploader l'image si présente
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
        if (!imageUrl) {
          alert("⚠️ Erreur lors de l'upload de l'image, mais la chambre sera créée sans image")
        }
      }

      // ÉTAPE 3: Créer la chambre
      const newRoom = {
        name: formData.name,
        type: formData.type,
        price_per_night: price,
        status: "available",
        hotel_id: hotelId,
        image_url: imageUrl, // Peut être null si pas d'image
      }

      console.log("🛏️ Création de la chambre:", newRoom)

      const { error: insertError } = await supabase
        .from("rooms")
        .insert([newRoom])

      if (insertError) {
        console.error("❌ Erreur lors de la création de la chambre:", insertError)
        alert(`Erreur: ${insertError.message}`)
        return
      }

      // Succès !
      console.log("✅ Chambre créée avec succès!")
      
      // Réinitialiser le formulaire
      setFormData({ name: "", price: "", type: "double" })
      setImageFile(null)
      setImagePreview("")
      setEditingRoom(null)
      setShowModal(false)
      
      // Rafraîchir la liste des chambres
      await fetchRooms()
      
    } catch (error) {
      console.error("❌ Erreur inattendue:", error)
      alert("Une erreur inattendue s'est produite")
    } finally {
      setAdding(false)
    }
  }

  // Charger les chambres au montage du composant
  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <div>
      {/* En-tête de la page */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Chambres
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos chambres et leur disponibilité
          </p>
        </div>

        {/* Bouton pour ouvrir la modale en mode création */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          <span>Ajouter une chambre</span>
        </button>
      </div>

      {/* Modale d'ajout de chambre */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête de la modale */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRoom ? "Modifier la chambre" : "Nouvelle Chambre"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingRoom(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nom de la chambre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la chambre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Chambre 101"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Type de chambre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de chambre
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="simple">Simple</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </div>

              {/* Prix par nuit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix par nuit (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ex: 9000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Upload d'image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo de la chambre
                </label>
                
                {/* Prévisualisation */}
                {imagePreview ? (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Prévisualisation"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview("")
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Supprimer l'image
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={40} className="text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour uploader</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG ou WEBP (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRoom(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={adding}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{editingRoom ? "Modification..." : "Création..."}</span>
                    </>
                  ) : editingRoom ? (
                    <>
                      <Pencil size={16} />
                      <span>Sauvegarder</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Créer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des chambres */}
      {loading ? (
        // État de chargement
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des chambres...</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        // Aucune chambre trouvée
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Bed size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune chambre trouvée
          </h2>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter une chambre
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Ajouter une chambre</span>
          </button>
        </div>
      ) : (
        // Grille des chambres
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden relative"
            >
              {/* Boutons d'action (Edit & Delete) */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                {/* Bouton Modifier */}
                <button
                  onClick={() => handleOpenEditModal(room)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                  title="Modifier la chambre"
                >
                  <Pencil size={18} />
                </button>
                
                {/* Bouton Supprimer */}
                <button
                  onClick={() => handleDelete(room)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                  title="Supprimer la chambre"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Image de la chambre */}
              {room.image_url ? (
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <ImageIcon size={64} className="text-white opacity-50" />
                </div>
              )}

              {/* Contenu de la carte */}
              <div className="p-6">
                {/* Nom de la chambre */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {room.name}
                </h3>

                {/* Type de chambre */}
                <p className="text-gray-600 text-sm mb-4 capitalize">
                  Type: {room.type}
                </p>

                {/* Prix de la chambre */}
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={20} className="text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {room.price_per_night.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-gray-600">FCFA / nuit</span>
                </div>

                {/* Badge de statut */}
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      inline-block px-3 py-1 rounded-full text-sm font-semibold
                      ${
                        room.status === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}
                  >
                    {/* Affichage en français pour l'utilisateur */}
                    {room.status === "available" ? "Disponible" : "Occupée"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
