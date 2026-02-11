import React from "react"
import type { Metadata, Viewport } from 'next'
import { Fredoka, Geist } from 'next/font/google'

import './globals.css'

const _fredoka = Fredoka({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })
const _geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Feliz Cumple Azul!',
  description: 'Una pagina de cumple especial para Azul',
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
