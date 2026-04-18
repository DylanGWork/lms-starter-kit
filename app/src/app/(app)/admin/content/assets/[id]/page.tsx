import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { VideoReviewPanel } from './VideoReviewPanel'
import type { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

export default async function AssetReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) redirect('/dashboard')

  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: {
      extractedFrames: {
        orderBy: { videoTimestamp: 'asc' },
      },
    },
  })

  if (!asset) notFound()

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/assets" className="btn-secondary py-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Asset Library
        </Link>
        <div>
          <h1 className="font-geologica font-black text-xl text-gray-900">{asset.title || asset.originalName}</h1>
          <p className="text-xs text-gray-400 font-jakarta mt-0.5">{asset.type} · {asset.originalName}</p>
        </div>
      </div>

      <VideoReviewPanel asset={asset as any} frames={asset.extractedFrames as any} />
    </div>
  )
}
