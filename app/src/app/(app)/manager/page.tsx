import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, CheckCircle, AlertCircle, Clock, Monitor, Smartphone, Tablet, ChevronRight, LifeBuoy } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MANAGER_ROLES } from '@/types'
import type { Role } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Team Compliance' }

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor className="w-3.5 h-3.5" />,
  mobile: <Smartphone className="w-3.5 h-3.5" />,
  tablet: <Tablet className="w-3.5 h-3.5" />,
}

export default async function ManagerPage() {
  const session = await getServerSession(authOptions)
  if (!session || !MANAGER_ROLES.includes(session.user.role as Role)) redirect('/dashboard')

  // Required courses per role
  const requirements = await prisma.courseRequirement.findMany({
    include: { course: { include: { modules: { include: { lessons: { where: { status: 'PUBLISHED' }, select: { id: true } } } } } } },
  })

  // All technicians + site managers (people this view covers)
  const technicians = await prisma.user.findMany({
    where: { role: { in: ['TECHNICIAN', 'SITE_MANAGER'] }, isActive: true },
    orderBy: { name: 'asc' },
    include: {
      progress: { where: { completed: true }, select: { lessonId: true } },
      loginEvents: { orderBy: { loginAt: 'desc' }, take: 1, select: { loginAt: true, deviceType: true } },
    },
  })

  // Build required lesson IDs per role
  const requiredLessonIdsByRole: Record<string, string[]> = {}
  for (const req of requirements) {
    const lessonIds = req.course.modules.flatMap(m => m.lessons.map(l => l.id))
    if (!requiredLessonIdsByRole[req.role]) requiredLessonIdsByRole[req.role] = []
    requiredLessonIdsByRole[req.role].push(...lessonIds)
  }

  // Compute compliance per technician
  const techRows = technicians.map(t => {
    const required = requiredLessonIdsByRole[t.role] || []
    const completedIds = new Set(t.progress.map(p => p.lessonId))
    const completedRequired = required.filter(id => completedIds.has(id)).length
    const totalRequired = required.length
    const lastLogin = t.loginEvents[0]

    let status: 'compliant' | 'partial' | 'not_started' | 'no_requirements' = 'no_requirements'
    if (totalRequired > 0) {
      if (completedRequired === totalRequired) status = 'compliant'
      else if (completedRequired > 0) status = 'partial'
      else status = 'not_started'
    }

    return { ...t, completedRequired, totalRequired, status, lastLogin }
  })

  const compliantCount = techRows.filter(t => t.status === 'compliant').length
  const partialCount = techRows.filter(t => t.status === 'partial').length
  const notStartedCount = techRows.filter(t => t.status === 'not_started').length

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-geologica font-black text-2xl md:text-3xl text-gray-900 mb-1">Team Compliance</h1>
        <p className="text-gray-500 font-jakarta text-sm">Track which technicians have completed their required training.</p>
      </div>

      <div className="mb-6 rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-3">
              <LifeBuoy className="w-3.5 h-3.5" />
              Team Help
            </div>
            <h2 className="font-geologica font-bold text-xl text-gray-900">Need help using the LMS?</h2>
            <p className="mt-2 text-sm font-jakarta text-gray-600 max-w-3xl">
              The new Team Help area explains how managers and admins use the Academy, where required training is controlled,
              and which courses your customer managers should take first.
            </p>
          </div>

          <Link
            href="/manager/help"
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-jakarta font-semibold transition-colors"
            style={{ backgroundColor: '#002400', color: '#61ce70', border: '1px solid #61ce70' }}
          >
            Open Team Help
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="font-geologica font-black text-2xl text-green-700">{compliantCount}</div>
          <div className="text-xs font-jakarta text-gray-500 mt-0.5">Fully compliant</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-geologica font-black text-2xl text-amber-600">{partialCount}</div>
          <div className="text-xs font-jakarta text-gray-500 mt-0.5">In progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="font-geologica font-black text-2xl text-red-600">{notStartedCount}</div>
          <div className="text-xs font-jakarta text-gray-500 mt-0.5">Not started</div>
        </div>
      </div>

      {requirements.length === 0 && (
        <div className="card p-6 text-center text-gray-500 font-jakarta text-sm mb-6">
          No required courses set yet.{' '}
          <Link href="/admin/requirements" className="text-green-700 font-medium hover:underline">
            Set up required courses →
          </Link>
        </div>
      )}

      {/* Technician table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-jakarta font-semibold text-sm text-gray-700">Team members ({techRows.length})</span>
        </div>

        {techRows.length === 0 ? (
          <div className="p-6 text-center text-gray-400 font-jakarta text-sm">No technicians found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {techRows.map(t => (
              <Link
                key={t.id}
                href={`/manager/technicians/${t.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-jakarta shrink-0"
                  style={{ backgroundColor: '#002400', color: '#61ce70' }}>
                  {t.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <div className="font-jakarta font-medium text-sm text-gray-900 truncate">{t.name}</div>
                  <div className="text-xs text-gray-400 font-jakarta">{t.role.charAt(0) + t.role.slice(1).toLowerCase().replace('_', ' ')}</div>
                </div>

                {/* Compliance status */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  {t.totalRequired === 0 ? (
                    <span className="text-xs font-jakarta text-gray-400">No requirements</span>
                  ) : (
                    <>
                      <StatusBadge status={t.status} />
                      <span className="text-xs font-jakarta text-gray-500 tabular-nums">
                        {t.completedRequired}/{t.totalRequired} lessons
                      </span>
                    </>
                  )}
                </div>

                {/* Last login */}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 font-jakarta shrink-0">
                  {t.lastLogin ? (
                    <>
                      {DEVICE_ICONS[t.lastLogin.deviceType || 'desktop'] || DEVICE_ICONS.desktop}
                      {formatDate(t.lastLogin.loginAt)}
                    </>
                  ) : (
                    <span>Never logged in</span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'compliant') return (
    <span className="flex items-center gap-1 text-xs font-jakarta font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
      <CheckCircle className="w-3 h-3" /> Compliant
    </span>
  )
  if (status === 'partial') return (
    <span className="flex items-center gap-1 text-xs font-jakarta font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> In progress
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-jakarta font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" /> Not started
    </span>
  )
}
