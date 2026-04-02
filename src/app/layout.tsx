import type { Metadata } from 'next'
import { Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeProvider'
import { SessionProvider } from '@/lib/SessionProvider'

export const metadata: Metadata = {
  title: 'iBudget — Student Financial Literacy',
  description: 'Smart financial tools for students',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
