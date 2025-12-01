'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'

export default function Home() {
  const [showDevInfo, setShowDevInfo] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-umn-blue to-blue-900 pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-umn-yellow/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 relative z-10 text-center pt-8">
          {/* Beta Badge & Info Button - Centered Above Title */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-bold tracking-wide">BETA v1.0</span>
            </div>

            <button
              onClick={() => setShowDevInfo(true)}
              className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all text-white/80 hover:text-white"
              title="Info Pengembang"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-sm mb-4">
            <span className="text-white">Tigaraksa</span> <span className="text-umn-yellow">Image Search</span>
          </h1>
          <p className="text-blue-100 text-lg font-medium max-w-2xl mx-auto">
            Temukan gambar yang kamu butuhkan dengan teknologi AI canggih
          </p>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="relative -mt-16 z-20">
        <svg className="w-full h-16 md:h-24 text-white" fill="white" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 -mt-8 relative z-30 pb-20">
        {/* Logos Section - Moved to white area */}
        <div className="flex justify-center items-center gap-8 mb-10 animate-fade-in-up">
          <div className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <img
              src="/logo-umn.png"
              alt="Logo UMN"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <img
              src="/logo-tigaraksa.png"
              alt="Logo Tigaraksa"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-6xl mx-auto">
          <SearchForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Universitas Multimedia Nusantara. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Developer Info Modal */}
      {showDevInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDevInfo(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
            <button
              onClick={() => setShowDevInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Info Pengembang</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  Aplikasi ini dikembangkan sebagai bagian dari Skripsi di Universitas Multimedia Nusantara.
                </p>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dibuat Oleh</p>
                    <p className="font-bold text-umn-blue text-lg">Nicholas Prawira</p>
                    <p className="text-sm text-gray-500">Mahasiswa Sistem Informasi</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">Dibimbing Oleh</p>
                    <p className="font-bold text-umn-blue">Ahmad Faza, S.Kom., M.T.I.</p>
                    <p className="text-sm text-blue-600">Dosen Pembimbing</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 pt-2">
                  Versi 1.0.0 (Beta)
                </p>
              </div>
              <button
                onClick={() => setShowDevInfo(false)}
                className="mt-6 w-full py-3 bg-umn-blue text-white rounded-xl font-medium hover:bg-blue-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}