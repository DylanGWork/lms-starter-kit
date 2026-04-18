import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Eye } from 'lucide-react'
import { STATUS_COLORS } from '@/types'
import type { ContentStatus } from '@/types'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Lessons' }

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string }
}) {
  const lessons = await prisma.lesson.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status as ContentStatus } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      module: {
        include: {
          course: {
            include: { category: true },
          },
        },
      },
      _count: { select: { assets: true, progress: true } },
    },
    take: 100,
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Lessons</h1>
          <p className="text-gray-500 font-jakarta">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/content/lessons/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New lesson
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map(status => (
          <Link
            key={status}
            href={status ? `/admin/content/lessons?status=${status}` : '/admin/content/lessons'}
            className={`badge px-3 py-1.5 text-xs font-jakarta cursor-pointer hover:opacity-80 ${
              (searchParams.status || '') === status
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {status || 'All'}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Lesson</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Course</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Assets</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lessons.map(lesson => (
              <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-jakarta font-medium text-gray-900">{lesson.title}</div>
                  {lesson.summary && (
                    <div className="text-xs text-gray-400 font-jakarta mt-0.5 line-clamp-1">{lesson.summary}</div>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="text-xs text-gray-500 font-jakarta">{lesson.module.course.category.name}</div>
                  <div className="text-sm font-jakarta text-gray-700">{lesson.module.course.title}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[lesson.status as ContentStatus]}`}>
                    {lesson.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-gray-500 font-jakarta">{lesson._count.assets}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs text-gray-400 font-jakarta">{formatDate(lesson.updatedAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/lessons/${lesson.id}`} className="text-gray-400 hover:text-gray-700 transition-colors" title="Preview">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/content/lessons/${lesson.id}`} className="text-gray-400 hover:text-gray-700 transition-colors" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-jakarta">
                  No lessons found.{' '}
                  <Link href="/admin/content/lessons/new" className="underline" style={{ color: '#018902' }}>Create one</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
