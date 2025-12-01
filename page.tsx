"use client"

// Importation des icônes depuis Lucide React
import { LogIn, Calendar } from "lucide-react"
// Importation du composant Link pour la navigation
import Link from "next/link"

export default function Home() {
  return (
    // Container principal centré avec hauteur plein écran
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Carte contenant le titre et les boutons */}
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        {/* Titre principal de l'application */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Mon PMS Hôtelier
        </h1>
        
        {/* Sous-titre descriptif */}
        <p className="text-gray-600 mb-8">
          Système de gestion de réservation hôtelière
        </p>
        
        {/* Bouton Réserver une chambre */}
        <Link href="/book">
          <button className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg mb-4">
            {/* Icône de calendrier */}
            <Calendar size={20} />
            {/* Texte du bouton */}
            <span>Réserver une chambre</span>
          </button>
        </Link>
        
        {/* Bouton de connexion avec icône */}
        <Link href="/login">
          <button className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
            {/* Icône de connexion */}
            <LogIn size={20} />
            {/* Texte du bouton */}
            <span>Se connecter (Staff)</span>
          </button>
        </Link>
      </div>
    </main>
  )
}
