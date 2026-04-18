import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale } from '@/lib/i18n/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const locale = body?.locale

    if (!isSupportedLocale(locale)) {
      return NextResponse.json({ error: 'Unsupported locale' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { preferredLocale: locale },
      })
    }

    const response = NextResponse.json({ ok: true, locale: locale || DEFAULT_LOCALE })
    response.cookies.set(LOCALE_COOKIE, locale || DEFAULT_LOCALE, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  } catch (error) {
    console.error('Failed to update locale preference', error)
    return NextResponse.json({ error: 'Failed to update locale preference' }, { status: 500 })
  }
}
