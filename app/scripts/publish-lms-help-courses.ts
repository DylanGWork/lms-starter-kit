import { ContentStatus, PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

type LessonSeed = {
  title: string
  slug: string
  summary: string
  sortOrder: number
  version: string
  tags: string[]
  content: string
}

type ModuleSeed = {
  title: string
  description: string
  sortOrder: number
  lessons: LessonSeed[]
}

type CourseSeed = {
  title: string
  slug: string
  description: string
  estimatedMins: number
  sortOrder: number
  roles: Role[]
  modules: ModuleSeed[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function lessonContent(...sections: string[]) {
  return sections.join('\n')
}

function routeBlock(title: string, items: string[]) {
  return `
<h2>${title}</h2>
<ul>
  ${items.map((item) => `<li>${item}</li>`).join('\n')}
</ul>
`
}

function callout(text: string) {
  return `<blockquote><p>${text}</p></blockquote>`
}

const managerCourse: CourseSeed = {
  title: 'Using PestSense Academy as a Manager',
  slug: 'using-pestsense-academy-as-a-manager',
  description:
    'Internal guide for site managers and operational leads who need to browse training, monitor compliance, and coach technicians inside the Academy.',
  estimatedMins: 18,
  sortOrder: 2,
  roles: [Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN],
  modules: [
    {
      title: 'Module 1: Day-To-Day LMS Use',
      description: 'Learn where to browse training and how to read team progress without getting lost in admin tooling.',
      sortOrder: 1,
      lessons: [
        {
          title: 'Browse Courses And Start The Right Learning Path',
          slug: 'browse-courses-and-start-the-right-learning-path',
          summary: 'Use the learning catalog confidently and understand which courses belong to technicians, managers, and internal team members.',
          sortOrder: 1,
          version: '1.0',
          tags: ['internal', 'manager', 'academy', 'browse-courses'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Managers usually need two things from the Academy straight away: find the right course quickly, and avoid sending people into the wrong learning path. This lesson gives you the simple route through the LMS.</p>`,
            routeBlock('Where To Go', [
              '<strong>Browse Courses</strong>: open <code>/learn</code> to see all published courses available to your role.',
              '<strong>Team Help</strong>: open <code>/manager/help</code> for the internal help surface, role boundaries, and LMS operating guides.',
              '<strong>Dashboard</strong>: use the learner dashboard when you want the next suggested item rather than the full catalog.',
            ]),
            `<h2>How To Read The Catalog</h2>
<ol>
  <li>Open <strong>Browse Courses</strong>.</li>
  <li>Look at the category first, not just the title. This helps separate software, hardware, sales, and internal operational learning.</li>
  <li>Send technicians to technician-facing workflow courses.</li>
  <li>Use manager-facing courses when the goal is oversight, reporting, alerts, or escalation.</li>
  <li>Use the internal manager/admin guides when the goal is running the Academy itself.</li>
</ol>`,
            callout('Good operating habit: if a course is about how to use the LMS, it is internal training. If it is about how to use PestSense for customer outcomes, it is customer-facing training.'),
            `<h2>What To Send Different People</h2>
<ul>
  <li><strong>Technicians</strong>: start with <strong>Technician Getting Started</strong>, then move into setup, visit, and servicing workflows.</li>
  <li><strong>Customer managers</strong>: send them to <strong>Site Manager Basics</strong> so they can understand alerts, reports, and escalation.</li>
  <li><strong>Internal managers</strong>: use this course and the help area to understand compliance tracking and coaching.</li>
  <li><strong>Admins</strong>: use the admin playbook for requirements, content, and QA operations.</li>
</ul>`,
            `<h2>Manager Checklist</h2>
<ol>
  <li>Open <code>/learn</code>.</li>
  <li>Find the course that matches the person and outcome.</li>
  <li>Check whether the course is customer-facing or internal.</li>
  <li>Send the person to the right learning path before chasing compliance.</li>
</ol>`
          ),
        },
        {
          title: 'Track Team Compliance And Technician Records',
          slug: 'track-team-compliance-and-technician-records',
          summary: 'Use the manager compliance screens to see who is behind, who is progressing, and who needs a nudge.',
          sortOrder: 2,
          version: '1.0',
          tags: ['internal', 'manager', 'compliance', 'technicians'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Once people are assigned learning, the manager job is not to guess. It is to look at the real progress data and coach the right people at the right time.</p>`,
            routeBlock('Main Screens', [
              '<strong>Team Compliance</strong>: open <code>/manager</code> to see who is compliant, in progress, or not started.',
              '<strong>Individual Technician Record</strong>: open a technician card when you need course-by-course detail and a printable record.',
            ]),
            `<h2>How To Use Team Compliance</h2>
<ol>
  <li>Open <strong>Team Compliance</strong>.</li>
  <li>Review the top-level totals first so you know whether the issue is broad or isolated.</li>
  <li>Check who has not started at all. That is usually the highest-friction coaching group.</li>
  <li>Open individual technician records when someone says they are finished but the dashboard disagrees.</li>
  <li>Use printable reports when you need a clean status snapshot for internal follow-up.</li>
</ol>`,
            `<h2>What Good Manager Behaviour Looks Like</h2>
<ul>
  <li>Use compliance data to coach, not to surprise people later.</li>
  <li>Look for patterns. If several people stall at the same lesson, the training itself may need improving.</li>
  <li>Keep the message practical: what is required, what is overdue, and what the next action is.</li>
</ul>`,
            callout('If multiple technicians are blocked on the same course, treat that as a content or UX signal, not just a people problem.'),
            `<h2>Manager Checklist</h2>
<ol>
  <li>Open <code>/manager</code> at least once a week.</li>
  <li>Follow up first with people who have not started.</li>
  <li>Open the detailed record if progress looks confusing.</li>
  <li>Escalate content problems when the same blockage repeats across the team.</li>
</ol>`
          ),
        },
      ],
    },
    {
      title: 'Module 2: Coaching And Escalation',
      description: 'Understand what a manager can change directly and what needs to be handed to an admin.',
      sortOrder: 2,
      lessons: [
        {
          title: 'Know What Managers Can Change And When To Escalate',
          slug: 'know-what-managers-can-change-and-when-to-escalate',
          summary: 'Separate manager responsibilities from admin-only LMS controls so you do not waste time in the wrong place.',
          sortOrder: 1,
          version: '1.0',
          tags: ['internal', 'manager', 'roles', 'escalation'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Managers can see a lot in the Academy, but they are not supposed to change everything. Knowing the boundary keeps the LMS calm and avoids dead ends.</p>`,
            `<h2>Managers Can</h2>
<ul>
  <li>Browse courses and point people to the right learning.</li>
  <li>Open Team Compliance and individual technician records.</li>
  <li>Coach staff based on progress, blockers, and overdue work.</li>
  <li>Use the Team Help area to understand the Academy workflow.</li>
</ul>`,
            `<h2>Managers Cannot</h2>
<ul>
  <li>Set role-based mandatory training rules.</li>
  <li>Publish or restructure courses.</li>
  <li>Work the QA board or internal content tooling without admin rights.</li>
</ul>`,
            routeBlock('When To Escalate To An Admin', [
              'A course needs to become mandatory for a role.',
              'You need content fixed, expanded, or reordered.',
              'A lesson has a bug, broken media, or confusing instructions.',
              'QA evidence or a security concern needs to be captured inside the Academy.',
            ]),
            callout('Simple rule: managers coach people, admins configure the Academy.'),
            `<h2>Escalation Checklist</h2>
<ol>
  <li>Capture the problem clearly.</li>
  <li>Say whether it is a people issue, a content issue, or an Academy admin issue.</li>
  <li>Pass it to a Business Admin or Super Admin when the fix touches requirements, content, or QA workflow.</li>
</ol>`
          ),
        },
        {
          title: 'Run A Simple Weekly Training Rhythm',
          slug: 'run-a-simple-weekly-training-rhythm',
          summary: 'Use a light weekly routine to keep training moving without creating admin overhead.',
          sortOrder: 2,
          version: '1.0',
          tags: ['internal', 'manager', 'coaching', 'workflow'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Managers do not need a heavy governance program to keep learning healthy. A simple, predictable rhythm is enough.</p>`,
            `<h2>A Practical Weekly Rhythm</h2>
<ol>
  <li>Open <strong>Team Compliance</strong> once at the start of the week.</li>
  <li>Identify three groups: completed, in progress, and not started.</li>
  <li>Send a short reminder only to the people who need it.</li>
  <li>Notice repeated friction and feed it back to an admin.</li>
  <li>Close the loop at the end of the week by checking movement.</li>
</ol>`,
            `<h2>What To Avoid</h2>
<ul>
  <li>Do not flood everyone with the same reminder.</li>
  <li>Do not assume “in progress” means blocked. Open the detail when needed.</li>
  <li>Do not try to solve content problems only with reminders.</li>
</ul>`,
            callout('Healthy Academy operations come from short feedback loops: assign clearly, review quickly, coach lightly, and improve the content when the same confusion appears more than once.'),
            `<h2>Weekly Checklist</h2>
<ol>
  <li>Review compliance.</li>
  <li>Coach the right people.</li>
  <li>Escalate repeat blockers.</li>
  <li>Check again before the week closes.</li>
</ol>`
          ),
        },
      ],
    },
  ],
}

const adminCourse: CourseSeed = {
  title: 'PestSense Academy Admin Playbook',
  slug: 'pestsense-academy-admin-playbook',
  description:
    'Internal operating guide for business admins and super admins who manage required training, content, QA, and Academy health.',
  estimatedMins: 22,
  sortOrder: 3,
  roles: [Role.BUSINESS_ADMIN, Role.SUPER_ADMIN],
  modules: [
    {
      title: 'Module 1: Control Required Learning',
      description: 'Use the admin controls that shape the learner experience for different roles.',
      sortOrder: 1,
      lessons: [
        {
          title: 'Set Required Training By Role',
          slug: 'set-required-training-by-role',
          summary: 'Use the Required Training screen to make the right courses mandatory for technicians and site managers.',
          sortOrder: 1,
          version: '1.0',
          tags: ['internal', 'admin', 'requirements', 'roles'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Admins are the people who turn “nice to have” learning into an expected standard. In the current Academy, this happens by role rather than by individual user.</p>`,
            routeBlock('Where To Work', [
              '<strong>Required Training</strong>: open <code>/admin/requirements</code>.',
              '<strong>Roles Supported</strong>: current required training is set by role, mainly <code>TECHNICIAN</code> and <code>SITE_MANAGER</code>.',
            ]),
            `<h2>How To Set Requirements</h2>
<ol>
  <li>Open <strong>Required Training</strong>.</li>
  <li>Choose the course you want to make mandatory.</li>
  <li>Select the role that must complete it.</li>
  <li>Add notes if the reason matters, such as rollout, compliance, or readiness.</li>
  <li>Save and then confirm it appears in the required list for that role.</li>
</ol>`,
            `<h2>Important Constraint</h2>
<p>The current Academy supports <strong>role-based</strong> requirements, not per-person assignment. That means one decision applies to every user in that role.</p>`,
            callout('Use required training sparingly. The strongest mandatory courses are the ones that truly protect quality, readiness, or compliance.'),
            `<h2>Admin Checklist</h2>
<ol>
  <li>Check whether the course is published and role-visible first.</li>
  <li>Mark it required for the right role.</li>
  <li>Review manager compliance later to make sure the change is landing.</li>
</ol>`
          ),
        },
        {
          title: 'Use Team Compliance To Follow Through',
          slug: 'use-team-compliance-to-follow-through',
          summary: 'Make sure required learning is actually landing by pairing admin setup with manager-facing compliance review.',
          sortOrder: 2,
          version: '1.0',
          tags: ['internal', 'admin', 'compliance', 'follow-through'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Setting requirements is only the first half of the job. Healthy Academy operations come from follow-through with managers and clear visibility of uptake.</p>`,
            `<h2>How Admins Should Use Compliance Data</h2>
<ol>
  <li>After changing requirements, give the team a clear start date.</li>
  <li>Check the manager compliance surface after rollout.</li>
  <li>Watch for role-wide confusion, not only individual lag.</li>
  <li>If a course is widely stalled, inspect the content before assuming the people are the issue.</li>
</ol>`,
            `<h2>What Good Admin Follow-Through Looks Like</h2>
<ul>
  <li>Managers know what is mandatory and why.</li>
  <li>Courses are easy to find and clearly named.</li>
  <li>Compliance reporting supports coaching instead of creating friction.</li>
  <li>Repeated learner confusion triggers content or UX improvements.</li>
</ul>`,
            callout('A requirement is only successful when managers can explain it, learners can find it, and progress data stays believable.'),
            `<h2>Admin Checklist</h2>
<ol>
  <li>Set the requirement.</li>
  <li>Communicate the expectation.</li>
  <li>Review compliance after rollout.</li>
  <li>Improve the course if the same blockage repeats.</li>
</ol>`
          ),
        },
      ],
    },
    {
      title: 'Module 2: Run The Academy',
      description: 'Use the content, QA, and help tools to keep the Academy coherent for the whole team.',
      sortOrder: 2,
      lessons: [
        {
          title: 'Manage Content, QA, And Internal Help',
          slug: 'manage-content-qa-and-internal-help',
          summary: 'Use the content area, guide blueprint, and QA board together so the Academy stays consistent and evidence-backed.',
          sortOrder: 1,
          version: '1.0',
          tags: ['internal', 'admin', 'qa', 'content'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>The Academy is not just a course list. It is also the place where internal help, QA evidence, and training standards should stay aligned.</p>`,
            routeBlock('Core Admin Surfaces', [
              '<strong>Content</strong>: use the admin content area to manage courses, modules, and lessons.',
              '<strong>Guide Blueprint</strong>: use <code>/admin/content/guides</code> to keep new guide builds consistent.',
              '<strong>QA Board</strong>: use <code>/admin/qa</code> to review bugs, evidence, severity, and follow-up actions.',
              '<strong>Team Help</strong>: keep <code>/manager/help</code> aligned with the real Academy workflow so managers are not sent to stale instructions.',
            ]),
            `<h2>Operating Rule</h2>
<p>If the team is learning something repeatedly, it belongs in the Academy. If the same bug or confusion appears repeatedly, it belongs in QA. If a guide format is drifting, it belongs in the blueprint.</p>`,
            `<h2>What To Keep Consistent</h2>
<ul>
  <li>Course titles should describe the real user outcome.</li>
  <li>Internal help should match the live Academy routes and permissions.</li>
  <li>QA evidence should be understandable to someone who was not in the session.</li>
  <li>Manager-facing guidance should not promise admin-only controls.</li>
</ul>`,
            callout('The best Academy admin work removes ambiguity: the right people see the right courses, the help pages match reality, and QA evidence is easy to act on.'),
            `<h2>Admin Checklist</h2>
<ol>
  <li>Review the help surface after major content changes.</li>
  <li>Keep QA items clear, visual, and actionable.</li>
  <li>Use the blueprint when publishing new internal guides.</li>
</ol>`
          ),
        },
        {
          title: 'Weekly Admin Operating Rhythm',
          slug: 'weekly-admin-operating-rhythm',
          summary: 'Run the Academy with a simple recurring rhythm that covers requirements, quality, and content upkeep.',
          sortOrder: 2,
          version: '1.0',
          tags: ['internal', 'admin', 'workflow', 'operations'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Admins need a repeatable operating rhythm, not a pile of disconnected tasks. This lesson gives you a practical cadence.</p>`,
            `<h2>A Simple Weekly Rhythm</h2>
<ol>
  <li>Check whether any required training needs changing.</li>
  <li>Review manager compliance signals and note repeated learner friction.</li>
  <li>Open the QA board and check the highest-severity issues first.</li>
  <li>Refresh help pages or course content if the Academy has changed.</li>
  <li>Publish only when the wording, visibility, and purpose are clear.</li>
</ol>`,
            `<h2>What Good Admin Ownership Looks Like</h2>
<ul>
  <li>The Academy feels calm and predictable.</li>
  <li>Managers know where to look for help.</li>
  <li>Customer-facing courses are distinct from internal operating guides.</li>
  <li>The same confusion does not stay unfixed for months.</li>
</ul>`,
            callout('The Academy should feel like a maintained product, not a storage cupboard for old instructions.'),
            `<h2>Admin Checklist</h2>
<ol>
  <li>Review requirements.</li>
  <li>Review compliance.</li>
  <li>Review QA.</li>
  <li>Refresh help and content.</li>
  <li>Publish cleanly.</li>
</ol>`
          ),
        },
      ],
    },
  ],
}

const customerManagerCourse: CourseSeed = {
  title: 'Site Manager Basics',
  slug: 'site-manager-basics',
  description:
    'Customer manager guide for understanding site activity, alerts, service outcomes, and when to escalate to your PestSense provider.',
  estimatedMins: 18,
  sortOrder: 4,
  roles: [Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN],
  modules: [
    {
      title: 'Module 1: See What Is Happening On Site',
      description: 'Understand the normal management view of activity, status, and alerts.',
      sortOrder: 1,
      lessons: [
        {
          title: 'Reviewing Site Activity',
          slug: 'reviewing-site-activity',
          summary: 'Use the site-level screens to understand what is happening across your locations and devices.',
          sortOrder: 1,
          version: '2.0',
          tags: ['customer', 'manager', 'site-activity', 'overview'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Customer managers do not need to behave like technicians. Your job is to understand whether the site looks healthy, whether anything needs attention, and whether the service story makes sense.</p>`,
            routeBlock('Where To Look', [
              '<strong>Site-Level Overview</strong>: use the site view to understand the current state of the customer location.',
              '<strong>Live Activity</strong>: look for obvious device activity, alert counts, or service signals that explain what changed recently.',
              '<strong>Location Structure</strong>: make sure the site layout and zones make sense for the real premises.',
            ]),
            `<h2>What To Look For First</h2>
<ol>
  <li>Is the site structure clear and familiar?</li>
  <li>Are there devices or areas showing unusual activity?</li>
  <li>Does the recent activity line up with what the team expects on site?</li>
  <li>Do you need clarification from the service provider, or is the picture already clear enough?</li>
</ol>`,
            `<h2>What This Screen Is For</h2>
<ul>
  <li>It gives you oversight, not technician-level maintenance instructions.</li>
  <li>It helps you spot patterns, exceptions, and service conversations worth having.</li>
  <li>It helps you understand whether the site appears calm, noisy, or in need of a follow-up discussion.</li>
</ul>`,
            callout('Customer manager view: you are looking for clarity and confidence, not trying to perform field actions from the dashboard.'),
            `<h2>Manager Checklist</h2>
<ol>
  <li>Open the site view.</li>
  <li>Check the overall activity picture.</li>
  <li>Notice anything unusual.</li>
  <li>Decide whether you simply need awareness or whether you need to ask a question.</li>
</ol>`
          ),
        },
        {
          title: 'Understanding Alerts And What Needs Action',
          slug: 'understanding-alerts-and-what-needs-action',
          summary: 'Understand the difference between an alert that needs immediate follow-up and a signal that simply needs monitoring.',
          sortOrder: 2,
          version: '1.0',
          tags: ['customer', 'manager', 'alerts', 'action'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Alerts only help if the customer manager can read them calmly. This lesson helps you decide what needs action, what needs context, and what can wait for the next planned conversation.</p>`,
            `<h2>How To Read Alerts</h2>
<ol>
  <li>Look at the location, device, and timing.</li>
  <li>Check whether the alert appears isolated or part of a wider pattern.</li>
  <li>Decide whether it is an awareness signal, a service follow-up, or an urgent conversation.</li>
</ol>`,
            `<h2>Good Questions To Ask</h2>
<ul>
  <li>Is this a one-off signal or part of a trend?</li>
  <li>Has this already been reviewed by the provider?</li>
  <li>Does the location make this alert more important?</li>
  <li>Do we need action now, or do we need explanation at the next service touchpoint?</li>
</ul>`,
            `<h2>What Customer Managers Usually Need</h2>
<ul>
  <li>Confidence that the alert is understood.</li>
  <li>Clear language about whether action is required.</li>
  <li>A simple path for follow-up when something does not look right.</li>
</ul>`,
            callout('A good alert experience does not leave the customer guessing whether something is urgent.'),
            `<h2>Manager Checklist</h2>
<ol>
  <li>Check location and timing.</li>
  <li>Decide whether the alert is isolated or repeated.</li>
  <li>Ask for provider context when the action is not obvious.</li>
</ol>`
          ),
        },
      ],
    },
    {
      title: 'Module 2: Act On Reports And Escalations',
      description: 'Understand the service story and know when to ask for more detail or support.',
      sortOrder: 2,
      lessons: [
        {
          title: 'Read Service Reports And Visit Outcomes',
          slug: 'read-service-reports-and-visit-outcomes',
          summary: 'Use service outputs to understand what happened, what changed, and what the provider did about it.',
          sortOrder: 1,
          version: '1.0',
          tags: ['customer', 'manager', 'reports', 'service-visits'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Service reports are where PestSense turns activity into a customer story. A manager should be able to read the outcome without needing to decode technician shorthand.</p>`,
            `<h2>How To Read A Service Outcome</h2>
<ol>
  <li>Confirm which site and visit you are looking at.</li>
  <li>Look for the key outcome first: what was found, serviced, changed, or resolved.</li>
  <li>Check whether the actions match the alerts or activity you were seeing.</li>
  <li>Notice whether any open items still need discussion.</li>
</ol>`,
            `<h2>What Good Reports Give A Manager</h2>
<ul>
  <li>A clear summary of what happened.</li>
  <li>Confidence that the provider responded appropriately.</li>
  <li>Enough detail to answer operational questions without drowning in field detail.</li>
</ul>`,
            callout('If the report leaves you more confused than informed, that is a communication gap worth raising with the provider.'),
            `<h2>Manager Checklist</h2>
<ol>
  <li>Read the outcome summary first.</li>
  <li>Match the report against recent activity or alerts.</li>
  <li>Flag any unresolved or unclear points for follow-up.</li>
</ol>`
          ),
        },
        {
          title: 'Knowing When To Escalate Or Ask Your Provider',
          slug: 'knowing-when-to-escalate-or-ask-your-provider',
          summary: 'Know when a question can wait, when it needs clarification, and when it should be escalated quickly.',
          sortOrder: 2,
          version: '1.0',
          tags: ['customer', 'manager', 'escalation', 'provider'],
          content: lessonContent(
            `<h2>What This Lesson Solves</h2>
<p>Customer managers should not be left wondering whether to wait, ask, or escalate. This lesson gives you a simple framework.</p>`,
            `<h2>When To Ask A Normal Follow-Up Question</h2>
<ul>
  <li>You want clarification on an alert or recent service outcome.</li>
  <li>The site view does not fully match what you expected to see.</li>
  <li>You need help interpreting a device, location, or visit detail.</li>
</ul>`,
            `<h2>When To Escalate More Firmly</h2>
<ul>
  <li>The same issue repeats without a clear resolution.</li>
  <li>A report, alert, or site state suggests the service response was incomplete.</li>
  <li>The platform view looks confusing enough that trust is being affected.</li>
  <li>You believe the site carries a higher operational or compliance risk than the system is reflecting.</li>
</ul>`,
            `<h2>What To Include In An Escalation</h2>
<ol>
  <li>Which site and area you are referring to.</li>
  <li>What you saw.</li>
  <li>What you expected instead.</li>
  <li>Why the issue matters operationally.</li>
</ol>`,
            callout('The best customer escalations are clear and specific. They do not need technical jargon, just a clean statement of what looks wrong and why it matters.'),
            `<h2>Manager Checklist</h2>
<ol>
  <li>Decide whether you need context, action, or escalation.</li>
  <li>Capture the site, area, and issue clearly.</li>
  <li>Ask your provider for the next step and expected timeframe.</li>
</ol>`
          ),
        },
      ],
    },
  ],
}

const courseSeeds = [managerCourse, adminCourse, customerManagerCourse]

const softwareSortOrder = [
  { slug: 'technician-getting-started', sortOrder: 1 },
  { slug: managerCourse.slug, sortOrder: 2 },
  { slug: adminCourse.slug, sortOrder: 3 },
  { slug: customerManagerCourse.slug, sortOrder: 4 },
  { slug: 'pestsense-initial-setup-guide', sortOrder: 5 },
  { slug: 'rodenticides-for-baited-devices', sortOrder: 6 },
  { slug: 'conducting-a-site-visit', sortOrder: 7 },
  { slug: 'pestsense-site-servicing-guide', sortOrder: 8 },
]

async function ensureTags(lessonId: string, tagNames: string[]) {
  await prisma.lessonTag.deleteMany({ where: { lessonId } })

  for (const tagName of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(tagName) },
      update: { name: tagName },
      create: { name: tagName, slug: slugify(tagName) },
    })

    await prisma.lessonTag.upsert({
      where: { lessonId_tagId: { lessonId, tagId: tag.id } },
      update: {},
      create: { lessonId, tagId: tag.id },
    })
  }
}

async function publishCourse(categoryId: string, seed: CourseSeed) {
  const course = await prisma.course.upsert({
    where: { slug: seed.slug },
    update: {
      categoryId,
      title: seed.title,
      description: seed.description,
      estimatedMins: seed.estimatedMins,
      sortOrder: seed.sortOrder,
      status: ContentStatus.PUBLISHED,
    },
    create: {
      categoryId,
      title: seed.title,
      slug: seed.slug,
      description: seed.description,
      estimatedMins: seed.estimatedMins,
      sortOrder: seed.sortOrder,
      status: ContentStatus.PUBLISHED,
    },
  })

  await prisma.courseRole.deleteMany({ where: { courseId: course.id } })
  await prisma.courseRole.createMany({
    data: seed.roles.map((role) => ({ courseId: course.id, role })),
    skipDuplicates: true,
  })

  for (const moduleSeed of seed.modules) {
    const existingModule = await prisma.module.findFirst({
      where: { courseId: course.id, sortOrder: moduleSeed.sortOrder },
    })

    const moduleRecord = existingModule
      ? await prisma.module.update({
          where: { id: existingModule.id },
          data: {
            title: moduleSeed.title,
            description: moduleSeed.description,
            sortOrder: moduleSeed.sortOrder,
            status: ContentStatus.PUBLISHED,
          },
        })
      : await prisma.module.create({
          data: {
            courseId: course.id,
            title: moduleSeed.title,
            description: moduleSeed.description,
            sortOrder: moduleSeed.sortOrder,
            status: ContentStatus.PUBLISHED,
          },
        })

    for (const lessonSeed of moduleSeed.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { slug: lessonSeed.slug },
        update: {
          moduleId: moduleRecord.id,
          title: lessonSeed.title,
          summary: lessonSeed.summary,
          content: lessonSeed.content,
          status: ContentStatus.PUBLISHED,
          version: lessonSeed.version,
          sortOrder: lessonSeed.sortOrder,
          lastReviewedAt: new Date(),
        },
        create: {
          moduleId: moduleRecord.id,
          title: lessonSeed.title,
          slug: lessonSeed.slug,
          summary: lessonSeed.summary,
          content: lessonSeed.content,
          status: ContentStatus.PUBLISHED,
          version: lessonSeed.version,
          sortOrder: lessonSeed.sortOrder,
          lastReviewedAt: new Date(),
        },
      })

      await ensureTags(lesson.id, lessonSeed.tags)
    }
  }

  console.log(`Published course ${course.title}`)
  console.log(`Course route: /learn/software/${course.slug}`)
}

async function applySoftwareOrdering() {
  for (const item of softwareSortOrder) {
    await prisma.course.updateMany({
      where: { slug: item.slug },
      data: { sortOrder: item.sortOrder },
    })
  }
}

async function main() {
  const softwareCategory = await prisma.category.findUnique({
    where: { slug: 'software' },
  })

  if (!softwareCategory) {
    throw new Error('Software category not found')
  }

  for (const courseSeed of courseSeeds) {
    await publishCourse(softwareCategory.id, courseSeed)
  }

  await applySoftwareOrdering()

  console.log('Published manager/admin LMS help courses and refreshed software course ordering.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
