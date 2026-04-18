import { prisma } from '@/lib/prisma'
import { AssetLibrary } from '@/components/admin/AssetLibrary'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Asset Library' }

export default async function AdminAssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      sourceAsset: {
        select: { id: true, title: true, originalName: true },
      },
    },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Asset Library</h1>
        <p className="text-gray-500 font-jakarta">Upload and manage videos, images, PDFs, and documents.</p>
      </div>
      <AssetLibrary assets={assets} />
    </div>
  )
}
