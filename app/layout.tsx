import type { Metadata } from 'next'
// PREDART:FONT_START
import { Inter } from 'next/font/google'
const fontSans = Inter({ variable: '--font-sans', subsets: ['latin'] })
// PREDART:FONT_END
import { Geist_Mono } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { LenisProvider } from '@/components/animations/lenis-provider'
import { SanityLive } from '@/sanity/lib/live'
import { DisableDraftMode } from '@/components/disable-draft-mode'
import { isSanityConfigured } from '@/sanity/env'
import './globals.css'
// Hand-managed semantic typography layer (.label, .kicker, .prose-measure,
// balanced headings) — loaded AFTER generated globals.css so it can lean on the
// type-scale CSS vars. See app/typography.css.
import './typography.css'

const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

// PREDART:META_START
export const metadata: Metadata = {
  title: 'Predart Starter',
  description: 'Predart Studio',
}
// PREDART:META_END

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Guarded so an unconfigured clone never reads draftMode() and stays fully
  // static — Sanity preview/live only engages once a project id is present.
  const draftEnabled = isSanityConfigured && (await draftMode()).isEnabled

  return (
    <html lang="en" className={`${fontSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <LenisProvider>{children}</LenisProvider>
        {isSanityConfigured ? <SanityLive /> : null}
        {draftEnabled ? (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        ) : null}
      </body>
    </html>
  )
}
