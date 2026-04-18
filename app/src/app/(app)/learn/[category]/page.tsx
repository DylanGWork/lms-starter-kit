import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import type { Role } from '@/types'
import { getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'
import { resolveCategory, resolveCourse } from '@/lib/i18n/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { category: string } }) {
  const cat = await prisma.category.findUnique({ where: { slug: params.category } })
  return { title: cat?.name || 'Category' }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)
  const role = session.user.role as Role

  const category = await prisma.category.findFirst({
    where: { slug: params.category, status: 'PUBLISHED' },
    include: {
      locales: {
        where: { locale, status: 'PUBLISHED' },
      },
      courses: {
        where: {
          status: 'PUBLISHED',
          roleVisibility: { some: { role } },
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          locales: {
            where: { locale, status: 'PUBLISHED' },
          },
          modules: {
            include: {
              lessons: {
                where: { status: 'PUBLISHED' },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  })

  if (!category) notFound()
  const localizedCategory = resolveCategory(category, locale)
  const localizedCourses = category.courses.map((course) => resolveCourse(course, locale))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href={withLocalePrefix(locale, '/learn')} className="hover:text-gray-600">{messages.learn.coursesCrumb}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">{localizedCategory.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{getCategoryEmoji(localizedCategory.slug)}</div>
          <h1 className="font-geologica font-black text-3xl text-gray-900">{localizedCategory.name}</h1>
        </div>
        {localizedCategory.description && (
          <p className="text-gray-500 font-jakarta">{localizedCategory.description}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {localizedCourses.map(course => {
          const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
          return (
            <Link
              key={course.id}
              href={withLocalePrefix(locale, `/learn/${localizedCategory.slug}/${course.slug}`)}
              className="card p-5 hover:shadow-md transition-all group block"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-jakarta font-semibold text-gray-900 group-hover:text-green-700 transition-colors flex-1">
                  {course.title}
                </h2>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0 mt-0.5" />
              </div>
              {course.description && (
                <p className="text-sm text-gray-500 font-jakarta mb-3 line-clamp-2">{course.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400 font-jakarta">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {totalLessons} {totalLessons !== 1 ? messages.learn.lessons : messages.learn.lesson}
                </span>
                {course.estimatedMins && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{course.estimatedMins} {messages.learn.minutesShort}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {localizedCourses.length === 0 && (
        <div className="card p-12 text-center text-gray-400 font-jakarta">
          {messages.learn.noCategoryCourses}
        </div>
      )}
    </div>
  )
}

function getCategoryEmoji(slug: string) {
  const map: Record<string, string> = { software: '💻', hardware: '🔧', network: '📡', sales: '📈' }
  return map[slug] || '📚'
}
