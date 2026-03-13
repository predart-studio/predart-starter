import type { Metadata } from 'next'
// PREDART:FONT_START
import { Inter } from 'next/font/google'
const fontSans = Inter({ variable: '--font-sans', subsets: ['latin'] })
// PREDART:FONT_END
import { Geist_Mono } from 'next/font/google'
import { LenisProvider } from '@/components/animations/lenis-provider'
import './globals.css'

const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

// PREDART:META_START
export const metadata: Metadata = {
  title: 'Predart Starter',
  description: 'Predart Studio',
}
// PREDART:META_END

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
