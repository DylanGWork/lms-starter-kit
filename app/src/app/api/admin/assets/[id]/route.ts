import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage'
import type { Role } from '@prisma/client'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const asset = await prisma.asset.findUnique({ where: { id: params.id } })
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from filesystem
  await deleteFile(asset.url)

  // Delete from DB (cascades to lesson associations)
  await prisma.asset.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
