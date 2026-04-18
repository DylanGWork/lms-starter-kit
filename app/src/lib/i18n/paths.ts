import { isSupportedLocale, type AppLocale } from './config'

export function detectLocaleFromPath(pathname: string): AppLocale | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  return isSupportedLocale(segment) ? segment : null
}

export function stripLocaleFromPath(pathname: string): string {
  const locale = detectLocaleFromPath(pathname)
  if (!locale) return pathname || '/'
  const withoutPrefix = pathname.slice(locale.length + 1)
  if (!withoutPrefix) return '/'
  return withoutPrefix.startsWith('/') ? withoutPrefix : `/${withoutPrefix}`
}

export function withLocalePrefix(locale: AppLocale, href: string): string {
  if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#')) {
    return href
  }

  const normalized = href.startsWith('/') ? href : `/${href}`
  const stripped = stripLocaleFromPath(normalized)
  return stripped === '/' ? `/${locale}` : `/${locale}${stripped}`
}

export function switchLocaleInPath(pathname: string, locale: AppLocale): string {
  return withLocalePrefix(locale, stripLocaleFromPath(pathname))
}
