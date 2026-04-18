import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, CheckCircle, FileText, Download, ArrowLeft, ArrowRight, Calendar, Tag, Printer } from 'lucide-react'
import { MarkCompleteButton } from '@/components/lessons/MarkCompleteButton'
import { VideoPlayer } from '@/components/lessons/VideoPlayer'
import { LessonModuleNav } from '@/components/lessons/LessonModuleNav'
import { formatDate, formatFileSize } from '@/lib/utils'
import { getIntlLocale, getLocaleMessages, getRequestLocale, withLocalePrefix } from '@/lib/i18n/server'
import { replaceInlineAssetUrls, resolveAssetVariant, resolveCategory, resolveCourse, resolveLesson, resolveModule } from '@/lib/i18n/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } })
  return { title: lesson?.title || 'Lesson' }
}

export default async function LessonPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const locale = getRequestLocale()
  const messages = getLocaleMessages(locale)
  const intlLocale = getIntlLocale(locale)

  const lesson = await prisma.lesson.findFirst({
    where: { id: params.id, status: 'PUBLISHED' },
    include: {
      locales: {
        where: { locale, status: 'PUBLISHED' },
      },
      module: {
        include: {
          course: {
            include: {
              locales: {
                where: { locale, status: 'PUBLISHED' },
              },
              category: {
                include: {
                  locales: {
                    where: { locale, status: 'PUBLISHED' },
                  },
                },
              },
            },
          },
          locales: {
            where: { locale, status: 'PUBLISHED' },
          },
          lessons: {
            where: { status: 'PUBLISHED' },
            orderBy: { sortOrder: 'asc' },
            include: {
              locales: {
                where: { locale, status: 'PUBLISHED' },
              },
            },
          },
        },
      },
      assets: {
        include: {
          asset: {
            include: {
              tags: { include: { tag: true } },
              variants: {
                where: { locale, status: 'PUBLISHED' },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      tags: { include: { tag: true } },
    },
  })

  if (!lesson) notFound()
  const localizedCategory = resolveCategory(lesson.module.course.category, locale)
  const localizedCourse = resolveCourse({ ...lesson.module.course, category: localizedCategory }, locale)
  const localizedModule = {
    ...resolveModule(lesson.module, locale),
    course: localizedCourse,
    lessons: lesson.module.lessons.map((moduleLesson) => resolveLesson(moduleLesson, locale)),
  }

  const localizedAssets = lesson.assets.map((lessonAsset) => ({
    ...lessonAsset,
    asset: resolveAssetVariant(lessonAsset.asset, locale),
  }))

  const inlineAssetMap = new Map<string, string>()
  lesson.assets.forEach((lessonAsset, index) => {
    const localizedAsset = localizedAssets[index]?.asset
    if (localizedAsset && localizedAsset.url !== lessonAsset.asset.url) {
      inlineAssetMap.set(lessonAsset.asset.url, localizedAsset.url)
    }
  })

  const localizedLesson = {
    ...resolveLesson(lesson, locale, inlineAssetMap),
    module: localizedModule,
    assets: localizedAssets,
  }

  // Track progress — mark as started
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
    update: { lastViewedAt: new Date(), started: true },
    create: {
      userId: session.user.id,
      lessonId: lesson.id,
      started: true,
      startedAt: new Date(),
    },
  })

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
  })

  // Next/prev navigation within module
  const lessonIndex = localizedModule.lessons.findIndex(l => l.id === lesson.id)
  const prevLesson = lessonIndex > 0 ? localizedModule.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < localizedModule.lessons.length - 1 ? localizedModule.lessons[lessonIndex + 1] : null

  // Split assets by type
  const videoAssets = localizedAssets.filter(la => la.asset.type === 'VIDEO')
  const imageAssets = localizedAssets.filter(la => la.asset.type === 'IMAGE')
  const downloadAssets = localizedAssets.filter(la => ['PDF', 'DOCUMENT', 'OTHER', 'SUBTITLE', 'AUDIO'].includes(la.asset.type))

  const course = localizedCourse
  const subtitleTracks = localizedLesson.subtitleUrl
    ? [{ src: localizedLesson.subtitleUrl, srcLang: locale, label: messages.lesson.subtitles, default: true }]
    : []

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400 font-jakarta mb-4 md:mb-6 flex-wrap">
        <Link href={withLocalePrefix(locale, '/learn')} className="hover:text-gray-600">{messages.learn.coursesCrumb}</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href={withLocalePrefix(locale, `/learn/${course.category.slug}/${course.slug}`)} className="hover:text-gray-600 truncate max-w-[120px] md:max-w-none">{course.title}</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-gray-700 truncate max-w-[120px] md:max-w-none">{localizedLesson.title}</span>
      </nav>

      <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">

          {/* Title block */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="font-geologica font-black text-xl md:text-2xl text-gray-900 leading-tight">{localizedLesson.title}</h1>
              {progress?.completed && (
                <span className="flex items-center gap-1 text-xs md:text-sm font-jakarta text-green-700 bg-green-50 px-2 py-1 rounded-full shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" /> {messages.lesson.completed}
                </span>
              )}
            </div>
            {localizedLesson.summary && (
              <p className="text-gray-600 font-jakarta leading-relaxed text-sm md:text-base">{localizedLesson.summary}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-jakarta">
              {localizedLesson.lastReviewedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {messages.lesson.updated} {formatDate(localizedLesson.lastReviewedAt, intlLocale)}
                </span>
              )}
              {localizedLesson.version && <span>v{localizedLesson.version}</span>}
            </div>
          </div>

          {/* Primary video (from lesson.videoUrl) */}
          {localizedLesson.videoUrl && (
            <VideoPlayer
              url={localizedLesson.videoUrl}
              provider={localizedLesson.videoProvider}
              title={localizedLesson.title}
              lessonId={localizedLesson.id}
              poster={localizedLesson.posterUrl}
              subtitleTracks={subtitleTracks}
            />
          )}
          {localizedLesson.subtitleUrl && ['youtube', 'vimeo'].includes(localizedLesson.videoProvider || '') && (
            <div className="flex items-center justify-end">
              <a
                href={localizedLesson.subtitleUrl}
                className="text-sm font-jakarta text-emerald-700 hover:text-emerald-800"
                target="_blank"
                rel="noreferrer"
              >
                {messages.lesson.openTranscriptDownload}
              </a>
            </div>
          )}

          {/* Additional video assets */}
          {videoAssets.map(la => (
            <div key={la.id}>
              {la.label && (
                <h3 className="font-jakarta font-semibold text-gray-700 mb-2 text-sm md:text-base">{la.label}</h3>
              )}
              <VideoPlayer
                url={la.asset.url}
                provider="local"
                title={la.label || la.asset.title || localizedLesson.title}
                lessonId={localizedLesson.id}
              />
            </div>
          ))}

          {/* Written content */}
          {localizedLesson.content && (
            <div
              className="lesson-content card p-4 md:p-6"
              dangerouslySetInnerHTML={{ __html: localizedLesson.content }}
            />
          )}

          {/* Images */}
          {imageAssets.length > 0 && (
            <div>
              <h3 className="font-jakarta font-semibold text-gray-700 mb-3 text-sm md:text-base">{messages.lesson.images}</h3>
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                {imageAssets.map(la => (
                  <div key={la.id} className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={la.asset.url}
                      alt={la.label || la.asset.title || lesson.title}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    {(la.label || la.asset.title) && (
                      <div className="px-3 py-2 text-xs text-gray-500 font-jakarta bg-gray-50">
                        {la.label || la.asset.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloads */}
          {downloadAssets.length > 0 && (
            <div>
              <h3 className="font-jakarta font-semibold text-gray-700 mb-3 text-sm md:text-base">{messages.lesson.downloads}</h3>
              <div className="space-y-2">
                {downloadAssets.map(la => (
                  <a
                    key={la.id}
                    href={la.asset.url}
                    download={la.asset.originalName}
                    className="flex items-center gap-3 card p-3 hover:shadow-md transition-shadow group"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 shrink-0">
                      {la.asset.type === 'PDF' ? (
                        <FileText className="w-5 h-5 text-red-500" />
                      ) : (
                        <Download className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-jakarta font-medium text-gray-900 group-hover:text-green-700 transition-colors truncate">
                        {la.label || la.asset.title || la.asset.originalName}
                      </div>
                      <div className="text-xs text-gray-400 font-jakarta">
                        {la.asset.type} · {formatFileSize(la.asset.size)}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {lesson.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              {lesson.tags.map(lt => (
                <span key={lt.tagId} className="badge bg-gray-100 text-gray-600">{lt.tag.name}</span>
              ))}
            </div>
          )}

          {/* Mark complete + Print */}
          <div className="card p-4 md:p-5 space-y-3">
            <MarkCompleteButton
              lessonId={lesson.id}
              isCompleted={progress?.completed || false}
            />
            <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
              <Link
                href={withLocalePrefix(locale, `/lessons/${localizedLesson.id}/print`)}
                className="flex items-center gap-2 text-sm font-jakarta text-gray-500 hover:text-gray-900 transition-colors"
                target="_blank"
              >
                <Printer className="w-4 h-4" />
                {messages.lesson.print}
              </Link>
              <span className="text-xs text-gray-400 font-jakarta">{messages.lesson.printCopy}</span>
            </div>
          </div>

          {/* Prev / next navigation */}
          <div className="flex items-center justify-between pt-1 pb-4">
            {prevLesson ? (
              <Link
                href={withLocalePrefix(locale, `/lessons/${prevLesson.id}`)}
                className="flex items-center gap-2 text-sm font-jakarta text-gray-600 hover:text-green-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline truncate max-w-[180px]">{prevLesson.title}</span>
                <span className="sm:hidden">{messages.lesson.previous}</span>
              </Link>
            ) : <div />}
            {nextLesson ? (
              <Link
                href={withLocalePrefix(locale, `/lessons/${nextLesson.id}`)}
                className="flex items-center gap-2 text-sm font-jakarta text-gray-600 hover:text-green-700 transition-colors"
              >
                <span className="hidden sm:inline truncate max-w-[180px]">{nextLesson.title}</span>
                <span className="sm:hidden">{messages.lesson.next}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Sidebar — module lesson list */}
        <div className="lg:col-span-1 order-first lg:order-none">
          <div className="lg:sticky lg:top-4">
            <LessonModuleNav
              currentLessonId={localizedLesson.id}
              moduleTitle={localizedModule.title}
              lessons={localizedModule.lessons}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
