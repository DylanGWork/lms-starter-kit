import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Role } from '@prisma/client'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

const LessonSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  summary: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  videoProvider: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  version: z.string().optional(),
  moduleId: z.string().min(1),
  sortOrder: z.number().int().default(0),
  assetIds: z.array(z.string()).default([]),
  tagNames: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = LessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { assetIds, tagNames, ...lessonData } = parsed.data

  // Ensure unique slug
  const existing = await prisma.lesson.findUnique({ where: { slug: lessonData.slug } })
  if (existing) {
    lessonData.slug = `${lessonData.slug}-${Date.now()}`
  }

  const lesson = await prisma.lesson.create({
    data: {
      ...lessonData,
      assets: {
        create: assetIds.map((assetId, idx) => ({ assetId, sortOrder: idx })),
      },
      tags: {
        create: await Promise.all(tagNames.map(async name => {
          const tag = await prisma.tag.upsert({
            where: { slug: name },
            update: {},
            create: { name, slug: name },
          })
          return { tagId: tag.id }
        })),
      },
    },
  })

  return NextResponse.json({ lesson }, { status: 201 })
}
