import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.lessonId) return NextResponse.json({ ok: false }, { status: 400 })

  const { lessonId, currentTime, duration, completed } = body as {
    lessonId: string
    currentTime: number   // seconds
    duration: number      // seconds
    completed: boolean    // reached ≥80%
  }

  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const isCompleted = completed || percent >= 80

  const existing = await prisma.videoProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  })

  if (existing) {
    await prisma.videoProgress.update({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      data: {
        lastPosition: Math.floor(currentTime),
        durationSeconds: Math.floor(duration) || existing.durationSeconds,
        percentWatched: Math.max(existing.percentWatched, percent),
        watchedSeconds: Math.max(existing.watchedSeconds, Math.floor(currentTime)),
        completed: existing.completed || isCompleted,
        lastWatchedAt: new Date(),
        // Increment play count only on new session (currentTime < 5s means fresh start)
        playCount: currentTime < 5 ? existing.playCount + 1 : existing.playCount,
      },
    })
  } else {
    await prisma.videoProgress.create({
      data: {
        userId: session.user.id,
        lessonId,
        lastPosition: Math.floor(currentTime),
        durationSeconds: Math.floor(duration) || null,
        percentWatched: percent,
        watchedSeconds: Math.floor(currentTime),
        completed: isCompleted,
      },
    })
  }

  // Also mark lesson as started in LessonProgress if not already
  if (currentTime > 5) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      update: { started: true, lastViewedAt: new Date() },
      create: {
        userId: session.user.id,
        lessonId,
        started: true,
        startedAt: new Date(),
        lastViewedAt: new Date(),
      },
    })
  }

  return NextResponse.json({ ok: true })
}
