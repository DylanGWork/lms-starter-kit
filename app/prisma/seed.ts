import { PrismaClient, Role, ContentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PestSense Academy...')

  // ─── ADMIN USER ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('ChangeMe123!', 12)
  const techPassword = await bcrypt.hash('Tech1234!', 12)
  const managerPassword = await bcrypt.hash('Manager1234!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.internal' },
    update: {},
    create: {
      email: 'admin@example.internal',
      name: 'Platform Admin',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  })

  const tech = await prisma.user.upsert({
    where: { email: 'tech@pestsense.com' },
    update: {},
    create: {
      email: 'tech@pestsense.com',
      name: 'Demo Technician',
      passwordHash: techPassword,
      role: Role.TECHNICIAN,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@pestsense.com' },
    update: {},
    create: {
      email: 'manager@pestsense.com',
      name: 'Demo Site Manager',
      passwordHash: managerPassword,
      role: Role.SITE_MANAGER,
    },
  })

  console.log('✅ Users created')

  // ─── TAGS ───────────────────────────────────────────────────────────────
  const tagNames = ['getting-started', 'hardware', 'software', 'network', 'lorawan', 'troubleshooting', 'gateway', 'alerts', 'reports', 'sales', 'device', 'admin']
  const tags: Record<string, { id: string }> = {}
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { slug: name },
      update: {},
      create: { name, slug: name },
    })
    tags[name] = tag
  }
  console.log('✅ Tags created')

  // ─── CATEGORIES ─────────────────────────────────────────────────────────
  const softwareCat = await prisma.category.upsert({
    where: { slug: 'software' },
    update: {},
    create: {
      name: 'Software',
      slug: 'software',
      description: 'Training on the PestSense web platform and mobile app',
      icon: 'Monitor',
      color: '#61ce70',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  const hardwareCat = await prisma.category.upsert({
    where: { slug: 'hardware' },
    update: {},
    create: {
      name: 'Hardware',
      slug: 'hardware',
      description: 'Physical device installation, setup, and troubleshooting',
      icon: 'Cpu',
      color: '#018902',
      sortOrder: 2,
      status: ContentStatus.PUBLISHED,
    },
  })

  const networkCat = await prisma.category.upsert({
    where: { slug: 'network' },
    update: {},
    create: {
      name: 'Network / LoRaWAN',
      slug: 'network',
      description: 'Non-technical field guide to understanding connectivity',
      icon: 'Wifi',
      color: '#02f103',
      sortOrder: 3,
      status: ContentStatus.PUBLISHED,
    },
  })

  const salesCat = await prisma.category.upsert({
    where: { slug: 'sales' },
    update: {},
    create: {
      name: 'Sales & Commercial',
      slug: 'sales',
      description: 'How to sell and scope digital pest control solutions',
      icon: 'TrendingUp',
      color: '#006300',
      sortOrder: 4,
      status: ContentStatus.PUBLISHED,
    },
  })

  console.log('✅ Categories created')

  // ─── COURSES ────────────────────────────────────────────────────────────

  // Software courses
  const techStartCourse = await prisma.course.upsert({
    where: { slug: 'technician-getting-started' },
    update: {},
    create: {
      categoryId: softwareCat.id,
      title: 'Technician Getting Started',
      slug: 'technician-getting-started',
      description: 'Everything a technician needs to get up and running with the PestSense platform on day one.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 1,
      estimatedMins: 30,
    },
  })

  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: techStartCourse.id, role: Role.TECHNICIAN } },
    update: {},
    create: { courseId: techStartCourse.id, role: Role.TECHNICIAN },
  })
  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: techStartCourse.id, role: Role.SUPER_ADMIN } },
    update: {},
    create: { courseId: techStartCourse.id, role: Role.SUPER_ADMIN },
  })

  const managerBasicsCourse = await prisma.course.upsert({
    where: { slug: 'site-manager-basics' },
    update: {},
    create: {
      categoryId: softwareCat.id,
      title: 'Site Manager Basics',
      slug: 'site-manager-basics',
      description: 'How to oversee sites, review reports, and manage your team through the PestSense platform.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 2,
      estimatedMins: 45,
    },
  })

  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: managerBasicsCourse.id, role: Role.SITE_MANAGER } },
    update: {},
    create: { courseId: managerBasicsCourse.id, role: Role.SITE_MANAGER },
  })
  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: managerBasicsCourse.id, role: Role.BUSINESS_ADMIN } },
    update: {},
    create: { courseId: managerBasicsCourse.id, role: Role.BUSINESS_ADMIN },
  })
  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: managerBasicsCourse.id, role: Role.SUPER_ADMIN } },
    update: {},
    create: { courseId: managerBasicsCourse.id, role: Role.SUPER_ADMIN },
  })

  const adminPlatformCourse = await prisma.course.upsert({
    where: { slug: 'admin-platform-basics' },
    update: {},
    create: {
      categoryId: softwareCat.id,
      title: 'Admin Platform Basics',
      slug: 'admin-platform-basics',
      description: 'Full administration guide for business owners and platform admins.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 3,
      estimatedMins: 60,
    },
  })

  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: adminPlatformCourse.id, role: Role.BUSINESS_ADMIN } },
    update: {},
    create: { courseId: adminPlatformCourse.id, role: Role.BUSINESS_ADMIN },
  })
  await prisma.courseRole.upsert({
    where: { courseId_role: { courseId: adminPlatformCourse.id, role: Role.SUPER_ADMIN } },
    update: {},
    create: { courseId: adminPlatformCourse.id, role: Role.SUPER_ADMIN },
  })

  // Hardware courses
  const device1Course = await prisma.course.upsert({
    where: { slug: 'device-1-basics' },
    update: {},
    create: {
      categoryId: hardwareCat.id,
      title: 'Device 1 Basics',
      slug: 'device-1-basics',
      description: 'Complete guide to unboxing, installing, and commissioning Device 1 in the field.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 1,
      estimatedMins: 40,
    },
  })

  for (const role of [Role.TECHNICIAN, Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]) {
    await prisma.courseRole.upsert({
      where: { courseId_role: { courseId: device1Course.id, role } },
      update: {},
      create: { courseId: device1Course.id, role },
    })
  }

  const device2Course = await prisma.course.upsert({
    where: { slug: 'device-2-basics' },
    update: {},
    create: {
      categoryId: hardwareCat.id,
      title: 'Device 2 Basics',
      slug: 'device-2-basics',
      description: 'Complete guide to Device 2 — components, installation, and troubleshooting.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 2,
      estimatedMins: 40,
    },
  })

  for (const role of [Role.TECHNICIAN, Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]) {
    await prisma.courseRole.upsert({
      where: { courseId_role: { courseId: device2Course.id, role } },
      update: {},
      create: { courseId: device2Course.id, role },
    })
  }

  const gatewayCourse = await prisma.course.upsert({
    where: { slug: 'gateway-basics' },
    update: {},
    create: {
      categoryId: hardwareCat.id,
      title: 'Gateway Basics',
      slug: 'gateway-basics',
      description: 'How to place, power, and connect a PestSense gateway. Includes common mistakes and site checklist.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 3,
      estimatedMins: 35,
    },
  })

  for (const role of [Role.TECHNICIAN, Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]) {
    await prisma.courseRole.upsert({
      where: { courseId_role: { courseId: gatewayCourse.id, role } },
      update: {},
      create: { courseId: gatewayCourse.id, role },
    })
  }

  // Network course
  const signalCourse = await prisma.course.upsert({
    where: { slug: 'signal-basics-for-field-users' },
    update: {},
    create: {
      categoryId: networkCat.id,
      title: 'Signal Basics for Field Users',
      slug: 'signal-basics-for-field-users',
      description: 'A plain-language guide to LoRaWAN and how the PestSense network works — no technical background needed.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 1,
      estimatedMins: 25,
    },
  })

  for (const role of [Role.TECHNICIAN, Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]) {
    await prisma.courseRole.upsert({
      where: { courseId_role: { courseId: signalCourse.id, role } },
      update: {},
      create: { courseId: signalCourse.id, role },
    })
  }

  // Sales course
  const salesCourse = await prisma.course.upsert({
    where: { slug: 'selling-digital-pest-control' },
    update: {},
    create: {
      categoryId: salesCat.id,
      title: 'Selling Digital Pest Control',
      slug: 'selling-digital-pest-control',
      description: 'How to identify great-fit customers, explain value, and close digital pest control opportunities.',
      status: ContentStatus.PUBLISHED,
      sortOrder: 1,
      estimatedMins: 50,
    },
  })

  for (const role of [Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]) {
    await prisma.courseRole.upsert({
      where: { courseId_role: { courseId: salesCourse.id, role } },
      update: {},
      create: { courseId: salesCourse.id, role },
    })
  }

  console.log('✅ Courses created')

  // ─── MODULES & LESSONS ─────────────────────────────────────────────────

  // == Technician Getting Started ==
  const techMod1 = await prisma.module.upsert({
    where: { id: 'mod-tech-1' },
    update: {},
    create: {
      id: 'mod-tech-1',
      courseId: techStartCourse.id,
      title: 'Module 1: Your First Login',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-tech-1-1',
    moduleId: techMod1.id,
    title: 'Logging In for the First Time',
    slug: 'logging-in-first-time',
    summary: 'Current first-access steps for PestSense, including the live login URL and the difference between sign-in and self-registration.',
    content: `
<h2>Accessing PestSense for the First Time</h2>
<p>The current production login shown in training is <code>https://app.pestsense.com</code>.</p>
<p>There are two common first-access paths in the current platform:</p>
<ul>
  <li><strong>Existing company account:</strong> your manager or admin gives you an email address and password.</li>
  <li><strong>New platform or demo account:</strong> you click <strong>Register as New User</strong>, complete the signup form, confirm the email, and then sign in.</li>
</ul>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/login-form.jpg" alt="PestSense login form at app.pestsense.com" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">The current live login screen at <code>https://app.pestsense.com</code>.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/register-form.jpg" alt="PestSense self-registration form" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">The current self-registration form used when creating a new account.</figcaption>
  </figure>
</div>
<h3>If you are registering a new account</h3>
<ol>
  <li>Open <code>https://app.pestsense.com</code>.</li>
  <li>Click <strong>Register as New User</strong> on the login screen.</li>
  <li>Complete the company, contact, address, and password fields.</li>
  <li>Finish the verification challenge and click <strong>Submit</strong>.</li>
  <li>Open the registration email and follow the confirmation link.</li>
  <li>Return to the login page and sign in with the account you just created.</li>
</ol>
<h3>If you were given credentials</h3>
<ul>
  <li>Open <code>https://app.pestsense.com</code>.</li>
  <li>Enter your email address and password.</li>
  <li>Use <strong>Remember me</strong> if this is your regular work device.</li>
  <li>Click <strong>Sign in</strong>.</li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li><strong>Forgot your password?</strong> Click <strong>Forgot my password</strong> on the login screen.</li>
  <li><strong>No confirmation email?</strong> Check spam/junk, then ask an admin to confirm the address is correct.</li>
  <li><strong>Not sure which path applies?</strong> Ask whether your company uses admin-created accounts or self-registration for that environment.</li>
</ul>
<blockquote><p>Bookmark <code>https://app.pestsense.com</code> once you know you are using the correct environment.</p></blockquote>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '2.0',
  })

  await createLesson(prisma, {
    id: 'lesson-tech-1-2',
    moduleId: techMod1.id,
    title: 'First Login and Quickstart',
    slug: 'navigating-the-dashboard',
    summary: 'What to expect on first sign-in, including the QUICKSTART / Test Site Mode flow used to create a safe practice site.',
    content: `
<h2>What You See After Your First Login</h2>
<p>On a fresh account, the platform may open a guided setup flow straight after sign-in. In the current UI this setup can appear as <strong>QUICKSTART</strong>, <strong>Testing Site</strong>, or <strong>Test Site Mode</strong>. These labels all refer to the same first-time setup experience.</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/quickstart-testing-site.jpg" alt="PestSense Quickstart screen showing Testing Site option" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">The Quickstart screen shown on a fresh account before the test site is created.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/screens-live-map.jpg" alt="Live Screens map view after the Quickstart flow" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">This is the kind of Screens view you usually land on once the wizard finishes.</figcaption>
  </figure>
</div>
<h3>What the Quickstart is doing for you</h3>
<ul>
  <li>It creates a safe branch, customer, site, and first location structure to practice with.</li>
  <li>It lets you choose the map style and alert options before you start working in the platform.</li>
  <li>It gets you into the live Screens view quickly so the rest of the interface makes more sense.</li>
</ul>
<h3>Typical first-login flow</h3>
<ol>
  <li>Sign in at <code>https://app.pestsense.com</code>.</li>
  <li>If the setup prompt appears, choose <strong>Testing Site</strong> to create a safe practice environment.</li>
  <li>Enter your branch name, customer name, site name, address, and first location or zone.</li>
  <li>Click <strong>Next</strong> and choose either <strong>Live Map</strong> or <strong>Floor Plan</strong>.</li>
  <li>Enable email alerting if you want notifications during testing.</li>
  <li>Finish the wizard and wait for the map view to load.</li>
</ol>
<h3>What happens next</h3>
<ul>
  <li>The platform opens into the OneCloud view.</li>
  <li>The map usually takes most of the screen.</li>
  <li>Your new branch, customer, site, and zone cards appear on the left-hand side.</li>
</ul>
<h3>Tips</h3>
<ul>
  <li>If the page shows a loading spinner for a while, give the map a moment to finish loading.</li>
  <li>If the wizard closes accidentally, you can still continue setup later through the platform screens and settings.</li>
</ul>
<blockquote><p>If you are teaching this live, pause after the wizard finishes and point out the left-hand hierarchy cards before clicking deeper into the map.</p></blockquote>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '2.1',
  })

  const techMod2 = await prisma.module.upsert({
    where: { id: 'mod-tech-2' },
    update: {},
    create: {
      id: 'mod-tech-2',
      courseId: techStartCourse.id,
      title: 'Module 2: Sites and Devices',
      sortOrder: 2,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-tech-2-1',
    moduleId: techMod2.id,
    title: 'Finding a Site and Navigating the Hierarchy',
    slug: 'finding-a-site',
    summary: 'How to use Screens, the left-hand cards, and the map hierarchy to move from branch level down to site and zone views.',
    content: `
<h2>Working in the OneCloud Screens View</h2>
<p>The current platform layout is driven by the <strong>Screens</strong> tab, a left-hand card panel, and a large map or satellite view.</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/screens-hierarchy.jpg" alt="PestSense OneCloud Screens view with site and zone hierarchy" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">The left-hand cards and map work together to show the branch, site, zone, and device hierarchy.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/screens-live-map.jpg" alt="Live map view inside Screens" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">A real map view from the training session, showing how much screen space the map can take once a site is selected.</figcaption>
  </figure>
</div>
<h3>Top navigation you will use most</h3>
<ul>
  <li><strong>Screens</strong> - live map, cards, zones, and device views</li>
  <li><strong>App Settings</strong> - products, users, and setup items</li>
  <li><strong>Help</strong> and <strong>More</strong> - support and extra options</li>
</ul>
<h3>How to find a site</h3>
<ol>
  <li>Open <strong>Screens</strong>.</li>
  <li>Use the cards panel on the left to move from branch to customer to site to zone.</li>
  <li>Use the search box if you need to find a site by name or address.</li>
  <li>Click a site or zone card to update the map and open the relevant detail view.</li>
</ol>
<h3>What you will see in this view</h3>
<ul>
  <li>A breadcrumb-like path near the top left showing where you are in the hierarchy</li>
  <li>A map / satellite toggle above the map</li>
  <li>Cards for branch, customer, site, and zone summaries</li>
  <li>Device cards and actions once you drill into a zone or device</li>
</ul>
<blockquote><p>If you lose track of where you are, look at the breadcrumb trail and the selected card on the left before clicking deeper.</p></blockquote>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '2.1',
  })

  await createLesson(prisma, {
    id: 'lesson-tech-2-2',
    moduleId: techMod2.id,
    title: 'Understanding Device Status and Alerts',
    slug: 'understanding-alerts',
    summary: 'How to read site counters, device cards, and the current action controls in the Screens view.',
    content: `
<h2>Reading Status in Screens</h2>
<p>In the current platform, status is spread across summary cards, counters, device panels, and action buttons rather than a single alert inbox.</p>
<h3>What to check first</h3>
<ul>
  <li><strong>Site and zone cards</strong> - review the counters and coloured status indicators before opening a device</li>
  <li><strong>Device cards</strong> - check the station ID, battery/state information, and any coloured warnings</li>
  <li><strong>Map markers</strong> - confirm you are looking at the correct location before taking action</li>
</ul>
<h3>Common actions you will see</h3>
<ol>
  <li><strong>END VISIT</strong> when you are finishing a site visit</li>
  <li><strong>REC / INCIDENT</strong> when you need to log an issue or event</li>
  <li><strong>INSTALL</strong>, <strong>SERVICE</strong>, or <strong>REMOVE</strong> when working on a device</li>
  <li><strong>View History</strong> when you need more context around previous activity</li>
</ol>
<h3>Good habit</h3>
<p>Always confirm the selected branch, customer, site, zone, and device before recording work. The current UI lets you move quickly, so it is easy to be in the wrong part of the hierarchy if you click too fast.</p>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '2.0',
  })

  // == Admin Platform Basics ==
  const adminMod1 = await prisma.module.upsert({
    where: { id: 'mod-admin-1' },
    update: {},
    create: {
      id: 'mod-admin-1',
      courseId: adminPlatformCourse.id,
      title: 'Module 1: Account Access and First Setup',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-admin-1-1',
    moduleId: adminMod1.id,
    title: 'Register and Confirm a New Account',
    slug: 'register-and-confirm-account',
    summary: 'How to create a new PestSense account from the live login page and confirm it by email.',
    content: `
<h2>Create a New Account</h2>
<p>The current production login and registration page used in training is <code>https://app.pestsense.com</code>.</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/login-form.jpg" alt="PestSense login page" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">Start on the live login page and use <strong>Register as New User</strong> if you are creating the account yourself.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/register-form.jpg" alt="PestSense registration form with company and contact fields" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">Complete the registration form with company, contact, and password details.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/qa-review/register-flow.jpg" alt="Registration flow captured during the training session" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">A real training-session view of the registration journey as it appears in production.</figcaption>
  </figure>
</div>
<h3>What to point out while training this</h3>
<ul>
  <li>The user starts from the same login page whether they are signing in or registering.</li>
  <li>The registration form is longer than it first looks, so narrate the sections clearly.</li>
  <li>The email confirmation step is part of the onboarding path, not an optional extra.</li>
</ul>
<h3>Steps</h3>
<ol>
  <li>Open <code>https://app.pestsense.com</code>.</li>
  <li>Click <strong>Register as New User</strong>.</li>
  <li>Complete the form with company name, first name, last name, email, country, address, city, postcode/zip, phone number, and password.</li>
  <li>Add a website if needed and tick <strong>I am an auditor</strong> only if that applies to your role.</li>
  <li>Complete the verification challenge and click <strong>Submit</strong>.</li>
  <li>Open the registration email and confirm the account.</li>
  <li>Return to the login page and sign in.</li>
</ol>
<h3>Notes</h3>
<ul>
  <li>Keep the email inbox open while testing so you can confirm the account quickly.</li>
  <li>If the email does not arrive, check spam/junk before retrying the form.</li>
</ul>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '1.1',
  })

  await createLesson(prisma, {
    id: 'lesson-admin-1-2',
    moduleId: adminMod1.id,
    title: 'Create a Test Site with Quickstart',
    slug: 'create-test-site-with-quickstart',
    summary: 'Use the first-login Quickstart flow to create a safe practice branch, customer, site, and first zone.',
    content: `
<h2>Create a Test Site</h2>
<p>On a fresh account, the platform may launch a guided first-time setup. In the current UI you may see this referred to as <strong>QUICKSTART</strong>, <strong>Testing Site</strong>, or <strong>Test Site Mode</strong>.</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/quickstart-testing-site.jpg" alt="PestSense Quickstart screen with Testing Site option" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">The first setup prompt used to create a safe practice site.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/screens-live-map.jpg" alt="Map view after finishing Quickstart" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">After the wizard, you normally land in the Screens view with the map ready to use.</figcaption>
  </figure>
</div>
<h3>Steps</h3>
<ol>
  <li>Choose <strong>Testing Site</strong>.</li>
  <li>Enter a branch name, customer name, site name, address, and your first location or zone.</li>
  <li>Click <strong>Next</strong>.</li>
  <li>Choose <strong>Live Map</strong> if you want to use the map immediately, or <strong>Floor Plan</strong> if you plan to upload an image later.</li>
  <li>Turn email alerting on or off depending on the environment you are creating.</li>
  <li>Finish the wizard and wait for the OneCloud map view to load.</li>
</ol>
<blockquote><p>This is a good way to create a safe training environment before touching a live customer setup.</p></blockquote>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '1.1',
  })

  const adminMod2 = await prisma.module.upsert({
    where: { id: 'mod-admin-2' },
    update: {},
    create: {
      id: 'mod-admin-2',
      courseId: adminPlatformCourse.id,
      title: 'Module 2: Products and Team Setup',
      sortOrder: 2,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-admin-2-1',
    moduleId: adminMod2.id,
    title: 'Add a Product and Assign Company Products',
    slug: 'add-and-assign-company-products',
    summary: 'Create a product record in App Settings and move it into the company product list.',
    content: `
<h2>Manage Products</h2>
<p>Products are managed from <strong>App Settings</strong> in the current OneCloud interface. Watch the guided demo above first, then use the screenshots below as your step-by-step reference.</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/product/product-step-01-select-and-assign.jpg" alt="Annotated company products screen showing how to assign products" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">Tick products in <strong>All Products</strong>, then use the right arrow to add them to your company list.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/product/product-step-02-create-first.jpg" alt="Annotated manage products screen showing the create button" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">If the product is missing, use the <strong>+</strong> button first to create it.</figcaption>
  </figure>
</div>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/product/product-step-03-fill-required-fields.jpg" alt="Annotated new product form showing required fields" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">Complete the starred fields and click <strong>Save</strong> to create the product.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/course-guides/product/product-step-04-review-required-fields.jpg" alt="Annotated validation warning on the new product form" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">This warning usually means one of the required fields is still empty.</figcaption>
  </figure>
</div>
<h3>What the demo is teaching</h3>
<ul>
  <li>Where <strong>Manage Products</strong> lives inside <strong>App Settings</strong>.</li>
  <li>How the <strong>+</strong> button and the transfer arrows work together.</li>
  <li>What to do if the form falls back to a generic required-fields alert.</li>
</ul>
<h3>Create a new product</h3>
<ol>
  <li>Open <strong>App Settings</strong>.</li>
  <li>Select <strong>Manage Products</strong>.</li>
  <li>Click the <strong>+</strong> button to create a new product.</li>
  <li>Complete the required fields such as product name, unit of measurement, unit per block, chemical substance, bait holder, active ingredient, and expiry.</li>
  <li>Use <strong>Save</strong> to create the product.</li>
</ol>
<h3>Assign the product to the company</h3>
<ol>
  <li>Stay in <strong>Manage Products</strong>.</li>
  <li>Use the left-hand <strong>All Products</strong> list to find the product.</li>
  <li>Select the product and use the right-arrow button to move it to <strong>Company Products</strong>.</li>
  <li>Confirm it appears in the company list before leaving the page.</li>
</ol>
<h3>Arrow guide</h3>
<ul>
  <li><strong>Right arrow</strong> - adds the selected product to <strong>Company Products</strong>.</li>
  <li><strong>Left arrow</strong> - removes the selected product from <strong>Company Products</strong>.</li>
</ul>
<p>If the form shows a generic required-fields warning, check each starred field carefully before retrying.</p>
<blockquote><p>Once the product appears in <strong>Company Products</strong>, it is available in your company list for setup and servicing workflows.</p></blockquote>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '2.0',
    videoUrl: '/course-guides/product/add-product-guided-demo.mp4',
    videoProvider: 'local',
  })

  await createLesson(prisma, {
    id: 'lesson-admin-2-2',
    moduleId: adminMod2.id,
    title: 'Create a User and Review Access Options',
    slug: 'create-user-and-review-access',
    summary: 'Use Manage Users to create a new user, assign access, and decide whether to send an invite or force a password reset.',
    content: `
<h2>Create a User</h2>
<p>User setup is managed from <strong>App Settings</strong> in the current platform.</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/uploads/academy-guides/manage-users.jpg" alt="Manage Users screen in App Settings" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">The main <strong>Manage Users</strong> screen used to create and edit users.</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="/qa-review/user-access.jpg" alt="Detailed user access panel from the training session" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">A real session view showing the reset-password and access options you should explain during training.</figcaption>
  </figure>
</div>
<h3>Steps</h3>
<ol>
  <li>Open <strong>App Settings</strong>.</li>
  <li>Select <strong>Manage Users</strong>.</li>
  <li>Enter the user's email/username, first name, last name, alias, mobile number, and access role.</li>
  <li>Complete password, country, timezone, and address details if you are creating the account manually.</li>
  <li>Review the available access toggles such as <strong>DASHBOARD</strong> and <strong>APPSETTINGS</strong>.</li>
  <li>Choose whether to <strong>Send email to user</strong> and whether to <strong>Prompt to change password</strong>.</li>
  <li>Save the record and confirm the user is enabled.</li>
</ol>
<h3>Before you finish</h3>
<ul>
  <li>Double-check the selected role so the new user sees the right content and controls.</li>
  <li>Use password-reset prompts for first access when you want the user to set their own secret.</li>
</ul>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '1.1',
  })

  // == Gateway Basics ==
  const gatewayMod1 = await prisma.module.upsert({
    where: { id: 'mod-gw-1' },
    update: {},
    create: {
      id: 'mod-gw-1',
      courseId: gatewayCourse.id,
      title: 'Module 1: Introduction to the Gateway',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-gw-1-1',
    moduleId: gatewayMod1.id,
    title: 'What the Gateway Does',
    slug: 'what-the-gateway-does',
    summary: "The gateway's role in the PestSense network — what it is, why it matters, and how it connects everything.",
    content: `
<h2>The Gateway: Your Site's Communication Hub</h2>
<p>Think of the gateway as the "Wi-Fi router" for your PestSense devices. Without it, the devices at a site can't communicate with the cloud platform.</p>
<h3>What the gateway does:</h3>
<ul>
  <li>Receives signals from all PestSense devices within range</li>
  <li>Forwards those signals to the PestSense cloud platform</li>
  <li>Allows the platform to show real-time device status and alerts</li>
</ul>
<h3>What the gateway doesn't do:</h3>
<ul>
  <li>Store data locally (it just passes data through)</li>
  <li>Control devices directly</li>
  <li>Require you to "check in" to it — it works automatically</li>
</ul>
<p>Each site needs at least one gateway. Larger or complex sites may need more than one to ensure full coverage.</p>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  await createLesson(prisma, {
    id: 'lesson-gw-1-2',
    moduleId: gatewayMod1.id,
    title: 'Where to Place the Gateway',
    slug: 'where-to-place-the-gateway',
    summary: 'Placement principles for maximum coverage — height, obstacles, and what to avoid.',
    content: `
<h2>Gateway Placement Guide</h2>
<p>Where you put the gateway has a big impact on how well the whole site works. Good placement = fewer problems.</p>
<h3>General rules:</h3>
<ul>
  <li><strong>Height</strong> — Mount as high as practical. The higher it is, the better the signal range. Aim for at least 2–3 metres off the floor.</li>
  <li><strong>Central location</strong> — Position the gateway near the centre of the area it needs to cover.</li>
  <li><strong>Avoid metal enclosures</strong> — Metal walls and cabinets can block LoRaWAN signals significantly.</li>
  <li><strong>Avoid thick concrete</strong> — Signal can travel through walls, but multiple thick concrete walls reduce range.</li>
  <li><strong>Power access</strong> — Must be near a power outlet. Check cable run before committing to a location.</li>
  <li><strong>Network access</strong> — Needs either an Ethernet connection or cellular signal (model dependent).</li>
</ul>
<h3>Common mistakes:</h3>
<ul>
  <li>Placing it in a locked metal cabinet</li>
  <li>Placing it too low (e.g. under a desk)</li>
  <li>Placing it near the edge of the building, away from most devices</li>
  <li>Forgetting to check network connectivity before installation</li>
</ul>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  await createLesson(prisma, {
    id: 'lesson-gw-1-3',
    moduleId: gatewayMod1.id,
    title: 'Power and Connectivity',
    slug: 'gateway-power-and-connectivity',
    summary: 'What the gateway needs to run — power supply options and internet connection requirements.',
    content: `
<h2>Power and Connectivity Requirements</h2>
<h3>Power</h3>
<p>The gateway requires a standard power outlet. It uses a 12V DC adapter (supplied in the box). Do not use third-party adapters — they may not supply enough current.</p>
<h3>Internet Connection Options</h3>
<p>The gateway needs to reach the PestSense cloud to forward device data. It supports:</p>
<ul>
  <li><strong>Ethernet (recommended)</strong> — Most reliable. Connect with the supplied cable to a router or switch at the site.</li>
  <li><strong>Cellular (LTE model only)</strong> — Uses a SIM card. Suitable for sites with no fixed internet or difficult cable runs. Check coverage before relying on this.</li>
</ul>
<h3>What happens if it loses connectivity?</h3>
<p>The gateway will continue to receive signals from devices but cannot forward them. Data will queue briefly, then you may see "Gateway Offline" alerts in the platform. Restore connectivity to resume normal operation.</p>
    `,
    sortOrder: 3,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  await createLesson(prisma, {
    id: 'lesson-gw-1-4',
    moduleId: gatewayMod1.id,
    title: 'Common Gateway Problems',
    slug: 'common-gateway-problems',
    summary: 'A troubleshooting reference for the most common gateway issues seen in the field.',
    content: `
<h2>Common Gateway Problems and Solutions</h2>
<table>
  <thead><tr><th>Problem</th><th>Likely Cause</th><th>What to Do</th></tr></thead>
  <tbody>
    <tr><td>Gateway shows "Offline" in platform</td><td>No internet, power lost, or hardware fault</td><td>Check power LED, check network cable/cellular signal, reboot gateway</td></tr>
    <tr><td>Devices not appearing on platform</td><td>Gateway not commissioned, out of range, or devices not registered</td><td>Confirm gateway is online, check device placement relative to gateway</td></tr>
    <tr><td>Intermittent connectivity</td><td>Unstable network at site, interference, or poor placement</td><td>Check site network stability, move gateway higher or more central</td></tr>
    <tr><td>LED is off</td><td>No power</td><td>Check power adapter and outlet</td></tr>
  </tbody>
</table>
<h3>LED Status Guide</h3>
<ul>
  <li>🟢 <strong>Solid Green</strong> — Online and operating normally</li>
  <li>🟡 <strong>Flashing Amber</strong> — Connecting to network</li>
  <li>🔴 <strong>Solid Red</strong> — Hardware fault. Contact support.</li>
  <li>⚪ <strong>Off</strong> — No power</li>
</ul>
    `,
    sortOrder: 4,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  // == Signal Basics ==
  const signalMod1 = await prisma.module.upsert({
    where: { id: 'mod-signal-1' },
    update: {},
    create: {
      id: 'mod-signal-1',
      courseId: signalCourse.id,
      title: 'Module 1: How the Network Works',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-signal-1-1',
    moduleId: signalMod1.id,
    title: 'What is LoRaWAN? (Plain Language)',
    slug: 'what-is-lorawan',
    summary: 'A jargon-free explanation of LoRaWAN and why PestSense uses it.',
    content: `
<h2>LoRaWAN in Plain English</h2>
<p>You don't need to be a network engineer to understand this. Here's what you actually need to know:</p>
<h3>The Simple Version</h3>
<p>LoRaWAN is a type of wireless communication designed for low-power sensors and devices that need to send small amounts of data over long distances. PestSense uses it because:</p>
<ul>
  <li><strong>Long range</strong> — One gateway can cover a large building or site without needing cables to every device</li>
  <li><strong>Low power</strong> — Devices can run on small batteries for months or years</li>
  <li><strong>Reliable</strong> — Designed specifically for monitoring applications, not streaming video or music</li>
</ul>
<h3>How It Connects</h3>
<p>Think of it like this:</p>
<ol>
  <li>A <strong>device</strong> (like a trap sensor) detects something and sends a tiny signal</li>
  <li>The <strong>gateway</strong> picks up that signal (like a receiver dish on a rooftop)</li>
  <li>The gateway sends it over the internet to the <strong>PestSense cloud</strong></li>
  <li>You see it on your <strong>dashboard</strong></li>
</ol>
<p>The device never connects to the internet directly — it only talks to the gateway.</p>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  await createLesson(prisma, {
    id: 'lesson-signal-1-2',
    moduleId: signalMod1.id,
    title: 'What Affects Signal',
    slug: 'what-affects-signal',
    summary: 'The real-world factors that affect how well devices communicate — what helps and what hurts.',
    content: `
<h2>What Affects Signal Quality</h2>
<p>LoRaWAN is designed to penetrate walls and travel long distances, but there are limits. Here's what matters in the field:</p>
<h3>Things that HELP signal:</h3>
<ul>
  <li>Gateway placed high up (2–5m or above)</li>
  <li>Gateway in a central, open location</li>
  <li>Clear line of sight between device and gateway</li>
  <li>Newer concrete or timber-frame buildings</li>
</ul>
<h3>Things that HURT signal:</h3>
<ul>
  <li>Thick concrete or stone walls (old buildings, bunkers, basements)</li>
  <li>Metal shelving, racking, or walls between device and gateway</li>
  <li>Fridges, freezers, and large metal equipment nearby</li>
  <li>Underground or sub-basement placement</li>
  <li>Very large buildings relying on a single gateway</li>
</ul>
<h3>Rule of thumb for field placements:</h3>
<p>If you can walk from the device to the gateway without going through more than 2–3 solid walls, signal should be fine. If the path has lots of metal, concrete floors, or has to go around an entire building — consider adding a second gateway or moving placement.</p>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  // == Sales Course ==
  const salesMod1 = await prisma.module.upsert({
    where: { id: 'mod-sales-1' },
    update: {},
    create: {
      id: 'mod-sales-1',
      courseId: salesCourse.id,
      title: 'Module 1: Identifying the Right Customer',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-sales-1-1',
    moduleId: salesMod1.id,
    title: 'Identifying Good-Fit Customers',
    slug: 'identifying-good-fit-customers',
    summary: 'The customer profile that gets the most value from PestSense — signs to look for during discovery.',
    content: `
<h2>Who Benefits Most from PestSense?</h2>
<p>Not every pest control customer needs digital monitoring. Knowing who to target saves time and improves close rates.</p>
<h3>Strong indicators of a good fit:</h3>
<ul>
  <li><strong>Multiple sites or a large single site</strong> — More devices = more value from remote monitoring</li>
  <li><strong>Compliance-driven industries</strong> — Food manufacturing, hospitality, healthcare, aged care — customers who need audit trails and documentation</li>
  <li><strong>Sites that are hard to access regularly</strong> — Remote locations, high-security areas, 24/7 operations</li>
  <li><strong>Current manual reporting pain</strong> — If they're spending hours generating reports or chasing technicians, PestSense solves a real problem</li>
  <li><strong>High pest pressure</strong> — Sites with active pest issues are more motivated to invest in better detection</li>
</ul>
<h3>Signs it's probably not the right fit (yet):</h3>
<ul>
  <li>Single small site with easy physical access</li>
  <li>Very price-sensitive customer with no compliance requirements</li>
  <li>Customer not engaged in their pest program at all</li>
</ul>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  await createLesson(prisma, {
    id: 'lesson-sales-1-2',
    moduleId: salesMod1.id,
    title: 'How to Explain Value',
    slug: 'how-to-explain-value',
    summary: 'Plain-language talking points for explaining what PestSense does and why it matters to a customer.',
    content: `
<h2>Explaining PestSense Value to Customers</h2>
<p>Most customers don't need to understand LoRaWAN. They need to understand what they get and why it's worth paying for.</p>
<h3>Core value messages:</h3>
<ul>
  <li><strong>"You'll know what's happening between visits"</strong> — Real-time alerts mean you catch activity as it happens, not days later when damage is done.</li>
  <li><strong>"Less paper, less chasing"</strong> — Digital reporting means automatic records of every device check-in, alert, and service visit.</li>
  <li><strong>"Prove your service is working"</strong> — Give your clients a portal login so they can see the data themselves. That builds trust and reduces disputes.</li>
  <li><strong>"Fewer unnecessary callouts"</strong> — Instead of checking every trap every time, focus visits on devices that have activity. Saves time and cost.</li>
</ul>
<h3>Handling the "we already have pest control" objection:</h3>
<p>"I completely understand — this doesn't replace your current service. It makes it smarter. Your technician still visits, but now you both know exactly where to focus."</p>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  // == Device 1 Basics ==
  const device1Mod1 = await prisma.module.upsert({
    where: { id: 'mod-dev1-1' },
    update: {},
    create: {
      id: 'mod-dev1-1',
      courseId: device1Course.id,
      title: 'Module 1: Getting to Know Device 1',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-dev1-1-1',
    moduleId: device1Mod1.id,
    title: 'Device 1 Overview',
    slug: 'device-1-overview',
    summary: 'What Device 1 is, what it detects, and where it is typically deployed.',
    content: `
<h2>Device 1 Overview</h2>
<p>Device 1 is a compact LoRaWAN sensor designed for pest monitoring applications. It sends signals to the nearest gateway when triggered.</p>
<h3>Key specifications:</h3>
<ul>
  <li>Battery-powered (standard AA batteries, 12–18 months typical life)</li>
  <li>LoRaWAN Class A communication</li>
  <li>IP65 rated — suitable for damp environments</li>
  <li>Check-in interval: every 24 hours (plus on-trigger)</li>
</ul>
<h3>Typical deployment locations:</h3>
<ul>
  <li>Along walls and floor-wall junctions</li>
  <li>Behind equipment or appliances</li>
  <li>Inside service ducts and risers</li>
  <li>In storage areas and roof voids</li>
</ul>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  await createLesson(prisma, {
    id: 'lesson-dev1-1-2',
    moduleId: device1Mod1.id,
    title: 'Device 1 Installation',
    slug: 'device-1-installation',
    summary: 'Step-by-step installation guide — from unboxing to confirmed online status.',
    content: `
<h2>Installing Device 1</h2>
<h3>What's in the box:</h3>
<ul>
  <li>Device 1 unit</li>
  <li>2x AA batteries</li>
  <li>Mounting bracket and screws</li>
  <li>QR code label (for commissioning)</li>
</ul>
<h3>Installation steps:</h3>
<ol>
  <li>Choose your placement location (see placement guide for rules).</li>
  <li>Mount the bracket first — use the supplied screws. Level it on the wall or floor-wall junction.</li>
  <li>Insert batteries into the device. The LED will flash briefly to confirm power.</li>
  <li>Clip the device onto the bracket.</li>
  <li>Open PestSense on your phone or tablet.</li>
  <li>Navigate to the site → Add Device → Scan QR code on the device label.</li>
  <li>The platform will confirm the device has checked in (this may take 2–5 minutes).</li>
  <li>Label the device location in the platform (e.g. "Kitchen — rear wall, beside fridge").</li>
</ol>
<h3>Confirming installation success:</h3>
<p>The device should appear as "Online" in the platform within 5 minutes. If it shows "Pending" after 10 minutes, check gateway coverage at that location.</p>
    `,
    sortOrder: 2,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  // == Site Manager Basics ==
  const managerMod1 = await prisma.module.upsert({
    where: { id: 'mod-mgr-1' },
    update: {},
    create: {
      id: 'mod-mgr-1',
      courseId: managerBasicsCourse.id,
      title: 'Module 1: Site-Level Oversight',
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  })

  await createLesson(prisma, {
    id: 'lesson-mgr-1-1',
    moduleId: managerMod1.id,
    title: 'Reviewing Site Activity',
    slug: 'reviewing-site-activity',
    summary: 'How to get a clear picture of what is happening across your sites using the PestSense platform.',
    content: `
<h2>Reviewing Site Activity</h2>
<p>As a site manager, you have visibility across all devices at your assigned sites. Here's how to stay across what's happening.</p>
<h3>Your site overview panel shows:</h3>
<ul>
  <li>Total devices and status breakdown (online / offline / in-alert)</li>
  <li>Unresolved alerts requiring attention</li>
  <li>Trend indicators (activity up or down vs last period)</li>
  <li>Last service visit date and technician name</li>
</ul>
<h3>How to review activity for a period:</h3>
<ol>
  <li>Go to <strong>Sites</strong> and select your site.</li>
  <li>Click <strong>Activity Report</strong>.</li>
  <li>Choose your date range (last 7 days, last month, custom).</li>
  <li>The report shows all alerts, device triggers, and technician visits in that period.</li>
  <li>Export to PDF for audit or client reporting if needed.</li>
</ol>
    `,
    sortOrder: 1,
    status: ContentStatus.PUBLISHED,
    version: '1.0',
  })

  console.log('✅ Modules and lessons created')

  console.log('\n✅ Seed complete!')
  console.log('\nDemo accounts:')
  console.log('  Admin:   admin@example.internal   / ChangeMe123!')
  console.log('  Tech:    tech@pestsense.com    / Tech1234!')
  console.log('  Manager: manager@pestsense.com / Manager1234!')
}

async function createLesson(
  prisma: PrismaClient,
  data: {
    id: string
    moduleId: string
    title: string
    slug: string
    summary: string
    content: string
    sortOrder: number
    status: ContentStatus
    version: string
    videoUrl?: string
    videoProvider?: string
  }
) {
  const { id, ...rest } = data
  return prisma.lesson.upsert({
    where: { id },
    update: {
      ...rest,
    },
    create: data,
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
