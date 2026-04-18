import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { STATUS_COLORS, ROLE_LABELS } from '@/types'
import type { ContentStatus, Role } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Courses' }

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    include: {
      category: true,
      roleVisibility: true,
      _count: { select: { modules: true } },
    },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Courses</h1>
          <p className="text-gray-500 font-jakarta">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/content/courses/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New course
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Course</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Roles</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Modules</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-jakarta font-medium text-gray-900">{course.title}</div>
                  {course.description && (
                    <div className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1">{course.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-jakarta text-gray-600">{course.category.name}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {course.roleVisibility.map(rv => (
                      <span key={rv.role} className="badge bg-gray-100 text-gray-500 text-xs">
                        {ROLE_LABELS[rv.role as Role].split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[course.status as ContentStatus]}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-gray-500 font-jakarta">{course._count.modules}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/content/courses/${course.id}`} className="text-gray-400 hover:text-gray-700 transition-colors">
                    <Edit className="w-4 h-4" />
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
