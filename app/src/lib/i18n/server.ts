import { cookies, headers } from 'next/headers'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  LOCALE_INTL_MAP,
  isSupportedLocale,
  type AppLocale,
} from './config'
import { getMessages } from './messages'
import { SUPPORTED_LOCALES } from './config'
export { detectLocaleFromPath, stripLocaleFromPath, switchLocaleInPath, withLocalePrefix } from './paths'

export function getRequestLocale(): AppLocale {
  const headerLocale = headers().get(LOCALE_HEADER)
  if (isSupportedLocale(headerLocale)) return headerLocale

  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value
  if (isSupportedLocale(cookieLocale)) return cookieLocale

  return DEFAULT_LOCALE
}

export function getIntlLocale(locale: AppLocale): string {
  return LOCALE_INTL_MAP[locale]
}

export function getLocaleOptions() {
  return SUPPORTED_LOCALES.map((locale) => ({ value: locale, label: locale }))
}

export function getLocaleMessages(locale: AppLocale) {
  return getMessages(locale)
}
