'use client'

import { SessionProvider } from 'next-auth/react'
import type { AppLocale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'
import { LocaleProvider } from '@/components/i18n/LocaleProvider'

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode
  locale: AppLocale
  messages: Messages
}) {
  return (
    <SessionProvider>
      <LocaleProvider locale={locale} messages={messages}>
        {children}
      </LocaleProvider>
    </SessionProvider>
  )
}
