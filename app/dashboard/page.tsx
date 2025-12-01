"use client"

// Importation des icônes pour les statistiques
import { Bed, Calendar, Users, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  // Données statistiques fictives (à remplacer par des données réelles de Supabase)
  const stats = [
    {
      title: "Chambres disponibles",
      value: "12",
      icon: Bed,
      color: "bg-green-500",
    },
    {
      title: "Réservations actives",
      value: "8",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: "Clients",
      value: "45",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Taux d'occupation",
      value: "67%",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ]

  return (
    <div>
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Vue d'ensemble
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre tableau de bord
        </p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon

          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* En-tête de la carte avec icône */}
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              
              {/* Valeur de la statistique */}
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              
              {/* Titre de la statistique */}
              <div className="text-gray-600 text-sm">
                {stat.title}
              </div>
            </div>
          )
        })}
      </div>

      {/* Section à venir */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Activité récente
        </h2>
        <p className="text-gray-500">
          Cette section affichera les dernières réservations et activités...
        </p>
      </div>
    </div>
  )
}

