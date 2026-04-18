'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useLocale } from '@/components/i18n/LocaleProvider'
import { withLocalePrefix } from '@/lib/i18n/paths'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { locale, messages } = useLocale()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // In production, this would send a reset email via an API route
    // For MVP, password resets are handled by admin
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#61ce70' }}>
            <GraduationCap className="w-6 h-6" style={{ color: '#001b00' }} />
          </div>
          <div>
            <div className="font-audiowide font-bold text-white text-lg leading-none">PestSense</div>
            <div className="text-xs font-jakarta mt-0.5" style={{ color: '#61ce70' }}>Academy</div>
          </div>
        </div>

        {submitted ? (
          <div>
            <div className="rounded-lg px-4 py-4 mb-6 font-jakarta" style={{ backgroundColor: '#002400', border: '1px solid #61ce70', color: '#61ce70' }}>
              <div className="font-semibold mb-1">{messages.auth.requestReceived}</div>
              <p className="text-sm opacity-80">
                {messages.auth.requestReceivedCopy.replace('{email}', email)}
              </p>
            </div>
            <Link href={withLocalePrefix(locale, '/login')} className="flex items-center gap-2 text-sm font-jakarta" style={{ color: '#61ce70' }}>
              <ArrowLeft className="w-4 h-4" /> {messages.auth.backToSignIn}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-geologica font-black text-2xl text-white mb-2">{messages.auth.resetPassword}</h2>
              <p className="text-gray-500 text-sm font-jakarta">
                {messages.auth.resetCopy}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 font-jakarta">
                  {messages.auth.emailAddress}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none transition font-jakarta"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-jakarta font-semibold text-sm transition-all disabled:opacity-60"
                style={{ backgroundColor: '#61ce70', color: '#001b00' }}
              >
                {loading ? messages.auth.sending : messages.auth.sendReset}
              </button>
            </form>

            <div className="mt-6">
              <Link href={withLocalePrefix(locale, '/login')} className="flex items-center gap-2 text-sm font-jakarta" style={{ color: '#61ce70' }}>
                <ArrowLeft className="w-4 h-4" /> {messages.auth.backToSignIn}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
