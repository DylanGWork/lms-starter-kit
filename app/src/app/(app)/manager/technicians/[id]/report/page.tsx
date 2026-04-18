import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MANAGER_ROLES } from '@/types'
import type { Role } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { name: true } })
  return { title: user ? `Training Record — ${user.name}` : 'Training Record' }
}

function fmt(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function TechnicianReportPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !MANAGER_ROLES.includes(session.user.role as Role)) redirect('/dashboard')

  const tech = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      progress: { include: { lesson: true } },
      videoProgress: true,
      loginEvents: { orderBy: { loginAt: 'desc' }, take: 1 },
    },
  })

  if (!tech || !['TECHNICIAN', 'SITE_MANAGER'].includes(tech.role)) notFound()

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
                select: { id: true, title: true, videoUrl: true },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  const progressByLesson = new Map(tech.progress.map(p => [p.lessonId, p]))
  const videoByLesson = new Map(tech.videoProgress.map(v => [v.lessonId, v]))

  const requiredRows = requirements.map(req => {
    const lessons = req.course.modules.flatMap(m => m.lessons)
    const completed = lessons.filter(l => progressByLesson.get(l.id)?.completed).length
    const isFullyComplete = completed === lessons.length && lessons.length > 0
    return { course: req.course, lessons, completed, isFullyComplete, notes: req.notes }
  })

  const allCompliant = requiredRows.length > 0 && requiredRows.every(r => r.isFullyComplete)
  const reportDate = fmt(new Date())

  return (
    <html>
      <head>
        <title>{`Training Record — ${tech.name}`}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: white; padding: 32px; font-size: 13px; }
          h1 { font-size: 22px; font-weight: 800; margin-bottom: 2px; }
          h2 { font-size: 14px; font-weight: 700; margin: 20px 0 8px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          h3 { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #002400; }
          .logo { font-size: 18px; font-weight: 800; color: #002400; letter-spacing: -0.5px; }
          .logo span { color: #018902; }
          .meta { text-align: right; font-size: 11px; color: #6b7280; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
          .badge-green { background: #dcfce7; color: #15803d; }
          .badge-red { background: #fee2e2; color: #dc2626; }
          .badge-amber { background: #fef3c7; color: #b45309; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
          .info-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
          .info-card .label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
          .info-card .value { font-size: 14px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
          td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; font-size: 12px; }
          .check { color: #16a34a; font-weight: 700; }
          .cross { color: #dc2626; }
          .partial { color: #d97706; }
          .course-block { margin-bottom: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
          .course-header { padding: 8px 12px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px; } @page { margin: 1cm; } }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div>
            <div className="logo">PestSense <span>Academy</span></div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Training Compliance Record</div>
          </div>
          <div className="meta">
            <div>Report generated: {reportDate}</div>
            <div style={{ marginTop: '4px' }}>
              <span className={`badge ${allCompliant ? 'badge-green' : requiredRows.length === 0 ? '' : 'badge-red'}`}>
                {allCompliant ? '✓ COMPLIANT' : requiredRows.length === 0 ? 'No requirements set' : '✗ INCOMPLETE'}
              </span>
            </div>
          </div>
        </div>

        {/* Technician info */}
        <div className="info-grid">
          <div className="info-card">
            <div className="label">Name</div>
            <div className="value">{tech.name}</div>
          </div>
          <div className="info-card">
            <div className="label">Role</div>
            <div className="value">{tech.role.charAt(0) + tech.role.slice(1).toLowerCase().replace('_', ' ')}</div>
          </div>
          <div className="info-card">
            <div className="label">Last login</div>
            <div className="value">{tech.loginEvents[0] ? fmt(tech.loginEvents[0].loginAt) : 'Never'}</div>
          </div>
        </div>

        {/* Required training */}
        <h2>Required Training</h2>
        {requiredRows.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '12px' }}>No required courses assigned for this role.</p>
        ) : (
          requiredRows.map(row => (
            <div key={row.course.id} className="course-block">
              <div className="course-header">
                <strong style={{ fontSize: '13px' }}>{row.course.title}</strong>
                <span className={`badge ${row.isFullyComplete ? 'badge-green' : row.completed > 0 ? 'badge-amber' : 'badge-red'}`}>
                  {row.isFullyComplete ? `✓ Complete` : `${row.completed}/${row.lessons.length} lessons`}
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Lesson</th>
                    <th>Status</th>
                    <th>Completed</th>
                    <th>Video watched</th>
                  </tr>
                </thead>
                <tbody>
                  {row.lessons.map(lesson => {
                    const lp = progressByLesson.get(lesson.id)
                    const vp = lesson.videoUrl ? videoByLesson.get(lesson.id) : null
                    return (
                      <tr key={lesson.id}>
                        <td>{lesson.title}</td>
                        <td>
                          {lp?.completed ? (
                            <span className="check">✓ Completed</span>
                          ) : lp?.started ? (
                            <span className="partial">In progress</span>
                          ) : (
                            <span className="cross">Not started</span>
                          )}
                        </td>
                        <td>{fmt(lp?.completedAt)}</td>
                        <td>{vp ? `${Math.round(vp.percentWatched)}%` : lesson.videoUrl ? '0%' : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}

        {/* Summary */}
        <h2>Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Required</th>
              <th>Lessons complete</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requiredRows.map(row => (
              <tr key={row.course.id}>
                <td><strong>{row.course.title}</strong></td>
                <td>Yes</td>
                <td>{row.completed} of {row.lessons.length}</td>
                <td>
                  <span className={`badge ${row.isFullyComplete ? 'badge-green' : row.completed > 0 ? 'badge-amber' : 'badge-red'}`}>
                    {row.isFullyComplete ? 'Complete' : row.completed > 0 ? 'In progress' : 'Not started'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer">
          <span>PestSense Academy — Confidential training record for {tech.name}</span>
          <span>pestsense.com.au</span>
        </div>

        <script dangerouslySetInnerHTML={{ __html: 'window.onload = function() { window.print(); }' }} />
      </body>
    </html>
  )
}
