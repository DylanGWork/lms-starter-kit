export type QaPriority = 'P0' | 'P1' | 'P2' | 'P3'
export type QaStatus =
  | 'new'
  | 'triaged'
  | 'needs-evidence'
  | 'reproduced'
  | 'devops-ready'
  | 'submitted'
  | 'resolved'
  | "won't-fix"

export type QaFindingType = 'security' | 'bug' | 'copy' | 'visual' | 'process'

export type QaScreenshot = {
  src: string
  alt: string
  caption: string
}

export type QaFinding = {
  id: string
  status: QaStatus
  type: QaFindingType
  priority: QaPriority
  title: string
  area: string
  summary: string
  impact: string[]
  evidence: string[]
  nextChecks: string[]
  screenshots?: QaScreenshot[]
  sampleLog?: string
}

export const qaReviewMeta = {
  reviewTitle: 'Academy Walkthrough Review (Narration-Aligned)',
  reviewDate: '2026-04-15',
  reviewDuration: '16m 33s',
  reviewer: 'Dylan + Codex',
  sourceVideo: '/home/dylan/dylan/training videos/2026-04-15 11-00-08.mp4',
  sourceLog: '/home/dylan/dylan/training videos/app.pestsense.com-1776215780065.log',
  trackerPath: '/home/dylan/pestsense-academy/qa/live-tracker.md',
  reportPath: '/home/dylan/pestsense-academy/qa/reviews/2026-04-15-training-session-01-narration-aligned.md',
  audience: 'BUSINESS_ADMIN and SUPER_ADMIN',
  lessonUpdates: 8,
} as const

export const qaWorkflowNotes = [
  'Use this board during walkthroughs so bugs, UX issues, and security risks stay attached to visual evidence.',
  'Give software leads or sys admins an Academy admin account and this page becomes the shared review surface.',
  'Use the repo tracker for raw notes and this screen for the clearer, decision-ready version of the same findings.',
]

export const qaFindings: QaFinding[] = [
  {
    id: 'PSA-001',
    status: 'reproduced',
    type: 'security',
    priority: 'P0',
    title: 'Fresh account with only non-smart stations appears to receive live device traffic that does not belong to that account',
    area: 'Live device feed / browser session',
    summary:
      'During a brand new account walkthrough, the browser appeared to receive live device and server-feed traffic that did not match what had actually been created in that account.',
    impact: [
      'Makes a fresh account look like it can see activity from devices it does not own',
      'Leaks device identifiers, event topics, and internal routing structure into an ordinary browser session',
      'Adds avoidable client-side noise and load to sessions that should be quiet',
      'Undermines trust because the account in the walkthrough only had non-smart stations and nothing should have been transmitting',
    ],
    evidence: [
      '155 unique PESTCO/RODENTS topic channels observed in one captured session',
      '73 distinct device-like IDs surfaced inside topic names',
      '72 MQTT-style metadata strings observed, including loriot_predictor routing hints',
      'Peak burst reached 80 server/feed log lines in a single second',
      'Admin-looking channel $DB/ADMIN/MANAGE/RESPONSE was visible in the client log',
    ],
    nextChecks: [
      'Reproduce with a clean low-privilege account that has zero assigned devices visible in the UI',
      'Capture the Network request URL for the live stream or websocket before clicking through other pages',
      'Confirm whether payloads include customer names, emails, tenant IDs, or other direct identifiers',
      'Verify tenant and role scoping server-side before messages are broadcast to the browser',
    ],
    screenshots: [
      {
        src: '/qa-review/academy-hierarchy.jpg',
        alt: 'PestSense site and hierarchy screen used during the walkthrough',
        caption:
          'The problem surfaced during ordinary onboarding and navigation, not a specialist engineering view.',
      },
    ],
    sampleLog: `Server message sent to subscribing widget 'Rodent#0' with channel '$DB/ADMIN/MANAGE/RESPONSE', sysmeta 'server/feed'\nreceived a server event but did not have a function registered\nMQTT#3,loriot_predictor,D4F98D6AE3E8FFFF,101812,0`,
  },
  {
    id: 'PSA-003',
    status: 'triaged',
    type: 'security',
    priority: 'P1',
    title: 'Production console exposes internal event taxonomy and integration metadata',
    area: 'Browser console / telemetry logging',
    summary:
      'Even if the subscription scope were fixed, the browser console still reveals more system structure than a low-privilege user should learn from day-to-day usage.',
    impact: [
      'Makes backend conventions easier to map from the browser alone',
      'Turns any accidental feed leak into a more interpretable data exposure',
      'Creates a noisy production console that hides real breakages',
    ],
    evidence: [
      'Log includes MQTT-style metadata strings such as MQTT#3,loriot_predictor,...',
      'Widget names, channel names, and graph subscriptions are logged in plaintext',
      'Console shows internal routing behavior like unhandled server/feed events',
    ],
    nextChecks: [
      'Confirm whether debug logging is enabled in production by default',
      'Suppress or redact internal channel names and metadata client-side',
      'Check whether the browser receives fields it never needs to render the current screen',
    ],
    sampleLog:
      "graph channel requested: PESTCO/RODENTS/N01878/...\nServer message sent to subscribing widget ... sysmeta 'server/feed'",
  },
  {
    id: 'PSA-004',
    status: 'triaged',
    type: 'bug',
    priority: 'P2',
    title: 'Product setup is a hidden prerequisite for bait/device setup, and the new-product form fails with vague validation',
    area: 'App Settings > Manage Products > New Product',
    summary:
      'The walkthrough showed that bait/device setup stalls until products are added to company products, and the fallback create-product path then fails with generic validation that does not explain the real problem clearly.',
    impact: [
      'Blocks a user from finishing bait-related setup unless they already understand a hidden prerequisite',
      'Breaks training flow because the narrator has to stop and guess what is wrong',
      'Makes the form feel brittle and less trustworthy than it should',
      'Turns a teachable admin workflow into a trial-and-error task',
    ],
    evidence: [
      'The company-product transfer control is not self-explanatory in the walkthrough',
      'Alert message observed: Please fill out all required fields',
      'The workflow did not visibly highlight the missing field',
      'Narration suggests the weight field may reject decimals and the active-ingredient flow becomes awkward to undo',
    ],
    nextChecks: [
      'Make the product prerequisite obvious before the user reaches device setup',
      'Clarify the company-product transfer action with explicit labels',
      'Identify the exact missing field that caused the alert',
      'Add inline required-field markers and field-level errors',
      'Replace blocking alert behavior with inline guidance and focus management',
    ],
    screenshots: [
      {
        src: '/qa-review/product-validation.jpg',
        alt: 'Product creation form during validation issue',
        caption: 'The form lets the user reach save, then falls back to a generic alert instead of precise guidance.',
      },
      {
        src: '/qa-review/academy-manage-products.jpg',
        alt: 'Manage products screen in PestSense Academy guide crop',
        caption: 'This is a core admin workflow, so weak validation becomes a training and product issue at the same time.',
      },
    ],
  },
  {
    id: 'PSA-009',
    status: 'triaged',
    type: 'bug',
    priority: 'P2',
    title: 'Signup does not show password rules early enough and the completion state lacks a clear finish',
    area: 'Public signup / first-run onboarding',
    summary:
      'The walkthrough calls out that password requirements are learned too late and the post-registration state does not give the user a strong, obvious finish to the task.',
    impact: [
      'Creates avoidable friction on a high-trust public-facing flow',
      'Teaches password rules by failure instead of guidance',
      'Leaves the user less certain about what to do immediately after successful registration',
    ],
    evidence: [
      'Password rules were called out explicitly in the narration as not being shown clearly before submit',
      'The success state was described as needing a clearer close or finish action',
      'This is grounded in the training video and transcript rather than console-only evidence',
    ],
    nextChecks: [
      'Show password requirements before submission on all signup variants',
      'Add a stronger completion CTA or dismiss action after successful registration',
      'Tighten the first-run copy so the next step is unmistakable',
    ],
    screenshots: [
      {
        src: '/qa-review/signup-copy.jpg',
        alt: 'Signup screen frame showing password and copy issues',
        caption: 'This is a trust-sensitive screen, so missing guidance stands out immediately to a new user.',
      },
    ],
  },
  {
    id: 'PSA-010',
    status: 'triaged',
    type: 'bug',
    priority: 'P1',
    title: 'QR scanner or camera flow launches unexpectedly during device setup',
    area: 'Device install / QR scanning',
    summary:
      'During device setup, the walkthrough hit a camera-related path without an intentional scan action, and the console confirms the scanner then failed with Camera not found.',
    impact: [
      'Feels unstable because camera access appears without a clear user-triggered reason',
      'Interrupts a critical install workflow in the middle of setup',
      'Makes the product harder to trust and harder to train',
    ],
    evidence: [
      'Narration explicitly calls out the camera prompt as a bug',
      'Console line: [WIDGETS/QRCodeScanner] ERROR Camera not found.',
      'Console line: BarcodeScanner.html:497 Uncaught (in promise) Camera not found.',
    ],
    nextChecks: [
      'Reproduce from a fresh account and record the exact click path that opens the scanner',
      'Confirm whether back-navigation or field focus is incorrectly triggering QR mode',
      'Ensure camera permission is never requested without an explicit scan action',
    ],
  },
  {
    id: 'PSA-011',
    status: 'triaged',
    type: 'bug',
    priority: 'P1',
    title: 'Quickstart or Testing Site flow can reappear after the user has already moved into the main product',
    area: 'Onboarding state / navigation',
    summary:
      'After moving through setup and using products and users, the walkthrough returned to the quickstart/testing-site flow when trying to get back home, which made the app state feel unreliable.',
    impact: [
      'Makes the user feel like setup has not really completed',
      'Creates confusion around what the true home state of the product is',
      'Interrupts training because the narrator has to explain around a state regression',
    ],
    evidence: [
      'Narration explicitly calls this out as a pretty big bug',
      'The issue appears after the user has already moved past first-run setup and into normal admin screens',
      'This is grounded in the walkthrough rather than a single definitive console line',
    ],
    nextChecks: [
      'Confirm the exact state transition that causes quickstart to reappear',
      'Check whether onboarding-complete flags are persisting correctly',
      'Verify whether this affects only new accounts or existing tenants too',
    ],
  },
  {
    id: 'PSA-005',
    status: 'triaged',
    type: 'bug',
    priority: 'P2',
    title: 'Production frontend still references missing assets and third-party CSS',
    area: 'Global frontend assets / widget shell',
    summary:
      'The captured session contains repeated 404s for local assets and repeated CORS failures for an external stylesheet dependency.',
    impact: [
      'Adds avoidable console noise that buries real issues',
      'Can produce inconsistent styling, missing icons, or brittle widget behavior',
      'Leaves production dependent on third-party hosts that can fail or change unexpectedly',
    ],
    evidence: [
      'Repeated 404s observed for utils.js, MaterialIcons-Regular.woff2, bg.png, manifest.json, and api/',
      'Repeated blocked stylesheet requests observed for https://www.w3schools.com/w3css/4/w3.css',
      'Failures appeared across Generic.html, SiteWizard.html, Device.html, and curtain.html',
    ],
    nextChecks: [
      'Inventory asset references that still point to missing or legacy files',
      'Vendor third-party CSS locally or remove it entirely',
      'Verify whether missing icons or scripts create visible regressions in the UI',
    ],
  },
  {
    id: 'PSA-006',
    status: 'triaged',
    type: 'bug',
    priority: 'P3',
    title: 'Graph rendering emits invalid negative SVG height errors',
    area: 'Device graphs / chart rendering',
    summary:
      'Chart rendering is attempting to draw invalid negative SVG dimensions under some data or layout state.',
    impact: [
      'Adds repeated console noise in already noisy sessions',
      'Suggests graph components are not guarding against empty or inverted data',
      'May hide edge-case chart failures until a customer reports them visually',
    ],
    evidence: [
      'Repeated error: <rect> attribute height: A negative value is not valid. ("-40")',
      'Issue likely correlates with empty history or malformed graph state',
    ],
    nextChecks: [
      'Reproduce with a device that has no history or incomplete data',
      'Trace which chart component emits the invalid dimension',
      'Clamp or guard bar heights before SVG render',
    ],
  },
  {
    id: 'PSA-007',
    status: 'triaged',
    type: 'copy',
    priority: 'P2',
    title: 'Core journeys use inconsistent terminology and trust-reducing copy',
    area: 'Signup, login, onboarding, admin UI',
    summary:
      'The walkthrough showed multiple visible wording issues and naming changes inside the same journey, which makes the product feel less settled.',
    impact: [
      'Reduces trust on signup and first login screens',
      'Makes training harder because the narrator cannot rely on stable product language',
      'Creates the impression of a tool that still speaks in internal labels rather than customer-facing terms',
    ],
    evidence: [
      'Password should be atleast 8 characters long',
      'QUICKSTART, Testing Site, and Test Site Mode used for the same flow',
      'By Station id, Food Warehouse Set Up, and APPSETTINGS shown to the user',
      'Transfer actions in company products are not clearly labeled as Add or Remove',
      'Marketing copy uses open-standards based and standards based solution phrasing',
    ],
    nextChecks: [
      'Run a structured copy pass across onboarding, admin, and marketing-adjacent screens',
      'Define canonical terms for site, test site, quickstart, and role labels',
      'Check region-specific wording so the product matches the audience being trained',
    ],
    screenshots: [
      {
        src: '/qa-review/signup-copy.jpg',
        alt: 'Signup screen frame showing copy issues',
        caption: 'Small wording issues on high-trust screens stand out more than they would inside a back-office form.',
      },
      {
        src: '/qa-review/register-flow.jpg',
        alt: 'Registration flow frame from the training video',
        caption: 'The registration journey is strong enough for training, but the language needs to be more consistent.',
      },
    ],
  },
  {
    id: 'PSA-008',
    status: 'triaged',
    type: 'visual',
    priority: 'P2',
    title: 'Core forms and tables are visually dense and lose context during data entry',
    area: 'Signup, site wizard, device setup, products, user management',
    summary:
      'Several high-value workflows rely on placeholder-only fields, cramped controls, or truncated tables that require extra narration to stay understandable.',
    impact: [
      'Raises trainer effort because the interface is not carrying enough of the explanation on its own',
      'Makes self-serve learning harder for new operators or admins',
      'Creates friction in workflows that should feel obvious after one run-through',
    ],
    evidence: [
      'Site wizard fields lose context once values are entered',
      'The setup location meaning had to be explained manually during the walkthrough',
      'Device setup controls are dense and visually compressed',
      'Product tables truncate important headers on normal desktop widths',
      'User management shows placeholder-like values such as [#]',
    ],
    nextChecks: [
      'Replace placeholder-only inputs with persistent labels',
      'Increase spacing and hierarchy in the device and onboarding forms',
      'Rework table widths or responsive behavior so headers remain readable',
    ],
    screenshots: [
      {
        src: '/qa-review/quickstart-density.jpg',
        alt: 'Quickstart and onboarding workflow frame showing density issues',
        caption: 'The workflow works, but it demands explanation because the field hierarchy is doing too little.',
      },
      {
        src: '/qa-review/user-access.jpg',
        alt: 'User access screen frame showing dense admin controls',
        caption: 'Admin screens pack important controls into tight layouts while leaving other areas visually empty.',
      },
    ],
  },
  {
    id: 'PSA-002',
    status: 'new',
    type: 'process',
    priority: 'P2',
    title: 'Training-driven QA needs a reusable capture and escalation workflow',
    area: 'QA operations / DevOps handoff',
    summary:
      'Walkthrough videos are surfacing valuable issues quickly, but they need a repeatable path from evidence to triage to developer-ready task.',
    impact: [
      'Without a stable process, valuable issues can stay anecdotal and lose urgency',
      'Review quality becomes dependent on memory instead of evidence',
      'Engineering receives weaker bug reports than the session actually supports',
    ],
    evidence: [
      'Live tracker, review doc, and Academy lesson updates are now in place',
      'The new admin board is intended to become the clearer shared surface for sys admins and engineering leads',
    ],
    nextChecks: [
      'Keep attaching screenshots, logs, and repro notes to each finding as new sessions are recorded',
      'Promote high-signal findings into DevOps-ready tickets once the evidence is clean enough',
      'Decide whether this board should eventually support direct ticket export or assignment',
    ],
  },
]

export const qaStats = {
  openFindings: qaFindings.filter((finding) => !['resolved', "won't-fix"].includes(finding.status)).length,
  securityFindings: qaFindings.filter((finding) => finding.type === 'security').length,
  criticalFindings: qaFindings.filter((finding) => finding.priority === 'P0').length,
  screenshotCount: qaFindings.reduce((count, finding) => count + (finding.screenshots?.length ?? 0), 0),
  lessonUpdates: qaReviewMeta.lessonUpdates,
}
