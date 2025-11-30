import './globals.css'
import type { Metadata } from 'next'
import ChatbotButton from '@/components/chatbot/ChatbotButton'

export const metadata: Metadata = {
  title: 'Cari gambar edukatif buatan AI, khusus untuk Desa Tigaraksa',
  description: 'Tuliskan yang kamu bayangkan, dan lihat gambarnya muncul.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        {children}
        <ChatbotButton />
      </body>
    </html>
  )
}
