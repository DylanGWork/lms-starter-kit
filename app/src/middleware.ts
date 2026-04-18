import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, isSupportedLocale } from '@/lib/i18n/config'
import { detectLocaleFromPath, stripLocaleFromPath, withLocalePrefix } from '@/lib/i18n/paths'

const PUBLIC_FILE = /\.[^/]+$/
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  return isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE
}

function shouldSkip(pathname: string) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/course-guides') ||
    pathname.startsWith('/qa-review') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  const pathnameLocale = detectLocaleFromPath(pathname)

  if (pathnameLocale) {
    const headers = new Headers(request.headers)
    headers.set(LOCALE_HEADER, pathnameLocale)

    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = stripLocaleFromPath(pathname)

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers },
    })

    response.cookies.set(LOCALE_COOKIE, pathnameLocale, {
      path: '/',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    })

    return response
  }

  const preferredLocale = getPreferredLocale(request)
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = withLocalePrefix(preferredLocale, pathname)

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set(LOCALE_COOKIE, preferredLocale, {
    path: '/',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  })

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
