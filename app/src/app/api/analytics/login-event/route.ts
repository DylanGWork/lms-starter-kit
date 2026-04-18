import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function detectDevice(ua: string, screenWidth: number): string {
  const uaLower = ua.toLowerCase()
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(uaLower)) return 'mobile'
  if (/ipad|tablet|kindle|silk/.test(uaLower)) return 'tablet'
  if (screenWidth > 0 && screenWidth < 768) return 'mobile'
  if (screenWidth >= 768 && screenWidth < 1024) return 'tablet'
  return 'desktop'
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const userAgent = (body.userAgent as string) || req.headers.get('user-agent') || ''
  const screenWidth = (body.screenWidth as number) || 0
  const deviceType = detectDevice(userAgent, screenWidth)

  await prisma.loginEvent.create({
    data: {
      userId: session.user.id,
      userAgent: userAgent.slice(0, 500),
      screenWidth: screenWidth || null,
      deviceType,
    },
  })

  return NextResponse.json({ ok: true })
}
