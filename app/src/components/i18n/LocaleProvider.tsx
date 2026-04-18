'use client'

import { createContext, useContext } from 'react'
import type { AppLocale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/messages'

type LocaleContextValue = {
  locale: AppLocale
  messages: Messages
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: AppLocale
  messages: Messages
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return value
}
