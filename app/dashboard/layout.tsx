"use client"

// Importation des icônes Lucide React pour la navigation
import { LayoutDashboard, Bed, Calendar, Settings, LogOut } from "lucide-react"
// Importation des hooks Next.js pour la navigation
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Hook pour récupérer le chemin actuel et mettre en surbrillance le lien actif
  const pathname = usePathname()

  // Configuration des liens de navigation avec leurs icônes
  const navLinks = [
    {
      href: "/dashboard",
      label: "Vue d'ensemble",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/rooms",
      label: "Chambres",
      icon: Bed,
    },
    {
      href: "/dashboard/calendar",
      label: "Planning",
      icon: Calendar,
    },
    {
      href: "/dashboard/settings",
      label: "Paramètres",
      icon: Settings,
    },
  ]

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    // TODO: Implémenter la déconnexion avec Supabase
    console.log("Déconnexion...")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar latérale gauche */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* En-tête de la sidebar avec le nom de l'application */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">
            Mon PMS Hôtelier
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion hôtelière
          </p>
        </div>

        {/* Navigation principale */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {navLinks.map((link) => {
              // Détermine si le lien est actif
              const isActive = pathname === link.href
              const Icon = link.icon

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {/* Icône du lien */}
                    <Icon size={20} />
                    {/* Libellé du lien */}
                    <span>{link.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bouton de déconnexion en bas de la sidebar */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            {/* Icône de déconnexion */}
            <LogOut size={20} />
            {/* Texte du bouton */}
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Zone de contenu principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Container avec padding pour le contenu */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

