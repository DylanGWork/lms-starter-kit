'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { useLocale } from '@/components/i18n/LocaleProvider'
import { withLocalePrefix } from '@/lib/i18n/paths'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale, messages } = useLocale()
  const callbackUrl = searchParams.get('callbackUrl') || withLocalePrefix(locale, '/dashboard')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError(messages.auth.incorrectCredentials)
      } else if (result?.ok) {
        // Fire-and-forget: log device info for analytics
        fetch('/api/analytics/login-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
          }),
        }).catch(() => {})
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError(messages.auth.genericError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="fixed top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: '#001b00' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#61ce70' }}>
            <GraduationCap className="w-6 h-6" style={{ color: '#001b00' }} />
          </div>
          <div>
            <div className="font-audiowide font-bold text-white text-lg leading-none">PestSense</div>
            <div className="text-xs font-jakarta mt-0.5" style={{ color: '#61ce70' }}>Academy</div>
          </div>
        </div>

        <div>
          <h1 className="font-geologica font-black text-4xl text-white leading-tight mb-6">
            {messages.auth.leftTitle}<br />
            <span style={{ color: '#61ce70' }}>{messages.auth.leftTitleAccent}</span>
          </h1>
          <p className="font-jakarta text-gray-400 text-lg leading-relaxed mb-8">
            {messages.auth.leftCopy}
          </p>

          <div className="space-y-4">
            {[
              { label: messages.auth.featureOneTitle, desc: messages.auth.featureOneCopy },
              { label: messages.auth.featureTwoTitle, desc: messages.auth.featureTwoCopy },
              { label: messages.auth.featureThreeTitle, desc: messages.auth.featureThreeCopy },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ backgroundColor: '#61ce70' }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#001b00" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-jakarta font-semibold text-white text-sm">{item.label}</div>
                  <div className="font-jakarta text-gray-500 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-600 font-jakarta">
          © {new Date().getFullYear()} PestSense Pty Ltd · Brisbane, Australia
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#61ce70' }}>
              <GraduationCap className="w-6 h-6" style={{ color: '#001b00' }} />
            </div>
            <div>
              <div className="font-audiowide font-bold text-white text-lg leading-none">PestSense</div>
              <div className="text-xs font-jakarta mt-0.5" style={{ color: '#61ce70' }}>Academy</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-geologica font-black text-2xl text-white mb-2">{messages.auth.signInHeading}</h2>
            <p className="text-gray-500 text-sm font-jakarta">{messages.auth.signInSubheading}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm font-jakarta" style={{ backgroundColor: '#3d0000', color: '#ff6b6b', border: '1px solid #660000' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 font-jakarta">
                {messages.auth.emailAddress}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition font-jakarta"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  // @ts-ignore
                  '--tw-ring-color': '#61ce70',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 font-jakarta">
                {messages.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 transition font-jakarta"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href={withLocalePrefix(locale, '/reset-password')} className="text-sm font-jakarta hover:underline" style={{ color: '#61ce70' }}>
                {messages.auth.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-jakarta font-semibold text-sm transition-all duration-150 disabled:opacity-60"
              style={{ backgroundColor: '#61ce70', color: '#001b00' }}
            >
              {loading ? messages.auth.signingIn : messages.auth.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-600 font-jakarta">
            {messages.auth.needAccount}
          </p>
        </div>
      </div>
    </div>
  )
}
