import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { SimpleThemeProvider } from '@/components/providers/SimpleThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Theyaz Gallery',
  description: 'A beautiful photo gallery built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <SimpleThemeProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                {children}
              </div>
            </SimpleThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 