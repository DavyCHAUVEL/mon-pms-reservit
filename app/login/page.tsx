"use client"

// Importation des hooks React
import { useState, FormEvent } from "react"
// Importation du routeur Next.js pour la navigation
import { useRouter } from "next/navigation"
// Importation du composant Link pour la navigation
import Link from "next/link"
// Importation des icônes Lucide
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react"
// Importation du client Supabase
import { supabase } from "@/utils/supabase/client"

export default function LoginPage() {
  // Hook de navigation pour redirection
  const router = useRouter()
  
  // State pour l'email
  const [email, setEmail] = useState("")
  // State pour le mot de passe
  const [password, setPassword] = useState("")
  // State pour le chargement
  const [loading, setLoading] = useState(false)
  // State pour le message d'erreur
  const [error, setError] = useState("")

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Empêcher le rechargement de la page
    e.preventDefault()
    
    // Réinitialiser le message d'erreur
    setError("")
    
    // Validation basique des champs
    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Adresse email invalide")
      return
    }

    try {
      setLoading(true)
      
      console.log("🔐 Tentative de connexion pour:", email)

      // Appel à Supabase pour l'authentification
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      // Gestion des erreurs d'authentification
      if (signInError) {
        console.error("❌ Erreur de connexion:", signInError)
        
        // Messages d'erreur personnalisés selon le type d'erreur
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou mot de passe incorrect")
        } else if (signInError.message.includes("Email not confirmed")) {
          setError("Veuillez confirmer votre email avant de vous connecter")
        } else {
          setError(signInError.message || "Erreur lors de la connexion")
        }
        return
      }

      // Vérifier que l'utilisateur est bien connecté
      if (!data.user) {
        setError("Erreur lors de la connexion. Veuillez réessayer.")
        return
      }

      // Succès !
      console.log("✅ Connexion réussie pour:", data.user.email)
      
      // Redirection vers le dashboard
      router.push("/dashboard")
      
    } catch (error) {
      // Gestion des erreurs inattendues
      console.error("❌ Erreur inattendue:", error)
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Container principal */}
      <div className="w-full max-w-md">
        {/* Bouton retour discret */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Retour à l'accueil</span>
        </Link>

        {/* Card principale */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo / En-tête */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">
              Mon PMS
            </h1>
            <p className="text-gray-600">
              Connexion au tableau de bord
            </p>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                {/* Icône mail */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                {/* Input email */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  disabled={loading}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                {/* Icône cadenas */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                {/* Input password */}
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                {/* Icône d'alerte */}
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                {/* Message d'erreur */}
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  {/* Spinner de chargement */}
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  {/* Icône de connexion */}
                  <LogIn size={20} />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Liens supplémentaires */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <button
                onClick={() => alert("La création de compte n'est pas encore disponible")}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Contactez l'administrateur
              </button>
            </p>
          </div>
        </div>

        {/* Note de sécurité */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Connexion sécurisée via Supabase Auth
          </p>
        </div>
      </div>
    </div>
  )
}

