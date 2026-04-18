export const ACADEMY_GUIDE_RULES = [
  'Teach one real outcome per lesson. If the video covers multiple workflows, keep the imported draft as one course but split the final learner content into smaller lessons.',
  'Always use the live production labels, buttons, and URLs shown in the current interface. Avoid legacy wording unless you are explicitly flagging a mismatch.',
  'Open with a short outcome summary, then follow with the real click path, the key fields to fill in, and a short troubleshooting section.',
  'Use 3 to 6 visuals for a polished guide: an orientation screenshot, one or more action screenshots, and a confirmation or result screenshot.',
  'Every screenshot should earn its place. Highlight what changed, what to click, or what the user should check before moving on.',
  'Keep the language direct and concrete. Prefer exact menu names like App Settings or Manage Products over vague phrases like go to the setup area.',
  'Call out risky or easy-to-miss steps in a tip block. Use the tip to prevent mistakes, not to repeat the main instructions.',
  'If the source video exposes a bug, security concern, typo, or confusing workflow, keep that evidence in the QA board and do not blur it into the learner instructions.',
  'Publish only after the lesson has been checked against the current production flow end to end.',
]

export const ACADEMY_LESSON_TEMPLATE_SECTIONS = [
  {
    title: 'Lesson outcome',
    detail: 'One short paragraph explaining what the learner will be able to do after finishing the lesson.',
  },
  {
    title: 'Where this happens in the platform',
    detail: 'State the exact URL, top-level menu, and screen names while they are still fresh in the learner’s mind.',
  },
  {
    title: 'Guided walkthrough',
    detail: 'Use the video or the screenshots to walk through the task in order, using production labels verbatim.',
  },
  {
    title: 'What to check before saving or moving on',
    detail: 'Summarise the confirmation cues, expected result, or state change the learner should see.',
  },
  {
    title: 'Troubleshooting',
    detail: 'Cover the common failure states, generic alerts, missing fields, or timing issues that came up in the recording.',
  },
  {
    title: 'Trainer note',
    detail: 'Include one short teaching note about where to pause, what to point at, or how to explain the workflow cleanly.',
  },
]

export const ACADEMY_REVIEW_PROMPT_RULES = [
  'Write in the PestSense Academy style: practical, production-accurate, and easy for a field user or admin to follow.',
  'Use exact interface labels and URLs from the screenshots or video context.',
  'Prefer concise sections with h2 and h3 headings, ordered steps, and one useful blockquote tip.',
  'Reference screenshots where they help the learner understand what changed or what to click.',
  'If the walkthrough exposes a bug or confusing behaviour, mention it briefly as a caution but keep the main lesson focused on the correct workflow.',
]

export const DEFAULT_IMPORT_TAGS = [
  'draft-import',
  'academy-template',
  'needs-review',
  'training-video',
]

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function deriveDisplayTitleFromFilename(filename: string) {
  const bare = filename.replace(/\.[^.]+$/, '')
  const timestampMatch = bare.match(/^(\d{4})-(\d{2})-(\d{2})[ _](\d{2})-(\d{2})-(\d{2})$/)

  if (timestampMatch) {
    const [, year, month, day, hour, minute] = timestampMatch
    return `Training Session ${day}/${month}/${year} ${hour}:${minute}`
  }

  return titleCase(
    bare
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

export function buildDraftCourseTitle(displayTitle: string) {
  return `Training Draft: ${displayTitle}`
}

export function buildDraftLessonTitle(displayTitle: string) {
  return `${displayTitle} Walkthrough`
}

export function buildDraftSummary(displayTitle: string) {
  return `Draft lesson created automatically from the raw training video "${displayTitle}". Use this as the starting point for screenshots, click guidance, QA notes, and the polished Academy version.`
}

export function buildDraftCourseDescription(displayTitle: string) {
  return `Auto-imported draft course created from the training recording "${displayTitle}". Review the walkthrough, extract the best screenshots, and refine the lesson before publishing it to learners.`
}

export function buildDraftLessonContent({
  displayTitle,
  sourceFilename,
  hasLogAsset,
  notes = [],
}: {
  displayTitle: string
  sourceFilename: string
  hasLogAsset: boolean
  notes?: string[]
}) {
  const escapedTitle = escapeHtml(displayTitle)
  const escapedFilename = escapeHtml(sourceFilename)
  const noteItems = notes.length > 0
    ? notes.map(note => `<li>${escapeHtml(note)}</li>`).join('\n')
    : [
        'Add 3 to 6 screenshots from the extracted frames, with one visual for orientation and one for each key action.',
        'Replace any placeholder wording with the exact production labels and button names shown in the current UI.',
        'Move bugs, security concerns, typos, and process gaps into the QA board so the learner copy stays focused.',
      ].map(note => `<li>${escapeHtml(note)}</li>`).join('\n')

  return `
<h2>Lesson outcome</h2>
<p>This draft was created automatically from the raw training recording <strong>${escapedTitle}</strong>. Use it as the first pass for a polished Academy guide once the workflow, screenshots, and wording have been checked against production.</p>

<h3>Where this draft came from</h3>
<ul>
  <li><strong>Source recording:</strong> <code>${escapedFilename}</code></li>
  <li><strong>Format:</strong> one imported walkthrough video with a standard lesson structure already in place</li>
  <li><strong>Status:</strong> draft only - review before publishing</li>
</ul>

<h3>How to turn this into a polished Academy lesson</h3>
<ol>
  <li>Watch the recording and confirm the real learner outcome.</li>
  <li>Use the extracted screenshots to show the page entry point, the main action, and the successful end state.</li>
  <li>Rewrite the steps using the exact production labels, URLs, and button text currently shown in the interface.</li>
  <li>Add one short troubleshooting section for any alerts, timing issues, or easy-to-miss fields.</li>
  <li>Move bugs, visual issues, and security findings into the QA board instead of leaving them inside the learner lesson.</li>
</ol>

<h3>Draft checklist</h3>
<ul>
  ${noteItems}
</ul>

<h3>Suggested final structure</h3>
<ul>
  <li><strong>Lesson outcome:</strong> what the learner will be able to do</li>
  <li><strong>Platform path:</strong> URL, menu path, and screen name</li>
  <li><strong>Guided walkthrough:</strong> the click path in order</li>
  <li><strong>What to check:</strong> how the learner knows it worked</li>
  <li><strong>Troubleshooting:</strong> short, practical recovery notes</li>
  <li><strong>Trainer note:</strong> one useful narration or coaching tip</li>
</ul>

${hasLogAsset ? '<h3>Evidence attached</h3><p>A console or network log was imported alongside the video and attached to this lesson as a download so you can separate training guidance from QA or security evidence.</p>' : ''}

<blockquote><p>Publishing rule: do not publish the final learner lesson until the steps, screenshots, and wording have all been checked against the live production flow from start to finish.</p></blockquote>
  `.trim()
}

