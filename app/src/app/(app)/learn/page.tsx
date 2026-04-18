import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import type { Role } from '@/types'
import { getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'
import { resolveCategory, resolveCourse } from '@/lib/i18n/content'
import type { AppLocale } from '@/lib/i18n/config'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Browse Courses' }

async function getCourses(role: Role, locale: AppLocale) {
  const categories = await prisma.category.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { sortOrder: 'asc' },
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
          _count: { select: { modules: true } },
        },
      },
    },
  })
  return categories
    .filter(c => c.courses.length > 0)
    .map((category) => ({
      ...resolveCategory(category, locale),
      courses: category.courses.map((course) => resolveCourse(course, locale)),
    }))
}

export default async function LearnPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)
  const role = session.user.role as Role
  const categories = await getCourses(role, locale)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-geologica font-black text-3xl text-gray-900 mb-2">{messages.learn.browseTitle}</h1>
        <p className="text-gray-500 font-jakarta">{messages.learn.browseCopy}</p>
      </div>

      <div className="space-y-10">
        {categories.map(category => (
          <section key={category.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg">
                {getCategoryEmoji(category.slug)}
              </div>
              <div>
                <h2 className="font-geologica font-bold text-xl text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-gray-500 font-jakarta">{category.description}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.courses.map(course => {
                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
                return (
                  <Link
                    key={course.id}
                    href={withLocalePrefix(locale, `/learn/${category.slug}/${course.slug}`)}
                    className="card p-5 hover:shadow-md transition-all group block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-xs font-jakarta text-gray-400 mb-1">{category.name}</div>
                        <h3 className="font-jakarta font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0 mt-1" />
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-500 font-jakarta mb-4 line-clamp-2">{course.description}</p>
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
          </section>
        ))}

        {categories.length === 0 && (
          <div className="card p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-jakarta font-semibold text-gray-500">{messages.learn.noCourses}</h3>
            <p className="text-sm text-gray-400 mt-1">{messages.learn.noCoursesCopy}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getCategoryEmoji(slug: string) {
  const map: Record<string, string> = {
    software: '💻',
    hardware: '🔧',
    network: '📡',
    sales: '📈',
  }
  return map[slug] || '📚'
}
