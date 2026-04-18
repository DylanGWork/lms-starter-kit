'use client'

import Link from 'next/link'
import { Menu, GraduationCap } from 'lucide-react'
import { useSidebar } from './SidebarContext'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useLocale } from '@/components/i18n/LocaleProvider'
import { withLocalePrefix } from '@/lib/i18n/paths'

export function MobileHeader() {
  const { toggle } = useSidebar()
  const { locale, messages } = useLocale()

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-200 shrink-0">
      <button
        onClick={toggle}
        aria-label="Open menu"
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <Link href={withLocalePrefix(locale, '/dashboard')} className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#002400' }}
        >
          <GraduationCap className="w-4 h-4" style={{ color: '#61ce70' }} />
        </div>
        <span className="font-audiowide font-bold text-sm" style={{ color: '#0d0d0d' }}>
          PestSense
        </span>
        <span className="text-xs font-jakarta text-gray-400">{messages.nav.academy}</span>
      </Link>
      <LanguageSwitcher compact className="px-2.5 py-1.5" />
    </header>
  )
}
