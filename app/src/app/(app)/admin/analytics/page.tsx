import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Monitor, Smartphone, Tablet, Users, BookOpen, PlayCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics' }

function pct(n: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

function timeAgo(date: Date | null) {
  if (!date) return 'Never'
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return 'Just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 86400 * 7) return `${Math.floor(secs / 86400)}d ago`
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function fmtDuration(secs: number) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !['SUPER_ADMIN', 'BUSINESS_ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const now = new Date()
  const day7 = new Date(now.getTime() - 7 * 86400_000)
  const day30 = new Date(now.getTime() - 30 * 86400_000)

  // ── Summary counts ──────────────────────────────────────────────────────────
  const [
    totalUsers,
    activeUsers7d,
    activeUsers30d,
    totalLessonStarts,
    totalLessonCompletions,
    totalVideoCompletions,
    totalCourses,
    totalLessons,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { lastLoginAt: { gte: day7 } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: day30 } } }),
    prisma.lessonProgress.count({ where: { started: true } }),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.videoProgress.count({ where: { completed: true } }),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.lesson.count({ where: { status: 'PUBLISHED' } }),
  ])

  // ── Device breakdown ────────────────────────────────────────────────────────
  const loginEvents = await prisma.loginEvent.groupBy({
    by: ['deviceType'],
    _count: { id: true },
  })
  const totalLogins = loginEvents.reduce((s, e) => s + e._count.id, 0)
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 }
  for (const e of loginEvents) {
    const k = (e.deviceType || 'desktop') as keyof typeof deviceCounts
    deviceCounts[k] = (deviceCounts[k] || 0) + e._count.id
  }

  // ── Logins per day (last 14 days) ───────────────────────────────────────────
  const day14 = new Date(now.getTime() - 14 * 86400_000)
  const recentLogins = await prisma.loginEvent.findMany({
    where: { loginAt: { gte: day14 } },
    select: { loginAt: true },
    orderBy: { loginAt: 'asc' },
  })
  const loginsByDay: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400_000)
    loginsByDay[d.toISOString().slice(0, 10)] = 0
  }
  for (const ev of recentLogins) {
    const key = ev.loginAt.toISOString().slice(0, 10)
    if (key in loginsByDay) loginsByDay[key]++
  }
  const loginDays = Object.entries(loginsByDay)
  const maxLoginDay = Math.max(1, ...loginDays.map(([, v]) => v))

  // ── Most popular lessons ────────────────────────────────────────────────────
  const topLessons = await prisma.lessonProgress.groupBy({
    by: ['lessonId'],
    _count: { id: true },
    where: { started: true },
    orderBy: { _count: { id: 'desc' } },
    take: 8,
  })
  const topLessonIds = topLessons.map(l => l.lessonId)
  const topLessonDetails = await prisma.lesson.findMany({
    where: { id: { in: topLessonIds } },
    select: { id: true, title: true, videoUrl: true },
  })
  const topLessonCompletions = await prisma.lessonProgress.groupBy({
    by: ['lessonId'],
    _count: { id: true },
    where: { completed: true, lessonId: { in: topLessonIds } },
  })
  const completionMap = Object.fromEntries(topLessonCompletions.map(l => [l.lessonId, l._count.id]))
  const titleMap = Object.fromEntries(topLessonDetails.map(l => [l.id, { title: l.title, hasVideo: !!l.videoUrl }]))

  // ── Video engagement ────────────────────────────────────────────────────────
  const videoStats = await prisma.videoProgress.aggregate({
    _avg: { percentWatched: true },
    _count: { id: true },
  })
  const videoByLesson = await prisma.videoProgress.groupBy({
    by: ['lessonId'],
    _avg: { percentWatched: true },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  })
  const videoLessonIds = videoByLesson.map(v => v.lessonId)
  const videoLessonTitles = await prisma.lesson.findMany({
    where: { id: { in: videoLessonIds } },
    select: { id: true, title: true },
  })
  const videoTitleMap = Object.fromEntries(videoLessonTitles.map(l => [l.id, l.title]))

  // ── Course completion rates ──────────────────────────────────────────────────
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true, title: true,
      modules: {
        select: {
          lessons: {
            where: { status: 'PUBLISHED' },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
  const allLessonIds = courses.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => l.id)))
  const completionsByCourse = await prisma.lessonProgress.groupBy({
    by: ['lessonId'],
    _count: { id: true },
    where: { completed: true, lessonId: { in: allLessonIds } },
  })
  const completionsByLessonId = Object.fromEntries(completionsByCourse.map(c => [c.lessonId, c._count.id]))

  // ── User activity table ──────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, email: true, role: true, lastLoginAt: true, createdAt: true,
      progress: { select: { completed: true, started: true } },
      loginEvents: { orderBy: { loginAt: 'desc' }, take: 1, select: { deviceType: true, loginAt: true } },
      videoProgress: { select: { percentWatched: true, completed: true } },
    },
    orderBy: { lastLoginAt: { sort: 'desc', nulls: 'last' } },
    take: 50,
  })

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin', BUSINESS_ADMIN: 'Admin',
    SITE_MANAGER: 'Manager', TECHNICIAN: 'Tech',
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-geologica font-black text-2xl text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Platform usage, engagement, and learner progress</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Users', value: totalUsers, sub: `${activeUsers7d} active this week`, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Lessons Started', value: totalLessonStarts, sub: `${totalLessonCompletions} completed`, icon: BookOpen, color: 'bg-green-50 text-green-600' },
          { label: 'Videos Completed', value: totalVideoCompletions, sub: videoStats._avg.percentWatched ? `${Math.round(videoStats._avg.percentWatched)}% avg watched` : 'No data yet', icon: PlayCircle, color: 'bg-purple-50 text-purple-600' },
          { label: 'Completion Rate', value: totalLessonStarts ? `${Math.round((totalLessonCompletions / totalLessonStarts) * 100)}%` : '—', sub: `${totalCourses} courses, ${totalLessons} lessons`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 font-jakarta">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 font-geologica">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1 font-jakarta">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Device breakdown + Login chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Device breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-jakarta font-semibold text-gray-800 mb-4 text-sm">Login Devices</h2>
          {totalLogins === 0 ? (
            <p className="text-sm text-gray-400 font-jakarta">No login data yet — logins after this update will be tracked.</p>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'desktop', label: 'Desktop', icon: Monitor, color: 'bg-blue-500' },
                { key: 'mobile', label: 'Mobile', icon: Smartphone, color: 'bg-green-500' },
                { key: 'tablet', label: 'Tablet', icon: Tablet, color: 'bg-purple-500' },
              ].map(({ key, label, icon: Icon, color }) => {
                const count = deviceCounts[key as keyof typeof deviceCounts] || 0
                const width = totalLogins > 0 ? Math.round((count / totalLogins) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-jakarta text-gray-600">{label}</span>
                      </div>
                      <span className="text-xs font-jakarta font-medium text-gray-700">{count} ({pct(count, totalLogins)})</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-gray-400 font-jakarta pt-1">{totalLogins} total login events recorded</p>
            </div>
          )}
        </div>

        {/* Logins per day chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-jakarta font-semibold text-gray-800 text-sm">Daily Logins (last 14 days)</h2>
            <span className="text-xs text-gray-400 font-jakarta">{activeUsers7d} users last 7d · {activeUsers30d} last 30d</span>
          </div>
          {totalLogins === 0 ? (
            <p className="text-sm text-gray-400 font-jakarta">No login data yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-28">
              {loginDays.map(([date, count]) => {
                const barH = Math.round((count / maxLoginDay) * 100)
                const label = new Date(date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1" title={`${label}: ${count} logins`}>
                    <div className="w-full flex items-end justify-center" style={{ height: 96 }}>
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${Math.max(barH, count > 0 ? 8 : 2)}%`,
                          backgroundColor: count > 0 ? '#61ce70' : '#e5e7eb',
                        }}
                      />
                    </div>
                    <span className="text-gray-400 font-jakarta" style={{ fontSize: 9, writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Most popular lessons + Video engagement ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top lessons */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-jakarta font-semibold text-gray-800 mb-4 text-sm">Most Started Lessons</h2>
          {topLessons.length === 0 ? (
            <p className="text-sm text-gray-400 font-jakarta">No lesson activity yet.</p>
          ) : (
            <div className="space-y-2">
              {topLessons.map(({ lessonId, _count }) => {
                const info = titleMap[lessonId]
                const completions = completionMap[lessonId] || 0
                const compRate = Math.round((completions / _count.id) * 100)
                return (
                  <div key={lessonId} className="flex items-center gap-3 py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-jakarta font-medium text-gray-800 truncate">
                        {info?.hasVideo && <PlayCircle className="w-3 h-3 inline mr-1 text-purple-400" />}
                        {info?.title || lessonId}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${compRate}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-jakarta whitespace-nowrap">{completions}/{_count.id} done</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Video engagement */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-jakarta font-semibold text-gray-800 mb-4 text-sm">Video Engagement</h2>
          {videoByLesson.length === 0 ? (
            <p className="text-sm text-gray-400 font-jakarta">No video watch data yet — data is collected as learners watch videos.</p>
          ) : (
            <div className="space-y-3">
              {videoByLesson.map(v => {
                const pctW = Math.round(v._avg.percentWatched || 0)
                return (
                  <div key={v.lessonId}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-jakarta text-gray-700 truncate flex-1 mr-2">{videoTitleMap[v.lessonId] || v.lessonId}</p>
                      <span className="text-xs font-jakarta font-semibold text-gray-600 whitespace-nowrap">{pctW}% avg · {v._count.id} viewers</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pctW}%`,
                          backgroundColor: pctW >= 80 ? '#22c55e' : pctW >= 50 ? '#61ce70' : pctW >= 30 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Course completion rates ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-jakarta font-semibold text-gray-800 mb-4 text-sm">Course Completion Rates</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-jakarta">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium pb-2 pr-4">Course</th>
                <th className="text-right text-gray-500 font-medium pb-2 px-2">Lessons</th>
                <th className="text-right text-gray-500 font-medium pb-2 px-2">Total Completions</th>
                <th className="text-left text-gray-500 font-medium pb-2 pl-4 w-40">Progress</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => {
                const lessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id))
                const totalCompletions = lessonIds.reduce((s, id) => s + (completionsByLessonId[id] || 0), 0)
                const maxPossible = lessonIds.length * totalUsers
                const fillPct = maxPossible > 0 ? Math.min(100, Math.round((totalCompletions / maxPossible) * 100)) : 0
                return (
                  <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-800 font-medium">{course.title}</td>
                    <td className="py-2 px-2 text-right text-gray-500">{lessonIds.length}</td>
                    <td className="py-2 px-2 text-right text-gray-500">{totalCompletions}</td>
                    <td className="py-2 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${fillPct}%` }} />
                        </div>
                        <span className="text-gray-400 whitespace-nowrap">{fillPct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── User activity table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-jakarta font-semibold text-gray-800 text-sm">Learner Activity</h2>
          <p className="text-xs text-gray-400 font-jakarta mt-0.5">Last 50 users by recent login</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-jakarta">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-gray-500 font-medium px-4 py-2.5">Name</th>
                <th className="text-left text-gray-500 font-medium px-3 py-2.5">Role</th>
                <th className="text-left text-gray-500 font-medium px-3 py-2.5">Last Login</th>
                <th className="text-left text-gray-500 font-medium px-3 py-2.5">Device</th>
                <th className="text-right text-gray-500 font-medium px-3 py-2.5">Lessons</th>
                <th className="text-right text-gray-500 font-medium px-3 py-2.5">Completed</th>
                <th className="text-right text-gray-500 font-medium px-4 py-2.5">Videos Watched</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const started = user.progress.filter(p => p.started).length
                const completed = user.progress.filter(p => p.completed).length
                const videosWatched = user.videoProgress.filter(v => v.completed).length
                const lastDevice = user.loginEvents[0]?.deviceType || null
                const DeviceIcon = lastDevice === 'mobile' ? Smartphone : lastDevice === 'tablet' ? Tablet : Monitor
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded text-gray-600 bg-gray-100">{roleLabel[user.role] || user.role}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{timeAgo(user.lastLoginAt)}</td>
                    <td className="px-3 py-2.5">
                      {lastDevice ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <DeviceIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">{lastDevice}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{started}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={completed > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>{completed}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={videosWatched > 0 ? 'text-purple-600 font-medium' : 'text-gray-400'}>{videosWatched > 0 ? videosWatched : '—'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
