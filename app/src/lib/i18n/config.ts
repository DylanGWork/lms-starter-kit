export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'
export const LOCALE_COOKIE = 'pestsense_locale'
export const LOCALE_HEADER = 'x-pestsense-locale'

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
}

export const LOCALE_NATIVE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
}

export const LOCALE_INTL_MAP: Record<AppLocale, string> = {
  en: 'en-AU',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
}

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as AppLocale))
}

export function getLocaleLabel(locale: AppLocale) {
  return LOCALE_LABELS[locale]
}
