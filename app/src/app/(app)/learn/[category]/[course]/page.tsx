import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import type { Role } from '@/types'
import { getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'
import { resolveCategory, resolveCourse, resolveLesson, resolveModule } from '@/lib/i18n/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { course: string } }) {
  const course = await prisma.course.findUnique({ where: { slug: params.course } })
  return { title: course?.title || 'Course' }
}

export default async function CoursePage({ params }: { params: { category: string; course: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)
  const role = session.user.role as Role

  const course = await prisma.course.findFirst({
    where: {
      slug: params.course,
      status: 'PUBLISHED',
      roleVisibility: { some: { role } },
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
      modules: {
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
        include: {
          locales: {
            where: { locale, status: 'PUBLISHED' },
          },
          lessons: {
            where: { status: 'PUBLISHED' },
            orderBy: { sortOrder: 'asc' },
            include: {
              locales: {
                where: { locale, status: 'PUBLISHED' },
              },
            },
          },
        },
      },
    },
  })

  if (!course) notFound()
  const localizedCategory = resolveCategory(course.category, locale)
  const localizedCourse = {
    ...resolveCourse(course, locale),
    category: localizedCategory,
    modules: course.modules.map((module) => ({
      ...resolveModule(module, locale),
      lessons: module.lessons.map((lesson) => resolveLesson(lesson, locale)),
    })),
  }

  // Get user progress for this course's lessons
  const allLessonIds = localizedCourse.modules.flatMap(m => m.lessons.map(l => l.id))
  const progressRecords = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, lessonId: { in: allLessonIds } },
  })
  const completedIds = new Set(progressRecords.filter(p => p.completed).map(p => p.lessonId))
  const completionPct = allLessonIds.length > 0
    ? Math.round((completedIds.size / allLessonIds.length) * 100)
    : 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href={withLocalePrefix(locale, '/learn')} className="hover:text-gray-600">{messages.learn.coursesCrumb}</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={withLocalePrefix(locale, `/learn/${params.category}`)} className="hover:text-gray-600">{localizedCategory.name}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">{localizedCourse.title}</span>
      </nav>

      {/* Course header */}
      <div className="card p-6 mb-6" style={{ borderLeft: `4px solid ${localizedCategory.color || '#61ce70'}` }}>
        <div className="text-xs font-jakarta text-gray-400 mb-1">{localizedCategory.name}</div>
        <h1 className="font-geologica font-black text-2xl text-gray-900 mb-2">{localizedCourse.title}</h1>
        {localizedCourse.description && (
          <p className="text-gray-600 font-jakarta mb-4">{localizedCourse.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-500 font-jakarta mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {allLessonIds.length} {allLessonIds.length !== 1 ? messages.learn.lessons : messages.learn.lesson}
          </span>
          {localizedCourse.estimatedMins && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{localizedCourse.estimatedMins} {messages.learn.minutesLong}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {allLessonIds.length > 0 && (
          <div>
            <div className="flex justify-between text-xs font-jakarta text-gray-500 mb-1">
              <span>{completedIds.size} / {allLessonIds.length} {messages.learn.completedOf}</span>
              <span>{completionPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${completionPct}%`, backgroundColor: '#61ce70' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modules and lessons */}
      <div className="space-y-4">
        {localizedCourse.modules.map((module, moduleIdx) => (
          <div key={module.id} className="card overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="text-xs text-gray-400 font-jakarta mb-0.5">{messages.learn.module} {moduleIdx + 1}</div>
              <h2 className="font-jakarta font-semibold text-gray-900">{module.title}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {module.lessons.map((lesson, lessonIdx) => {
                const isCompleted = completedIds.has(lesson.id)
                return (
                  <Link
                    key={lesson.id}
                    href={withLocalePrefix(locale, `/lessons/${lesson.id}`)}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-jakarta font-bold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : lessonIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-jakarta font-medium truncate group-hover:text-green-700 transition-colors ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                        {lesson.title}
                      </div>
                      {lesson.summary && (
                        <div className="text-xs text-gray-400 font-jakarta truncate mt-0.5">{lesson.summary}</div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  </Link>
                )
              })}
              {module.lessons.length === 0 && (
                <div className="px-5 py-4 text-sm text-gray-400 font-jakarta">{messages.learn.noLessons}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
