import fs from 'fs'
import path from 'path'

const QA_REVIEW_DIR = '/home/dylan/pestsense-academy/qa/reviews'

type GateStatus = 'green' | 'amber' | 'red'

export type LocalizationGateReport = {
  ran_at: string
  scope: string
  gate: {
    status: GateStatus
    critical: string[]
    warnings: string[]
  }
  content_report: string
  asset_report: string
  browser_report: string
  content: {
    summary: {
      issues: number
      missing_locale_rows: number
    }
  }
  assets: {
    summary: {
      issues: number
      assets_checked: number
    }
  }
  browser: {
    summary: {
      status: string
      issues?: number
      screenshots?: number
    }
  }
}

export function getLatestLocalizationGateReport(): { path: string; report: LocalizationGateReport } | null {
  if (!fs.existsSync(QA_REVIEW_DIR)) {
    return null
  }

  const candidates = fs
    .readdirSync(QA_REVIEW_DIR)
    .filter((file) => file.endsWith('-localization-gate.json'))
    .sort()

  const latest = candidates.at(-1)
  if (!latest) {
    return null
  }

  const fullPath = path.join(QA_REVIEW_DIR, latest)
  try {
    const report = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as LocalizationGateReport
    return { path: fullPath, report }
  } catch {
    return null
  }
}

export function gateStatusClasses(status: GateStatus) {
  if (status === 'green') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
  if (status === 'amber') {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  return 'bg-red-50 text-red-700 border-red-200'
}
