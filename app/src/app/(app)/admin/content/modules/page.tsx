import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { STATUS_COLORS } from '@/types'
import type { ContentStatus } from '@/types'
import { ModuleForm } from '@/components/admin/ModuleForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Modules' }

export default async function AdminModulesPage({
  searchParams,
}: {
  searchParams: { action?: string; courseId?: string }
}) {
  const [modules, courses] = await Promise.all([
    prisma.module.findMany({
      orderBy: [{ course: { category: { sortOrder: 'asc' } } }, { course: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        course: { include: { category: true } },
        _count: { select: { lessons: true } },
      },
    }),
    prisma.course.findMany({
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { category: true },
    }),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Modules</h1>
          <p className="text-gray-500 font-jakarta">{modules.length} module{modules.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/content/modules?action=create" className="btn-primary">
          <Plus className="w-4 h-4" />
          New module
        </Link>
      </div>

      {searchParams.action === 'create' && (
        <div className="card p-6 mb-6">
          <h2 className="font-geologica font-bold text-lg text-gray-900 mb-4">Create new module</h2>
          <ModuleForm
            courses={courses.map(c => ({
              id: c.id,
              label: `${c.category.name} > ${c.title}`,
            }))}
            defaultCourseId={searchParams.courseId}
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Module</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Course</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Lessons</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {modules.map(mod => (
              <tr key={mod.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-jakarta font-medium text-gray-900">{mod.title}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-400 font-jakarta">{mod.course.category.name}</div>
                  <div className="text-sm font-jakarta text-gray-700">{mod.course.title}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[mod.status as ContentStatus]}`}>
                    {mod.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-gray-500 font-jakarta">{mod._count.lessons}</span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/content/lessons?moduleId=${mod.id}`}
                    className="text-xs font-jakarta text-gray-400 hover:text-gray-700"
                  >
                    View lessons
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
