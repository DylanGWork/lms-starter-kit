import Link from 'next/link'
import { ClipboardCheck, Upload, Sparkles, Video, Bug, FileText, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getAcademyGuidePlaybook, getTrainingImportState } from '@/lib/training-draft-importer'
import { formatDate } from '@/lib/utils'
import { importTrainingDraftsAction } from './actions'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Guide Blueprint' }

export default async function GuideBlueprintPage({
  searchParams,
}: {
  searchParams?: { imported?: string; skipped?: string }
}) {
  const playbook = getAcademyGuidePlaybook()
  const importState = await getTrainingImportState()

  const recentImports = importState.imports.slice().reverse().slice(0, 8)

  const recentLessons = recentImports.length > 0
    ? await prisma.lesson.findMany({
        where: { id: { in: recentImports.map(record => record.lessonId) } },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      })
    : []

  const recentLessonMap = new Map(recentLessons.map(lesson => [lesson.id, lesson]))
  const importedCount = Number(searchParams?.imported || '0')
  const skippedCount = Number(searchParams?.skipped || '0')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Guide Blueprint</h1>
          <p className="text-gray-500 font-jakarta max-w-3xl">
            Keep Academy guides consistent across screenshots, video walkthroughs, wording, and draft imports.
            This page is the shared standard for how we turn raw training sessions into polished learning content.
          </p>
        </div>

        <form action={importTrainingDraftsAction}>
          <button className="btn-primary">
            <Upload className="w-4 h-4" />
            Import training drops
          </button>
        </form>
      </div>

      {(importedCount > 0 || skippedCount > 0) && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-jakarta text-green-800">
          Import completed. Added {importedCount} new draft course{importedCount === 1 ? '' : 's'} and skipped {skippedCount} file{skippedCount === 1 ? '' : 's'} already imported.
        </div>
      )}

      <div className="grid xl:grid-cols-[1.1fr,0.9fr] gap-6">
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Academy design rules</h2>
          </div>

          <div className="space-y-3">
            {playbook.rules.map((rule, index) => (
              <div key={rule} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold font-jakarta shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm font-jakarta text-gray-700 leading-6">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-blue-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Standard lesson anatomy</h2>
          </div>

          <div className="space-y-4">
            {playbook.sections.map((section, index) => (
              <div key={section.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-jakarta uppercase tracking-[0.18em] text-gray-400 mb-1">Section {index + 1}</div>
                <h3 className="font-jakarta font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm font-jakarta text-gray-600 mt-1 leading-6">{section.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-purple-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Auto-import workflow</h2>
          </div>

          <div className="space-y-4 text-sm font-jakarta text-gray-700">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="font-semibold text-gray-900 mb-1">Source folder</div>
              <code className="text-xs text-gray-600">{playbook.sourceDir}</code>
            </div>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Drop a raw training video into the source folder. Optional sidecar metadata can be added using <code>your-video.mp4.course.json</code>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Run the importer from this page or via automation. The importer creates a draft category entry, a draft course, one draft module, and one draft lesson.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>The source video is copied into Academy uploads, added to the asset library, and processed for extracted screenshots.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>If a nearby log file is found, it is attached to the lesson as a download so bugs and security evidence can live alongside the draft.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">5</span>
                <span>Review the extracted frames, refine the wording, split the workflow into smaller learner lessons if needed, and only then publish.</span>
              </li>
            </ol>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange-700" />
            <h2 className="font-geologica font-bold text-xl text-gray-900">Import state</h2>
          </div>
          <div className="space-y-3 text-sm font-jakarta text-gray-700">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-1">State file</div>
              <code className="text-xs text-gray-600 break-all">{playbook.statePath}</code>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-1">Imported drafts tracked</div>
              <div className="font-geologica font-black text-2xl text-gray-900">{importState.imports.length}</div>
            </div>
            <Link
              href="/admin/content/lessons?status=DRAFT"
              className="inline-flex items-center gap-2 text-sm font-jakarta font-semibold hover:underline"
              style={{ color: '#018902' }}
            >
              Review draft lessons
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bug className="w-5 h-5 text-red-700" />
          <h2 className="font-geologica font-bold text-xl text-gray-900">Recent imported drafts</h2>
        </div>

        {recentImports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-jakarta text-gray-500">
            No imported training drafts yet. Drop a video into the training folder and run the importer.
          </div>
        ) : (
          <div className="space-y-3">
            {recentImports.map(record => {
              const lesson = recentLessonMap.get(record.lessonId)
              return (
                <div key={`${record.lessonId}-${record.importedAt}`} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-gray-400 font-jakarta mb-1">
                        Imported {formatDate(record.importedAt)}
                      </div>
                      <h3 className="font-jakarta font-semibold text-gray-900">{record.courseTitle}</h3>
                      <p className="text-sm font-jakarta text-gray-500 mt-1">{record.sourceName}</p>
                      {lesson && (
                        <p className="text-sm font-jakarta text-gray-600 mt-2">
                          Draft lesson: <strong>{lesson.title}</strong>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/admin/content/lessons/${record.lessonId}`} className="btn-secondary py-2 text-xs">
                        Edit lesson
                      </Link>
                      <Link href={`/admin/content/assets/${record.videoAssetId}`} className="btn-secondary py-2 text-xs">
                        Review video
                      </Link>
                      {record.logAssetId && (
                        <Link href="/admin/qa" className="btn-secondary py-2 text-xs">
                          QA board
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

