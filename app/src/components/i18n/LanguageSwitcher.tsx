'use client'

import { useTransition } from 'react'
import { Globe2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LOCALE_NATIVE_LABELS, SUPPORTED_LOCALES, type AppLocale } from '@/lib/i18n/config'
import { switchLocaleInPath } from '@/lib/i18n/paths'
import { useLocale } from './LocaleProvider'

export function LanguageSwitcher({
  compact = false,
  className = '',
}: {
  compact?: boolean
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, messages } = useLocale()
  const [isPending, startTransition] = useTransition()

  async function handleChange(nextLocale: AppLocale) {
    const nextPath = switchLocaleInPath(pathname || '/', nextLocale)
    const search = searchParams?.toString()
    const href = search ? `${nextPath}?${search}` : nextPath

    startTransition(() => {
      fetch('/api/preferences/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: nextLocale }),
      }).catch(() => {})

      router.push(href)
      router.refresh()
    })
  }

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-jakarta text-gray-600 shadow-sm ${className}`}
    >
      <Globe2 className="h-4 w-4 text-gray-400" />
      {!compact && <span className="hidden xl:inline">{messages.language.label}</span>}
      <select
        aria-label={messages.language.helper}
        value={locale}
        onChange={(event) => handleChange(event.target.value as AppLocale)}
        disabled={isPending}
        className="bg-transparent pr-5 text-sm font-medium text-gray-700 focus:outline-none disabled:opacity-60"
      >
        {SUPPORTED_LOCALES.map((option) => (
          <option key={option} value={option}>
            {LOCALE_NATIVE_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  )
}
