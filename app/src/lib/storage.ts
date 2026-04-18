import path from 'path'
import fs from 'fs/promises'
import { v4 as uuid } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const subdirs = ['videos', 'images', 'documents', 'pdfs', 'subtitles', 'audio']
  for (const dir of subdirs) {
    await fs.mkdir(path.join(UPLOAD_DIR, dir), { recursive: true })
  }
}

export function getUploadDir(type: 'video' | 'image' | 'pdf' | 'document') {
  const map = {
    video: 'videos',
    image: 'images',
    pdf: 'pdfs',
    document: 'documents',
  }
  return path.join(UPLOAD_DIR, map[type])
}

export function getPublicUrl(filename: string, type: 'video' | 'image' | 'pdf' | 'document') {
  const map = {
    video: 'videos',
    image: 'images',
    pdf: 'pdfs',
    document: 'documents',
  }
  return `/uploads/${map[type]}/${filename}`
}

export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  return `${uuid()}${ext}`
}

export async function deleteFile(urlPath: string) {
  try {
    const relativePath = urlPath.replace('/uploads/', '')
    const fullPath = path.join(UPLOAD_DIR, relativePath)
    await fs.unlink(fullPath)
  } catch {
    // File may not exist — ignore
  }
}

export function getMimeCategory(mimeType: string): 'VIDEO' | 'IMAGE' | 'PDF' | 'DOCUMENT' | 'OTHER' {
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('spreadsheet')) return 'DOCUMENT'
  return 'OTHER'
}

export const MAX_FILE_SIZES: Record<string, number> = {
  VIDEO: 500 * 1024 * 1024,    // 500MB
  IMAGE: 10 * 1024 * 1024,     // 10MB
  PDF: 50 * 1024 * 1024,       // 50MB
  DOCUMENT: 50 * 1024 * 1024,  // 50MB
  SUBTITLE: 2 * 1024 * 1024,   // 2MB
  AUDIO: 100 * 1024 * 1024,    // 100MB
  OTHER: 10 * 1024 * 1024,     // 10MB
}
