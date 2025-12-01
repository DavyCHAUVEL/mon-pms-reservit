// Importation du client Supabase
import { createClient } from "@supabase/supabase-js"

// Récupération des variables d'environnement pour Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Les variables d'environnement Supabase ne sont pas configurées. " +
    "Veuillez remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
  )
}

// Création et export du client Supabase
// Ce client sera utilisé dans toute l'application pour interagir avec la base de données
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuration de la persistance de session
    persistSession: true,
    // Détection automatique de la session
    autoRefreshToken: true,
    // Stockage de la session dans le localStorage
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
})

