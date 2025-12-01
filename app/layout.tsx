import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mon PMS Hôtelier",
  description: "Système de gestion de réservation hôtelière",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

