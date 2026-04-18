import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Search, BookOpen, ChevronRight } from 'lucide-react'
import { stripHtml } from '@/lib/utils'
import type { Role } from '@/types'
import { getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'
import { resolveCategory, resolveCourse, resolveLesson } from '@/lib/i18n/content'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Search' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)
  const role = session.user.role as Role
  const q = searchParams.q?.trim() || ''

  let results: {
    id: string
    type: 'lesson' | 'course'
    title: string
    summary?: string | null
    courseName?: string
    categoryName?: string
    href: string
  }[] = []

  if (q.length >= 2) {
    const [lessons, courses] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            {
              locales: {
                some: {
                  locale,
                  status: 'PUBLISHED',
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { summary: { contains: q, mode: 'insensitive' } },
                    { content: { contains: q, mode: 'insensitive' } },
                  ],
                },
              },
            },
            { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
          ],
          module: {
            status: 'PUBLISHED',
            course: {
              status: 'PUBLISHED',
              roleVisibility: { some: { role } },
            },
          },
        },
        include: {
          locales: {
            where: { locale, status: 'PUBLISHED' },
          },
          module: {
            include: {
              course: {
                include: {
                  locales: {
                    where: { locale, status: 'PUBLISHED' },
                  },
                  category: {
                    include: {
                      locales: {
                        where: { locale, status: 'PUBLISHED' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        take: 20,
      }),
      prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          roleVisibility: { some: { role } },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            {
              locales: {
                some: {
                  locale,
                  status: 'PUBLISHED',
                  OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                  ],
                },
              },
            },
          ],
        },
        include: {
          locales: {
            where: { locale, status: 'PUBLISHED' },
          },
          category: {
            include: {
              locales: {
                where: { locale, status: 'PUBLISHED' },
              },
            },
          },
        },
        take: 10,
      }),
    ])

    results = [
      ...courses.map((course) => {
        const localizedCategory = resolveCategory(course.category, locale)
        const localizedCourse = resolveCourse({ ...course, category: localizedCategory }, locale)
        return {
          id: course.id,
          type: 'course' as const,
          title: localizedCourse.title,
          summary: localizedCourse.description,
          categoryName: localizedCategory.name,
          href: withLocalePrefix(locale, `/learn/${localizedCategory.slug}/${localizedCourse.slug}`),
        }
      }),
      ...lessons.map((lesson) => {
        const localizedCategory = resolveCategory(lesson.module.course.category, locale)
        const localizedCourse = resolveCourse({ ...lesson.module.course, category: localizedCategory }, locale)
        const localizedLesson = resolveLesson(lesson, locale)
        return {
          id: lesson.id,
          type: 'lesson' as const,
          title: localizedLesson.title,
          summary: localizedLesson.summary || (localizedLesson.content ? stripHtml(localizedLesson.content).slice(0, 150) : undefined),
          courseName: localizedCourse.title,
          categoryName: localizedCategory.name,
          href: withLocalePrefix(locale, `/lessons/${lesson.id}`),
        }
      }),
    ]
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-geologica font-black text-3xl text-gray-900 mb-4">{messages.search.title}</h1>
        <SearchForm initialQuery={q} action={withLocalePrefix(locale, '/search')} placeholder={messages.search.placeholder} />
      </div>

      {q.length >= 2 && (
        <div>
          <div className="text-sm text-gray-500 font-jakarta mb-4">
            {results.length === 0 ? messages.search.noResults : `${results.length} ${results.length !== 1 ? messages.search.results : messages.search.result}`} {messages.search.resultsFor} &ldquo;{q}&rdquo;
          </div>

          {results.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-jakarta font-semibold text-gray-500">{messages.search.noMatches}</h3>
              <p className="text-sm text-gray-400 mt-1">{messages.search.noResultsCopy}</p>
              <Link href={withLocalePrefix(locale, '/learn')} className="text-sm font-jakarta font-medium mt-3 inline-block hover:underline" style={{ color: '#018902' }}>
                {messages.search.browseAllCourses} →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(r => (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  className="card p-4 flex items-start gap-3 hover:shadow-md transition-shadow group block"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-50">
                    <BookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="badge bg-gray-100 text-gray-500 text-xs">
                        {r.type === 'course' ? messages.search.course : messages.search.lesson}
                      </span>
                      {r.categoryName && (
                        <span className="text-xs text-gray-400 font-jakarta">{r.categoryName}</span>
                      )}
                      {r.courseName && (
                        <span className="text-xs text-gray-400 font-jakarta">· {r.courseName}</span>
                      )}
                    </div>
                    <div className="font-jakarta font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      {r.title}
                    </div>
                    {r.summary && (
                      <div className="text-sm text-gray-500 font-jakarta mt-0.5 line-clamp-2">{r.summary}</div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="card p-8 text-center text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-jakarta text-sm">{messages.search.emptyCopy}</p>
        </div>
      )}
    </div>
  )
}

function SearchForm({ initialQuery, action, placeholder }: { initialQuery: string; action: string; placeholder: string }) {
  return (
    <form method="GET" action={action}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder={placeholder}
          autoFocus
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-jakarta focus:outline-none focus:ring-2 transition"
          style={{ '--tw-ring-color': '#61ce70' } as React.CSSProperties}
        />
      </div>
    </form>
  )
}
