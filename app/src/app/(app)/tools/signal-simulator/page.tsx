import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignalSimulator } from './SignalSimulator'
import { getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Signal Simulator — PestSense Academy' }

export default async function SignalSimulatorPage() {
  const session = await getServerSession(authOptions)
  const locale = getRequestLocale()
  if (!session) redirect(withLocalePrefix(locale, '/login'))
  const messages = getLocaleMessages(locale)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <h1 className="font-geologica font-black text-xl text-gray-900">{messages.simulator.title}</h1>
        <p className="text-sm text-gray-500 font-jakarta mt-0.5">
          {messages.simulator.copy}
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <SignalSimulator />
      </div>
    </div>
  )
}
