import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Role } from '@prisma/client'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

const UpdateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  videoProvider: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  version: z.string().optional(),
  moduleId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  assetIds: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateLessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { assetIds, tagNames, ...lessonData } = parsed.data

  // Rebuild assets and tags if provided
  const [lesson] = await prisma.$transaction([
    prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...lessonData,
        ...(assetIds !== undefined ? {
          assets: {
            deleteMany: {},
            create: assetIds.map((assetId, idx) => ({ assetId, sortOrder: idx })),
          },
        } : {}),
      },
    }),
  ])

  if (tagNames !== undefined) {
    await prisma.lessonTag.deleteMany({ where: { lessonId: params.id } })
    for (const name of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { slug: name },
        update: {},
        create: { name, slug: name },
      })
      await prisma.lessonTag.upsert({
        where: { lessonId_tagId: { lessonId: params.id, tagId: tag.id } },
        update: {},
        create: { lessonId: params.id, tagId: tag.id },
      })
    }
  }

  return NextResponse.json({ lesson })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.lesson.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
