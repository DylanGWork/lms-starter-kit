import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, Clock, ChevronRight, Calculator, FileText, TrendingUp, BarChart2, DollarSign, ClipboardList } from 'lucide-react'
import type { Role } from '@/types'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

export default async function SalesHubPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const role = session.user.role as Role
  if (!ADMIN_ROLES.includes(role)) redirect('/dashboard')

  const salesCourses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      category: { slug: 'sales' },
      roleVisibility: { some: { role } },
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      modules: {
        include: {
          lessons: { where: { status: 'PUBLISHED' }, select: { id: true } },
        },
      },
    },
  })

  const tools = [
    {
      href: '/sales/calculators/customer-fit',
      title: 'Customer Fit Calculator',
      description: 'Score a prospect across industry, compliance, and risk factors. Get a Fit Score and recommendation before investing sales time.',
      icon: <ClipboardList className="w-5 h-5" />,
      color: '#61ce70',
    },
    {
      href: '/sales/calculators/business-model',
      title: 'Business Model A/B Calculator',
      description: 'Compare traditional vs digital service model costs over 3 years. The most powerful tool for breaking through the "too expensive" objection.',
      icon: <BarChart2 className="w-5 h-5" />,
      color: '#018902',
      badge: 'Most Used',
    },
    {
      href: '/sales/calculators/risk-impact',
      title: 'Stock-Loss / Risk Impact Tool',
      description: 'Quantify the financial risk of a pest incident for a specific customer. Compare risk exposure to PestSense cost.',
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#006300',
    },
    {
      href: '/sales/calculators/proposal',
      title: 'Proposal Summary Generator',
      description: 'Enter site details and device count to generate a formatted pricing summary ready for your proposal document.',
      icon: <DollarSign className="w-5 h-5" />,
      color: '#002400',
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="rounded-2xl p-8 mb-8 text-white" style={{ background: 'linear-gradient(135deg, #002400 0%, #006300 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-7 h-7" style={{ color: '#61ce70' }} />
          <h1 className="font-geologica font-black text-3xl">Sales &amp; Commercial Enablement</h1>
        </div>
        <p className="font-jakarta text-green-100 text-lg max-w-2xl">
          Everything you need to identify the right customers, build a compelling business case, and close digital pest control opportunities with confidence.
        </p>
        <div className="flex gap-6 mt-5 font-jakarta text-sm text-green-200">
          <span>📚 {salesCourses.length} courses</span>
          <span>🧮 4 interactive tools</span>
          <span>📋 Templates &amp; playbooks</span>
        </div>
      </div>

      {/* Sales Tools */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-geologica font-bold text-xl text-gray-900">Sales Tools</h2>
          <Link href="/sales/templates" className="text-sm font-jakarta text-green-700 hover:text-green-900 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Templates &amp; Playbooks
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="card p-5 hover:shadow-md transition-all group block border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: tool.color }}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-jakarta font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span className="text-xs font-jakarta font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#61ce70' }}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-jakarta">{tool.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-geologica font-bold text-xl text-gray-900">Sales Courses</h2>
          <Link href="/learn/sales" className="text-sm font-jakarta text-green-700 hover:text-green-900 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {salesCourses.map(course => {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
            return (
              <Link
                key={course.id}
                href={`/learn/sales/${course.slug}`}
                className="card p-5 hover:shadow-md transition-all group block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-jakarta font-semibold text-gray-900 group-hover:text-green-700 transition-colors flex-1">
                    {course.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0 mt-0.5" />
                </div>
                {course.description && (
                  <p className="text-sm text-gray-500 font-jakarta mb-3 line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 font-jakarta">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                  </span>
                  {course.estimatedMins && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{course.estimatedMins} min
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
