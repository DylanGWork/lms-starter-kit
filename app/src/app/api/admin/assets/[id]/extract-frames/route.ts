import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { execFile } from 'child_process'
import { mkdir, readdir, stat } from 'fs/promises'
import path from 'path'
import type { Role } from '@prisma/client'

const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile('ffmpeg', args, { timeout: 120_000 }, (err, _stdout, stderr) => {
      if (err) reject(new Error(`ffmpeg: ${stderr}`))
      else resolve()
    })
  })
}

function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve) => {
    execFile(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath],
      (err, stdout) => {
        resolve(err ? 0 : parseFloat(stdout.trim()) || 0)
      }
    )
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !ADMIN_ROLES.includes(session.user.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const asset = await prisma.asset.findUnique({ where: { id: params.id } })
  if (!asset || asset.type !== 'VIDEO') {
    return NextResponse.json({ error: 'Video asset not found' }, { status: 404 })
  }

  // Resolve file path — asset.url is like /uploads/videos/uuid.mp4
  // UPLOAD_DIR is /app/uploads, asset.url path part after /uploads/ gives us the subpath
  const urlPath = asset.url.replace(/^\/uploads\//, '')
  const videoFilePath = path.join(UPLOAD_DIR, urlPath)

  try {
    await stat(videoFilePath)
  } catch {
    return NextResponse.json({ error: `Video file not found at ${videoFilePath}` }, { status: 404 })
  }

  const durationSecs = await getVideoDuration(videoFilePath)
  const intervalSecs = durationSecs > 0 ? Math.max(15, Math.floor(durationSecs / 20)) : 30

  const frameDir = path.join(UPLOAD_DIR, 'frames', params.id)
  await mkdir(frameDir, { recursive: true })

  try {
    await runFfmpeg([
      '-i', videoFilePath,
      '-vf', `fps=1/${intervalSecs},scale=1280:-2`,
      '-frames:v', '20',
      '-q:v', '3',
      path.join(frameDir, 'frame_%04d.jpg'),
    ])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  const frameFiles = (await readdir(frameDir))
    .filter(f => f.endsWith('.jpg'))
    .sort()

  // Remove old frames for this video
  await prisma.asset.deleteMany({ where: { sourceVideoId: params.id } })

  const createdFrames = []
  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i]
    const timestampSecs = Math.round((i + 1) * intervalSecs)
    const mins = Math.floor(timestampSecs / 60)
    const secs = timestampSecs % 60
    const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`

    let fileSize = 0
    try { fileSize = (await stat(path.join(frameDir, file))).size } catch {}

    const frame = await prisma.asset.create({
      data: {
        filename: file,
        originalName: `frame_${timeLabel.replace(':', 'm')}s_${asset.title || asset.originalName}`,
        mimeType: 'image/jpeg',
        size: fileSize,
        url: `/uploads/frames/${params.id}/${file}`,
        type: 'IMAGE',
        title: `Frame at ${timeLabel} — ${asset.title || asset.originalName}`,
        description: `Extracted from video at ${timeLabel}`,
        status: 'PUBLISHED',
        sourceVideoId: params.id,
        videoTimestamp: timestampSecs,
        uploadedById: session.user.id,
      },
    })
    createdFrames.push(frame)
  }

  await prisma.asset.update({
    where: { id: params.id },
    data: { framesExtracted: true },
  })

  return NextResponse.json({
    framesExtracted: createdFrames.length,
    durationSecs,
    intervalSecs,
    frames: createdFrames,
  })
}
