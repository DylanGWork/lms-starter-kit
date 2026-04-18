import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LessonEditor } from '@/components/admin/LessonEditor'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (params.id === 'new') return { title: 'New Lesson' }
  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } })
  return { title: lesson ? `Edit: ${lesson.title}` : 'Lesson Not Found' }
}

export default async function AdminLessonEditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new'

  const [lesson, modules, assets] = await Promise.all([
    isNew ? null : prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        assets: {
          include: { asset: true },
          orderBy: { sortOrder: 'asc' },
        },
        tags: { include: { tag: true } },
        module: { include: { course: { include: { category: true } } } },
      },
    }),
    prisma.module.findMany({
      orderBy: [{ course: { category: { sortOrder: 'asc' } } }, { course: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { course: { include: { category: true } } },
    }),
    prisma.asset.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, originalName: true, type: true, url: true, size: true },
    }),
  ])

  if (!isNew && !lesson) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-geologica font-black text-2xl text-gray-900 mb-6">
        {isNew ? 'Create new lesson' : `Edit: ${lesson?.title}`}
      </h1>
      <LessonEditor
        lesson={lesson ? {
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary || '',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          videoProvider: lesson.videoProvider || 'youtube',
          status: lesson.status,
          version: lesson.version || '1.0',
          moduleId: lesson.moduleId,
          sortOrder: lesson.sortOrder,
          assetIds: lesson.assets.map(la => la.assetId),
          tagNames: lesson.tags.map(lt => lt.tag.name),
        } : null}
        modules={modules.map(m => ({
          id: m.id,
          title: `${m.course.category.name} > ${m.course.title} > ${m.title}`,
        }))}
        availableAssets={assets}
      />
    </div>
  )
}
