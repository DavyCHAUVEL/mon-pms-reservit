"use client"

// Importation des hooks React
import { useEffect, useState } from "react"
// Importation du routeur Next.js pour la redirection
import { useRouter } from "next/navigation"
// Importation des icônes Lucide
import { Calendar, Users, DollarSign, CheckCircle, Bed, Image as ImageIcon } from "lucide-react"
// Importation du client Supabase
import { supabase } from "@/utils/supabase/client"

// Type pour un hôtel
type Hotel = {
  id: string
  name: string
  address?: string
  city?: string
  country?: string
}

// Type pour une chambre
type Room = {
  id: string
  name: string
  type: string
  price_per_night: number
  hotel_id: string
  image_url?: string  // URL de l'image de la chambre (optionnel)
}

// Type pour une réservation
type Booking = {
  id: string
  room_id: string
  start_date: string  // Nom de colonne SQL: start_date (pas check_in)
  end_date: string    // Nom de colonne SQL: end_date (pas check_out)
  status: string
}

export default function BookPage() {
  // Hook de navigation pour redirection
  const router = useRouter()
  
  // State pour l'hôtel
  const [hotel, setHotel] = useState<Hotel | null>(null)
  // State pour les chambres de l'hôtel
  const [rooms, setRooms] = useState<Room[]>([])
  // State pour toutes les réservations existantes
  const [bookings, setBookings] = useState<Booking[]>([])
  // State pour le chargement
  const [loading, setLoading] = useState(true)
  // State pour la date d'arrivée (par défaut: aujourd'hui)
  const [checkIn, setCheckIn] = useState<string>("")
  // State pour la date de départ (par défaut: demain)
  const [checkOut, setCheckOut] = useState<string>("")

  // Fonction pour formater une date en YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Initialisation des dates par défaut (aujourd'hui et demain)
  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    setCheckIn(formatDate(today))
    setCheckOut(formatDate(tomorrow))
  }, [])

  // Fonction pour calculer le nombre de nuits entre deux dates
  const calculateNights = (checkInDate: string, checkOutDate: string): number => {
    // Convertir les dates en millisecondes
    const start = new Date(checkInDate).getTime()
    const end = new Date(checkOutDate).getTime()
    
    // Calculer la différence en jours
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    
    // Retourner au minimum 1 nuit
    return nights > 0 ? nights : 1
  }

  // Fonction pour vérifier si une chambre est disponible sur les dates sélectionnées
  const isRoomAvailable = (roomId: string): boolean => {
    // Si les dates ne sont pas définies, considérer la chambre comme non disponible
    if (!checkIn || !checkOut) return false
    
    // Chercher s'il existe une réservation qui chevauche les dates demandées
    const hasConflict = bookings.some((booking) => {
      // Ignorer les réservations annulées
      if (booking.status === "cancelled") return false
      
      // Vérifier si c'est la même chambre
      if (booking.room_id !== roomId) return false
      
      // Logique de chevauchement de dates :
      // Il y a conflit si :
      // - Notre arrivée est avant leur départ ET
      // - Notre départ est après leur arrivée
      const conflict = checkIn < booking.end_date && checkOut > booking.start_date
      
      return conflict
    })
    
    // La chambre est disponible s'il n'y a PAS de conflit
    return !hasConflict
  }

  // Fonction pour récupérer l'hôtel depuis Supabase
  const fetchHotel = async () => {
    try {
      // Récupérer le premier hôtel trouvé
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .limit(1)
        .single()

      if (error) {
        console.error("❌ Erreur lors de la récupération de l'hôtel:", error)
        return
      }

      setHotel(data)
    } catch (error) {
      console.error("❌ Erreur:", error)
    }
  }

  // Fonction pour récupérer les chambres depuis Supabase
  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "available") // Seulement les chambres avec status 'available'
        .order("name", { ascending: true })

      if (error) {
        console.error("❌ Erreur lors de la récupération des chambres:", error)
        return
      }

      setRooms(data || [])
    } catch (error) {
      console.error("❌ Erreur:", error)
    }
  }

  // Fonction pour récupérer toutes les réservations
  const fetchBookings = async () => {
    try {
      // Récupération avec les noms de colonnes corrects du schéma SQL
      const { data, error } = await supabase
        .from("bookings")
        .select("id, room_id, start_date, end_date, status")

      if (error) {
        console.error("❌ Erreur lors de la récupération des réservations:", error)
        return
      }

      setBookings(data || [])
    } catch (error) {
      console.error("❌ Erreur:", error)
    }
  }

  // Fonction pour charger toutes les données
  const loadData = async () => {
    setLoading(true)
    await Promise.all([fetchHotel(), fetchRooms(), fetchBookings()])
    setLoading(false)
  }

  // Charger les données au montage du composant
  useEffect(() => {
    loadData()
  }, [])

  // Fonction pour gérer la réservation d'une chambre
  const handleBookRoom = async (room: Room) => {
    try {
      // Validation des dates
      if (!checkIn || !checkOut) {
        alert("⚠️ Veuillez sélectionner les dates d'arrivée et de départ")
        return
      }

      // Vérifier que check_out > check_in
      if (checkOut <= checkIn) {
        alert("⚠️ La date de départ doit être après la date d'arrivée")
        return
      }

      // Vérifier à nouveau la disponibilité avant de réserver
      if (!isRoomAvailable(room.id)) {
        alert("⚠️ Désolé, cette chambre n'est plus disponible pour ces dates")
        // Recharger les données
        await loadData()
        return
      }

      // Demander le nom du client
      const customerName = window.prompt("👤 Entrez votre nom complet :")
      if (!customerName || customerName.trim() === "") {
        return // Annulé par l'utilisateur
      }

      // Demander l'email du client
      const customerEmail = window.prompt("📧 Entrez votre adresse email :")
      if (!customerEmail || customerEmail.trim() === "") {
        return // Annulé par l'utilisateur
      }

      // Validation basique de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        alert("⚠️ Adresse email invalide")
        return
      }

      // Calculer le nombre de nuits
      const nights = calculateNights(checkIn, checkOut)
      
      // Calculer le prix total
      const totalPrice = room.price_per_night * nights

      // Préparer les données de la réservation avec les noms de colonnes corrects
      const bookingData = {
        room_id: room.id,
        customer_name: customerName.trim(),  // Nom de colonne SQL: customer_name
        customer_email: customerEmail.trim(),
        start_date: checkIn,   // Nom de colonne SQL: start_date (pas check_in)
        end_date: checkOut,    // Nom de colonne SQL: end_date (pas check_out)
        status: "confirmed",   // Statut confirmé pour qu'elle apparaisse dans le planning
        total_price: totalPrice,
        notes: `Réservation en ligne - ${nights} nuit(s)`,
      }

      console.log("📝 Création de la réservation:", bookingData)

      // Insérer la réservation dans Supabase
      const { error } = await supabase
        .from("bookings")
        .insert([bookingData])

      // Gestion des erreurs
      if (error) {
        console.error("❌ Erreur lors de la réservation:", error)
        alert(`❌ Erreur lors de la réservation: ${error.message}`)
        return
      }

      // Succès !
      console.log("✅ Réservation créée avec succès!")
      
      // Afficher un message de succès détaillé
      alert(
        `✅ Réservation réussie !\n\n` +
        `📍 Hôtel: ${hotel?.name || "Mon Hôtel"}\n` +
        `🛏️ Chambre: ${room.name}\n` +
        `📅 Du ${checkIn} au ${checkOut}\n` +
        `🌙 ${nights} nuit(s)\n` +
        `💰 Prix total: ${totalPrice.toLocaleString("fr-FR")} FCFA\n\n` +
        `Un email de confirmation sera envoyé à ${customerEmail}`
      )

      // Rediriger vers la page d'accueil
      router.push("/")
    } catch (error) {
      console.error("❌ Erreur inattendue:", error)
      alert("❌ Une erreur inattendue s'est produite. Veuillez réessayer.")
    }
  }

  // Calculer le nombre de nuits sélectionnées
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0

  // Filtrer les chambres disponibles
  const availableRooms = rooms.filter((room) => isRoomAvailable(room.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* Container principal */}
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {hotel ? hotel.name : "Mon PMS Hôtelier"}
          </h1>
          <p className="text-gray-600 text-lg">
            Réservez votre chambre en ligne
          </p>
          {hotel?.address && (
            <p className="text-gray-500 mt-2">
              📍 {hotel.address}
              {hotel.city && `, ${hotel.city}`}
              {hotel.country && `, ${hotel.country}`}
            </p>
          )}
        </div>

        {/* Section de sélection des dates */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-indigo-600" />
            Sélectionnez vos dates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date d'arrivée */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date d'arrivée
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={formatDate(new Date())} // Ne peut pas réserver dans le passé
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Date de départ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de départ
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn} // La date de départ doit être après l'arrivée
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Affichage du nombre de nuits */}
            <div className="flex items-end">
              <div className="bg-indigo-50 rounded-lg p-4 w-full">
                <p className="text-sm text-gray-600 mb-1">Nombre de nuits</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {nights}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des chambres disponibles */}
        {loading ? (
          // État de chargement
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des chambres disponibles...</p>
            </div>
          </div>
        ) : availableRooms.length === 0 ? (
          // Aucune chambre disponible
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <Bed size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucune chambre disponible
            </h2>
            <p className="text-gray-600 mb-4">
              Désolé, aucune chambre n'est disponible pour les dates sélectionnées.
            </p>
            <p className="text-gray-500 text-sm">
              Essayez de modifier vos dates ou contactez-nous directement.
            </p>
          </div>
        ) : (
          // Grille des chambres disponibles
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Chambres disponibles ({availableRooms.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => {
                // Calculer le prix total pour cette chambre
                const totalPrice = room.price_per_night * nights

                return (
                  <div
                    key={room.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                  >
                    {/* Image de la chambre */}
                    {room.image_url ? (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={room.image_url}
                          alt={room.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                        {/* Overlay avec le nom de la chambre */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-2xl font-bold text-white">
                            {room.name}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 h-64 flex flex-col items-center justify-center">
                        <ImageIcon size={64} className="text-white opacity-50 mb-4" />
                        <h3 className="text-2xl font-bold text-white">
                          {room.name}
                        </h3>
                      </div>
                    )}

                    {/* Contenu de la carte */}
                    <div className="p-6">
                      {/* Type de chambre */}
                      <div className="flex items-center gap-2 mb-4">
                        <Users size={20} className="text-gray-500" />
                        <span className="text-gray-700 capitalize">
                          Chambre {room.type}
                        </span>
                      </div>

                      {/* Prix */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign size={20} className="text-green-600" />
                          <span className="text-gray-600 text-sm">
                            {room.price_per_night.toLocaleString("fr-FR")} FCFA / nuit
                          </span>
                        </div>
                        
                        {/* Prix total */}
                        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                          <p className="text-sm text-gray-600 mb-1">Prix total</p>
                          <p className="text-3xl font-bold text-green-700">
                            {totalPrice.toLocaleString("fr-FR")} FCFA
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            pour {nights} nuit{nights > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Bouton RÉSERVER */}
                      <button
                        onClick={() => handleBookRoom(room)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <CheckCircle size={24} />
                        <span className="text-lg">RÉSERVER</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

