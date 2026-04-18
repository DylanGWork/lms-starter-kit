import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { execFile } from 'child_process'
import { getMimeCategory, MAX_FILE_SIZES } from '@/lib/storage'
import type { AssetVariantKind, Locale, Role } from '@prisma/client'
import { isSupportedLocale } from '@/lib/i18n/config'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const product = formData.get('product') as string | null
    const localeInput = formData.get('locale') as string | null
    const sourceAssetId = formData.get('sourceAssetId') as string | null
    const variantKindInput = formData.get('variantKind') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const locale = isSupportedLocale(localeInput) ? (localeInput as Locale) : 'en'
    const allowedVariantKinds: AssetVariantKind[] = ['BASE', 'LOCALIZED_IMAGE', 'SUBTITLE_TRACK', 'DUBBED_VIDEO', 'AUDIO_TRACK', 'TRANSCRIPT']
    const variantKind = allowedVariantKinds.includes(variantKindInput as AssetVariantKind)
      ? (variantKindInput as AssetVariantKind)
      : 'BASE'

    const inferredType = getMimeCategory(file.type)
    const assetType =
      variantKind === 'SUBTITLE_TRACK'
        ? 'SUBTITLE'
        : variantKind === 'AUDIO_TRACK'
          ? 'AUDIO'
          : inferredType
    const maxSize = MAX_FILE_SIZES[assetType] || MAX_FILE_SIZES.OTHER

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size for ${assetType}: ${Math.round(maxSize / (1024 * 1024))}MB` },
        { status: 413 }
      )
    }

    // Determine subdirectory
    const subDir = assetType === 'VIDEO' ? 'videos'
      : assetType === 'IMAGE' ? 'images'
      : assetType === 'PDF' ? 'pdfs'
      : assetType === 'SUBTITLE' ? 'subtitles'
      : assetType === 'AUDIO' ? 'audio'
      : 'documents'

    const uploadPath = path.join(UPLOAD_DIR, subDir)
    await mkdir(uploadPath, { recursive: true })

    // Generate safe filename
    const ext = path.extname(file.name).toLowerCase()
    const filename = `${uuid()}${ext}`
    const fullPath = path.join(uploadPath, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    await writeFile(fullPath, Buffer.from(bytes))

    const publicUrl = `/uploads/${subDir}/${filename}`

    // Save to DB
    const asset = await prisma.asset.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        type: assetType,
        locale,
        variantKind,
        title: title || null,
        description: description || null,
        product: product || null,
        status: 'PUBLISHED',
        sourceAssetId: sourceAssetId || null,
        uploadedById: session.user.id,
      },
    })

    // Auto-extract frames for videos (non-blocking — fire and forget)
    if (assetType === 'VIDEO') {
      triggerFrameExtraction(asset.id, fullPath, asset.title || asset.originalName, session.user.id).catch(err => {
        console.error('Frame extraction failed for asset', asset.id, err)
      })
    }

    return NextResponse.json({ asset }, { status: 201 })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

async function triggerFrameExtraction(
  assetId: string,
  videoFilePath: string,
  assetName: string,
  uploadedById: string
) {
  const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
  const frameDir = path.join(UPLOAD_DIR, 'frames', assetId)
  await mkdir(frameDir, { recursive: true })

  // Get duration
  let durationSecs = 0
  await new Promise<void>((resolve) => {
    execFile(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoFilePath],
      (err, stdout) => {
        if (!err) durationSecs = parseFloat(stdout.trim()) || 0
        resolve()
      }
    )
  })

  const intervalSecs = durationSecs > 0 ? Math.max(15, Math.floor(durationSecs / 20)) : 30

  await new Promise<void>((resolve, reject) => {
    execFile(
      'ffmpeg',
      [
        '-i', videoFilePath,
        '-vf', `fps=1/${intervalSecs},scale=1280:-2`,
        '-frames:v', '20',
        '-q:v', '3',
        path.join(frameDir, 'frame_%04d.jpg'),
      ],
      { timeout: 120_000 },
      (err, _stdout, stderr) => {
        if (err) reject(new Error(stderr))
        else resolve()
      }
    )
  })

  const { readdir, stat } = await import('fs/promises')
  const frameFiles = (await readdir(frameDir))
    .filter((f: string) => f.endsWith('.jpg'))
    .sort()

  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i]
    const frameIndex = i + 1
    const timestampSecs = Math.round(frameIndex * intervalSecs)
    const mins = Math.floor(timestampSecs / 60)
    const secs = timestampSecs % 60
    const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`

    let fileSize = 0
    try {
      const s = await stat(path.join(frameDir, file))
      fileSize = s.size
    } catch {}

    await prisma.asset.create({
      data: {
        filename: file,
        originalName: `frame_${timeLabel.replace(':', 'm')}s_${assetName}`,
        mimeType: 'image/jpeg',
        size: fileSize,
        url: `/uploads/frames/${assetId}/${file}`,
        type: 'IMAGE',
        title: `Frame at ${timeLabel} — ${assetName}`,
        description: `Extracted from video at ${timeLabel}`,
        status: 'PUBLISHED',
        sourceVideoId: assetId,
        videoTimestamp: timestampSecs,
        uploadedById,
      },
    })
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: { framesExtracted: true },
  })
}
