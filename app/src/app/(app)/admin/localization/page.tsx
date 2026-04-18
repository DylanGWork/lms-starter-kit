import Link from 'next/link'
import { Layers3, Languages, Clapperboard, ImageIcon, ShieldCheck, ShieldAlert } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import type { Locale } from '@prisma/client'
import { gateStatusClasses, getLatestLocalizationGateReport } from '@/lib/localization-qa'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Localization Queue' }

const LOCALES: Locale[] = ['fr', 'es', 'de']

export default async function LocalizationQueuePage() {
  const latestGate = getLatestLocalizationGateReport()
  const [
    categoryDrafts,
    categoryPublished,
    courseDrafts,
    coursePublished,
    lessonDrafts,
    lessonPublished,
    localizedAssetsDraft,
    localizedAssetsPublished,
    recentLessonLocales,
    recentAssetLocales,
  ] = await Promise.all([
    prisma.categoryLocale.count({ where: { status: 'DRAFT', locale: { in: LOCALES } } }),
    prisma.categoryLocale.count({ where: { status: 'PUBLISHED', locale: { in: LOCALES } } }),
    prisma.courseLocale.count({ where: { status: 'DRAFT', locale: { in: LOCALES } } }),
    prisma.courseLocale.count({ where: { status: 'PUBLISHED', locale: { in: LOCALES } } }),
    prisma.lessonLocale.count({ where: { status: 'DRAFT', locale: { in: LOCALES } } }),
    prisma.lessonLocale.count({ where: { status: 'PUBLISHED', locale: { in: LOCALES } } }),
    prisma.asset.count({ where: { status: 'DRAFT', locale: { in: LOCALES } } }),
    prisma.asset.count({ where: { status: 'PUBLISHED', locale: { in: LOCALES } } }),
    prisma.lessonLocale.findMany({
      where: { locale: { in: LOCALES } },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    }),
    prisma.asset.findMany({
      where: { locale: { in: LOCALES } },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: {
        sourceAsset: true,
      },
    }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-emerald-700">
          <Languages className="w-3.5 h-3.5" />
          Learner-facing rollout only
        </div>
        <h1 className="mt-4 font-geologica font-black text-3xl text-gray-900">Localization Queue</h1>
        <p className="mt-2 max-w-3xl text-sm font-jakarta leading-6 text-gray-600">
          English remains the canonical source. French, Spanish, and German stay as separate draft or published variants so we can review translated text, screenshots, subtitles, and dubbed media without risking the live English experience.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Layers3}
          title="Category + course translations"
          draft={categoryDrafts + courseDrafts}
          published={categoryPublished + coursePublished}
          note="Names, descriptions, and learner-facing catalogue copy."
        />
        <StatCard
          icon={Languages}
          title="Lesson translations"
          draft={lessonDrafts}
          published={lessonPublished}
          note="Titles, summaries, body HTML, transcripts, and localized video metadata."
        />
        <StatCard
          icon={Clapperboard}
          title="Localized media variants"
          draft={localizedAssetsDraft}
          published={localizedAssetsPublished}
          note="Translated screenshots, subtitle tracks, dubbed videos, and audio derivatives."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-gray-700">
            <Languages className="w-4 h-4 text-emerald-700" />
            Recent lesson translation activity
          </div>

          {recentLessonLocales.length === 0 ? (
            <p className="mt-4 text-sm font-jakarta text-gray-500">Nothing in the queue yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentLessonLocales.map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-jakarta uppercase tracking-[0.16em] text-gray-400">
                        {item.locale.toUpperCase()} · {item.status}
                      </div>
                      <div className="mt-1 font-jakarta font-semibold text-gray-900">{item.title}</div>
                      <div className="mt-1 text-sm font-jakarta text-gray-500">
                        {item.lesson.module.course.title} / {item.lesson.title}
                      </div>
                    </div>
                    <Link
                      href={`/admin/content/lessons/${item.lessonId}`}
                      className="text-sm font-jakarta font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Open source
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-gray-700">
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            Recent localized assets
          </div>

          {recentAssetLocales.length === 0 ? (
            <p className="mt-4 text-sm font-jakarta text-gray-500">Nothing in the queue yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentAssetLocales.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="text-xs font-jakarta uppercase tracking-[0.16em] text-gray-400">
                    {asset.locale?.toUpperCase()} · {asset.variantKind} · {asset.status}
                  </div>
                  <div className="mt-1 font-jakarta font-semibold text-gray-900">
                    {asset.title || asset.originalName}
                  </div>
                  <div className="mt-1 text-sm font-jakarta text-gray-500">
                    Source: {asset.sourceAsset?.title || asset.sourceAsset?.originalName || 'Standalone localized asset'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-gray-700">
              {latestGate?.report.gate.status === 'red' ? (
                <ShieldAlert className="w-4 h-4 text-red-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              )}
              Latest localization QA gate
            </div>
            <p className="mt-2 max-w-3xl text-sm font-jakarta leading-6 text-gray-600">
              This is the publish-readiness check for translated lesson text, localized screenshots, subtitle and dub asset wiring, and browser-level dogfooding when available.
            </p>
          </div>

          {latestGate ? (
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] ${gateStatusClasses(latestGate.report.gate.status)}`}>
              {latestGate.report.gate.status}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-gray-500">
              No gate report yet
            </div>
          )}
        </div>

        {latestGate ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MiniStat
                label="Content issues"
                value={latestGate.report.content.summary.issues}
                note={`${latestGate.report.content.summary.missing_locale_rows} missing locale rows`}
              />
              <MiniStat
                label="Asset issues"
                value={latestGate.report.assets.summary.issues}
                note={`${latestGate.report.assets.summary.assets_checked} assets checked`}
              />
              <MiniStat
                label="Browser issues"
                value={latestGate.report.browser.summary.issues ?? 0}
                note={
                  latestGate.report.browser.summary.status === 'skipped'
                    ? 'Browser crawl skipped'
                    : `${latestGate.report.browser.summary.screenshots ?? 0} failure screenshots`
                }
              />
              <MiniStat
                label="Gate scope"
                value={latestGate.report.scope}
                note={new Date(latestGate.report.ran_at).toLocaleString()}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-jakarta font-semibold text-gray-800">Current release blockers</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <StatusList title="Critical" items={latestGate.report.gate.critical} tone="red" />
                <StatusList title="Warnings" items={latestGate.report.gate.warnings} tone="amber" />
              </div>
              <div className="mt-4 space-y-2 text-xs font-mono text-gray-500">
                <div>Gate report: {latestGate.path}</div>
                <div>Content audit: {latestGate.report.content_report}</div>
                <div>Asset audit: {latestGate.report.asset_report}</div>
                <div>Browser crawl: {latestGate.report.browser_report}</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm font-jakarta text-gray-500">
            Run the localization QA gate to see release readiness, asset health, and browser dogfood results here.
          </p>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  draft,
  published,
  note,
}: {
  icon: typeof Languages
  title: string
  draft: number
  published: number
  note: string
}) {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 font-geologica text-xl font-bold text-gray-900">{title}</div>
      <div className="mt-2 flex items-center gap-3 text-sm font-jakarta">
        <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">Draft {draft}</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">Published {published}</span>
      </div>
      <p className="mt-3 text-sm font-jakarta leading-6 text-gray-500">{note}</p>
    </div>
  )
}

function MiniStat({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-jakarta uppercase tracking-[0.16em] text-gray-400">{label}</div>
      <div className="mt-2 font-geologica text-2xl font-black text-gray-900">{value}</div>
      <div className="mt-1 text-sm font-jakarta text-gray-500">{note}</div>
    </div>
  )
}

function StatusList({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'red' | 'amber'
}) {
  const classes =
    tone === 'red'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <div className="text-sm font-jakarta font-semibold">{title}</div>
      <div className="mt-2 space-y-2 text-sm font-jakarta">
        {items.length > 0 ? items.map((item) => <div key={item}>{item}</div>) : <div>None</div>}
      </div>
    </div>
  )
}
