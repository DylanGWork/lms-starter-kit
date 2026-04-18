import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Role } from '@prisma/client'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

const ModuleSchema = z.object({
  title: z.string().min(1).max(200),
  courseId: z.string().min(1),
  sortOrder: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ModuleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const module_ = await prisma.module.create({ data: parsed.data })
  return NextResponse.json({ module: module_ }, { status: 201 })
}
