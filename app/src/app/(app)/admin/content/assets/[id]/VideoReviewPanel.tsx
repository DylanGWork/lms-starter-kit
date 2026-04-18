'use client'

import { useState } from 'react'
import { VideoPlayer } from '@/components/lessons/VideoPlayer'
import { Cpu, RefreshCw, Check, Copy, Clock, Image as ImageIcon, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { ACADEMY_LESSON_TEMPLATE_SECTIONS, ACADEMY_REVIEW_PROMPT_RULES } from '@/lib/course-authoring'

interface Frame {
  id: string
  url: string
  title: string | null
  videoTimestamp: number | null
}

interface Asset {
  id: string
  title: string | null
  originalName: string
  url: string
  type: string
  framesExtracted: boolean
  description: string | null
  product: string | null
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VideoReviewPanel({ asset, frames: initialFrames }: { asset: Asset; frames: Frame[] }) {
  const [frames, setFrames] = useState(initialFrames)
  const [extracting, setExtracting] = useState(false)
  const [extractMsg, setExtractMsg] = useState('')
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  async function extractFrames() {
    setExtracting(true)
    setExtractMsg('')
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}/extract-frames`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setFrames(data.frames)
        setExtractMsg(`Extracted ${data.framesExtracted} frames (1 every ${data.intervalSecs}s)`)
      } else {
        setExtractMsg(data.error || 'Extraction failed')
      }
    } catch {
      setExtractMsg('Extraction failed')
    } finally {
      setExtracting(false)
    }
  }

  function toggleFrame(id: string) {
    setSelectedFrameIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedFrameIds(new Set(frames.map(f => f.id)))
  }

  function selectNone() {
    setSelectedFrameIds(new Set())
  }

  function buildClaudePrompt() {
    const selectedFrames = frames.filter(f => selectedFrameIds.has(f.id))
    const frameList = selectedFrames.map(f =>
      `- ${f.title || `Frame at ${formatTime(f.videoTimestamp || 0)}`} → URL: ${window.location.origin}${f.url}`
    ).join('\n')
    const templateSections = ACADEMY_LESSON_TEMPLATE_SECTIONS.map(
      section => `- ${section.title}: ${section.detail}`
    ).join('\n')
    const styleRules = ACADEMY_REVIEW_PROMPT_RULES.map(rule => `- ${rule}`).join('\n')

    return `I've uploaded a training video titled "${asset.title || asset.originalName}" for our PestSense Academy platform.

Below are ${selectedFrames.length} screenshot frames extracted from the video at regular intervals. Please:

1. Review each frame and describe what is being demonstrated at that point in the video
2. Write a structured lesson in HTML format covering the full content shown, with:
   - A brief intro paragraph
   - Step-by-step sections using <h2> and <h3> headings
   - Key points highlighted in <strong> tags
   - A short troubleshooting section
   - A <blockquote> tip for any important warnings or best practices
   - Reference the relevant frame screenshots where they add value (note the timestamp)
3. Suggest a lesson title, 1-sentence summary, and 3–5 tags
4. Flag any steps where a screenshot would be especially useful to embed

Use this standard lesson structure:
${templateSections}

Follow these style rules:
${styleRules}

Extracted frames:
${frameList}

${asset.description ? `Video description: ${asset.description}` : ''}
${asset.product ? `Product: ${asset.product}` : ''}`
  }

  async function copyPrompt() {
    const prompt = buildClaudePrompt()
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const isVideo = asset.type === 'VIDEO'

  return (
    <div className="space-y-6">
      {/* Video player */}
      {isVideo && (
        <div className="max-w-3xl">
          <VideoPlayer url={asset.url} provider="local" title={asset.title} />
        </div>
      )}

      {/* Frame extraction controls */}
      {isVideo && (
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-jakarta font-semibold text-gray-900 mb-0.5">Screenshot frames</h2>
              <p className="text-sm text-gray-500 font-jakarta">
                {frames.length > 0
                  ? `${frames.length} frames extracted · select frames to include in your Claude review prompt`
                  : 'No frames extracted yet — click Extract to process the video'}
              </p>
            </div>
            <button
              onClick={extractFrames}
              disabled={extracting}
              className="btn-primary disabled:opacity-60"
            >
              {extracting
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Extracting…</>
                : <><Cpu className="w-4 h-4" /> {frames.length > 0 ? 'Re-extract frames' : 'Extract frames'}</>
              }
            </button>
          </div>
          {extractMsg && (
            <p className={`mt-3 text-sm font-jakarta ${extractMsg.includes('failed') ? 'text-red-600' : 'text-green-700'}`}>
              {extractMsg}
            </p>
          )}
        </div>
      )}

      {/* Frame gallery */}
      {frames.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-jakarta font-semibold text-gray-900">
              Frames
              {selectedFrameIds.size > 0 && (
                <span className="ml-2 text-sm font-normal text-green-700">{selectedFrameIds.size} selected</span>
              )}
            </h3>
            <div className="flex gap-2 text-sm">
              <button onClick={selectAll} className="text-gray-500 hover:text-gray-900 font-jakarta transition-colors">Select all</button>
              <span className="text-gray-300">·</span>
              <button onClick={selectNone} className="text-gray-500 hover:text-gray-900 font-jakarta transition-colors">None</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {frames.map(frame => {
              const selected = selectedFrameIds.has(frame.id)
              return (
                <button
                  key={frame.id}
                  onClick={() => toggleFrame(frame.id)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all text-left ${
                    selected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={frame.url}
                    alt={frame.title || ''}
                    className="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-jakarta">
                      <Clock className="w-3 h-3" />
                      {formatTime(frame.videoTimestamp || 0)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Claude review prompt builder */}
      {frames.length > 0 && (
        <div className="card p-5 border-l-4" style={{ borderLeftColor: '#61ce70' }}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-jakarta font-semibold text-gray-900">Prepare for Claude review</h3>
              <p className="text-sm text-gray-500 font-jakarta mt-0.5">
                Select the frames above, then copy this prompt and paste it into a new Claude conversation.
                Claude will write the lesson using the shared Academy structure instead of a one-off format.
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(v => !v)}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showInstructions && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-100 p-4 text-sm font-jakarta text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900">How to use this:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Select the frames that best represent each step in the video above</li>
                <li>Click "Copy prompt" below</li>
                <li>Open a new Claude conversation (claude.ai or Claude Code)</li>
                <li>Paste the prompt — Claude will review the frames and write the full lesson in the Academy house style</li>
                <li>Copy Claude's HTML output back into the lesson editor in Admin → Content → Lessons</li>
                <li>Attach the relevant frames as image assets to the lesson</li>
              </ol>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={copyPrompt}
              disabled={selectedFrameIds.size === 0}
              className="btn-primary disabled:opacity-50"
            >
              {copied
                ? <><Check className="w-4 h-4" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy prompt ({selectedFrameIds.size} frames selected)</>
              }
            </button>
            {selectedFrameIds.size === 0 && (
              <span className="text-sm text-gray-400 font-jakarta">Select at least one frame first</span>
            )}
          </div>
        </div>
      )}

      {/* Non-video asset info */}
      {!isVideo && (
        <div className="card p-5">
          <div className="flex items-center gap-2 text-gray-500 font-jakarta text-sm">
            <ImageIcon className="w-4 h-4" />
            <span>Frame extraction is only available for video assets.</span>
          </div>
        </div>
      )}
    </div>
  )
}
