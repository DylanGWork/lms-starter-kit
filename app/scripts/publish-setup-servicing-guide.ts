import { ContentStatus, PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const ALL_ROLES: Role[] = [Role.TECHNICIAN, Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]

const GUIDE_PDF = '/course-guides/setup-servicing-en/pestsense-setup-servicing-guide-en-feb26.pdf'
const GUIDE_PPTX = '/course-guides/setup-servicing-en/pestsense-setup-servicing-guide-en-feb26.pptx'
const SLIDE_BASE = '/course-guides/setup-servicing-en/slides'

type LessonSeed = {
  title: string
  slug: string
  summary: string
  sortOrder: number
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
  categorySlug: 'software' | 'hardware'
  title: string
  slug: string
  description: string
  estimatedMins: number
  sortOrder: number
  modules: ModuleSeed[]
}

function figure(slideNumber: number, alt: string, caption: string) {
  const file = `${SLIDE_BASE}/slide-${String(slideNumber).padStart(2, '0')}.png`

  return `
<figure style="margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;">
  <img src="${file}" alt="${alt}" style="display:block;width:100%;height:auto;" />
  <figcaption style="padding:14px 18px;color:#4b5563;font-size:14px;line-height:1.6;">${caption}</figcaption>
</figure>
`
}

function referenceBlock(label: string) {
  return `
<blockquote>
  <p><strong>${label}</strong> This lesson is adapted from the February 2026 English setup and servicing guide. You can open the reference files here:
  <a href="${GUIDE_PDF}" target="_blank" rel="noreferrer">PDF guide</a> |
  <a href="${GUIDE_PPTX}" target="_blank" rel="noreferrer">PowerPoint source</a>.</p>
</blockquote>
`
}

function lessonContent(...sections: string[]) {
  return sections.join('\n')
}

const courses: CourseSeed[] = [
  {
    categorySlug: 'software',
    title: 'PestSense Initial Setup Guide',
    slug: 'pestsense-initial-setup-guide',
    description:
      'How hierarchy, locations, device stores, App Settings, and QuickStart fit together before a new site goes live.',
    estimatedMins: 14,
    sortOrder: 5,
    modules: [
      {
        title: 'Module 1: Foundations',
        description: 'Understand the structure of the app and the setup tools used before installation begins.',
        sortOrder: 1,
        lessons: [
          {
            title: 'Understand The App Hierarchy And Device Store',
            slug: 'pestsense-app-hierarchy-and-device-store',
            summary:
              'Learn how company, branch, customer, site, location, and the branch device store fit together in PestSense.',
            sortOrder: 1,
            tags: ['setup', 'hierarchy', 'site', 'device-store'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>What This Lesson Solves</h2>
<p>The guide starts by showing the structure that sits underneath every PestSense deployment. This matters because later setup and servicing steps make much more sense once you know where devices live, where locations sit, and what happens when a device is removed from site.</p>

<h2>How The Hierarchy Works</h2>
<ul>
  <li><strong>Company</strong>: your top-level business account.</li>
  <li><strong>Branch</strong>: a regional or operational subdivision of the company.</li>
  <li><strong>Customer</strong>: the customer account being serviced.</li>
  <li><strong>Site</strong>: a specific customer property or address.</li>
  <li><strong>Location</strong>: a zone within the site such as internal, external, or high-risk areas.</li>
  <li><strong>Device</strong>: the actual station, trap, or gateway assigned into the structure.</li>
</ul>`,
              figure(
                3,
                'PestSense app hierarchy showing company, branch, customer, site, location, and device levels',
                'The hierarchy is what lets PestSense separate customers, physical sites, and individual locations or zones.'
              ),
              `<h2>Why Locations Matter</h2>
<p>A site can be split into locations or zones for practical reasons such as alerting, service frequency, or how you want the live map to read in the field. Internal and external areas can be treated differently, and high-risk locations can be isolated for stronger alerting or reporting.</p>`,
              figure(
                4,
                'Example site layout split into internal and external locations',
                'Locations are not just visual. They drive map presentation, risk logic, alerting rules, and servicing rhythm.'
              ),
              `<h2>What The Branch Device Store Is For</h2>
<p>PestSense automatically creates a branch device store. This is where devices go when they are removed from a customer site. The guide makes an important point here: the system does not care whether that store is virtual or physical. It is simply the holding place for devices that are no longer installed on the live site.</p>`,
              figure(
                5,
                'Branch device store slide showing where removed devices are held',
                'This is the safe holding area for devices once they are removed from a customer site and no longer belong on the live map.'
              ),
              `<h2>Checklist</h2>
<ol>
  <li>Confirm which company, branch, and customer the work belongs to.</li>
  <li>Create or review the site before installation begins.</li>
  <li>Split the site into meaningful locations or zones where needed.</li>
  <li>Remember that removed devices return to the branch device store.</li>
</ol>`
            ),
          },
          {
            title: 'Use App Settings And QuickStart For First Site Setup',
            slug: 'pestsense-app-settings-and-quickstart',
            summary:
              'Use App Settings to prepare the account and QuickStart to create the first site and locations quickly.',
            sortOrder: 2,
            tags: ['setup', 'quickstart', 'app-settings', 'sites'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>What App Settings Covers</h2>
<p>Before site installation begins, the guide points back to <strong>App Settings</strong>. This is where the platform controls users, products, roles, thresholds, and service-data collection. In other words, App Settings is where the account gets shaped before day-to-day field work becomes smooth.</p>`,
              figure(
                7,
                'App Settings slide outlining users, products, roles, thresholds, and service-data controls',
                'This is the administrative setup area that makes field workflows easier later.'
              ),
              `<h2>When To Use QuickStart</h2>
<p>QuickStart is the easy path for an initial test site or a simple first deployment. The slide deck uses it as the preferred way to stand up a new site and locations without forcing the user through a slower manual structure build.</p>`,
              figure(
                9,
                'QuickStart slide introducing easy site and location setup',
                'QuickStart is the fast path for building an initial site and its first locations.'
              ),
              `<h2>QuickStart Workflow</h2>
<ol>
  <li>Create the initial test or live site.</li>
  <li>Choose site map and alerting options.</li>
  <li>Confirm the site setup.</li>
</ol>
<p>This matters because later installation steps assume the site structure already exists.</p>`,
              figure(
                10,
                'QuickStart initial test site setup slide',
                'The guide presents QuickStart as the preferred first-run route for site creation.'
              ),
              figure(
                11,
                'QuickStart site map and alerting options slide',
                'Map choice and alerting rules are set early so the site is usable as soon as installation begins.'
              ),
              figure(
                12,
                'QuickStart site setup confirmed slide',
                'The site should be confirmed and visible before moving into gateway and device installation.'
              ),
              `<h2>Good Practice</h2>
<ul>
  <li>Do App Settings work before the field team arrives if possible.</li>
  <li>Use QuickStart for clean first-site setup rather than ad hoc structure building.</li>
  <li>Make sure the locations and alerting choices reflect the real operating environment.</li>
</ul>`
            ),
          },
        ],
      },
    ],
  },
  {
    categorySlug: 'hardware',
    title: 'PestSense New Site Installation Guide',
    slug: 'pestsense-new-site-installation-guide',
    description:
      'End-to-end guide for starting an installation visit, provisioning the gateway, bringing devices online, mapping them, and closing the visit.',
    estimatedMins: 24,
    sortOrder: 3,
    modules: [
      {
        title: 'Module 1: Installation Workflow',
        description: 'Follow the field sequence for a clean first installation.',
        sortOrder: 1,
        lessons: [
          {
            title: 'Start The New Installation Visit',
            slug: 'pestsense-start-new-installation-visit',
            summary:
              'Begin the installation visit correctly so the site enters setup mode before hardware is provisioned.',
            sortOrder: 1,
            tags: ['installation', 'site-visit', 'setup-mode'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>What This Lesson Solves</h2>
<p>The installation guide begins with a formal <strong>New Installation</strong> visit. This is important because the app changes all site locations into <strong>Set Up</strong> mode and temporarily stops normal sensor processing while installation is underway.</p>`,
              figure(
                14,
                'New site installation overview showing the end-to-end installation sequence',
                'The overall flow is: start visit, install gateway, bring devices online, set up devices in app, then end the visit.'
              ),
              `<h2>How To Start The Visit</h2>
<ol>
  <li>Navigate to the site level.</li>
  <li>Click <strong>Start Visit</strong>.</li>
  <li>Select <strong>New Installation</strong> as the reason.</li>
  <li>Complete the other visit options.</li>
  <li>Save the visit so the site enters setup mode.</li>
</ol>`,
              figure(
                15,
                'Start a new installation visit slide with setup mode highlighted',
                'While the site is in setup mode, live data processing pauses and the field team can install safely.'
              ),
              `<h2>Why This Step Matters</h2>
<ul>
  <li>The site is now clearly in an installation state.</li>
  <li>Field activity is captured properly for later reporting.</li>
  <li>Normal servicing logic only resumes after the visit is ended.</li>
</ul>`
            ),
          },
          {
            title: 'Install And Provision The Gateway',
            slug: 'pestsense-install-and-provision-the-gateway',
            summary:
              'Place the gateway correctly, confirm power and connectivity, then provision it in the app with the QR code and OTC.',
            sortOrder: 2,
            tags: ['gateway', 'installation', 'qr', 'otc'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>Install The Gateway Hardware First</h2>
<p>The guide recommends an indoor placement at higher elevation where possible, with permanent power and good cellular reception. The gateway should stabilise on the mobile network before the team moves on.</p>`,
              figure(
                16,
                'Gateway installation slide showing placement, antennas, and cellular guidance',
                'Good placement and stable power are prerequisites for a calm installation. A bad gateway position will create avoidable device join problems later.'
              ),
              `<h2>Provision The Gateway In The App</h2>
<ol>
  <li>Find the gateway QR label with the <strong>G-number</strong> and 4-digit <strong>OTC</strong>.</li>
  <li>Open the site and go to the location named <code>&lt;Site Name&gt; Set Up</code>.</li>
  <li>Choose <strong>New Device</strong> and select the gateway type.</li>
  <li>Scan the QR code or enter the gateway ID manually.</li>
  <li>Enter the OTC and activate the device.</li>
</ol>`,
              figure(
                17,
                'Gateway provisioning slide showing where to add the gateway from the setup location',
                'The guide uses the setup location as the staging point for gateway provisioning.'
              ),
              figure(
                18,
                'Gateway provisioning continuation slide with QR and OTC steps',
                'The QR code plus OTC pair is what formally binds the gateway into the site.'
              ),
              figure(
                19,
                'Gateway provisioning slide showing check status confirmation',
                'Do not leave this step half-finished. Check status before moving into device deployment.'
              ),
              `<h2>Troubleshooting</h2>
<ul>
  <li>If the gateway does not connect, check local cellular reception first.</li>
  <li>Move the gateway to a better indoor position if needed.</li>
  <li>Do not continue the install until the gateway is active on the network.</li>
</ul>`
            ),
          },
          {
            title: 'Bring Devices Online And Set Bait Or Trap Mode',
            slug: 'pestsense-bring-devices-online-and-set-bait-or-trap-mode',
            summary:
              'Power devices up cleanly, confirm network join, then prepare each station in bait or trap mode before app setup.',
            sortOrder: 3,
            tags: ['device', 'installation', 'bait', 'trap'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>Bring The Device Online</h2>
<p>Once batteries are installed and the device is near its intended use area, turn it on and watch the LEDs carefully. The guide uses LED behaviour as the key signal for successful network join.</p>`,
              figure(
                20,
                'Device battery install and power-on slide showing join success and failure LEDs',
                'Alternating amber and green indicates a successful join. Red only indicates the device did not join.'
              ),
              `<h2>Choose Bait Or Trap Mode</h2>
<p>Before app setup is completed, each device still needs to be physically prepared for how it will operate in the field.</p>
<ul>
  <li><strong>Bait mode</strong>: prepare the bait bar, add bait, and confirm the mode on the device.</li>
  <li><strong>Trap mode</strong>: fit the trap arrangement and arm the station correctly.</li>
</ul>`,
              figure(
                21,
                'Deploy device in bait or trap mode slide',
                'The field preparation step matters because the app should reflect the real physical configuration of the device.'
              ),
              figure(
                22,
                'Short summary slide for bait and trap mode on the control panel',
                'This quick-reference summary is useful for repeat visits and technician refreshers.'
              ),
              `<h2>Set Up The Device In The App</h2>
<p>After the device is physically ready, scan the QR code or enter the station number and complete the setup details in the app. For bait mode, product and quantity matter. For both modes, station ID and location are essential.</p>`,
              figure(
                23,
                'Scan devices QR code to set up in the app slide',
                'This is the point where the physical station becomes a tracked record inside the site structure.'
              ),
              `<h2>Checklist</h2>
<ol>
  <li>Install batteries and power the device on.</li>
  <li>Wait for a successful network join.</li>
  <li>Physically prepare bait or trap mode.</li>
  <li>Scan the QR code or enter the station number.</li>
  <li>Set station ID, product, quantity, and location.</li>
</ol>`
            ),
          },
          {
            title: 'Place Devices On The Map And End The Visit',
            slug: 'pestsense-place-devices-on-map-and-end-visit',
            summary:
              'Finish installation by placing devices on the map or floor plan, then close the visit so the site returns to ready mode.',
            sortOrder: 4,
            tags: ['installation', 'map', 'reporting', 'end-visit'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>Map The Devices Before You Leave</h2>
<p>The guide recommends using a tablet or desktop where possible for map placement. That larger screen makes site layout easier and helps avoid messy initial mapping.</p>`,
              figure(
                24,
                'Setup location maps slide showing how to place devices on the map',
                'A clean map pays off later in servicing, reporting, and customer communication.'
              ),
              `<h2>End The Installation Visit Properly</h2>
<ol>
  <li>Return to site level.</li>
  <li>Click <strong>End Visit</strong>.</li>
  <li>Generate the draft site visit report.</li>
  <li>Download or share the report if needed.</li>
</ol>
<p>Once the visit ends, the system checks the installed devices and moves the locations back into <strong>Ready</strong> mode.</p>`,
              figure(
                25,
                'End visit slide showing report generation and site returning to ready mode',
                'The installation is not really complete until the visit is closed and the site returns to ready mode.'
              ),
              `<h2>Do Not Skip This</h2>
<ul>
  <li>Unfinished visits leave the site in setup mode.</li>
  <li>That can delay normal data handling and confuse later servicing.</li>
  <li>Always leave the site with the report drafted and the status back to ready.</li>
</ul>`
            ),
          },
        ],
      },
    ],
  },
  {
    categorySlug: 'software',
    title: 'PestSense Site Servicing Guide',
    slug: 'pestsense-site-servicing-guide',
    description:
      'How to start a servicing visit, choose auto baiting and express mode, service devices, resolve discrepancies, and close the report cleanly.',
    estimatedMins: 16,
    sortOrder: 6,
    modules: [
      {
        title: 'Module 1: Servicing Workflow',
        description: 'Follow the field servicing sequence from visit start through to report submission.',
        sortOrder: 1,
        lessons: [
          {
            title: 'Start A Service Visit And Choose Baiting Options',
            slug: 'pestsense-start-service-visit-and-baiting-options',
            summary:
              'Begin a site visit correctly, decide whether to use auto baiting, and choose whether express mode is appropriate.',
            sortOrder: 1,
            tags: ['servicing', 'site-visit', 'auto-baiting', 'express-mode'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>What Changes During A Service Visit</h2>
<p>The servicing section of the guide treats the visit as a controlled workflow: start the visit, service the stations, resolve any discrepancies, and then end the visit properly.</p>`,
              figure(
                27,
                'Servicing a site overview showing the main service workflow',
                'The slide keeps the whole service rhythm visible: start, service, resolve, and end.'
              ),
              `<h2>Start The Visit</h2>
<ol>
  <li>Go to site level.</li>
  <li>Click <strong>Start Visit</strong>.</li>
  <li>Select the reason, such as <strong>Scheduled Review</strong>.</li>
  <li>Set the visit duration.</li>
  <li>Choose auto baiting and express mode settings if appropriate.</li>
</ol>`,
              figure(
                28,
                'Start a visit slide for scheduled review or other on-site service reasons',
                'The guide also notes that selected locations can be toggled into setup mode if needed during the service.'
              ),
              `<h2>Choose Auto Baiting Carefully</h2>
<p>Auto baiting is designed to reduce app interaction during repetitive servicing. It assumes defaults, prior bait values, or a combination of both. Express mode similarly compresses the interface to help the technician move faster.</p>`,
              figure(
                29,
                'Choose appropriate baiting options slide with auto baiting and express mode guidance',
                'Auto baiting and express mode are speed tools, but they only help if the underlying defaults are trustworthy.'
              ),
              `<h2>Use These Features When</h2>
<ul>
  <li>The site has repeatable servicing patterns.</li>
  <li>The team already trusts the default product and quantity settings.</li>
  <li>The visit is large enough that reduced button clicks matter.</li>
</ul>`
            ),
          },
          {
            title: 'Service Devices And Update Them In The App',
            slug: 'pestsense-service-devices-and-update-in-app',
            summary:
              'Service each station, scan or identify the device, and record the correct bait or trap outcome in the app.',
            sortOrder: 2,
            tags: ['servicing', 'device', 'qr', 'bait', 'trap'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>Service The Device First</h2>
<p>The guide keeps the field action and the app update tightly linked. Service the station physically, then capture the device update in the app so the record stays accurate.</p>`,
              figure(
                30,
                'Service devices as needed slide showing the device control panel context',
                'Field servicing still begins with the device itself, not the form.'
              ),
              `<h2>Update The Device In The App</h2>
<ol>
  <li>Open the app and scan the QR code, or enter the station number.</li>
  <li>For bait mode, record product, quantity, and service answers.</li>
  <li>For trap mode, confirm the trap result and answer any prompts.</li>
  <li>Save with the green tick.</li>
</ol>`,
              figure(
                31,
                'Service devices then update them in app slide',
                'The guide treats the app update as the formal record of what happened during servicing.'
              ),
              `<h2>Operator Tip</h2>
<p>If the team uses repeat defaults sensibly, service logging becomes much faster without losing traceability.</p>`
            ),
          },
          {
            title: 'Resolve Auto-Baiting Discrepancies And Submit The Visit',
            slug: 'pestsense-resolve-auto-baiting-and-submit-visit',
            summary:
              'Finish the service visit by clearing discrepancies, finalising the report, and returning the site to ready mode.',
            sortOrder: 3,
            tags: ['servicing', 'auto-baiting', 'discrepancy', 'report'],
            content: lessonContent(
              referenceBlock('Guide reference'),
              `<h2>Resolve Discrepancies Before Closing</h2>
<p>If auto baiting guessed wrong, PestSense flags the mismatch as a failure that must be corrected before the visit can close. The guide points to <strong>Add Bait</strong> as the fix path.</p>`,
              figure(
                33,
                'Resolve auto-baiting discrepancies slide showing bait weight mismatch handling',
                'The visit cannot close cleanly until the recorded bait state matches reality.'
              ),
              `<h2>End The Visit Properly</h2>
<ol>
  <li>Go back to site level.</li>
  <li>Click <strong>End Visit</strong>.</li>
  <li>Resolve any discrepancies.</li>
  <li>Complete the draft site visit report.</li>
  <li>Capture signature if required.</li>
  <li>Set the report as final and submit.</li>
</ol>`,
              figure(
                32,
                'End visit slide showing report completion and final submission',
                'This final step closes the operational loop and returns the site to ready mode.'
              ),
              `<h2>Checklist</h2>
<ul>
  <li>No unresolved auto-baiting fails remain.</li>
  <li>The report reflects what actually happened on site.</li>
  <li>The visit is submitted and the site is back in ready mode.</li>
</ul>`
            ),
          },
        ],
      },
    ],
  },
]

async function ensureTags(lessonId: string, tags: string[]) {
  await prisma.lessonTag.deleteMany({ where: { lessonId } })

  for (const tagName of tags) {
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

async function ensureModule(courseId: string, moduleSeed: ModuleSeed) {
  const existing = await prisma.module.findFirst({
    where: { courseId, title: moduleSeed.title },
  })

  if (existing) {
    return prisma.module.update({
      where: { id: existing.id },
      data: {
        description: moduleSeed.description,
        sortOrder: moduleSeed.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
    })
  }

  return prisma.module.create({
    data: {
      courseId,
      title: moduleSeed.title,
      description: moduleSeed.description,
      sortOrder: moduleSeed.sortOrder,
      status: ContentStatus.PUBLISHED,
    },
  })
}

async function main() {
  for (const courseSeed of courses) {
    const category = await prisma.category.findUnique({
      where: { slug: courseSeed.categorySlug },
    })

    if (!category) {
      throw new Error(`Category ${courseSeed.categorySlug} not found`)
    }

    const course = await prisma.course.upsert({
      where: { slug: courseSeed.slug },
      update: {
        categoryId: category.id,
        title: courseSeed.title,
        description: courseSeed.description,
        estimatedMins: courseSeed.estimatedMins,
        sortOrder: courseSeed.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        categoryId: category.id,
        title: courseSeed.title,
        slug: courseSeed.slug,
        description: courseSeed.description,
        estimatedMins: courseSeed.estimatedMins,
        sortOrder: courseSeed.sortOrder,
        status: ContentStatus.PUBLISHED,
      },
    })

    await prisma.courseRole.deleteMany({ where: { courseId: course.id } })
    await prisma.courseRole.createMany({
      data: ALL_ROLES.map((role) => ({ courseId: course.id, role })),
      skipDuplicates: true,
    })

    for (const moduleSeed of courseSeed.modules) {
      const module = await ensureModule(course.id, moduleSeed)

      for (const lessonSeed of moduleSeed.lessons) {
        const lesson = await prisma.lesson.upsert({
          where: { slug: lessonSeed.slug },
          update: {
            moduleId: module.id,
            title: lessonSeed.title,
            summary: lessonSeed.summary,
            content: lessonSeed.content,
            status: ContentStatus.PUBLISHED,
            sortOrder: lessonSeed.sortOrder,
            version: '1.0',
            lastReviewedAt: new Date(),
            videoUrl: null,
            videoProvider: null,
            duration: null,
          },
          create: {
            moduleId: module.id,
            title: lessonSeed.title,
            slug: lessonSeed.slug,
            summary: lessonSeed.summary,
            content: lessonSeed.content,
            status: ContentStatus.PUBLISHED,
            sortOrder: lessonSeed.sortOrder,
            version: '1.0',
            lastReviewedAt: new Date(),
          },
        })

        await ensureTags(lesson.id, lessonSeed.tags)
      }
    }

    console.log(`Published course: ${courseSeed.title}`)
    console.log(`Route: /learn/${courseSeed.categorySlug}/${courseSeed.slug}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
