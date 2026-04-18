import { getServerSession } from 'next-auth'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Play,
  RadioTower,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ADMIN_ROLES, MANAGER_ROLES } from '@/types'
import type { Role } from '@/types'
import { formatDate } from '@/lib/utils'
import { getIntlLocale, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'
import { resolveCategory, resolveCourse, resolveLesson, resolveModule } from '@/lib/i18n/content'

export const dynamic = 'force-dynamic'

async function getDashboardData(userId: string, role: Role, locale: 'en' | 'fr' | 'es' | 'de') {
  const [recentProgress, roleCourses, userProgress] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { lastViewedAt: 'desc' },
      take: 5,
      include: {
        lesson: {
          include: {
            locales: {
              where: { locale, status: 'PUBLISHED' },
            },
            module: {
              include: {
                locales: {
                  where: { locale, status: 'PUBLISHED' },
                },
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
        },
      },
    }),
    prisma.course.findMany({
      where: {
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
          include: {
            locales: {
              where: { locale, status: 'PUBLISHED' },
            },
            lessons: {
              where: { status: 'PUBLISHED' },
              include: {
                locales: {
                  where: { locale, status: 'PUBLISHED' },
                },
              },
            },
          },
        },
      },
      take: 6,
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    }),
    prisma.lessonProgress.findMany({
      where: { userId },
      select: {
        lessonId: true,
        started: true,
        completed: true,
        lastViewedAt: true,
      },
    }),
  ])

  return { recentProgress, roleCourses, userProgress }
}

type DashboardCourse = Awaited<ReturnType<typeof getDashboardData>>['roleCourses'][number]
type ProgressMap = Map<string, { lessonId: string; started: boolean; completed: boolean }>
type CategoryMeta = {
  icon: LucideIcon
  tag: string
  copy: string
  footer: string
  accentClass: string
  softClass: string
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const locale = getRequestLocale()
  const intlLocale = getIntlLocale(locale)
  const dashboardText = getDashboardText(locale)
  const role = session.user.role as Role
  const { recentProgress, roleCourses, userProgress } = await getDashboardData(session.user.id, role, locale)

  const greeting = getGreeting(dashboardText)
  const localizedRecentProgress = recentProgress.map((item) => {
    const category = resolveCategory(item.lesson.module.course.category, locale)
    const course = resolveCourse({ ...item.lesson.module.course, category }, locale)
    const module = resolveModule({ ...item.lesson.module, course }, locale)
    const lesson = resolveLesson({ ...item.lesson, module }, locale)
    return { ...item, lesson }
  })
  const localizedCourses = roleCourses.map((course) => {
    const category = resolveCategory(course.category, locale)
    return {
      ...resolveCourse({ ...course, category }, locale),
      category,
      modules: course.modules.map((module) => ({
        ...resolveModule(module, locale),
        lessons: module.lessons.map((lesson) => resolveLesson(lesson, locale)),
      })),
    }
  })
  const progressByLesson = new Map(userProgress.map((item) => [item.lessonId, item]))
  const enrichedCourses = localizedCourses.map((course) => buildCourseCard(course, progressByLesson, dashboardText))
  const totalLessonsAvailable = enrichedCourses.reduce((sum, course) => sum + course.totalLessons, 0)
  const lessonsStarted = userProgress.filter((item) => item.started).length
  const lessonsCompleted = userProgress.filter((item) => item.completed).length
  const overallProgressPct = totalLessonsAvailable > 0 ? Math.round((lessonsCompleted / totalLessonsAvailable) * 100) : 0
  const featuredLesson = localizedRecentProgress[0]
  const featuredCourse =
    enrichedCourses.find((course) => course.startedLessons > 0 && !course.isComplete) ?? enrichedCourses[0] ?? null
  const signal = getProgressSignal(overallProgressPct, lessonsCompleted, dashboardText)
  const quickActions = getQuickActions(role, featuredLesson, dashboardText).map((action) => ({
    ...action,
    href: withLocalePrefix(locale, action.href),
  }))

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-emerald-300/30 bg-[#001b00] p-6 text-white shadow-[0_24px_80px_rgba(0,36,0,0.18)] md:p-8">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/hex-pattern.svg)',
            backgroundSize: '280px',
            backgroundPosition: 'right center',
          }}
        />
        <div className="absolute -left-16 top-8 h-48 w-48 rounded-full bg-[#61ce70]/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#02f103]/12 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-stretch">
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-[#9ce7a6]">
              <Sparkles className="h-3.5 w-3.5" />
              {dashboardText.academyKicker}
            </div>

            <div className="mt-5">
              <div className="text-sm font-jakarta text-white/65">{greeting}</div>
              <h1 className="mt-2 font-geologica text-4xl font-black tracking-tight text-white md:text-5xl">
                {session.user.name.split(' ')[0]}{dashboardText.heroTitleSuffix}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-jakarta leading-7 text-white/78 md:text-lg">
                {dashboardText.roleDescriptions[role]}{dashboardText.heroCopySuffix}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {[dashboardText.pillOne, dashboardText.pillTwo, dashboardText.pillThree].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-jakarta font-medium text-white/82"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {featuredLesson ? (
                <Link href={withLocalePrefix(locale, `/lessons/${featuredLesson.lesson.id}`)} className="btn-primary">
                  {dashboardText.actionResumeTitle}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href={withLocalePrefix(locale, '/learn')} className="btn-primary">
                  {dashboardText.exploreCourses}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href={withLocalePrefix(locale, '/learn')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-jakarta font-semibold text-white transition-colors hover:bg-white/12"
              >
                {dashboardText.actionExploreTitle}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: dashboardText.coverage,
                  value: `${localizedCourses.length} ${dashboardText.roleReadyCourses}`,
                  note: dashboardText.coverageNote,
                },
                {
                  label: dashboardText.momentum,
                  value: `${lessonsStarted} ${dashboardText.lessonsInMotion}`,
                  note: dashboardText.momentumNote,
                },
                {
                  label: dashboardText.outcome,
                  value: `${lessonsCompleted} ${dashboardText.completionsLogged}`,
                  note: dashboardText.outcomeNote,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="text-[11px] font-jakarta font-semibold uppercase tracking-[0.18em] text-[#9ce7a6]">
                    {item.label}
                  </div>
                  <div className="mt-2 font-geologica text-xl font-bold text-white">{item.value}</div>
                  <div className="mt-1 text-sm font-jakarta text-white/62">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative grid gap-4">
            <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-jakarta font-semibold uppercase tracking-[0.16em] text-[#9ce7a6]">
                    {dashboardText.learningSignal}
                    </div>
                  <div className="mt-3 font-geologica text-5xl font-black text-white">{overallProgressPct}%</div>
                  <p className="mt-2 text-sm font-jakarta leading-6 text-white/70">
                    {signal.copy}
                  </p>
                </div>
                <div className={`rounded-2xl border px-3 py-2 text-xs font-jakarta font-semibold ${signal.badgeClass}`}>
                  {signal.label}
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#61ce70] via-[#38d861] to-[#b8ffbc]"
                  style={{ width: `${Math.max(overallProgressPct, totalLessonsAvailable > 0 ? 8 : 0)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: dashboardText.availableLessons, value: totalLessonsAvailable || '—' },
                  { label: dashboardText.completed, value: lessonsCompleted || '—' },
                  { label: dashboardText.role, value: dashboardText.roleLabels[role] },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                    <div className="text-lg font-geologica font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] font-jakarta uppercase tracking-[0.16em] text-white/55">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                {dashboardText.platformPillars}
              </div>
              <div className="mt-4 space-y-3">
                {[
                  {
                    title: dashboardText.pillarRiskTitle,
                    copy: dashboardText.pillarRiskCopy,
                  },
                  {
                    title: dashboardText.pillarProductivityTitle,
                    copy: dashboardText.pillarProductivityCopy,
                  },
                  {
                    title: dashboardText.pillarDataTitle,
                    copy: dashboardText.pillarDataCopy,
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="font-geologica text-base font-bold text-gray-900">{item.title}</div>
                    <div className="mt-1 text-sm font-jakarta leading-6 text-gray-600">{item.copy}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={GraduationCap}
          title={dashboardText.metricCoursesTitle}
          value={roleCourses.length.toString()}
          detail={dashboardText.metricCoursesDetail}
          accentClass="bg-emerald-50 text-emerald-700 border-emerald-100"
        />
        <MetricCard
          icon={Play}
          title={dashboardText.metricStartedTitle}
          value={lessonsStarted.toString()}
          detail={dashboardText.metricStartedDetail}
          accentClass="bg-sky-50 text-sky-700 border-sky-100"
        />
        <MetricCard
          icon={CheckCircle2}
          title={dashboardText.metricCompletedTitle}
          value={lessonsCompleted.toString()}
          detail={dashboardText.metricCompletedDetail}
          accentClass="bg-lime-50 text-lime-700 border-lime-100"
        />
        <MetricCard
          icon={TrendingUp}
          title={dashboardText.metricProgressTitle}
          value={`${overallProgressPct}%`}
          detail={signal.shortCopy}
          accentClass="bg-violet-50 text-violet-700 border-violet-100"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-geologica text-2xl font-black text-gray-900">{dashboardText.learningPathTitle}</h2>
              <p className="mt-1 text-sm font-jakarta text-gray-500">
                {dashboardText.learningPathCopy}
              </p>
            </div>
            <Link href={withLocalePrefix(locale, '/learn')} className="text-sm font-jakarta font-semibold text-emerald-700 hover:text-emerald-800">
              {dashboardText.browseAll} <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </div>

          {enrichedCourses.length === 0 ? (
            <div className="card rounded-[28px] border-dashed p-8 text-center">
              <BookOpen className="mx-auto mb-3 h-9 w-9 text-gray-300" />
              <p className="font-jakarta text-gray-500">{dashboardText.noRoleCourses}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {enrichedCourses.slice(0, 4).map((course) => {
                const meta = getCategoryMeta(course.category.slug, dashboardText)
                return (
                  <Link
                    key={course.id}
                    href={withLocalePrefix(locale, `/learn/${course.category.slug}/${course.slug}`)}
                    className="group relative overflow-hidden rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#61ce70] via-[#0b8d33] to-[#002400]" />
                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-emerald-100/60 blur-3xl transition-transform duration-300 group-hover:scale-125" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${meta.accentClass}`}>
                            <meta.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-[11px] font-jakarta font-semibold uppercase tracking-[0.16em] text-gray-400">
                              {course.category.name}
                            </div>
                            <div className="mt-1 font-geologica text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-emerald-700">
                              {course.title}
                            </div>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-jakarta font-semibold ${course.statusClass}`}>
                          {course.statusLabel}
                        </span>
                      </div>

                      <p className="mt-4 min-h-[72px] text-sm font-jakarta leading-6 text-gray-600">
                        {course.description || meta.copy}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-jakarta text-gray-600">
                          {course.totalLessons} {course.totalLessons === 1 ? dashboardText.lessonSingular : dashboardText.lessonPlural}
                        </span>
                        {course.estimatedMins && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-jakarta text-gray-600">
                            ~{course.estimatedMins} min
                          </span>
                        )}
                        <span className={`rounded-full px-3 py-1 text-xs font-jakarta font-medium ${meta.softClass}`}>
                          {meta.tag}
                        </span>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-jakarta text-gray-500">
                          <span>{course.completedLessons}/{course.totalLessons} {dashboardText.completedLower}</span>
                          <span>{course.progressPct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#61ce70] to-[#0b8d33]"
                            style={{ width: `${Math.max(course.progressPct, course.startedLessons > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between text-sm font-jakarta">
                        <span className="text-gray-500">{meta.footer}</span>
                        <span className="font-semibold text-emerald-700">
                          {dashboardText.openGuide} <ChevronRight className="inline h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-gray-700">
              <Activity className="h-4 w-4 text-emerald-700" />
              {dashboardText.continueLearningTitle}
            </div>

            {recentProgress.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <BookOpen className="mx-auto h-9 w-9 text-gray-300" />
                <div className="mt-3 font-geologica text-xl font-bold text-gray-900">{dashboardText.nothingStartedTitle}</div>
                <p className="mt-2 text-sm font-jakarta leading-6 text-gray-500">
                  {dashboardText.nothingStartedCopy}
                </p>
                <Link href={withLocalePrefix(locale, '/learn')} className="btn-secondary mt-4">
                  {dashboardText.exploreCourses}
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentProgress.map((item) => (
                  <Link
                    key={item.id}
                    href={withLocalePrefix(locale, `/lessons/${item.lesson.id}`)}
                    className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/90 px-4 py-4 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${item.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-400 border border-gray-200'}`}>
                      {item.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-jakarta text-sm font-semibold text-gray-900 transition-colors group-hover:text-emerald-700">
                        {item.lesson.title}
                      </div>
                      <div className="mt-1 text-xs font-jakarta uppercase tracking-[0.14em] text-gray-400">
                        {item.lesson.module.course.category.name}
                      </div>
                      <div className="mt-2 text-sm font-jakarta text-gray-500">
                        {item.lesson.module.course.title}
                      </div>
                      <div className="mt-2 text-xs font-jakarta text-gray-400">
                        {dashboardText.lastActiveLabel} {formatDate(item.lastViewedAt, intlLocale)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-gray-700">
              <RadioTower className="h-4 w-4 text-emerald-700" />
              {dashboardText.quickActionsTitle}
            </div>
            <div className="mt-4 space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${action.accentClass}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-geologica text-lg font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
                      {action.title}
                    </div>
                    <div className="mt-1 text-sm font-jakarta leading-6 text-gray-600">{action.copy}</div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-emerald-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featuredCourse && (
        <section className="rounded-[30px] border border-gray-200 bg-gradient-to-r from-white via-emerald-50/50 to-white p-6 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <Target className="h-3.5 w-3.5" />
                {dashboardText.bestNextMove}
              </div>
              <h2 className="mt-4 font-geologica text-3xl font-black text-gray-900">
                {featuredCourse.title}
              </h2>
              <p className="mt-3 text-sm font-jakarta leading-7 text-gray-600">
                {featuredCourse.description || dashboardText.bestNextMoveFallback}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: dashboardText.featuredStarted,
                  value: featuredCourse.startedLessons,
                  icon: Play,
                },
                {
                  title: dashboardText.featuredCompleted,
                  value: featuredCourse.completedLessons,
                  icon: CheckCircle2,
                },
                {
                  title: dashboardText.featuredRemaining,
                  value: Math.max(featuredCourse.totalLessons - featuredCourse.completedLessons, 0),
                  icon: BarChart3,
                },
              ].map((stat) => (
                <div key={stat.title} className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-jakarta font-semibold text-emerald-700">
                    <stat.icon className="h-4 w-4" />
                    {stat.title}
                  </div>
                  <div className="mt-3 font-geologica text-3xl font-black text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
  accentClass,
}: {
  icon: LucideIcon
  title: string
  value: string
  detail: string
  accentClass: string
}) {
  return (
    <div className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 font-geologica text-3xl font-black text-gray-900">{value}</div>
      <div className="mt-1 font-jakarta text-sm font-semibold text-gray-900">{title}</div>
      <div className="mt-2 text-sm font-jakarta leading-6 text-gray-500">{detail}</div>
    </div>
  )
}

function buildCourseCard(
  course: DashboardCourse,
  progressByLesson: ProgressMap,
  dashboardText: ReturnType<typeof getDashboardText>
) {
  const totalLessons = course.modules.reduce((count, module) => count + module.lessons.length, 0)
  const completedLessons = course.modules.reduce(
    (count, module) =>
      count + module.lessons.filter((lesson) => progressByLesson.get(lesson.id)?.completed).length,
    0
  )
  const startedLessons = course.modules.reduce(
    (count, module) =>
      count + module.lessons.filter((lesson) => progressByLesson.get(lesson.id)?.started).length,
    0
  )
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const isComplete = totalLessons > 0 && completedLessons === totalLessons

  let statusLabel: string = dashboardText.courseStatusReady
  let statusClass = 'border-gray-200 bg-gray-50 text-gray-600'

  if (isComplete) {
    statusLabel = dashboardText.courseStatusCompleted
    statusClass = 'border-emerald-200 bg-emerald-50 text-emerald-700'
  } else if (startedLessons > 0) {
    statusLabel = dashboardText.courseStatusInProgress
    statusClass = 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return {
    ...course,
    totalLessons,
    completedLessons,
    startedLessons,
    progressPct,
    isComplete,
    statusLabel,
    statusClass,
  }
}

function getGreeting(dashboardText: ReturnType<typeof getDashboardText>) {
  const hour = new Date().getHours()
  if (hour < 12) return dashboardText.greetingMorning
  if (hour < 17) return dashboardText.greetingAfternoon
  return dashboardText.greetingEvening
}

function getProgressSignal(progressPct: number, lessonsCompleted: number, dashboardText: ReturnType<typeof getDashboardText>) {
  if (progressPct >= 70) {
    return {
      label: dashboardText.signalStrongLabel,
      copy: dashboardText.signalStrongCopy,
      shortCopy: dashboardText.signalStrongShort,
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
  }
  if (progressPct >= 25 || lessonsCompleted >= 2) {
    return {
      label: dashboardText.signalBuildingLabel,
      copy: dashboardText.signalBuildingCopy,
      shortCopy: dashboardText.signalBuildingShort,
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    }
  }
  return {
    label: dashboardText.signalFreshLabel,
    copy: dashboardText.signalFreshCopy,
    shortCopy: dashboardText.signalFreshShort,
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
  }
}

function getQuickActions(
  role: Role,
  featuredLesson: Awaited<ReturnType<typeof getDashboardData>>['recentProgress'][number] | undefined,
  dashboardText: ReturnType<typeof getDashboardText>
) {
  const actions: Array<{
    title: string
    copy: string
    href: string
    icon: LucideIcon
    accentClass: string
  }> = []

  if (featuredLesson) {
    actions.push({
      title: dashboardText.actionResumeTitle,
      copy: dashboardText.actionResumeCopy.replace('{lesson}', featuredLesson.lesson.title),
      href: `/lessons/${featuredLesson.lesson.id}`,
      icon: Play,
      accentClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    })
  }

  actions.push({
    title: dashboardText.actionExploreTitle,
    copy: dashboardText.actionExploreCopy,
    href: '/learn',
    icon: BookOpen,
    accentClass: 'border-gray-200 bg-gray-50 text-gray-700',
  })

  actions.push({
    title: dashboardText.actionSimulatorTitle,
    copy: dashboardText.actionSimulatorCopy,
    href: '/tools/signal-simulator',
    icon: RadioTower,
    accentClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  })

  if (ADMIN_ROLES.includes(role)) {
    actions.push({
      title: dashboardText.actionQaTitle,
      copy: dashboardText.actionQaCopy,
      href: '/admin/qa',
      icon: ShieldCheck,
      accentClass: 'border-red-200 bg-red-50 text-red-700',
    })
  } else if (MANAGER_ROLES.includes(role)) {
    actions.push({
      title: dashboardText.actionComplianceTitle,
      copy: dashboardText.actionComplianceCopy,
      href: '/manager',
      icon: BarChart3,
      accentClass: 'border-amber-200 bg-amber-50 text-amber-700',
    })
  } else {
    actions.push({
      title: dashboardText.actionSearchTitle,
      copy: dashboardText.actionSearchCopy,
      href: '/search',
      icon: Search,
      accentClass: 'border-sky-200 bg-sky-50 text-sky-700',
    })
  }

  return actions.slice(0, 4)
}

function getCategoryMeta(slug: string, dashboardText: ReturnType<typeof getDashboardText>): CategoryMeta {
  const map: Record<string, CategoryMeta> = {
    software: {
      icon: Activity,
      tag: dashboardText.categorySoftwareTag,
      copy: dashboardText.categorySoftwareCopy,
      footer: dashboardText.categorySoftwareFooter,
      accentClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      softClass: 'bg-emerald-50 text-emerald-700',
    },
    hardware: {
      icon: RadioTower,
      tag: dashboardText.categoryHardwareTag,
      copy: dashboardText.categoryHardwareCopy,
      footer: dashboardText.categoryHardwareFooter,
      accentClass: 'border-sky-200 bg-sky-50 text-sky-700',
      softClass: 'bg-sky-50 text-sky-700',
    },
    sales: {
      icon: TrendingUp,
      tag: dashboardText.categorySalesTag,
      copy: dashboardText.categorySalesCopy,
      footer: dashboardText.categorySalesFooter,
      accentClass: 'border-amber-200 bg-amber-50 text-amber-700',
      softClass: 'bg-amber-50 text-amber-700',
    },
    'academy-drafts': {
      icon: Sparkles,
      tag: dashboardText.categoryDraftsTag,
      copy: dashboardText.categoryDraftsCopy,
      footer: dashboardText.categoryDraftsFooter,
      accentClass: 'border-violet-200 bg-violet-50 text-violet-700',
      softClass: 'bg-violet-50 text-violet-700',
    },
  }

  return map[slug] || {
    icon: GraduationCap,
    tag: dashboardText.categoryDefaultTag,
    copy: dashboardText.categoryDefaultCopy,
    footer: dashboardText.categoryDefaultFooter,
    accentClass: 'border-gray-200 bg-gray-50 text-gray-700',
    softClass: 'bg-gray-100 text-gray-700',
  }
}

function getDashboardText(locale: 'en' | 'fr' | 'es' | 'de') {
  const copy = {
    en: {
      academyKicker: 'PestSense Academy',
      greetingMorning: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      heroTitleSuffix: ', train for smarter protection.',
      heroCopySuffix: ' Keep OneCloud, Predictor, and the Academy working together so your team can know before they go.',
      pillOne: 'Predictor + OneCloud',
      pillTwo: 'Digital pest management',
      pillThree: 'Know before you go',
      coverage: 'Coverage',
      coverageNote: 'Built around your access level',
      momentum: 'Momentum',
      momentumNote: 'Tracks both reading and video sessions',
      outcome: 'Outcome',
      outcomeNote: 'Clear progress the team can review',
      learningSignal: 'Learning signal',
      platformPillars: 'Platform pillars',
      roleReadyCourses: 'role-ready courses',
      lessonsInMotion: 'lessons in motion',
      completionsLogged: 'completions logged',
      roleLabels: {
        TECHNICIAN: 'Technician',
        SITE_MANAGER: 'Site Manager',
        BUSINESS_ADMIN: 'Business Admin',
        SUPER_ADMIN: 'Super Admin',
      },
      roleDescriptions: {
        TECHNICIAN: 'Field technician — practical device and site training.',
        SITE_MANAGER: 'Site oversight, reports, and team management.',
        BUSINESS_ADMIN: 'Full business administration and platform control.',
        SUPER_ADMIN: 'PestSense internal — full platform access.',
      },
      availableLessons: 'Available lessons',
      completed: 'Completed',
      completedLower: 'completed',
      role: 'Role',
      pillarRiskTitle: 'Risk management',
      pillarRiskCopy: 'Train the team to spot issues earlier and respond with more confidence.',
      pillarProductivityTitle: 'Productivity',
      pillarProductivityCopy: 'Use setup, servicing, and simulator tools to shorten guesswork in the field.',
      pillarDataTitle: 'Data & analytics',
      pillarDataCopy: 'Bring learning, alerts, and QA evidence into one operating rhythm.',
      metricCoursesTitle: 'Courses for your role',
      metricCoursesDetail: 'Curated by visibility and published status',
      metricStartedTitle: 'Lessons started',
      metricStartedDetail: 'Any lesson opened or video watched counts here',
      metricCompletedTitle: 'Lessons completed',
      metricCompletedDetail: 'Explicit completions and video thresholds are logged',
      metricProgressTitle: 'Progress signal',
      learningPathTitle: 'Your learning path',
      learningPathCopy: 'Branded, role-aware learning that maps to the way PestSense actually works.',
      browseAll: 'Browse all',
      noRoleCourses: 'No courses are visible for your role yet.',
      lessonSingular: 'lesson',
      lessonPlural: 'lessons',
      openGuide: 'Open guide',
      continueLearningTitle: 'Continue learning',
      nothingStartedTitle: 'Nothing started yet',
      nothingStartedCopy: 'Start with a role guide and the dashboard will begin surfacing your learning history here.',
      exploreCourses: 'Explore courses',
      lastActiveLabel: 'Last active',
      quickActionsTitle: 'Quick actions',
      bestNextMove: 'Best next move',
      bestNextMoveFallback: 'This course is the clearest next step based on your role and current progress.',
      featuredStarted: 'Started',
      featuredCompleted: 'Completed',
      featuredRemaining: 'Remaining',
      courseStatusReady: 'Ready to start',
      courseStatusInProgress: 'In progress',
      courseStatusCompleted: 'Completed',
      signalStrongLabel: 'Strong signal',
      signalStrongCopy: 'You have a solid amount of training in place. This is a good moment to deepen the more advanced workflows and team guidance.',
      signalStrongShort: 'Strong progress across your current learning path',
      signalBuildingLabel: 'Building well',
      signalBuildingCopy: 'The foundation is there now. Keep moving through the current path and the dashboard will keep surfacing the next best steps.',
      signalBuildingShort: 'The learning signal is building nicely',
      signalFreshLabel: 'Fresh start',
      signalFreshCopy: 'This is the early stage, which is fine. Start with the core role guide and the strongest product workflows will build from there.',
      signalFreshShort: 'Early momentum, ready to build',
      actionResumeTitle: 'Resume latest lesson',
      actionResumeCopy: 'Pick up from {lesson} and keep the learning flow going.',
      actionExploreTitle: 'Explore the Academy',
      actionExploreCopy: 'Browse all visible courses, guides, and role-based content in one place.',
      actionSimulatorTitle: 'Signal Simulator',
      actionSimulatorCopy: 'Sketch layouts, test obstacles, and give the team a more visual way to talk about coverage.',
      actionQaTitle: 'Review QA findings',
      actionQaCopy: 'Open the internal QA board with bugs, screenshots, and security findings ready for software leads.',
      actionComplianceTitle: 'Check team compliance',
      actionComplianceCopy: 'See who has started, completed, or missed their required training.',
      actionSearchTitle: 'Search training quickly',
      actionSearchCopy: 'Jump straight into specific lessons, products, and guidance when you need an answer fast.',
      categorySoftwareTag: 'OneCloud workflows',
      categorySoftwareCopy: 'Build confidence in the interface, alerts, hierarchy, and practical operating flows.',
      categorySoftwareFooter: 'Software-first guidance',
      categoryHardwareTag: 'Predictor hardware',
      categoryHardwareCopy: 'Learn installation, devices, gateways, and the physical setup choices that matter on site.',
      categoryHardwareFooter: 'Field hardware guidance',
      categorySalesTag: 'Commercial messaging',
      categorySalesCopy: 'Translate product capability into stronger customer conversations and clearer business value.',
      categorySalesFooter: 'Sales enablement',
      categoryDraftsTag: 'Draft review',
      categoryDraftsCopy: 'Early review material captured from new training content and Academy iteration work.',
      categoryDraftsFooter: 'Internal draft content',
      categoryDefaultTag: 'Academy guide',
      categoryDefaultCopy: 'Role-aware guidance packaged in a cleaner, more shareable Academy format.',
      categoryDefaultFooter: 'Academy content',
    },
    fr: {
      academyKicker: 'PestSense Academy',
      greetingMorning: 'Bonjour',
      greetingAfternoon: 'Bon apres-midi',
      greetingEvening: 'Bonsoir',
      heroTitleSuffix: ', formez-vous pour une protection plus intelligente.',
      heroCopySuffix: ' Faites travailler OneCloud, Predictor et l Academy ensemble pour que votre equipe sache avant de partir.',
      pillOne: 'Predictor + OneCloud',
      pillTwo: 'Gestion numerique des nuisibles',
      pillThree: 'Savoir avant d intervenir',
      coverage: 'Couverture',
      coverageNote: 'Construit autour de votre niveau d acces',
      momentum: 'Dynamique',
      momentumNote: 'Suit a la fois les lectures et les sessions video',
      outcome: 'Resultat',
      outcomeNote: 'Une progression claire que l equipe peut relire',
      learningSignal: 'Signal de formation',
      platformPillars: 'Piliers de la plateforme',
      roleReadyCourses: 'cours adaptes au role',
      lessonsInMotion: 'lecons en cours',
      completionsLogged: 'validations enregistrees',
      roleLabels: {
        TECHNICIAN: 'Technicien',
        SITE_MANAGER: 'Responsable de site',
        BUSINESS_ADMIN: 'Admin metier',
        SUPER_ADMIN: 'Super admin',
      },
      roleDescriptions: {
        TECHNICIAN: 'Technicien terrain — formation pratique sur les appareils et les sites.',
        SITE_MANAGER: 'Supervision du site, rapports et gestion de l equipe.',
        BUSINESS_ADMIN: 'Administration metier complete et pilotage de la plateforme.',
        SUPER_ADMIN: 'Interne PestSense — acces complet a la plateforme.',
      },
      availableLessons: 'Lecons disponibles',
      completed: 'Termine',
      completedLower: 'termines',
      role: 'Role',
      pillarRiskTitle: 'Gestion du risque',
      pillarRiskCopy: 'Formez l equipe a detecter plus tot les problemes et a reagir avec plus de confiance.',
      pillarProductivityTitle: 'Productivite',
      pillarProductivityCopy: 'Utilisez les outils de configuration, de service et de simulation pour reduire les suppositions sur le terrain.',
      pillarDataTitle: 'Donnees et analyses',
      pillarDataCopy: 'Rassemblez apprentissage, alertes et preuves QA dans un meme rythme operationnel.',
      metricCoursesTitle: 'Cours pour votre role',
      metricCoursesDetail: 'Filtres par visibilite et statut publie',
      metricStartedTitle: 'Lecons commencees',
      metricStartedDetail: 'Toute lecon ouverte ou video lancee est comptabilisee ici',
      metricCompletedTitle: 'Lecons terminees',
      metricCompletedDetail: 'Les validations explicites et les seuils video sont journalises',
      metricProgressTitle: 'Signal de progression',
      learningPathTitle: 'Votre parcours de formation',
      learningPathCopy: 'Une formation alignee sur le role et sur la facon dont PestSense fonctionne vraiment.',
      browseAll: 'Tout parcourir',
      noRoleCourses: 'Aucun cours n est encore visible pour votre role.',
      lessonSingular: 'lecon',
      lessonPlural: 'lecons',
      openGuide: 'Ouvrir le guide',
      continueLearningTitle: 'Continuer la formation',
      nothingStartedTitle: 'Rien n a encore commence',
      nothingStartedCopy: 'Commencez par un guide de role et le tableau de bord affichera ensuite votre historique d apprentissage.',
      exploreCourses: 'Explorer les cours',
      lastActiveLabel: 'Derniere activite',
      quickActionsTitle: 'Actions rapides',
      bestNextMove: 'Meilleure prochaine etape',
      bestNextMoveFallback: 'Ce cours est la prochaine etape la plus claire compte tenu de votre role et de votre progression actuelle.',
      featuredStarted: 'Commence',
      featuredCompleted: 'Termine',
      featuredRemaining: 'Restant',
      courseStatusReady: 'Pret a commencer',
      courseStatusInProgress: 'En cours',
      courseStatusCompleted: 'Termine',
      signalStrongLabel: 'Signal fort',
      signalStrongCopy: 'Vous avez deja une base de formation solide. C est un bon moment pour approfondir les workflows avances et le guidage equipe.',
      signalStrongShort: 'Progression solide sur votre parcours actuel',
      signalBuildingLabel: 'Ca progresse bien',
      signalBuildingCopy: 'La base est en place. Continuez sur le parcours actuel et le tableau de bord fera ressortir les prochaines etapes utiles.',
      signalBuildingShort: 'Le signal de progression se construit bien',
      signalFreshLabel: 'Nouveau depart',
      signalFreshCopy: 'Vous etes encore au debut, ce qui est normal. Commencez par le guide de role principal et les workflows produit les plus utiles se construiront ensuite.',
      signalFreshShort: 'Debut de dynamique, pret a monter en puissance',
      actionResumeTitle: 'Reprendre la derniere lecon',
      actionResumeCopy: 'Reprenez depuis {lesson} et gardez le rythme de formation.',
      actionExploreTitle: 'Explorer l Academy',
      actionExploreCopy: 'Parcourez tous les cours, guides et contenus visibles selon le role en un seul endroit.',
      actionSimulatorTitle: 'Simulateur de signal',
      actionSimulatorCopy: 'Esquissez des plans, testez les obstacles et donnez a l equipe une facon plus visuelle de parler de la couverture.',
      actionQaTitle: 'Consulter les retours QA',
      actionQaCopy: 'Ouvrez le tableau QA interne avec bugs, captures et constats securite deja prets pour les responsables logiciel.',
      actionComplianceTitle: 'Verifier la conformite equipe',
      actionComplianceCopy: 'Voyez qui a commence, termine ou manque encore sa formation obligatoire.',
      actionSearchTitle: 'Rechercher rapidement',
      actionSearchCopy: 'Accedez directement aux lecons, produits et guides utiles quand vous avez besoin d une reponse rapide.',
      categorySoftwareTag: 'Workflows OneCloud',
      categorySoftwareCopy: 'Prenez confiance sur l interface, les alertes, la hierarchie et les flux operationnels concrets.',
      categorySoftwareFooter: 'Guides orientes logiciel',
      categoryHardwareTag: 'Materiel Predictor',
      categoryHardwareCopy: 'Apprenez l installation, les appareils, les passerelles et les choix physiques qui comptent sur site.',
      categoryHardwareFooter: 'Guides terrain materiel',
      categorySalesTag: 'Messages commerciaux',
      categorySalesCopy: 'Transformez les capacites produit en conversations client plus fortes et en valeur metier plus claire.',
      categorySalesFooter: 'Aide a la vente',
      categoryDraftsTag: 'Revue brouillon',
      categoryDraftsCopy: 'Contenu de revue initial capture a partir de nouvelles formations et du travail d iteration Academy.',
      categoryDraftsFooter: 'Contenu brouillon interne',
      categoryDefaultTag: 'Guide Academy',
      categoryDefaultCopy: 'Un guidage oriente role dans un format Academy plus propre et plus facile a partager.',
      categoryDefaultFooter: 'Contenu Academy',
    },
    es: {
      academyKicker: 'PestSense Academy',
      greetingMorning: 'Buenos dias',
      greetingAfternoon: 'Buenas tardes',
      greetingEvening: 'Buenas noches',
      heroTitleSuffix: ', formate para una proteccion mas inteligente.',
      heroCopySuffix: ' Haz que OneCloud, Predictor y Academy trabajen juntos para que tu equipo sepa antes de salir.',
      pillOne: 'Predictor + OneCloud',
      pillTwo: 'Gestion digital de plagas',
      pillThree: 'Saber antes de actuar',
      coverage: 'Cobertura',
      coverageNote: 'Construido alrededor de tu nivel de acceso',
      momentum: 'Impulso',
      momentumNote: 'Sigue tanto lectura como sesiones de video',
      outcome: 'Resultado',
      outcomeNote: 'Progreso claro que el equipo puede revisar',
      learningSignal: 'Senal de aprendizaje',
      platformPillars: 'Pilares de la plataforma',
      roleReadyCourses: 'cursos listos para el rol',
      lessonsInMotion: 'lecciones en marcha',
      completionsLogged: 'finalizaciones registradas',
      roleLabels: {
        TECHNICIAN: 'Tecnico',
        SITE_MANAGER: 'Responsable de sitio',
        BUSINESS_ADMIN: 'Admin de negocio',
        SUPER_ADMIN: 'Super admin',
      },
      roleDescriptions: {
        TECHNICIAN: 'Tecnico de campo — formacion practica sobre dispositivos y sitios.',
        SITE_MANAGER: 'Supervision del sitio, informes y gestion del equipo.',
        BUSINESS_ADMIN: 'Administracion de negocio completa y control de la plataforma.',
        SUPER_ADMIN: 'Interno de PestSense — acceso total a la plataforma.',
      },
      availableLessons: 'Lecciones disponibles',
      completed: 'Completado',
      completedLower: 'completadas',
      role: 'Rol',
      pillarRiskTitle: 'Gestion del riesgo',
      pillarRiskCopy: 'Forma al equipo para detectar problemas antes y responder con mas confianza.',
      pillarProductivityTitle: 'Productividad',
      pillarProductivityCopy: 'Usa las herramientas de configuracion, servicio y simulacion para reducir las suposiciones en campo.',
      pillarDataTitle: 'Datos y analitica',
      pillarDataCopy: 'Une aprendizaje, alertas y evidencias QA en un solo ritmo operativo.',
      metricCoursesTitle: 'Cursos para tu rol',
      metricCoursesDetail: 'Filtrados por visibilidad y estado publicado',
      metricStartedTitle: 'Lecciones iniciadas',
      metricStartedDetail: 'Toda leccion abierta o video visto cuenta aqui',
      metricCompletedTitle: 'Lecciones completadas',
      metricCompletedDetail: 'Se registran las finalizaciones explicitas y los umbrales de video',
      metricProgressTitle: 'Senal de progreso',
      learningPathTitle: 'Tu ruta de aprendizaje',
      learningPathCopy: 'Formacion orientada al rol y alineada con la forma real de trabajar en PestSense.',
      browseAll: 'Ver todo',
      noRoleCourses: 'Todavia no hay cursos visibles para tu rol.',
      lessonSingular: 'leccion',
      lessonPlural: 'lecciones',
      openGuide: 'Abrir guia',
      continueLearningTitle: 'Seguir aprendiendo',
      nothingStartedTitle: 'Todavia no has empezado',
      nothingStartedCopy: 'Empieza con una guia de rol y el panel comenzara a mostrar aqui tu historial de aprendizaje.',
      exploreCourses: 'Explorar cursos',
      lastActiveLabel: 'Ultima actividad',
      quickActionsTitle: 'Acciones rapidas',
      bestNextMove: 'Mejor siguiente paso',
      bestNextMoveFallback: 'Este curso es el siguiente paso mas claro segun tu rol y tu progreso actual.',
      featuredStarted: 'Iniciado',
      featuredCompleted: 'Completado',
      featuredRemaining: 'Pendiente',
      courseStatusReady: 'Listo para empezar',
      courseStatusInProgress: 'En progreso',
      courseStatusCompleted: 'Completado',
      signalStrongLabel: 'Senal fuerte',
      signalStrongCopy: 'Ya tienes una base de formacion solida. Es un buen momento para profundizar en los flujos mas avanzados y en la guia al equipo.',
      signalStrongShort: 'Progreso solido en tu ruta actual',
      signalBuildingLabel: 'Va muy bien',
      signalBuildingCopy: 'La base ya esta creada. Sigue avanzando en la ruta actual y el panel ira mostrando los siguientes mejores pasos.',
      signalBuildingShort: 'La senal de aprendizaje va creciendo bien',
      signalFreshLabel: 'Inicio nuevo',
      signalFreshCopy: 'Estas en una fase temprana, y eso esta bien. Empieza con la guia principal del rol y luego se iran construyendo los workflows de producto mas fuertes.',
      signalFreshShort: 'Primer impulso, listo para crecer',
      actionResumeTitle: 'Retomar la ultima leccion',
      actionResumeCopy: 'Retoma desde {lesson} y manten el ritmo de aprendizaje.',
      actionExploreTitle: 'Explorar Academy',
      actionExploreCopy: 'Recorre todos los cursos, guias y contenidos visibles por rol en un solo lugar.',
      actionSimulatorTitle: 'Simulador de senal',
      actionSimulatorCopy: 'Esboza planos, prueba obstaculos y da al equipo una forma mas visual de hablar sobre cobertura.',
      actionQaTitle: 'Revisar hallazgos de QA',
      actionQaCopy: 'Abre el tablero interno de QA con bugs, capturas y hallazgos de seguridad listos para el equipo de software.',
      actionComplianceTitle: 'Revisar cumplimiento del equipo',
      actionComplianceCopy: 'Ve quien ha empezado, completado o sigue pendiente de su formacion obligatoria.',
      actionSearchTitle: 'Buscar formacion rapido',
      actionSearchCopy: 'Salta directamente a lecciones, productos y guias cuando necesites una respuesta rapida.',
      categorySoftwareTag: 'Workflows de OneCloud',
      categorySoftwareCopy: 'Gana confianza en la interfaz, las alertas, la jerarquia y los flujos operativos reales.',
      categorySoftwareFooter: 'Guias centradas en software',
      categoryHardwareTag: 'Hardware Predictor',
      categoryHardwareCopy: 'Aprende instalacion, dispositivos, pasarelas y las decisiones fisicas que importan en sitio.',
      categoryHardwareFooter: 'Guias de hardware de campo',
      categorySalesTag: 'Mensajeria comercial',
      categorySalesCopy: 'Convierte la capacidad del producto en conversaciones mas fuertes con clientes y un valor de negocio mas claro.',
      categorySalesFooter: 'Apoyo comercial',
      categoryDraftsTag: 'Revision de borrador',
      categoryDraftsCopy: 'Material inicial de revision capturado desde nuevas formaciones y trabajo de iteracion de Academy.',
      categoryDraftsFooter: 'Contenido interno en borrador',
      categoryDefaultTag: 'Guia Academy',
      categoryDefaultCopy: 'Orientacion por rol empaquetada en un formato Academy mas limpio y compartible.',
      categoryDefaultFooter: 'Contenido Academy',
    },
    de: {
      academyKicker: 'PestSense Academy',
      greetingMorning: 'Guten Morgen',
      greetingAfternoon: 'Guten Tag',
      greetingEvening: 'Guten Abend',
      heroTitleSuffix: ', lernen Sie fur smarteren Schutz.',
      heroCopySuffix: ' Lassen Sie OneCloud, Predictor und die Academy zusammenarbeiten, damit Ihr Team schon vor dem Einsatz Bescheid weiss.',
      pillOne: 'Predictor + OneCloud',
      pillTwo: 'Digitale Schadlingskontrolle',
      pillThree: 'Vor dem Einsatz Bescheid wissen',
      coverage: 'Abdeckung',
      coverageNote: 'Auf Ihr Zugriffslevel abgestimmt',
      momentum: 'Dynamik',
      momentumNote: 'Verfolgt sowohl Lesen als auch Video-Sitzungen',
      outcome: 'Ergebnis',
      outcomeNote: 'Klarer Fortschritt, den das Team nachvollziehen kann',
      learningSignal: 'Lernsignal',
      platformPillars: 'Plattform-Saulen',
      roleReadyCourses: 'rollengerechte Kurse',
      lessonsInMotion: 'Lektionen in Bewegung',
      completionsLogged: 'protokollierte Abschlusse',
      roleLabels: {
        TECHNICIAN: 'Techniker',
        SITE_MANAGER: 'Standortleiter',
        BUSINESS_ADMIN: 'Business-Admin',
        SUPER_ADMIN: 'Super-Admin',
      },
      roleDescriptions: {
        TECHNICIAN: 'Aussendiensttechniker — praktische Schulung zu Geraten und Standorten.',
        SITE_MANAGER: 'Standortubersicht, Berichte und Teamsteuerung.',
        BUSINESS_ADMIN: 'Vollstandige Business-Administration und Plattformkontrolle.',
        SUPER_ADMIN: 'PestSense intern — voller Plattformzugang.',
      },
      availableLessons: 'Verfugbare Lektionen',
      completed: 'Abgeschlossen',
      completedLower: 'abgeschlossen',
      role: 'Rolle',
      pillarRiskTitle: 'Risikomanagement',
      pillarRiskCopy: 'Schulen Sie das Team darin, Probleme fruher zu erkennen und sicherer zu reagieren.',
      pillarProductivityTitle: 'Produktivitat',
      pillarProductivityCopy: 'Nutzen Sie Einrichtungs-, Service- und Simulator-Tools, um Mutmassungen im Feld zu verringern.',
      pillarDataTitle: 'Daten und Analytik',
      pillarDataCopy: 'Bringen Sie Lernen, Warnungen und QA-Nachweise in einen gemeinsamen Arbeitsrhythmus.',
      metricCoursesTitle: 'Kurse fur Ihre Rolle',
      metricCoursesDetail: 'Nach Sichtbarkeit und veroffentlichtem Status kuratiert',
      metricStartedTitle: 'Begonnene Lektionen',
      metricStartedDetail: 'Jede geoffnete Lektion oder angesehenes Video zahlt hier',
      metricCompletedTitle: 'Abgeschlossene Lektionen',
      metricCompletedDetail: 'Explizite Abschlusse und Video-Schwellenwerte werden protokolliert',
      metricProgressTitle: 'Fortschrittssignal',
      learningPathTitle: 'Ihr Lernpfad',
      learningPathCopy: 'Rollenbezogenes Lernen, das zu der Art passt, wie PestSense tatsachlich arbeitet.',
      browseAll: 'Alle ansehen',
      noRoleCourses: 'Fur Ihre Rolle sind noch keine Kurse sichtbar.',
      lessonSingular: 'Lektion',
      lessonPlural: 'Lektionen',
      openGuide: 'Leitfaden offnen',
      continueLearningTitle: 'Weiterlernen',
      nothingStartedTitle: 'Noch nichts begonnen',
      nothingStartedCopy: 'Beginnen Sie mit einem Rollenleitfaden, dann zeigt das Dashboard hier Ihren Lernverlauf an.',
      exploreCourses: 'Kurse erkunden',
      lastActiveLabel: 'Zuletzt aktiv',
      quickActionsTitle: 'Schnellaktionen',
      bestNextMove: 'Bester nachster Schritt',
      bestNextMoveFallback: 'Dieser Kurs ist auf Basis Ihrer Rolle und Ihres aktuellen Fortschritts der klarste nachste Schritt.',
      featuredStarted: 'Begonnen',
      featuredCompleted: 'Abgeschlossen',
      featuredRemaining: 'Verbleibend',
      courseStatusReady: 'Bereit zum Start',
      courseStatusInProgress: 'In Bearbeitung',
      courseStatusCompleted: 'Abgeschlossen',
      signalStrongLabel: 'Starkes Signal',
      signalStrongCopy: 'Sie haben bereits eine solide Schulungsbasis. Jetzt ist ein guter Zeitpunkt, tiefer in fortgeschrittene Workflows und Teamfuhrung einzusteigen.',
      signalStrongShort: 'Starker Fortschritt auf Ihrem aktuellen Lernpfad',
      signalBuildingLabel: 'Guter Aufbau',
      signalBuildingCopy: 'Das Fundament steht. Bleiben Sie auf dem aktuellen Pfad, dann zeigt das Dashboard die nachsten sinnvollen Schritte weiter an.',
      signalBuildingShort: 'Das Lernsignal baut sich gut auf',
      signalFreshLabel: 'Frischer Start',
      signalFreshCopy: 'Sie stehen noch am Anfang, und das ist in Ordnung. Beginnen Sie mit dem zentralen Rollenleitfaden, dann bauen sich die wichtigsten Produkt-Workflows darauf auf.',
      signalFreshShort: 'Erste Dynamik, bereit zum Aufbau',
      actionResumeTitle: 'Letzte Lektion fortsetzen',
      actionResumeCopy: 'Machen Sie bei {lesson} weiter und halten Sie den Lernfluss aufrecht.',
      actionExploreTitle: 'Academy erkunden',
      actionExploreCopy: 'Durchsuchen Sie alle sichtbaren Kurse, Leitfaden und rollenbasierten Inhalte an einem Ort.',
      actionSimulatorTitle: 'Signalsimulator',
      actionSimulatorCopy: 'Skizzieren Sie Layouts, testen Sie Hindernisse und geben Sie dem Team eine visuellere Sprache fur Abdeckung.',
      actionQaTitle: 'QA-Erkenntnisse prufen',
      actionQaCopy: 'Offnen Sie das interne QA-Board mit Bugs, Screenshots und Sicherheitsbefunden fur die Software-Leads.',
      actionComplianceTitle: 'Team-Compliance prufen',
      actionComplianceCopy: 'Sehen Sie, wer die Pflichtschulung begonnen, abgeschlossen oder noch offen hat.',
      actionSearchTitle: 'Schulung schnell suchen',
      actionSearchCopy: 'Springen Sie direkt zu Lektionen, Produkten und Hinweisen, wenn Sie schnell eine Antwort brauchen.',
      categorySoftwareTag: 'OneCloud-Workflows',
      categorySoftwareCopy: 'Bauen Sie Sicherheit im Interface, bei Warnungen, Hierarchie und praktischen Betriebsablaufen auf.',
      categorySoftwareFooter: 'Software-orientierte Leitfaden',
      categoryHardwareTag: 'Predictor-Hardware',
      categoryHardwareCopy: 'Lernen Sie Installation, Gerate, Gateways und die physischen Entscheidungen, die vor Ort wirklich zahlen.',
      categoryHardwareFooter: 'Hardware-Leitfaden fur das Feld',
      categorySalesTag: 'Vertriebsbotschaften',
      categorySalesCopy: 'Ubersetzen Sie Produktfahigkeiten in starkere Kundengesprach und klareren Geschaftswert.',
      categorySalesFooter: 'Vertriebsunterstutzung',
      categoryDraftsTag: 'Entwurfsprufung',
      categoryDraftsCopy: 'Fruhes Prufmaterial aus neuen Schulungsinhalten und Academy-Iterationsarbeit.',
      categoryDraftsFooter: 'Interner Entwurfsinhalt',
      categoryDefaultTag: 'Academy-Leitfaden',
      categoryDefaultCopy: 'Rollenbezogene Anleitung in einem saubereren und besser teilbaren Academy-Format.',
      categoryDefaultFooter: 'Academy-Inhalt',
    },
  } as const

  return copy[locale]
}
