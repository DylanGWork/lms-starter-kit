'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import {
  GraduationCap, LayoutDashboard, BookOpen, Search, Users,
  FolderOpen, Upload, LogOut, Shield, X,
  Monitor, Cpu, Wifi, TrendingUp, Calculator, FileText, BarChart2, ClipboardList, Radio, ClipboardCheck, Bug, LifeBuoy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, ROLE_COLORS } from '@/types'
import { useSidebar } from './SidebarContext'
import type { Role } from '@/types'
import { useLocale } from '@/components/i18n/LocaleProvider'
import { stripLocaleFromPath, withLocalePrefix } from '@/lib/i18n/paths'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  software: <Monitor className="w-4 h-4" />,
  hardware: <Cpu className="w-4 h-4" />,
  network: <Wifi className="w-4 h-4" />,
  sales: <TrendingUp className="w-4 h-4" />,
}

const LEARNER_NAV = [
  { href: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/learn', labelKey: 'browseCourses', icon: <BookOpen className="w-4 h-4" /> },
  { href: '/search', labelKey: 'search', icon: <Search className="w-4 h-4" /> },
] as const

const TOOLS_NAV = [
  { href: '/tools/signal-simulator', labelKey: 'signalSimulator', icon: <Radio className="w-4 h-4" /> },
] as const

const SALES_NAV = [
  { href: '/sales', label: 'Sales Hub', icon: <TrendingUp className="w-4 h-4" /> },
  { href: '/sales/calculators/customer-fit', label: 'Customer Fit', icon: <ClipboardList className="w-4 h-4" /> },
  { href: '/sales/calculators/business-model', label: 'A/B Calculator', icon: <BarChart2 className="w-4 h-4" /> },
  { href: '/sales/calculators/risk-impact', label: 'Risk Impact', icon: <Calculator className="w-4 h-4" /> },
  { href: '/sales/calculators/proposal', label: 'Proposal Generator', icon: <FileText className="w-4 h-4" /> },
  { href: '/sales/templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
]

const MANAGER_NAV = [
  { href: '/manager', labelKey: 'teamCompliance', icon: <ClipboardCheck className="w-4 h-4" /> },
  { href: '/manager/help', labelKey: 'teamHelp', icon: <LifeBuoy className="w-4 h-4" /> },
] as const

const ADMIN_NAV = [
  { href: '/admin', labelKey: 'adminOverview', icon: <Shield className="w-4 h-4" /> },
  { href: '/admin/qa', labelKey: 'qaReview', icon: <Bug className="w-4 h-4" /> },
  { href: '/admin/users', labelKey: 'users', icon: <Users className="w-4 h-4" /> },
  { href: '/admin/content', labelKey: 'content', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/admin/assets', labelKey: 'assetLibrary', icon: <Upload className="w-4 h-4" /> },
  { href: '/admin/localization', labelKey: 'localization', icon: <FileText className="w-4 h-4" /> },
  { href: '/admin/requirements', labelKey: 'requiredTraining', icon: <ClipboardCheck className="w-4 h-4" /> },
  { href: '/admin/analytics', labelKey: 'analytics', icon: <BarChart2 className="w-4 h-4" /> },
] as const

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']
const MANAGER_VISIBLE_ROLES: Role[] = ['SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role as Role | undefined
  const { locale, messages } = useLocale()
  const isAdmin = role && ADMIN_ROLES.includes(role)
  const isManager = role && MANAGER_VISIBLE_ROLES.includes(role)
  const { isOpen, close } = useSidebar()
  const normalizedPath = stripLocaleFromPath(pathname || '/')

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside className={cn(
        'flex flex-col h-full w-60 border-r border-gray-200 bg-white shrink-0',
        // Mobile: fixed drawer sliding in from left
        'lg:static lg:translate-x-0 lg:z-auto',
        'fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <Link href={withLocalePrefix(locale, '/dashboard')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#002400' }}>
            <GraduationCap className="w-5 h-5" style={{ color: '#61ce70' }} />
          </div>
          <div>
            <div className="font-audiowide font-bold text-sm leading-none" style={{ color: '#0d0d0d' }}>PestSense</div>
            <div className="text-xs font-jakarta mt-0.5 text-gray-500">{messages.nav.academy}</div>
          </div>
        </Link>
        <button
          onClick={close}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">
          {messages.nav.learning}
        </div>
        {LEARNER_NAV.map(item => (
          <Link
            key={item.href}
            href={withLocalePrefix(locale, item.href)}
            className={cn(
              'sidebar-item',
              normalizedPath === item.href && 'active'
            )}
          >
            {item.icon}
            {messages.nav[item.labelKey]}
          </Link>
        ))}

        <div className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-4">
          {messages.nav.tools}
        </div>
        {TOOLS_NAV.map(item => (
          <Link
            key={item.href}
            href={withLocalePrefix(locale, item.href)}
            className={cn(
              'sidebar-item',
              (normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')) && 'active'
            )}
          >
            {item.icon}
            {messages.nav[item.labelKey]}
          </Link>
        ))}

        {isManager && (
          <>
            <div className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-4">
              {messages.nav.management}
            </div>
            {MANAGER_NAV.map(item => (
              <Link
                key={item.href}
                href={withLocalePrefix(locale, item.href)}
                className={cn(
                  'sidebar-item',
                  (normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')) && 'active'
                )}
              >
                {item.icon}
                {messages.nav[item.labelKey]}
              </Link>
            ))}
          </>
        )}

        {isAdmin && (
          <>
            <div className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-4">
              {messages.nav.salesTools}
            </div>
            {SALES_NAV.map(item => (
              <Link
                key={item.href}
                href={withLocalePrefix(locale, item.href)}
                className={cn(
                  'sidebar-item',
                  (normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')) && 'active'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <div className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wider px-3 py-1 mt-4">
              {messages.nav.administration}
            </div>
            {ADMIN_NAV.map(item => (
              <Link
                key={item.href}
                href={withLocalePrefix(locale, item.href)}
                className={cn(
                  'sidebar-item',
                  (normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')) && 'active'
                )}
              >
                {item.icon}
                {messages.nav[item.labelKey]}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      {session?.user && (
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg mb-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-jakarta flex-shrink-0"
              style={{ backgroundColor: '#002400', color: '#61ce70' }}>
              {session.user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-jakarta font-medium text-gray-900 truncate">{session.user.name}</div>
              <span className={cn('badge text-xs', role && ROLE_COLORS[role])}>
                {role && ROLE_LABELS[role]}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: withLocalePrefix(locale, '/login') })}
            className="sidebar-item w-full text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
          >
            <LogOut className="w-4 h-4" />
            {messages.nav.signOut}
          </button>
        </div>
      )}
    </aside>
    </>
  )
}
