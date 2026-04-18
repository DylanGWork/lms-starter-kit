import type { ContentStatus } from '@prisma/client'
import type { AppLocale } from './config'

type LocaleRecord = {
  locale: AppLocale
  status: ContentStatus
}

function pickLocaleRecord<T extends LocaleRecord>(records: T[] | undefined, locale: AppLocale) {
  if (!records?.length) return null
  return records.find((record) => record.locale === locale && record.status === 'PUBLISHED') || null
}

export function resolveCategory<T extends { name: string; description?: string | null; locales?: Array<LocaleRecord & { name: string; description?: string | null }> }>(
  category: T,
  locale: AppLocale
) {
  const localized = pickLocaleRecord(category.locales, locale)
  return {
    ...category,
    name: localized?.name || category.name,
    description: localized?.description ?? category.description ?? null,
  }
}

export function resolveCourse<T extends { title: string; description?: string | null; thumbnailUrl?: string | null; locales?: Array<LocaleRecord & { title: string; description?: string | null; thumbnailUrl?: string | null }> }>(
  course: T,
  locale: AppLocale
) {
  const localized = pickLocaleRecord(course.locales, locale)
  return {
    ...course,
    title: localized?.title || course.title,
    description: localized?.description ?? course.description ?? null,
    thumbnailUrl: localized?.thumbnailUrl ?? course.thumbnailUrl ?? null,
  }
}

export function resolveModule<T extends { title: string; description?: string | null; locales?: Array<LocaleRecord & { title: string; description?: string | null }> }>(
  module: T,
  locale: AppLocale
) {
  const localized = pickLocaleRecord(module.locales, locale)
  return {
    ...module,
    title: localized?.title || module.title,
    description: localized?.description ?? module.description ?? null,
  }
}

export function replaceInlineAssetUrls(
  content: string | null | undefined,
  replacements: Map<string, string>
) {
  if (!content || replacements.size === 0) return content ?? null

  let resolved = content
  replacements.forEach((targetUrl, sourceUrl) => {
    resolved = resolved.split(sourceUrl).join(targetUrl)
  })

  return resolved
}

export function resolveLesson<
  T extends {
    title: string
    summary?: string | null
    content?: string | null
    transcript?: string | null
    videoUrl?: string | null
    videoProvider?: string | null
    locales?: Array<
      LocaleRecord & {
        title: string
        summary?: string | null
        content?: string | null
        transcript?: string | null
        videoUrl?: string | null
        videoProvider?: string | null
        subtitleUrl?: string | null
        posterUrl?: string | null
      }
    >
  }
>(lesson: T, locale: AppLocale, replacements?: Map<string, string>) {
  const localized = pickLocaleRecord(lesson.locales, locale)
  const resolvedContent = replaceInlineAssetUrls(localized?.content ?? lesson.content ?? null, replacements ?? new Map())

  return {
    ...lesson,
    title: localized?.title || lesson.title,
    summary: localized?.summary ?? lesson.summary ?? null,
    content: resolvedContent,
    transcript: localized?.transcript ?? lesson.transcript ?? null,
    videoUrl: localized?.videoUrl ?? lesson.videoUrl ?? null,
    videoProvider: localized?.videoProvider ?? lesson.videoProvider ?? null,
    subtitleUrl: localized?.subtitleUrl ?? null,
    posterUrl: localized?.posterUrl ?? null,
  }
}

type AssetLike = {
  url: string
  locale?: AppLocale | null
  status: ContentStatus
  variants?: AssetLike[]
}

export function resolveAssetVariant<T extends AssetLike>(asset: T, locale: AppLocale): T {
  if (locale === 'en' || !asset.variants?.length) return asset
  return (
    asset.variants.find((variant) => variant.locale === locale && variant.status === 'PUBLISHED') as T | undefined
  ) || asset
}
