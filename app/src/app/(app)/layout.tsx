import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const locale = getRequestLocale()
  if (!session) redirect(withLocalePrefix(locale, '/login'))

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <MobileHeader />
          <div className="hidden lg:flex items-center justify-end gap-3 px-6 py-4 border-b border-gray-200 bg-white">
            <LanguageSwitcher />
          </div>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
