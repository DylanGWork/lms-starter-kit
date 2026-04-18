'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { importTrainingDrafts } from '@/lib/training-draft-importer'
import type { Role } from '@prisma/client'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

export async function importTrainingDraftsAction() {
  const session = await getServerSession(authOptions)

  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    redirect('/dashboard')
  }

  const result = await importTrainingDrafts()

  revalidatePath('/admin')
  revalidatePath('/admin/assets')
  revalidatePath('/admin/content')
  revalidatePath('/admin/content/courses')
  revalidatePath('/admin/content/lessons')
  revalidatePath('/admin/content/guides')

  redirect(`/admin/content/guides?imported=${result.importedCount}&skipped=${result.skippedCount}`)
}

