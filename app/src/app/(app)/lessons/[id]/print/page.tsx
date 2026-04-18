import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PrintControls } from './PrintControls'
import { getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } })
  return { title: `${lesson?.title || 'Lesson'} — Print` }
}

export default async function LessonPrintPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)

  const lesson = await prisma.lesson.findFirst({
    where: { id: params.id, status: 'PUBLISHED' },
    include: {
      module: {
        include: {
          course: { include: { category: true } },
        },
      },
      assets: {
        include: { asset: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!lesson) notFound()

  const imageAssets = lesson.assets.filter(la => la.asset.type === 'IMAGE')
  const downloadAssets = lesson.assets.filter(la => ['PDF', 'DOCUMENT'].includes(la.asset.type))
  const course = lesson.module.course

  return (
    <div className="print-page">
      {/* Screen-only toolbar */}
      <PrintControls
        lessonTitle={lesson.title}
        lessonHref={withLocalePrefix(locale, `/lessons/${lesson.id}`)}
        backLabel={messages.lesson.backToLesson}
        printLabel={messages.lesson.print}
      />

      {/* Printable content */}
      <div className="print-body max-w-[780px] mx-auto px-8 py-8 bg-white">
        {/* Header */}
        <div className="print-header mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-jakarta">
            <span>{course.category.name}</span>
            <span>›</span>
            <span>{course.title}</span>
            <span>›</span>
            <span>{lesson.module.title}</span>
          </div>
          <h1 className="font-geologica font-black text-3xl text-gray-900 mb-2 leading-tight">
            {lesson.title}
          </h1>
          {lesson.summary && (
            <p className="text-gray-600 font-jakarta text-base leading-relaxed">{lesson.summary}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-jakarta">
            <span>PestSense Academy</span>
            {lesson.version && <span>Version {lesson.version}</span>}
            {lesson.lastReviewedAt && (
              <span>Last reviewed {new Date(lesson.lastReviewedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
          </div>
        </div>

        {/* Video note — show when there's a video but print can't play it */}
        {lesson.videoUrl && (
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-jakarta text-blue-800 print-video-note">
            <strong>Video available:</strong> This lesson includes a training video.
            Visit <span className="font-mono text-xs">{`/lessons/${lesson.id}`}</span> in the academy to watch it online.
          </div>
        )}

        {/* Image frames from video — show as a thumbnail strip */}
        {imageAssets.filter(la => la.asset.sourceVideoId).length > 0 && (
          <div className="mb-6">
            <h3 className="font-jakarta font-semibold text-gray-700 text-sm mb-2 uppercase tracking-wide">Video screenshots</h3>
            <div className="grid grid-cols-3 gap-3">
              {imageAssets.filter(la => la.asset.sourceVideoId).map(la => (
                <div key={la.id} className="rounded border border-gray-200 overflow-hidden">
                  <img
                    src={la.asset.url}
                    alt={la.label || la.asset.title || ''}
                    className="w-full object-cover"
                  />
                  {(la.label || la.asset.title) && (
                    <div className="px-2 py-1 text-xs text-gray-500 font-jakarta bg-gray-50">{la.label || la.asset.title}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-frame images */}
        {imageAssets.filter(la => !la.asset.sourceVideoId).map(la => (
          <div key={la.id} className="mb-6">
            {la.label && <h3 className="font-jakarta font-semibold text-gray-700 mb-2">{la.label}</h3>}
            <img
              src={la.asset.url}
              alt={la.label || la.asset.title || lesson.title}
              className="w-full max-w-lg rounded border border-gray-200"
            />
          </div>
        ))}

        {/* Main written content */}
        {lesson.content && (
          <div
            className="lesson-content"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )}

        {/* Downloads */}
        {downloadAssets.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-jakarta font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Related documents</h3>
            <ul className="space-y-1 text-sm font-jakarta text-gray-600">
              {downloadAssets.map(la => (
                <li key={la.id}>{la.label || la.asset.title || la.asset.originalName}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-400 font-jakarta flex justify-between">
          <span>PestSense Academy — {course.title}</span>
          <span>Printed from pestsense.com/academy</span>
        </div>
      </div>
    </div>
  )
}
