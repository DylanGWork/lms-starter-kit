import fs from 'fs'
import path from 'path'
import { importTrainingDrafts } from '../src/lib/training-draft-importer'

function loadEnvFromRepoRoot() {
  const envPath = path.resolve(process.cwd(), '..', '.env')
  if (!fs.existsSync(envPath)) return

  const raw = fs.readFileSync(envPath, 'utf-8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

async function main() {
  loadEnvFromRepoRoot()
  const result = await importTrainingDrafts()

  console.log(`Training import source: ${result.sourceDir}`)
  console.log(`Imported: ${result.importedCount}`)
  console.log(`Skipped: ${result.skippedCount}`)

  for (const item of result.imported) {
    console.log(`+ ${item.sourceName} -> ${item.courseTitle} / ${item.lessonTitle}`)
  }

  for (const item of result.skipped) {
    console.log(`- ${item.sourceName}: ${item.reason}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
