import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Layers, FileText, FolderOpen, ClipboardCheck, Upload } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Content Management' }

export default async function ContentPage() {
  const [categories, courses, modules, lessons] = await Promise.all([
    prisma.category.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.lesson.count(),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Content Management</h1>
        <p className="text-gray-500 font-jakarta">Create and manage your training content hierarchy.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          {
            href: '/admin/content/categories',
            label: 'Categories',
            count: categories,
            desc: 'Top-level groupings like Software, Hardware, Sales',
            icon: <FolderOpen className="w-6 h-6" />,
            color: 'bg-orange-50 text-orange-600',
          },
          {
            href: '/admin/content/courses',
            label: 'Courses',
            count: courses,
            desc: 'Full courses within each category',
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-green-50 text-green-600',
          },
          {
            href: '/admin/content/modules',
            label: 'Modules',
            count: modules,
            desc: 'Chapter-level groupings within courses',
            icon: <Layers className="w-6 h-6" />,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            href: '/admin/content/lessons',
            label: 'Lessons',
            count: lessons,
            desc: 'Individual lessons — content, video, assets',
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-purple-50 text-purple-600',
          },
          {
            href: '/admin/content/guides',
            label: 'Guide Blueprint',
            count: 'Rules',
            desc: 'Shared structure, screenshot standards, and writing rules for consistent lessons',
            icon: <ClipboardCheck className="w-6 h-6" />,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            href: '/admin/content/guides',
            label: 'Video Imports',
            count: 'Auto',
            desc: 'Turn dropped training videos into draft courses, lessons, and review assets',
            icon: <Upload className="w-6 h-6" />,
            color: 'bg-sky-50 text-sky-600',
          },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="card p-5 hover:shadow-md transition-shadow group flex items-start gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <h2 className="font-jakarta font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{item.label}</h2>
                <span className="text-lg font-geologica font-black text-gray-700">{item.count}</span>
              </div>
              <p className="text-sm text-gray-500 font-jakarta">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 card p-5">
        <h2 className="font-geologica font-bold text-lg text-gray-900 mb-2">Content workflow</h2>
        <p className="text-sm text-gray-600 font-jakarta mb-4">Recommended order for adding new training content:</p>
        <ol className="space-y-2 text-sm font-jakarta text-gray-600">
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">1</span> Create or select a Category</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">2</span> Create a Course within that category and assign roles</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">3</span> Create Modules within the course</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">4</span> Use the Guide Blueprint to keep section order, visuals, and wording consistent</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">5</span> Upload assets or import raw training videos into draft courses</li>
          <li className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">6</span> Refine lessons, attach screenshots, review QA issues, then publish</li>
        </ol>
      </div>
    </div>
  )
}
