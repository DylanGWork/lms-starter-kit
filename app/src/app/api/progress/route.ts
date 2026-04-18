import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { lessonId, completed } = await req.json()
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })

  const now = new Date()

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: {
      completed,
      completedAt: completed ? now : null,
      lastViewedAt: now,
      started: true,
    },
    create: {
      userId: session.user.id,
      lessonId,
      started: true,
      startedAt: now,
      completed,
      completedAt: completed ? now : null,
    },
  })

  return NextResponse.json({ progress })
}
