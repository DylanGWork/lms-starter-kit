import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, BookOpen, Upload, FileText, Bug, ArrowRight, ClipboardCheck, LifeBuoy } from 'lucide-react'
import { qaStats } from '@/lib/qa-review-data'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Admin Overview' }

export default async function AdminPage() {
  const [userCount, courseCount, lessonCount, assetCount, publishedLessons, draftLessons] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.asset.count(),
    prisma.lesson.count({ where: { status: 'PUBLISHED' } }),
    prisma.lesson.count({ where: { status: 'DRAFT' } }),
  ])

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Admin Overview</h1>
        <p className="text-gray-500 font-jakarta">Manage content, users, and assets for PestSense Academy.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active users', value: userCount, icon: <Users className="w-5 h-5" />, href: '/admin/users', color: 'blue' },
          { label: 'Courses', value: courseCount, icon: <BookOpen className="w-5 h-5" />, href: '/admin/content/courses', color: 'green' },
          { label: 'Lessons', value: lessonCount, icon: <FileText className="w-5 h-5" />, href: '/admin/content/lessons', color: 'purple' },
          { label: 'Assets', value: assetCount, icon: <Upload className="w-5 h-5" />, href: '/admin/assets', color: 'orange' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="card p-4 hover:shadow-md transition-shadow group block">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${getColorClass(stat.color)}`}>
              {stat.icon}
            </div>
            <div className="font-geologica font-black text-2xl text-gray-900 group-hover:text-green-700 transition-colors">{stat.value}</div>
            <div className="text-xs text-gray-500 font-jakarta mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Add user', href: '/admin/users?action=create', icon: <Users className="w-4 h-4" /> },
          { label: 'New lesson', href: '/admin/content/lessons?action=create', icon: <FileText className="w-4 h-4" /> },
          { label: 'Upload asset', href: '/admin/assets?action=upload', icon: <Upload className="w-4 h-4" /> },
          { label: 'Localization queue', href: '/admin/localization', icon: <FileText className="w-4 h-4" /> },
          { label: 'Guide blueprint', href: '/admin/content/guides', icon: <ClipboardCheck className="w-4 h-4" /> },
          { label: 'Team help', href: '/manager/help', icon: <LifeBuoy className="w-4 h-4" /> },
          { label: 'QA review board', href: '/admin/qa', icon: <Bug className="w-4 h-4" /> },
        ].map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-jakarta font-semibold text-sm transition-all"
            style={{ backgroundColor: '#002400', color: '#61ce70', border: '1px solid #61ce70' }}
          >
            {action.icon}
            {action.label}
          </Link>
        ))}
      </div>

      <div className="mb-8 rounded-[28px] border border-red-200 bg-gradient-to-r from-red-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-red-700 mb-3">
              <Bug className="w-3.5 h-3.5" />
              QA Review Board
            </div>
            <h2 className="font-geologica font-bold text-xl text-gray-900">Training evidence now has a home in the Academy</h2>
            <p className="mt-2 text-sm font-jakarta text-gray-600 max-w-3xl">
              The latest walkthrough produced {qaStats.openFindings} active findings, including {qaStats.criticalFindings} P0 security issue
              around the live device feed. Open the board to see screenshots, impact explanations, and the best next checks for engineering.
            </p>
          </div>

          <Link
            href="/admin/qa"
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-jakarta font-semibold transition-colors"
            style={{ backgroundColor: '#002400', color: '#61ce70', border: '1px solid #61ce70' }}
          >
            Open QA board
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="mb-8 rounded-[28px] border border-green-200 bg-gradient-to-r from-green-50 to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-jakarta font-semibold uppercase tracking-[0.18em] text-green-700 mb-3">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Course Consistency
            </div>
            <h2 className="font-geologica font-bold text-xl text-gray-900">New training drops can become draft courses automatically</h2>
            <p className="mt-2 text-sm font-jakarta text-gray-600 max-w-3xl">
              The Guide Blueprint now defines the Academy house style and the raw-video import workflow, so future training uploads can land as structured draft courses instead of starting from a blank page.
            </p>
          </div>

          <Link
            href="/admin/content/guides"
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-jakarta font-semibold transition-colors"
            style={{ backgroundColor: '#002400', color: '#61ce70', border: '1px solid #61ce70' }}
          >
            Open guide blueprint
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content status */}
        <div className="card p-5">
          <h2 className="font-geologica font-bold text-lg text-gray-900 mb-4">Content status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-jakarta text-gray-600">Published lessons</span>
              <span className="badge bg-green-100 text-green-800">{publishedLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-jakarta text-gray-600">Draft lessons</span>
              <span className="badge bg-yellow-100 text-yellow-800">{draftLessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-jakarta text-gray-600">Total lessons</span>
              <span className="badge bg-gray-100 text-gray-600">{lessonCount}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/admin/content/lessons" className="text-sm font-jakarta font-medium hover:underline" style={{ color: '#018902' }}>
              Manage lessons →
            </Link>
          </div>
        </div>

        {/* Recent users */}
        <div className="card p-5">
          <h2 className="font-geologica font-bold text-lg text-gray-900 mb-4">Recent users</h2>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-jakarta flex-shrink-0"
                  style={{ backgroundColor: '#002400', color: '#61ce70' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-jakarta font-medium text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-400 font-jakarta truncate">{user.email}</div>
                </div>
                <span className="badge bg-gray-100 text-gray-500 text-xs">{user.role}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/admin/users" className="text-sm font-jakarta font-medium hover:underline" style={{ color: '#018902' }}>
              Manage users →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function getColorClass(color: string) {
  const map: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return map[color] || 'bg-gray-50 text-gray-700'
}
