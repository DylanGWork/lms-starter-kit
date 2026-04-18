import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Shield, BookOpen, CheckSquare, Square } from 'lucide-react'
import { ADMIN_ROLES } from '@/types'
import type { Role } from '@/types'
import { RequirementToggle } from './RequirementToggle'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Required Training' }

const ROLE_LABELS: Record<string, string> = {
  TECHNICIAN: 'Technician',
  SITE_MANAGER: 'Site Manager',
}

const TARGET_ROLES = ['TECHNICIAN', 'SITE_MANAGER'] as const

export default async function RequirementsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) redirect('/dashboard')

  const [courses, requirements] = await Promise.all([
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true, modules: { include: { lessons: { where: { status: 'PUBLISHED' }, select: { id: true } } } } },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    }),
    prisma.courseRequirement.findMany(),
  ])

  // Set of "courseId:role" for quick lookup
  const reqSet = new Set(requirements.map(r => `${r.courseId}:${r.role}`))

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-sm font-jakarta text-gray-400 hover:text-gray-600">Admin</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-jakarta text-gray-700">Required Training</span>
        </div>
        <h1 className="font-geologica font-black text-2xl md:text-3xl text-gray-900 mb-1">Required Training</h1>
        <p className="text-gray-500 font-jakarta text-sm">
          Mark courses as mandatory for specific roles. Managers can track compliance against these requirements.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-sm font-jakarta text-gray-500">
        <span className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-green-600" /> Required for role</span>
        <span className="flex items-center gap-1.5"><Square className="w-4 h-4 text-gray-300" /> Not required</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="text-left px-4 py-3 text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wider">Lessons</th>
                {TARGET_ROLES.map(role => (
                  <th key={role} className="text-center px-4 py-3 text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map(course => {
                const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0)
                return (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />
                        <div>
                          <div className="text-sm font-jakarta font-medium text-gray-900">{course.title}</div>
                          <div className="text-xs font-jakarta text-gray-400">{course.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-jakarta text-gray-500 tabular-nums">{lessonCount}</td>
                    {TARGET_ROLES.map(role => {
                      const isRequired = reqSet.has(`${course.id}:${role}`)
                      const existingNotes = requirements.find(r => r.courseId === course.id && r.role === role)?.notes
                      return (
                        <td key={role} className="px-4 py-3 text-center">
                          <RequirementToggle
                            courseId={course.id}
                            role={role}
                            isRequired={isRequired}
                            notes={existingNotes || ''}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs font-jakarta text-gray-400">
        Changes take effect immediately. View compliance status at{' '}
        <Link href="/manager" className="text-green-700 hover:underline">Team Compliance →</Link>
      </p>
    </div>
  )
}
