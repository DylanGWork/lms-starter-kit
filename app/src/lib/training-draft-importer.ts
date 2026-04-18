import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'
import { prisma } from './prisma'
import { slugify } from './utils'
import {
  ACADEMY_GUIDE_RULES,
  ACADEMY_LESSON_TEMPLATE_SECTIONS,
  DEFAULT_IMPORT_TAGS,
  buildDraftCourseDescription,
  buildDraftCourseTitle,
  buildDraftLessonContent,
  buildDraftLessonTitle,
  buildDraftSummary,
  deriveDisplayTitleFromFilename,
} from './course-authoring'
import type { Role } from '@prisma/client'

const execFileAsync = promisify(execFile)
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm'])
const LOG_EXTENSIONS = new Set(['.log', '.txt'])
const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']

export const TRAINING_IMPORT_SOURCE_DIR =
  process.env.TRAINING_VIDEO_SOURCE_DIR || '/home/dylan/dylan/training videos'

export const TRAINING_IMPORT_STATE_PATH =
  process.env.TRAINING_IMPORT_STATE_PATH ||
  path.join(uploadRoot(), 'training-imports', 'training-video-imports.json')

type ImportStateRecord = {
  sourcePath: string
  fingerprint: string
  sourceName: string
  logSourcePath?: string
  courseId: string
  courseTitle: string
  lessonId: string
  lessonTitle: string
  videoAssetId: string
  logAssetId?: string
  importedAt: string
}

type ImportState = {
  imports: ImportStateRecord[]
}

type SidecarMetadata = {
  title?: string
  courseTitle?: string
  lessonTitle?: string
  moduleTitle?: string
  categorySlug?: string
  categoryName?: string
  categoryDescription?: string
  summary?: string
  description?: string
  tags?: string[]
  notes?: string[]
}

export type TrainingImportSummary = {
  sourceDir: string
  importedCount: number
  skippedCount: number
  imported: Array<{
    sourceName: string
    courseId: string
    courseTitle: string
    lessonId: string
    lessonTitle: string
    videoAssetId: string
    logAssetId?: string
  }>
  skipped: Array<{
    sourceName: string
    reason: string
  }>
}

function uploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
}

function normalisePath(filePath: string) {
  return path.resolve(filePath)
}

function buildFingerprint(stats: { size: number; mtimeMs: number }) {
  return `${stats.size}:${Math.floor(stats.mtimeMs)}`
}

function extToVideoMime(ext: string) {
  if (ext === '.mov') return 'video/quicktime'
  if (ext === '.webm') return 'video/webm'
  return 'video/mp4'
}

function extToOtherMime(ext: string) {
  if (ext === '.txt' || ext === '.log') return 'text/plain'
  return 'application/octet-stream'
}

async function ensureDirectory(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function loadState(): Promise<ImportState> {
  if (!existsSync(TRAINING_IMPORT_STATE_PATH)) {
    return { imports: [] }
  }

  const raw = await fs.readFile(TRAINING_IMPORT_STATE_PATH, 'utf-8')
  return JSON.parse(raw) as ImportState
}

async function saveState(state: ImportState) {
  await ensureDirectory(path.dirname(TRAINING_IMPORT_STATE_PATH))
  await fs.writeFile(TRAINING_IMPORT_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf-8')
}

export async function getTrainingImportState() {
  return loadState()
}

export function getAcademyGuidePlaybook() {
  return {
    rules: ACADEMY_GUIDE_RULES,
    sections: ACADEMY_LESSON_TEMPLATE_SECTIONS,
    sourceDir: TRAINING_IMPORT_SOURCE_DIR,
    statePath: TRAINING_IMPORT_STATE_PATH,
  }
}

async function readSidecarMetadata(videoPath: string): Promise<SidecarMetadata> {
  const sidecarPath = `${videoPath}.course.json`
  if (!existsSync(sidecarPath)) {
    return {}
  }

  try {
    const raw = await fs.readFile(sidecarPath, 'utf-8')
    return JSON.parse(raw) as SidecarMetadata
  } catch {
    return {}
  }
}

async function copyFileToUploads(sourcePath: string, targetFolder: string) {
  const ext = path.extname(sourcePath).toLowerCase()
  const filename = `${uuid()}${ext}`
  const fullTargetDir = path.join(uploadRoot(), targetFolder)
  const fullTargetPath = path.join(fullTargetDir, filename)

  await ensureDirectory(fullTargetDir)
  await fs.copyFile(sourcePath, fullTargetPath)

  return {
    filename,
    fullTargetPath,
    publicUrl: `/uploads/${targetFolder}/${filename}`,
  }
}

async function ensureCategory(metadata: SidecarMetadata) {
  if (metadata.categorySlug) {
    const existing = await prisma.category.findUnique({
      where: { slug: metadata.categorySlug },
    })

    if (existing) {
      return existing
    }

    return prisma.category.create({
      data: {
        name: metadata.categoryName || deriveDisplayTitleFromFilename(metadata.categorySlug),
        slug: metadata.categorySlug,
        description: metadata.categoryDescription || 'Imported draft courses created from raw training videos.',
        icon: 'Monitor',
        color: '#61ce70',
        sortOrder: 90,
        status: 'DRAFT',
      },
    })
  }

  return prisma.category.upsert({
    where: { slug: 'academy-drafts' },
    update: {},
    create: {
      name: 'Academy Drafts',
      slug: 'academy-drafts',
      description: 'Auto-imported draft courses generated from raw training videos and logs.',
      icon: 'Monitor',
      color: '#61ce70',
      sortOrder: 99,
      status: 'DRAFT',
    },
  })
}

async function createUniqueCourseSlug(base: string) {
  let slug = slugify(base)
  let counter = 2
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${counter}`
    counter += 1
  }
  return slug
}

async function createUniqueLessonSlug(base: string) {
  let slug = slugify(base)
  let counter = 2
  while (await prisma.lesson.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${counter}`
    counter += 1
  }
  return slug
}

async function extractFramesForVideoAsset(assetId: string, videoFilePath: string, assetName: string) {
  const frameDir = path.join(uploadRoot(), 'frames', assetId)
  await ensureDirectory(frameDir)

  let durationSecs = 0
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      videoFilePath,
    ])
    durationSecs = Math.round(parseFloat(stdout.trim()) || 0)
  } catch {
    durationSecs = 0
  }

  const intervalSecs = durationSecs > 0 ? Math.max(15, Math.floor(durationSecs / 20)) : 30

  try {
    await execFileAsync('ffmpeg', [
      '-i',
      videoFilePath,
      '-vf',
      `fps=1/${intervalSecs},scale=1280:-2`,
      '-frames:v',
      '20',
      '-q:v',
      '3',
      path.join(frameDir, 'frame_%04d.jpg'),
    ])
  } catch {
    return durationSecs
  }

  const frameFiles = (await fs.readdir(frameDir))
    .filter(file => file.endsWith('.jpg'))
    .sort()

  for (let index = 0; index < frameFiles.length; index += 1) {
    const frameFile = frameFiles[index]
    const timestampSecs = Math.round((index + 1) * intervalSecs)
    const mins = Math.floor(timestampSecs / 60)
    const secs = timestampSecs % 60
    const timeLabel = `${mins}:${secs.toString().padStart(2, '0')}`
    const fullFramePath = path.join(frameDir, frameFile)
    const stats = await fs.stat(fullFramePath)

    await prisma.asset.create({
      data: {
        filename: frameFile,
        originalName: `frame_${timeLabel.replace(':', 'm')}s_${assetName}`,
        mimeType: 'image/jpeg',
        size: stats.size,
        url: `/uploads/frames/${assetId}/${frameFile}`,
        type: 'IMAGE',
        title: `Frame at ${timeLabel} — ${assetName}`,
        description: `Extracted from imported training draft at ${timeLabel}`,
        status: 'PUBLISHED',
        sourceVideoId: assetId,
        videoTimestamp: timestampSecs,
      },
    })
  }

  await prisma.asset.update({
    where: { id: assetId },
    data: { framesExtracted: true },
  })

  return durationSecs
}

async function findNearestLog(videoPath: string, videoStats: { mtimeMs: number }, state: ImportState) {
  const sourceEntries = await fs.readdir(TRAINING_IMPORT_SOURCE_DIR, { withFileTypes: true })
  const importedLogPaths = new Set(
    state.imports
      .filter(record => record.logSourcePath)
      .map(record => record.logSourcePath as string)
  )

  const candidates: Array<{ fullPath: string; mtimeDelta: number }> = []

  for (const entry of sourceEntries) {
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!LOG_EXTENSIONS.has(ext)) continue

    const fullPath = normalisePath(path.join(TRAINING_IMPORT_SOURCE_DIR, entry.name))
    if (importedLogPaths.has(fullPath)) continue

    const stats = await fs.stat(fullPath)
    const delta = Math.abs(stats.mtimeMs - videoStats.mtimeMs)

    if (delta <= 3 * 60 * 60 * 1000) {
      candidates.push({ fullPath, mtimeDelta: delta })
    }
  }

  candidates.sort((a, b) => a.mtimeDelta - b.mtimeDelta)
  return candidates[0]?.fullPath
}

export async function importTrainingDrafts(): Promise<TrainingImportSummary> {
  await ensureDirectory(TRAINING_IMPORT_SOURCE_DIR)

  const [state, entries] = await Promise.all([
    loadState(),
    fs.readdir(TRAINING_IMPORT_SOURCE_DIR, { withFileTypes: true }),
  ])

  const videoEntries = entries
    .filter(entry => entry.isFile() && VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const summary: TrainingImportSummary = {
    sourceDir: TRAINING_IMPORT_SOURCE_DIR,
    importedCount: 0,
    skippedCount: 0,
    imported: [],
    skipped: [],
  }

  for (const entry of videoEntries) {
    const sourcePath = normalisePath(path.join(TRAINING_IMPORT_SOURCE_DIR, entry.name))
    const stats = await fs.stat(sourcePath)
    const fingerprint = buildFingerprint(stats)

    const existingImport = state.imports.find(
      record => record.sourcePath === sourcePath && record.fingerprint === fingerprint
    )

    if (existingImport) {
      summary.skipped.push({ sourceName: entry.name, reason: 'Already imported' })
      summary.skippedCount += 1
      continue
    }

    const metadata = await readSidecarMetadata(sourcePath)
    const category = await ensureCategory(metadata)
    const displayTitle = metadata.title || deriveDisplayTitleFromFilename(entry.name)
    const courseTitle = metadata.courseTitle || buildDraftCourseTitle(displayTitle)
    const lessonTitle = metadata.lessonTitle || buildDraftLessonTitle(displayTitle)
    const moduleTitle = metadata.moduleTitle || 'Module 1: Imported Walkthrough'
    const courseSlug = await createUniqueCourseSlug(`academy-draft-${displayTitle}`)
    const lessonSlug = await createUniqueLessonSlug(`${courseSlug}-walkthrough`)

    const copiedVideo = await copyFileToUploads(sourcePath, 'training-imports/videos')
    const videoAsset = await prisma.asset.create({
      data: {
        filename: copiedVideo.filename,
        originalName: entry.name,
        mimeType: extToVideoMime(path.extname(entry.name).toLowerCase()),
        size: stats.size,
        url: copiedVideo.publicUrl,
        type: 'VIDEO',
        title: courseTitle,
        description: metadata.description || `Imported training video source for ${courseTitle}.`,
        product: 'Academy Draft',
        status: 'PUBLISHED',
        isSourceRecording: true,
      },
    })

    const nearestLog = await findNearestLog(sourcePath, stats, state)
    let logAssetId: string | undefined
    if (nearestLog) {
      const logStats = await fs.stat(nearestLog)
      const copiedLog = await copyFileToUploads(nearestLog, 'training-imports/documents')
      const logAsset = await prisma.asset.create({
        data: {
          filename: copiedLog.filename,
          originalName: path.basename(nearestLog),
          mimeType: extToOtherMime(path.extname(nearestLog).toLowerCase()),
          size: logStats.size,
          url: copiedLog.publicUrl,
          type: 'OTHER',
          title: `Session log — ${displayTitle}`,
          description: 'Imported console or session log attached to the draft lesson for QA and security review.',
          product: 'Academy Draft',
          status: 'PUBLISHED',
        },
      })
      logAssetId = logAsset.id
    }

    const durationSecs = await extractFramesForVideoAsset(videoAsset.id, copiedVideo.fullTargetPath, courseTitle)
    const estimatedMins = durationSecs > 0 ? Math.max(1, Math.ceil(durationSecs / 60)) : null

    const course = await prisma.course.create({
      data: {
        categoryId: category.id,
        title: courseTitle,
        slug: courseSlug,
        description: metadata.description || buildDraftCourseDescription(displayTitle),
        status: 'DRAFT',
        sortOrder: 999,
        estimatedMins,
        roleVisibility: {
          create: ADMIN_ROLES.map(role => ({ role })),
        },
      },
    })

    const module = await prisma.module.create({
      data: {
        courseId: course.id,
        title: moduleTitle,
        description: 'Auto-generated draft module created from an imported training recording.',
        sortOrder: 1,
        status: 'DRAFT',
      },
    })

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: module.id,
        title: lessonTitle,
        slug: lessonSlug,
        summary: metadata.summary || buildDraftSummary(displayTitle),
        content: buildDraftLessonContent({
          displayTitle,
          sourceFilename: entry.name,
          hasLogAsset: Boolean(logAssetId),
          notes: metadata.notes,
        }),
        videoUrl: copiedVideo.publicUrl,
        videoProvider: 'local',
        duration: durationSecs || null,
        sortOrder: 1,
        status: 'DRAFT',
        version: '0.1',
        assets: logAssetId ? {
          create: [
            {
              assetId: logAssetId,
              sortOrder: 1,
              label: 'Imported session log',
            },
          ],
        } : undefined,
      },
    })

    const tagNames = Array.from(new Set([
      ...DEFAULT_IMPORT_TAGS,
      ...(metadata.tags || []),
      category.slug,
    ]))

    for (const tagName of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { slug: slugify(tagName) },
        update: { name: tagName },
        create: { name: tagName, slug: slugify(tagName) },
      })

      await prisma.lessonTag.upsert({
        where: { lessonId_tagId: { lessonId: lesson.id, tagId: tag.id } },
        update: {},
        create: { lessonId: lesson.id, tagId: tag.id },
      })
    }

    state.imports.push({
      sourcePath,
      fingerprint,
      sourceName: entry.name,
      logSourcePath: nearestLog,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      videoAssetId: videoAsset.id,
      logAssetId,
      importedAt: new Date().toISOString(),
    })

    summary.imported.push({
      sourceName: entry.name,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      videoAssetId: videoAsset.id,
      logAssetId,
    })
    summary.importedCount += 1
  }

  if (summary.importedCount > 0) {
    await saveState(state)
  } else if (!existsSync(TRAINING_IMPORT_STATE_PATH)) {
    await saveState(state)
  }

  return summary
}
