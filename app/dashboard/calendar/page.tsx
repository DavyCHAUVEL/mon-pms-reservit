"use client"

// Importation des hooks React
import { useEffect, useState } from "react"
// Importation des icônes Lucide
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react"
// Importation du client Supabase
import { supabase } from "@/utils/supabase/client"

// Type pour une chambre
type Room = {
  id: string
  name: string
  type: string
  price_per_night: number
  status: string
}

// Type pour une réservation
type Booking = {
  id: string
  room_id: string
  customer_name: string
  start_date: string  // Format: YYYY-MM-DD (nom de colonne SQL: start_date)
  end_date: string    // Format: YYYY-MM-DD (nom de colonne SQL: end_date)
  status: "confirmed" | "pending" | "cancelled"
  created_at: string
}

export default function CalendarPage() {
  // State pour stocker les chambres
  const [rooms, setRooms] = useState<Room[]>([])
  // State pour stocker les réservations
  const [bookings, setBookings] = useState<Booking[]>([])
  // State pour gérer le chargement
  const [loading, setLoading] = useState(true)
  // State pour les 14 prochains jours
  const [days, setDays] = useState<Date[]>([])

  // Fonction pour générer les 14 prochains jours (J à J+13)
  const generateDays = () => {
    const daysArray: Date[] = []
    const today = new Date()
    
    // Boucle pour créer un tableau de 14 dates
    for (let i = 0; i < 14; i++) {
      const day = new Date(today)
      day.setDate(today.getDate() + i) // Ajoute i jours à aujourd'hui
      daysArray.push(day)
    }
    
    setDays(daysArray)
  }

  // Fonction pour formater une date en "Lun 01"
  const formatDay = (date: Date): string => {
    // Tableau des jours de la semaine en français
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
    const dayName = dayNames[date.getDay()]
    // Récupère le numéro du jour avec un zéro devant si nécessaire
    const dayNumber = date.getDate().toString().padStart(2, "0")
    return `${dayName} ${dayNumber}`
  }

  // Fonction pour formater une date en YYYY-MM-DD (pour comparaison)
  const formatDateForComparison = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Fonction pour vérifier si une réservation couvre une date donnée
  const hasBookingOnDate = (roomId: string, date: Date): Booking | null => {
    const dateStr = formatDateForComparison(date)
    
    // Chercher une réservation pour cette chambre qui couvre cette date
    const booking = bookings.find((b) => {
      // Vérifier que c'est bien la bonne chambre
      if (b.room_id !== roomId) return false
      // Vérifier que la réservation n'est pas annulée
      if (b.status === "cancelled") return false
      // Vérifier que la date est entre start_date et end_date (exclusif de end_date)
      return dateStr >= b.start_date && dateStr < b.end_date
    })
    
    return booking || null
  }

  // Fonction pour récupérer les chambres depuis Supabase
  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
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

  // Fonction pour récupérer les réservations depuis Supabase
  const fetchBookings = async () => {
    try {
      // Calculer la date de fin (J+13) pour filtrer les réservations
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 13)
      const endDateStr = formatDateForComparison(endDate)
      
      // Récupérer les réservations qui se chevauchent avec notre période
      // Utilise les noms de colonnes corrects du schéma SQL
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .lte("start_date", endDateStr) // start_date <= fin de période
        .gte("end_date", formatDateForComparison(today)) // end_date >= aujourd'hui

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
    generateDays() // Générer les 14 jours
    await Promise.all([fetchRooms(), fetchBookings()]) // Charger en parallèle
    setLoading(false)
  }

  // Charger les données au montage du composant
  useEffect(() => {
    loadData()
  }, [])

  return (
    <div>
      {/* En-tête de la page */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Planning des Réservations
          </h1>
          <p className="text-gray-600 mt-2">
            Vue Timeline sur les 14 prochains jours
          </p>
        </div>

        {/* Bouton de rafraîchissement */}
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Légende des statuts */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CalendarIcon size={16} />
          Légende
        </h3>
        <div className="flex gap-6">
          {/* Badge Confirmé */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Confirmé</span>
          </div>
          {/* Badge En attente */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-700">En attente</span>
          </div>
          {/* Badge Disponible */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-sm text-gray-700">Disponible</span>
          </div>
        </div>
      </div>

      {/* Affichage conditionnel selon l'état de chargement */}
      {loading ? (
        // État de chargement
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <RefreshCw size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement du planning...</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        // Aucune chambre trouvée
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CalendarIcon size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune chambre disponible
          </h2>
          <p className="text-gray-600">
            Ajoutez des chambres pour voir le planning
          </p>
        </div>
      ) : (
        // Grille Timeline
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Container avec scroll horizontal */}
          <div className="overflow-x-auto">
            {/* Grille principale */}
            <div className="inline-block min-w-full">
              {/* En-tête avec les dates */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {/* Cellule vide pour aligner avec la colonne des chambres */}
                <div className="w-48 flex-shrink-0 p-4 font-semibold text-gray-700 border-r border-gray-200">
                  Chambres
                </div>
                
                {/* Cellules des dates */}
                {days.map((day, index) => {
                  // Vérifier si c'est aujourd'hui
                  const isToday = formatDateForComparison(day) === formatDateForComparison(new Date())
                  
                  return (
                    <div
                      key={index}
                      className={`w-32 flex-shrink-0 p-4 text-center border-r border-gray-200 ${
                        isToday ? "bg-indigo-50 font-bold text-indigo-700" : "text-gray-700"
                      }`}
                    >
                      {formatDay(day)}
                    </div>
                  )
                })}
              </div>

              {/* Lignes des chambres */}
              {rooms.map((room) => (
                <div key={room.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                  {/* Colonne avec le nom de la chambre */}
                  <div className="w-48 flex-shrink-0 p-4 border-r border-gray-200">
                    <div className="font-semibold text-gray-900">{room.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{room.type}</div>
                  </div>

                  {/* Cellules pour chaque jour */}
                  {days.map((day, dayIndex) => {
                    // Vérifier s'il y a une réservation pour cette chambre ce jour
                    const booking = hasBookingOnDate(room.id, day)
                    
                    return (
                      <div
                        key={dayIndex}
                        className="w-32 flex-shrink-0 p-2 border-r border-gray-200 relative"
                      >
                        {booking ? (
                          // Barre de réservation
                          <div
                            className={`
                              h-full rounded px-2 py-1 text-xs text-white font-medium
                              flex items-center justify-center text-center
                              ${
                                booking.status === "confirmed"
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              }
                            `}
                            title={`${booking.customer_name} - ${booking.status}`}
                          >
                            {/* Afficher le nom du client (tronqué si trop long) */}
                            <span className="truncate">
                              {booking.customer_name}
                            </span>
                          </div>
                        ) : (
                          // Cellule vide (disponible)
                          <div className="h-full bg-gray-50 rounded"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Message info si aucune réservation */}
          {bookings.length === 0 && (
            <div className="p-8 text-center border-t border-gray-200 bg-gray-50">
              <p className="text-gray-600">
                Aucune réservation sur cette période
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

