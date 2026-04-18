'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ADMIN_ROLES } from '@/types'
import type { Role } from '@/types'

export async function toggleRequirement(courseId: string, role: string, makeRequired: boolean, notes?: string) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    throw new Error('Unauthorized')
  }

  if (makeRequired) {
    await prisma.courseRequirement.upsert({
      where: { courseId_role: { courseId, role: role as Role } },
      update: { notes: notes || null },
      create: { courseId, role: role as Role, notes: notes || null },
    })
  } else {
    await prisma.courseRequirement.deleteMany({
      where: { courseId, role: role as Role },
    })
  }

  revalidatePath('/admin/requirements')
  revalidatePath('/manager')
}
