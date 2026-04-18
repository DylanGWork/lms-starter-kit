import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const locale = getRequestLocale()
  if (session) {
    redirect(withLocalePrefix(locale, '/dashboard'))
  } else {
    redirect(withLocalePrefix(locale, '/login'))
  }
}
