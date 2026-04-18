import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Video, BookOpen, Printer, Monitor, Smartphone, Tablet, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MANAGER_ROLES } from '@/types'
import type { Role } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { name: true } })
  return { title: user ? `${user.name} — Training Record` : 'Technician' }
}

export default async function TechnicianDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !MANAGER_ROLES.includes(session.user.role as Role)) redirect('/dashboard')

  const tech = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      progress: {
        include: { lesson: { include: { module: { include: { course: true } } } } },
      },
      videoProgress: {
        include: { lesson: { include: { module: { include: { course: true } } } } },
      },
      loginEvents: { orderBy: { loginAt: 'desc' }, take: 10, select: { loginAt: true, deviceType: true } },
    },
  })

  if (!tech || !['TECHNICIAN', 'SITE_MANAGER'].includes(tech.role)) notFound()

  // Required courses for this user's role
  const requirements = await prisma.courseRequirement.findMany({
    where: { role: tech.role },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                where: { status: 'PUBLISHED' },
                orderBy: { sortOrder: 'asc' },
                select: { id: true, title: true, videoUrl: true, videoProvider: true },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  // All courses the user has any progress on (for "other activity" section)
  const allCourses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      modules: {
        include: {
          lessons: {
            where: { status: 'PUBLISHED' },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, title: true, videoUrl: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  const progressByLesson = new Map(tech.progress.map(p => [p.lessonId, p]))
  const videoByLesson = new Map(tech.videoProgress.map(v => [v.lessonId, v]))

  // Required course rows
  const requiredRows = requirements.map(req => {
    const lessons = req.course.modules.flatMap(m => m.lessons)
    const completed = lessons.filter(l => progressByLesson.get(l.id)?.completed).length
    const started = lessons.filter(l => progressByLesson.get(l.id)?.started).length
    const completedAt = lessons
      .map(l => progressByLesson.get(l.id)?.completedAt)
      .filter(Boolean)
      .sort((a, b) => (b! > a! ? 1 : -1))[0]
    const isFullyComplete = completed === lessons.length && lessons.length > 0
    return { course: req.course, lessons, completed, started, completedAt, isFullyComplete, notes: req.notes }
  })

  const allCompliant = requiredRows.length > 0 && requiredRows.every(r => r.isFullyComplete)

  const DEVICE_ICONS: Record<string, React.ReactNode> = {
    desktop: <Monitor className="w-3.5 h-3.5" />,
    mobile: <Smartphone className="w-3.5 h-3.5" />,
    tablet: <Tablet className="w-3.5 h-3.5" />,
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/manager" className="inline-flex items-center gap-1.5 text-sm font-jakarta text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to team
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-jakarta shrink-0"
            style={{ backgroundColor: '#002400', color: '#61ce70' }}>
            {tech.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-geologica font-black text-2xl text-gray-900">{tech.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-jakarta text-gray-500">{tech.email}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-jakarta text-gray-400">{tech.role.charAt(0) + tech.role.slice(1).toLowerCase().replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {allCompliant ? (
            <span className="flex items-center gap-1.5 text-sm font-jakarta font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4" /> Compliant
            </span>
          ) : requiredRows.length > 0 ? (
            <span className="flex items-center gap-1.5 text-sm font-jakarta font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" /> Incomplete
            </span>
          ) : null}
          <Link
            href={`/manager/technicians/${tech.id}/report`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-jakarta text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print report
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Required training */}
        {requiredRows.length > 0 && (
          <div>
            <h2 className="font-geologica font-bold text-lg text-gray-900 mb-3">Required training</h2>
            <div className="space-y-3">
              {requiredRows.map(row => (
                <div key={row.course.id} className="card overflow-hidden">
                  {/* Course header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-jakarta font-semibold text-sm text-gray-900">{row.course.title}</span>
                      {row.notes && (
                        <span className="text-xs font-jakarta text-gray-400 italic">— {row.notes}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.isFullyComplete ? (
                        <span className="flex items-center gap-1 text-xs font-jakarta text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle className="w-3 h-3" /> Complete
                        </span>
                      ) : row.started > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-jakarta text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                          <Clock className="w-3 h-3" /> {row.completed}/{row.lessons.length} lessons
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-jakarta text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle className="w-3 h-3" /> Not started
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 pt-2 pb-1">
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${row.lessons.length > 0 ? (row.completed / row.lessons.length) * 100 : 0}%`,
                          backgroundColor: row.isFullyComplete ? '#16a34a' : '#f59e0b',
                        }}
                      />
                    </div>
                  </div>

                  {/* Lesson rows */}
                  <div className="divide-y divide-gray-50">
                    {row.lessons.map(lesson => {
                      const lp = progressByLesson.get(lesson.id)
                      const vp = videoByLesson.get(lesson.id)
                      const hasVideo = !!lesson.videoUrl
                      return (
                        <div key={lesson.id} className="px-4 py-2.5 flex items-center gap-3">
                          {lp?.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          ) : lp?.started ? (
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                          )}
                          <span className="text-sm font-jakarta text-gray-700 flex-1 truncate">{lesson.title}</span>
                          {hasVideo && vp && (
                            <span className="flex items-center gap-1 text-xs font-jakarta text-gray-400 shrink-0">
                              <Video className="w-3 h-3" />
                              {Math.round(vp.percentWatched)}%
                            </span>
                          )}
                          {lp?.completedAt && (
                            <span className="text-xs font-jakarta text-gray-400 shrink-0">
                              {formatDate(lp.completedAt)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other courses with activity */}
        {(() => {
          const requiredCourseIds = new Set(requiredRows.map(r => r.course.id))
          const progressCourseIds = new Set(tech.progress.map(p => p.lesson.module.courseId))
          const otherActive = allCourses.filter(c => progressCourseIds.has(c.id) && !requiredCourseIds.has(c.id))
          if (otherActive.length === 0) return null
          return (
            <div>
              <h2 className="font-geologica font-bold text-lg text-gray-900 mb-3">Other course activity</h2>
              <div className="space-y-2">
                {otherActive.map(course => {
                  const lessons = course.modules.flatMap(m => m.lessons)
                  const completed = lessons.filter(l => progressByLesson.get(l.id)?.completed).length
                  const started = lessons.filter(l => progressByLesson.get(l.id)?.started).length
                  return (
                    <div key={course.id} className="card px-4 py-3 flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-jakarta text-gray-700 flex-1">{course.title}</span>
                      <span className="text-xs font-jakarta text-gray-500 tabular-nums">{completed}/{lessons.length} completed</span>
                      {completed === lessons.length && lessons.length > 0 ? (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : started > 0 ? (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Login history */}
        <div>
          <h2 className="font-geologica font-bold text-lg text-gray-900 mb-3">Recent logins</h2>
          {tech.loginEvents.length === 0 ? (
            <div className="card p-4 text-sm font-jakarta text-gray-400">No login history.</div>
          ) : (
            <div className="card divide-y divide-gray-100">
              {tech.loginEvents.map((ev, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-sm font-jakarta">
                  <span className="text-gray-400">
                    {DEVICE_ICONS[ev.deviceType || 'desktop'] || DEVICE_ICONS.desktop}
                  </span>
                  <span className="text-gray-700 flex-1">{formatDate(ev.loginAt)}</span>
                  <span className="text-xs text-gray-400 capitalize">{ev.deviceType || 'desktop'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
