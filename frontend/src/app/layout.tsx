import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tigaraksa Image Search - UMN',
  description: 'Pencarian gambar cerdas berbasis AI untuk Desa Tigaraksa.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-umn-yellow/30 selection:text-umn-blue">
        {children}
      </body>
    </html>
  )
}
