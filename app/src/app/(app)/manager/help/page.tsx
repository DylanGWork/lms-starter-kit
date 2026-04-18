import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Bug,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LifeBuoy,
  Monitor,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MANAGER_ROLES } from '@/types'
import type { Role } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Team Help' }

const LMS_COURSE_SLUGS = [
  'using-pestsense-academy-as-a-manager',
  'pestsense-academy-admin-playbook',
  'site-manager-basics',
] as const

export default async function ManagerHelpPage() {
  const session = await getServerSession(authOptions)
  if (!session || !MANAGER_ROLES.includes(session.user.role as Role)) redirect('/dashboard')

  const role = session.user.role as Role
  const isAdmin = ['BUSINESS_ADMIN', 'SUPER_ADMIN'].includes(role)

  const courses = await prisma.course.findMany({
    where: {
      slug: { in: [...LMS_COURSE_SLUGS] },
      status: 'PUBLISHED',
      roleVisibility: { some: { role } },
    },
    include: {
      category: true,
      modules: {
        include: {
          lessons: { where: { status: 'PUBLISHED' }, select: { id: true } },
        },
      },
    },
  })

  const courseBySlug = new Map(courses.map((course) => [course.slug, course]))

  const roleGuide = [
    {
      role: 'Site Manager',
      canDo: [
        'Track team compliance and see who has started or completed required training',
        'Open individual technician training records and printable reports',
        'Use the internal help area and manager-facing LMS courses',
      ],
      cannotDo: [
        'Set required training rules for everyone',
        'Manage users, QA board, or content publishing workflows',
      ],
    },
    {
      role: 'Business Admin',
      canDo: [
        'Everything a Site Manager can do',
        'Mark courses as required for technicians or site managers',
        'Manage content, QA review, users, and Academy operations',
      ],
      cannotDo: [
        'Nothing significant beyond standard role restrictions',
      ],
    },
    {
      role: 'Super Admin',
      canDo: [
        'Everything a Business Admin can do',
        'Use the Academy as the full internal operating surface for content and QA',
      ],
      cannotDo: [
        'No platform-level LMS restrictions inside the Academy',
      ],
    },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="rounded-[32px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-emerald-700 mb-4">
          <LifeBuoy className="w-3.5 h-3.5" />
          Internal Help
        </div>
        <h1 className="font-geologica font-black text-3xl text-gray-900 mb-2">Team Help</h1>
        <p className="max-w-4xl text-gray-600 font-jakarta">
          This is the internal help surface for managers and admins using the PestSense Academy itself. It pulls together the LMS workflows,
          the supporting training courses, and the common “what do I do next?” tasks for your team.
        </p>
      </header>

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Browse learning',
            href: '/learn',
            icon: <GraduationCap className="w-5 h-5" />,
            description: 'See the courses available to your current role.',
            enabled: true,
          },
          {
            label: 'Track compliance',
            href: '/manager',
            icon: <ClipboardCheck className="w-5 h-5" />,
            description: 'Review technician progress and individual training records.',
            enabled: true,
          },
          {
            label: 'Required training',
            href: '/admin/requirements',
            icon: <Shield className="w-5 h-5" />,
            description: isAdmin ? 'Set role-based mandatory courses.' : 'Admins use this to set role-based mandatory courses.',
            enabled: isAdmin,
          },
          {
            label: 'QA review',
            href: '/admin/qa',
            icon: <Bug className="w-5 h-5" />,
            description: isAdmin ? 'Open the internal review board for evidence and bugs.' : 'Admins use this for QA evidence and bug review.',
            enabled: isAdmin,
          },
        ].map((item) => (
          item.enabled ? (
            <Link
              key={item.label}
              href={item.href}
              className="card p-5 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-700">
                {item.icon}
              </div>
              <div className="mt-4 font-geologica font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                {item.label}
              </div>
              <p className="mt-2 text-sm font-jakarta text-gray-500">{item.description}</p>
            </Link>
          ) : (
            <div
              key={item.label}
              className="rounded-[28px] border border-dashed border-gray-200 bg-gray-50 p-5 opacity-80"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white text-gray-400">
                {item.icon}
              </div>
              <div className="mt-4 font-geologica font-bold text-lg text-gray-700">{item.label}</div>
              <p className="mt-2 text-sm font-jakarta text-gray-500">{item.description}</p>
            </div>
          )
        ))}
      </section>

      <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Start Here</h2>
          </div>
          <div className="space-y-3 text-sm font-jakarta text-gray-600">
            <p>
              <strong className="text-gray-900">If you manage people:</strong> open <Link href="/manager" className="text-emerald-700 hover:underline">Team Compliance</Link> first.
              That shows who is fully compliant, in progress, or has not started.
            </p>
            <p>
              <strong className="text-gray-900">If you need to set expectations:</strong>{' '}
              {isAdmin ? (
                <>
                  use <Link href="/admin/requirements" className="text-emerald-700 hover:underline">Required Training</Link> to mark courses as mandatory by role.
                </>
              ) : (
                <>ask a Business Admin or Super Admin to set the role-based mandatory courses for your team.</>
              )}
            </p>
            <p>
              <strong className="text-gray-900">If you are coaching your own team:</strong> point customer-facing managers to the strengthened
              <Link href={`/learn/software/${courseBySlug.get('site-manager-basics')?.slug ?? 'site-manager-basics'}`} className="text-emerald-700 hover:underline"> Site Manager Basics</Link> course.
            </p>
            <p>
              <strong className="text-gray-900">If you are running internal Academy operations:</strong>{' '}
              {isAdmin ? (
                <>use the QA board, content area, and guide blueprint so training and evidence stay in one place.</>
              ) : (
                <>work with an admin when you need QA, content, or required-training changes made inside the Academy.</>
              )}
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Who Can Do What</h2>
          </div>
          <div className="space-y-4">
            {roleGuide.map((entry) => (
              <div key={entry.role} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="font-jakarta font-semibold text-gray-900 mb-2">{entry.role}</div>
                <div className="text-xs font-jakarta font-semibold uppercase tracking-[0.14em] text-emerald-700 mb-1">Can do</div>
                <ul className="space-y-1 text-sm font-jakarta text-gray-600">
                  {entry.canDo.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <div className="text-xs font-jakarta font-semibold uppercase tracking-[0.14em] text-gray-500 mt-3 mb-1">Not for this role</div>
                <ul className="space-y-1 text-sm font-jakarta text-gray-500">
                  {entry.cannotDo.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h2 className="font-geologica font-bold text-xl text-gray-900">Internal LMS Training</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            {
              slug: 'using-pestsense-academy-as-a-manager',
              fallbackTitle: 'Using PestSense Academy as a Manager',
              fallbackDescription: 'How to track training, understand compliance, and coach your team in the LMS.',
            },
            {
              slug: 'pestsense-academy-admin-playbook',
              fallbackTitle: 'PestSense Academy Admin Playbook',
              fallbackDescription: 'How admins manage required training, content, QA, and Academy operations.',
            },
            {
              slug: 'site-manager-basics',
              fallbackTitle: 'Site Manager Basics',
              fallbackDescription: 'The customer-facing manager course for reviewing activity, reports, and what to escalate.',
            },
          ]
            .filter((entry) => courseBySlug.has(entry.slug))
            .map((entry) => {
              const course = courseBySlug.get(entry.slug)!
              const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0)
              return (
                <Link
                  key={entry.slug}
                  href={`/learn/${course.category.slug}/${course.slug}`}
                  className="rounded-3xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="text-xs font-jakarta uppercase tracking-[0.16em] text-gray-400">{course.category.name}</div>
                  <div className="mt-2 font-geologica font-bold text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {course.title || entry.fallbackTitle}
                  </div>
                  <p className="mt-2 text-sm font-jakarta text-gray-500">
                    {course.description || entry.fallbackDescription}
                  </p>
                  <div className="mt-4 text-xs font-jakarta text-gray-400">
                    {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                  </div>
                </Link>
              )
            })}
        </div>
      </section>

      <section className="grid xl:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-emerald-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Common Internal Tasks</h2>
          </div>
          <ol className="space-y-3 text-sm font-jakarta text-gray-600">
            <li>
              <strong className="text-gray-900">Set training expectations:</strong>{' '}
              {isAdmin ? (
                <>
                  open <Link href="/admin/requirements" className="text-emerald-700 hover:underline">Required Training</Link> and mark courses mandatory for `TECHNICIAN` or `SITE_MANAGER`.
                </>
              ) : (
                <>ask a Business Admin or Super Admin to update the required courses for `TECHNICIAN` or `SITE_MANAGER`.</>
              )}
            </li>
            <li>
              <strong className="text-gray-900">Check progress:</strong> managers open
              <Link href="/manager" className="text-emerald-700 hover:underline"> Team Compliance</Link> to see who is compliant and who needs attention.
            </li>
            <li>
              <strong className="text-gray-900">Review one person in detail:</strong> drill into an individual technician record and print a report when needed.
            </li>
            <li>
              <strong className="text-gray-900">Improve training itself:</strong>{' '}
              {isAdmin ? (
                <>
                  use <Link href="/admin/content/guides" className="text-emerald-700 hover:underline">Guide Blueprint</Link> and the content tools to keep the Academy consistent.
                </>
              ) : (
                <>capture the issue or idea, then pass it to an admin so the guide blueprint and Academy content stay consistent.</>
              )}
            </li>
          </ol>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Where To Send People</h2>
          </div>
          <div className="space-y-3 text-sm font-jakarta text-gray-600">
            <p>
              <strong className="text-gray-900">Technicians</strong>: start them with <span className="font-semibold text-gray-900">Technician Getting Started</span>.
            </p>
            <p>
              <strong className="text-gray-900">Customer managers</strong>: send them to <Link href={`/learn/software/${courseBySlug.get('site-manager-basics')?.slug ?? 'site-manager-basics'}`} className="text-emerald-700 hover:underline">Site Manager Basics</Link>.
            </p>
            <p>
              <strong className="text-gray-900">Internal managers</strong>: use the new manager LMS course as the operating guide for compliance tracking and coaching.
            </p>
            <p>
              <strong className="text-gray-900">Admins</strong>: use the admin playbook plus the QA board and content tools as the internal operating manual.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
