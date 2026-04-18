import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { getLocaleMessages, getRequestLocale } from '@/lib/i18n/server'

export const metadata: Metadata = {
  title: {
    default: 'PestSense Academy',
    template: '%s | PestSense Academy',
  },
  description: 'Training platform for PestSense products and software',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers locale={locale} messages={messages}>{children}</Providers>
      </body>
    </html>
  )
}
