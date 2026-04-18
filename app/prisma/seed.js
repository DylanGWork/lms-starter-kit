const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding PestSense Academy...')

  const adminPassword = await bcrypt.hash('ChangeMe123!', 12)
  const techPassword = await bcrypt.hash('Tech1234!', 12)
  const managerPassword = await bcrypt.hash('Manager1234!', 12)

  await prisma.user.upsert({
    where: { email: 'admin@example.internal' },
    update: {},
    create: { email: 'admin@example.internal', name: 'Platform Admin', passwordHash: adminPassword, role: 'SUPER_ADMIN' },
  })
  await prisma.user.upsert({
    where: { email: 'tech@pestsense.com' },
    update: {},
    create: { email: 'tech@pestsense.com', name: 'Demo Technician', passwordHash: techPassword, role: 'TECHNICIAN' },
  })
  await prisma.user.upsert({
    where: { email: 'manager@pestsense.com' },
    update: {},
    create: { email: 'manager@pestsense.com', name: 'Demo Site Manager', passwordHash: managerPassword, role: 'SITE_MANAGER' },
  })
  console.log('✅ Users created')

  const tagNames = ['getting-started', 'hardware', 'software', 'network', 'lorawan', 'troubleshooting', 'gateway', 'alerts', 'reports', 'sales', 'device', 'admin']
  for (const name of tagNames) {
    await prisma.tag.upsert({ where: { slug: name }, update: {}, create: { name, slug: name } })
  }

  const softwareCat = await prisma.category.upsert({
    where: { slug: 'software' }, update: {},
    create: { name: 'Software', slug: 'software', description: 'Training on the PestSense web platform and mobile app', icon: 'Monitor', color: '#61ce70', sortOrder: 1, status: 'PUBLISHED' },
  })
  const hardwareCat = await prisma.category.upsert({
    where: { slug: 'hardware' }, update: {},
    create: { name: 'Hardware', slug: 'hardware', description: 'Physical device installation, setup, and troubleshooting', icon: 'Cpu', color: '#018902', sortOrder: 2, status: 'PUBLISHED' },
  })
  const networkCat = await prisma.category.upsert({
    where: { slug: 'network' }, update: {},
    create: { name: 'Network / LoRaWAN', slug: 'network', description: 'Non-technical field guide to understanding connectivity', icon: 'Wifi', color: '#02f103', sortOrder: 3, status: 'PUBLISHED' },
  })
  const salesCat = await prisma.category.upsert({
    where: { slug: 'sales' }, update: {},
    create: { name: 'Sales & Commercial', slug: 'sales', description: 'How to sell and scope digital pest control solutions', icon: 'TrendingUp', color: '#006300', sortOrder: 4, status: 'PUBLISHED' },
  })
  console.log('✅ Categories created')

  // Courses
  const techStartCourse = await prisma.course.upsert({
    where: { slug: 'technician-getting-started' }, update: {},
    create: { categoryId: softwareCat.id, title: 'Technician Getting Started', slug: 'technician-getting-started', description: 'Everything a technician needs to get up and running with PestSense on day one.', status: 'PUBLISHED', sortOrder: 1, estimatedMins: 30 },
  })
  for (const role of ['TECHNICIAN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: techStartCourse.id, role } }, update: {}, create: { courseId: techStartCourse.id, role } })
  }

  const managerBasicsCourse = await prisma.course.upsert({
    where: { slug: 'site-manager-basics' }, update: {},
    create: { categoryId: softwareCat.id, title: 'Site Manager Basics', slug: 'site-manager-basics', description: 'How to oversee sites, review reports, and manage your team.', status: 'PUBLISHED', sortOrder: 2, estimatedMins: 45 },
  })
  for (const role of ['SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: managerBasicsCourse.id, role } }, update: {}, create: { courseId: managerBasicsCourse.id, role } })
  }

  const adminPlatformCourse = await prisma.course.upsert({
    where: { slug: 'admin-platform-basics' }, update: {},
    create: { categoryId: softwareCat.id, title: 'Admin Platform Basics', slug: 'admin-platform-basics', description: 'Full administration guide for business owners and platform admins.', status: 'PUBLISHED', sortOrder: 3, estimatedMins: 60 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: adminPlatformCourse.id, role } }, update: {}, create: { courseId: adminPlatformCourse.id, role } })
  }

  const device1Course = await prisma.course.upsert({
    where: { slug: 'device-1-basics' }, update: {},
    create: { categoryId: hardwareCat.id, title: 'Device 1 Basics', slug: 'device-1-basics', description: 'Complete guide to unboxing, installing, and commissioning Device 1.', status: 'PUBLISHED', sortOrder: 1, estimatedMins: 40 },
  })
  for (const role of ['TECHNICIAN', 'SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: device1Course.id, role } }, update: {}, create: { courseId: device1Course.id, role } })
  }

  const gatewayCourse = await prisma.course.upsert({
    where: { slug: 'gateway-basics' }, update: { description: 'Everything you need to know about the Robustel R3000-LG LoRaWAN gateway — hardware, SIM setup, placement, LEDs, and field troubleshooting.', estimatedMins: 55 },
    create: { categoryId: hardwareCat.id, title: 'Gateway Basics', slug: 'gateway-basics', description: 'Everything you need to know about the Robustel R3000-LG LoRaWAN gateway — hardware, SIM setup, placement, LEDs, and field troubleshooting.', status: 'PUBLISHED', sortOrder: 3, estimatedMins: 55 },
  })
  for (const role of ['TECHNICIAN', 'SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: gatewayCourse.id, role } }, update: {}, create: { courseId: gatewayCourse.id, role } })
  }

  const signalCourse = await prisma.course.upsert({
    where: { slug: 'signal-basics-for-field-users' }, update: {},
    create: { categoryId: networkCat.id, title: 'Signal Basics for Field Users', slug: 'signal-basics-for-field-users', description: "A plain-language guide to LoRaWAN — no technical background needed.", status: 'PUBLISHED', sortOrder: 1, estimatedMins: 25 },
  })
  for (const role of ['TECHNICIAN', 'SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: signalCourse.id, role } }, update: {}, create: { courseId: signalCourse.id, role } })
  }

  const salesCourse = await prisma.course.upsert({
    where: { slug: 'selling-digital-pest-control' }, update: {},
    create: { categoryId: salesCat.id, title: 'Selling Digital Pest Control', slug: 'selling-digital-pest-control', description: 'How to identify great-fit customers, explain value, and close opportunities.', status: 'PUBLISHED', sortOrder: 1, estimatedMins: 50 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesCourse.id, role } }, update: {}, create: { courseId: salesCourse.id, role } })
  }

  // === SALES & COMMERCIAL ENABLEMENT — 7 COURSES ===

  const salesC1 = await prisma.course.upsert({
    where: { slug: 'what-digital-is-really-selling' }, update: {},
    create: { categoryId: salesCat.id, title: 'What Digital Is Really Selling', slug: 'what-digital-is-really-selling', description: 'Stop selling hardware. Learn how to sell the outcomes your customers actually care about — risk reduction, compliance, and peace of mind.', status: 'PUBLISHED', sortOrder: 2, estimatedMins: 30 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC1.id, role } }, update: {}, create: { courseId: salesC1.id, role } })
  }

  const salesC2 = await prisma.course.upsert({
    where: { slug: 'identifying-right-customers' }, update: {},
    create: { categoryId: salesCat.id, title: 'Identifying the Right Customers', slug: 'identifying-right-customers', description: 'Learn which businesses get the most value from digital pest control, and how to qualify opportunities quickly.', status: 'PUBLISHED', sortOrder: 3, estimatedMins: 40 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC2.id, role } }, update: {}, create: { courseId: salesC2.id, role } })
  }

  const salesC3 = await prisma.course.upsert({
    where: { slug: 'building-the-business-case' }, update: {},
    create: { categoryId: salesCat.id, title: 'Building the Business Case', slug: 'building-the-business-case', description: 'Turn PestSense into a financial argument. Quantify risk, calculate ROI, and make the business case irresistible.', status: 'PUBLISHED', sortOrder: 4, estimatedMins: 35 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC3.id, role } }, update: {}, create: { courseId: salesC3.id, role } })
  }

  const salesC4 = await prisma.course.upsert({
    where: { slug: 'changing-the-service-model' }, update: {},
    create: { categoryId: salesCat.id, title: 'Changing the Service Model', slug: 'changing-the-service-model', description: 'How the move to digital transforms the way you deliver, price, and demonstrate value in your pest control service.', status: 'PUBLISHED', sortOrder: 5, estimatedMins: 35 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC4.id, role } }, update: {}, create: { courseId: salesC4.id, role } })
  }

  const salesC5 = await prisma.course.upsert({
    where: { slug: 'selling-with-data' }, update: {},
    create: { categoryId: salesCat.id, title: 'Selling with Data', slug: 'selling-with-data', description: 'Use the PestSense OneCloud platform and automated reports as powerful live demonstration tools in your sales process.', status: 'PUBLISHED', sortOrder: 6, estimatedMins: 30 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC5.id, role } }, update: {}, create: { courseId: salesC5.id, role } })
  }

  const salesC6 = await prisma.course.upsert({
    where: { slug: 'handling-objections' }, update: {},
    create: { categoryId: salesCat.id, title: 'Handling Objections', slug: 'handling-objections', description: 'The complete playbook for the most common pushbacks — price, disruption, loyalty, and "we already have pest control".', status: 'PUBLISHED', sortOrder: 7, estimatedMins: 40 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC6.id, role } }, update: {}, create: { courseId: salesC6.id, role } })
  }

  const salesC7 = await prisma.course.upsert({
    where: { slug: 'pricing-and-proposals' }, update: {},
    create: { categoryId: salesCat.id, title: 'Pricing & Proposals', slug: 'pricing-and-proposals', description: 'Master the PestSense pricing model, scope sites accurately, and present proposals that close.', status: 'PUBLISHED', sortOrder: 8, estimatedMins: 45 },
  })
  for (const role of ['BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: salesC7.id, role } }, update: {}, create: { courseId: salesC7.id, role } })
  }

  console.log('✅ Courses created')

  // Modules and lessons
  const gatewayMod1 = await prisma.module.upsert({
    where: { id: 'mod-gw-1' }, update: { title: 'Module 1: How the Gateway Works' },
    create: { id: 'mod-gw-1', courseId: gatewayCourse.id, title: 'Module 1: How the Gateway Works', sortOrder: 1, status: 'PUBLISHED' },
  })

  const gatewayMod2 = await prisma.module.upsert({
    where: { id: 'mod-gw-2' }, update: {},
    create: { id: 'mod-gw-2', courseId: gatewayCourse.id, title: 'Module 2: The Robustel R3000-LG In Depth', sortOrder: 2, status: 'PUBLISHED' },
  })

  const lessons = [
    {
      id: 'lesson-gw-1-1', moduleId: gatewayMod1.id,
      title: 'What the Gateway Does', slug: 'what-the-gateway-does',
      summary: "The gateway's role in the PestSense network — what it is, why it matters, and how it connects everything.",
      content: `<h2>The Gateway: Your Site's Communication Hub</h2>
<p>Every PestSense site needs one thing before anything else can work: a gateway. Think of it as the translator and dispatcher for the entire site — it listens for signals from every Predictor device, decodes them, and forwards the data over 4G to the PestSense cloud platform.</p>
<p>Without the gateway, your devices are deaf and mute. They may be working perfectly, but no data reaches the platform, no alerts fire, and nothing appears on the dashboard.</p>

<h3>What it does, step by step</h3>
<ol>
<li>A Predictor device detects activity (or wakes up on schedule) and transmits a tiny LoRaWAN radio packet</li>
<li>The gateway's LoRaWAN receiver picks up the packet — this works through walls, floors, and across open space up to several hundred metres</li>
<li>The gateway forwards the decoded packet over its 4G cellular connection to the PestSense cloud (OneCloud)</li>
<li>OneCloud processes the data, updates device status, and fires alerts if needed</li>
<li>You see it on your dashboard or receive an email/push notification</li>
</ol>

<h3>One gateway, many devices</h3>
<p>A single Robustel R3000-LG gateway can support <strong>400+ Predictor devices</strong> simultaneously. For most commercial sites, one gateway is enough. Larger sites with multiple buildings or sub-basement areas may require two or more gateways.</p>

<h3>The gateway uses 4G, not your site's WiFi</h3>
<p>This is important: the R3000-LG connects to the internet through its own 4G SIM card. <strong>It does not need to be connected to the customer's Wi-Fi or network.</strong> This means:</p>
<ul>
<li>No IT involvement required at most sites</li>
<li>No dependency on the customer's broadband going down</li>
<li>You can install it wherever signal is best, not wherever there's an ethernet port</li>
<li>Connectivity is your responsibility, not the customer's</li>
</ul>
<blockquote><p>Always verify 4G coverage at the planned gateway location before finalising an installation. Use the Optus coverage checker or your SIM carrier's app to confirm signal strength at the mounting height.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '2.0',
    },
    {
      id: 'lesson-gw-1-2', moduleId: gatewayMod1.id,
      title: 'Where to Place the Gateway', slug: 'where-to-place-the-gateway',
      summary: 'Placement principles for maximum LoRaWAN coverage — height, centrality, obstacles, and what to avoid.',
      content: `<h2>Gateway Placement Guide</h2>
<p>Getting gateway placement right is the single most impactful decision on a PestSense installation. A poorly placed gateway can result in half the devices showing "Signal Weak" or going offline — even if everything else is perfect. A well-placed gateway will reliably cover an entire large commercial building from one point.</p>

<h3>The golden rules</h3>
<table>
<thead><tr><th>Rule</th><th>Why it matters</th></tr></thead>
<tbody>
<tr><td>Mount high — minimum 2.5m, ideally 4–6m</td><td>LoRaWAN signals radiate downward and outward from height. Mounting at desk height halves your effective range.</td></tr>
<tr><td>Central location preferred</td><td>Covers the site evenly. An edge-mounted gateway leaves the far end of the building at reduced signal.</td></tr>
<tr><td>Open space, not inside enclosures</td><td>A metal cabinet reduces LoRa range by up to 80%. Never mount inside a steel distribution board or comms rack without an external antenna run.</td></tr>
<tr><td>Avoid dense concrete between gateway and device zones</td><td>Reinforced concrete floors cause 15–20 dB attenuation per floor. A gateway on Level 1 may not reach Level 3.</td></tr>
<tr><td>Power point within 2m</td><td>The R3000-LG uses a 12V DC adapter. The supplied cable is 2m — note this in your site assessment.</td></tr>
</tbody>
</table>

<h3>Multi-storey buildings</h3>
<p>For buildings with multiple floors, consider one gateway per floor if devices are concentrated on each level. Alternatively, mounting the gateway near a stairwell or atrium allows signals to propagate more freely between levels.</p>

<h3>Ideal mounting locations</h3>
<ul>
<li>High on a partition wall in a back-of-house corridor</li>
<li>Above a false ceiling (if the ceiling tiles are not metal-backed)</li>
<li>On a structural column high in a warehouse or cold store</li>
<li>In a comms room with an external antenna cable run to a better vantage point</li>
</ul>

<h3>Places to avoid</h3>
<ul>
<li><strong>Inside metal electrical cabinets</strong> — even a small metal door dramatically reduces signal</li>
<li><strong>Under a desk or on the floor</strong> — signals are blocked by furniture, walls, and the floor itself</li>
<li><strong>Near large motors or inverters</strong> — electrical noise can interfere with 4G and LoRa reception</li>
<li><strong>In a basement with no 4G signal</strong> — the gateway needs cellular connectivity to function</li>
<li><strong>Directly adjacent to the LoRa antenna of another gateway</strong> — gateways from different networks can interfere at very close range</li>
</ul>

<blockquote><p>Use the Signal Simulator tool in the Academy to map out your site before installation — it lets you place a virtual gateway and devices and shows predicted signal strength through walls and obstacles.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '2.0',
    },
    {
      id: 'lesson-gw-1-3', moduleId: gatewayMod1.id,
      title: 'Power and 4G Connectivity', slug: 'gateway-power-and-connectivity',
      summary: 'Power requirements, SIM carrier selection, data usage, and what happens if 4G signal is poor.',
      content: `<h2>Power and 4G Connectivity</h2>

<h3>Power supply</h3>
<p>The Robustel R3000-LG is powered by a <strong>12V DC, 1A</strong> adaptor (supplied in the box). It uses a standard barrel connector. Power consumption is low — under 10W during normal operation.</p>
<ul>
<li>Always use the supplied Robustel power adaptor — third-party adaptors with the wrong polarity can damage the unit</li>
<li>The unit has no internal battery — it requires continuous power. Consider a UPS (uninterruptible power supply) for sites with unreliable mains power</li>
<li>Power draw increases slightly when 4G data is transmitting (normal)</li>
</ul>

<h3>4G SIM card</h3>
<p>The R3000-LG uses a standard nano SIM for its 4G connection. PestSense gateways ship with a pre-provisioned SIM card — <strong>do not remove or replace the SIM</strong> unless instructed by PestSense support.</p>
<p>If you need to install a SIM on a new unit, see the lesson: <em>Installing the SIM Card</em> in Module 2.</p>

<h3>4G carrier and coverage</h3>
<p>PestSense SIM cards are configured to use the <strong>Optus network with automatic Telstra roaming</strong> as fallback. Before finalising a gateway location:</p>
<ol>
<li>Check Optus coverage at the site address using the Optus Coverage Checker</li>
<li>For locations in regional areas, check Telstra coverage as the fallback</li>
<li>At the planned mounting height, check signal with your phone on Optus — the gateway will achieve similar or better results with its external antenna</li>
</ol>

<h3>Data usage</h3>
<p>LoRaWAN packets are extremely small — a typical Predictor device transmit is under 50 bytes. A site with 50 active devices checking in every 10 minutes uses approximately <strong>200–400MB per month</strong> per gateway. The PestSense SIM includes sufficient data for this usage. Contact support if you have a site with an unusually high device count.</p>

<h3>What if 4G signal is poor at the ideal gateway location?</h3>
<p>You have two options:</p>
<ul>
<li><strong>External LTE antenna</strong> — The R3000-LG has a dedicated LTE antenna port (SMA, labelled "LTE"). An external directional or omnidirectional LTE antenna ($80–$150) can significantly improve cellular signal in poor coverage areas. Run coax cable from the unit to a location with better line-of-sight to a cell tower.</li>
<li><strong>Ethernet connection</strong> — If cellular coverage is insufficient, connect the gateway to the site's ethernet network via the RJ45 port. The gateway will prefer ethernet over cellular when both are connected. Obtain a static IP or DHCP reservation from the site's IT team.</li>
</ul>
<blockquote><p>Do not mount the gateway in a sub-basement or lift shaft without verifying 4G signal first. It is common for these areas to have no cellular coverage at all.</p></blockquote>`,
      sortOrder: 3, status: 'PUBLISHED', version: '2.0',
    },
    {
      id: 'lesson-gw-1-4', moduleId: gatewayMod1.id,
      title: 'Field Troubleshooting', slug: 'common-gateway-problems',
      summary: 'Step-by-step troubleshooting for the most common gateway problems, including LED interpretation.',
      content: `<h2>Gateway Field Troubleshooting</h2>
<p>Most gateway issues fall into two categories: <strong>power/hardware issues</strong> and <strong>4G connectivity issues</strong>. Use this guide to quickly diagnose and resolve problems on site.</p>

<h3>LED Reference — Robustel R3000-LG</h3>
<table>
<thead><tr><th>LED</th><th>State</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>PWR</td><td>Solid green</td><td>Unit is powered on normally</td></tr>
<tr><td>PWR</td><td>Off</td><td>No power — check adaptor, outlet, and barrel connector</td></tr>
<tr><td>NET</td><td>Solid green</td><td>4G connected and registered on network</td></tr>
<tr><td>NET</td><td>Slow flash (1s)</td><td>Searching for or connecting to 4G network</td></tr>
<tr><td>NET</td><td>Fast flash (0.25s)</td><td>Active data transfer — normal during startup or large packet burst</td></tr>
<tr><td>NET</td><td>Off</td><td>No SIM detected, SIM fault, or 4G disabled</td></tr>
<tr><td>ACT</td><td>Blue flash</td><td>LoRa packet received or transmitted — means a device is communicating</td></tr>
<tr><td>ACT</td><td>Off</td><td>No LoRa activity — no devices are transmitting within range</td></tr>
<tr><td>USR</td><td>Green</td><td>Connected to PestSense OneCloud platform</td></tr>
<tr><td>USR</td><td>Off or Red</td><td>Not connected to platform — check internet connection</td></tr>
</tbody>
</table>

<h3>Problem: Gateway shows Offline in PestSense dashboard</h3>
<ol>
<li>Check the PWR LED — if off, check power supply</li>
<li>Check the NET LED — if not solid green, the 4G connection is the issue</li>
<li>If NET is flashing slowly, wait 2 minutes — the gateway may still be connecting</li>
<li>If NET stays off, check SIM card seating (see Module 2: Installing the SIM Card)</li>
<li>Check cellular coverage at the location with your phone on Optus</li>
<li>Try relocating the gateway closer to a window or higher on the wall</li>
<li>If Ethernet is available, connect it — the gateway will use ethernet instead of 4G</li>
</ol>

<h3>Problem: Gateway is online but devices not appearing</h3>
<ol>
<li>Confirm the device is commissioned in the PestSense platform (it must be registered before it will appear)</li>
<li>Check the ACT LED — if no blue flashes when you trigger a device, the device's signal is not reaching the gateway</li>
<li>Move the device closer to the gateway to test range</li>
<li>Check for metal obstacles between device and gateway</li>
<li>Use the Signal Simulator tool to check if the planned device location is within reliable range</li>
</ol>

<h3>Problem: Gateway disconnects intermittently</h3>
<ul>
<li>Likely cause: marginal 4G signal strength — borderline coverage that drops under load</li>
<li>Solution: relocate gateway, add external LTE antenna, or add ethernet as backup</li>
<li>Check for nearby sources of RF interference (large motors, welding equipment, HVAC inverters)</li>
</ul>

<h3>Problem: Gateway stuck in reboot loop (PWR LED cycling)</h3>
<ul>
<li>This is rare but indicates a firmware or hardware fault</li>
<li>Try a factory reset: hold the RESET button for 10 seconds with power on — the unit will restore factory defaults</li>
<li><strong>Note:</strong> factory reset will clear your configuration. Contact PestSense support before doing this if you are unsure</li>
</ul>

<blockquote><p>If in doubt, call PestSense support before spending more than 15 minutes troubleshooting. Most issues are resolved remotely via the cloud management portal.</p></blockquote>`,
      sortOrder: 4, status: 'PUBLISHED', version: '2.0',
    },

    // Module 2: R3000-LG In Depth
    {
      id: 'lesson-gw-2-1', moduleId: gatewayMod2.id,
      title: 'R3000-LG Hardware Tour', slug: 'r3000-lg-hardware-tour',
      summary: 'A walkthrough of every port, antenna, LED, and button on the Robustel R3000-LG — what each one does and when you need it.',
      content: `<h2>Robustel R3000-LG: Hardware Overview</h2>
<p>The Robustel R3000-LG is an industrial-grade LoRaWAN gateway with integrated 4G LTE backhaul. It is purpose-built for IoT deployments where reliable, always-on connectivity is essential and site Wi-Fi or ethernet cannot be guaranteed.</p>

<h3>Physical dimensions and mounting</h3>
<ul>
<li>Size: approximately 140 × 110 × 46 mm</li>
<li>Weight: approximately 400g (without antennas)</li>
<li>DIN rail mount: the unit ships with a DIN rail clip — ideal for mounting in a comms or electrical room</li>
<li>Wall mount: a flat wall-mount bracket is also included. Use 4 × M4 screws into a solid surface.</li>
<li>Operating temperature: −40°C to +70°C — fully rated for cold stores, freezers, and hot plant rooms</li>
</ul>

<h3>Front panel — LEDs and button</h3>
<table>
<thead><tr><th>Element</th><th>Function</th></tr></thead>
<tbody>
<tr><td>PWR LED</td><td>Power status — solid green = powered on</td></tr>
<tr><td>NET LED</td><td>4G LTE status — see LED guide in Module 1 for full reference</td></tr>
<tr><td>ACT LED</td><td>LoRa activity — flashes blue when a LoRa packet is received or transmitted</td></tr>
<tr><td>USR LED</td><td>Platform connectivity — green when connected to PestSense OneCloud</td></tr>
<tr><td>RESET button</td><td>Hold 3 seconds: reboot. Hold 10 seconds: factory reset. Use a pin or paperclip.</td></tr>
</tbody>
</table>

<h3>Rear/side panel — ports and connectors</h3>
<table>
<thead><tr><th>Port</th><th>Label</th><th>Function</th></tr></thead>
<tbody>
<tr><td>SMA connector (large)</td><td>LORA</td><td>LoRaWAN antenna — the larger rubber-duck antenna connects here. Never operate without an antenna connected — this can damage the LoRa concentrator chip.</td></tr>
<tr><td>SMA connector (smaller)</td><td>LTE</td><td>4G cellular antenna — the smaller antenna connects here. Can be replaced with an external antenna + coax cable for improved cellular coverage.</td></tr>
<tr><td>RJ45 ethernet</td><td>ETH</td><td>Wired ethernet for internet backhaul. Use this in preference to 4G where available — more stable and lower latency.</td></tr>
<tr><td>DC barrel jack</td><td>PWR</td><td>12V DC power input. Use the supplied Robustel adaptor only.</td></tr>
<tr><td>SIM tray</td><td>SIM</td><td>Standard nano-SIM slot. Push to eject with a SIM tool or small pin.</td></tr>
<tr><td>USB port (if fitted)</td><td>USB</td><td>Management and firmware upgrade — not used in normal operation.</td></tr>
</tbody>
</table>

<h3>In the box</h3>
<ul>
<li>Robustel R3000-LG unit</li>
<li>LoRa antenna (rubber duck, RP-SMA)</li>
<li>LTE antenna (small rubber duck, SMA)</li>
<li>12V DC power adaptor</li>
<li>DIN rail clip</li>
<li>Wall mount bracket + screws</li>
<li>Ethernet patch cable (0.5m)</li>
<li>Quick start guide</li>
</ul>
<p><strong>PestSense ships units with a pre-installed SIM card.</strong> Do not remove it unless instructed by support.</p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-gw-2-2', moduleId: gatewayMod2.id,
      title: 'Installing the SIM Card', slug: 'r3000-lg-sim-card',
      summary: 'Step-by-step guide to inserting, replacing, or verifying the SIM card in the R3000-LG.',
      content: `<h2>SIM Card Installation Guide</h2>
<p>The R3000-LG uses a <strong>nano-SIM</strong> (the small size — same as most modern smartphones). PestSense gateways are shipped with a SIM pre-installed and pre-configured. You should only need this guide if:</p>
<ul>
<li>You are installing a fresh unit that arrived without a SIM</li>
<li>Support has instructed you to replace a faulty SIM</li>
<li>You are verifying SIM seating after a NET LED fault</li>
</ul>

<h3>Before you begin</h3>
<ul>
<li>Power off the gateway before touching the SIM tray</li>
<li>Use the supplied SIM ejector tool or a straightened paperclip</li>
<li>Handle the SIM card carefully — the gold contacts scratch easily</li>
<li>Confirm the SIM is a nano-SIM (15 × 12 mm). Standard SIM and micro-SIM will not fit without an adapter.</li>
</ul>

<h3>Steps</h3>
<ol>
<li><strong>Power off the unit</strong> — unplug the DC adaptor from the wall or from the unit.</li>
<li><strong>Locate the SIM tray</strong> — it is on the side or base of the unit, labelled "SIM". There is a small pinhole next to it.</li>
<li><strong>Eject the tray</strong> — insert the SIM tool into the pinhole and press firmly. The tray will pop out a few millimetres.</li>
<li><strong>Pull the tray out fully</strong> — slide it straight out. Do not tilt or force it.</li>
<li><strong>Place the SIM in the tray</strong> — gold contacts face down, notched corner aligned with the tray corner. The SIM only fits one way.</li>
<li><strong>Re-insert the tray</strong> — slide straight back in until it clicks flush. Do not press on the SIM itself.</li>
<li><strong>Power on the unit</strong> — reconnect the DC adaptor. Watch the NET LED.</li>
</ol>

<h3>After installation</h3>
<p>After powering on with the SIM installed:</p>
<ul>
<li>NET LED should begin slow flashing (searching for network) within 10 seconds</li>
<li>NET LED should turn solid green within 1–2 minutes once registered on the network</li>
<li>If NET LED stays off or flashes red after 3 minutes, check SIM seating and carrier coverage</li>
</ul>

<h3>SIM carrier details</h3>
<table>
<thead><tr><th>Detail</th><th>Value</th></tr></thead>
<tbody>
<tr><td>Primary carrier</td><td>Optus (AU)</td></tr>
<tr><td>Roaming fallback</td><td>Telstra</td></tr>
<tr><td>SIM type</td><td>Data-only IoT SIM (no voice or SMS)</td></tr>
<tr><td>APN</td><td>Pre-configured — do not change</td></tr>
<tr><td>Monthly data included</td><td>1 GB (sufficient for standard deployments)</td></tr>
</tbody>
</table>
<blockquote><p>Do not attempt to use a third-party SIM in a PestSense gateway without contacting support first. The platform configuration is tied to the ICCID (SIM serial number) of the provisioned SIM.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-gw-2-3', moduleId: gatewayMod2.id,
      title: 'Understanding Signal Reach', slug: 'r3000-lg-signal-reach',
      summary: 'How far LoRaWAN actually reaches, what kills it, and how to predict coverage before you install.',
      content: `<h2>Understanding LoRaWAN Signal Reach</h2>
<p>One of the most common installation questions is: "Will the gateway reach that device?" LoRaWAN is designed for long-range, low-power communication — but "long range" is highly dependent on what is between the gateway and device.</p>

<h3>What range can I expect?</h3>
<table>
<thead><tr><th>Environment</th><th>Typical range</th></tr></thead>
<tbody>
<tr><td>Open outdoor (no obstacles)</td><td>Up to 5–10 km</td></tr>
<tr><td>Suburban outdoor (houses, trees)</td><td>1–3 km</td></tr>
<tr><td>Light industrial indoor (warehouse, factory)</td><td>200–500 m</td></tr>
<tr><td>Commercial building with concrete floors</td><td>50–200 m per floor</td></tr>
<tr><td>Dense construction (hospital, carpark)</td><td>20–80 m</td></tr>
</tbody>
</table>
<p>For most pest control sites — food processing facilities, warehouses, commercial kitchens, offices — a well-placed single gateway will cover the entire site with room to spare.</p>

<h3>How obstacles affect signal (915 MHz)</h3>
<p>Every wall, floor, or object between a device and the gateway reduces signal strength. Here is a practical guide to how much each material reduces signal:</p>
<table>
<thead><tr><th>Obstacle</th><th>Signal loss</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Open air / glass window</td><td>2 dB</td><td>Negligible effect</td></tr>
<tr><td>Wooden stud wall / plasterboard</td><td>4 dB</td><td>Minor — most signals pass through easily</td></tr>
<tr><td>Single brick wall</td><td>10–12 dB</td><td>Moderate — you can still expect 200m+ range through several</td></tr>
<tr><td>Double brick / dense blockwork</td><td>14–16 dB</td><td>Significant — plan gateway placement more carefully</td></tr>
<tr><td>Concrete floor/ceiling</td><td>15–18 dB</td><td>Each concrete floor you cross costs heavily</td></tr>
<tr><td>Reinforced concrete wall</td><td>18–22 dB</td><td>Major — 2–3 of these will push a device near range limit</td></tr>
<tr><td>Steel shelving / metal rack</td><td>20–28 dB</td><td>Very damaging — a row of metal racking between device and gateway is a common failure cause in warehouses</td></tr>
<tr><td>Metal door or wall panel</td><td>25–30 dB</td><td>Near-total blockage — avoid</td></tr>
<tr><td>Dense vegetation / trees</td><td>8–12 dB</td><td>Relevant for outdoor deployments</td></tr>
</tbody>
</table>

<h3>The total budget: 155 dB</h3>
<p>The R3000-LG gateway with PestSense Predictor devices has a total <strong>link budget of approximately 155 dB</strong>. Think of this like a bank balance — every metre of distance and every obstacle costs from this balance. As long as your total cost is under 155 dB, the connection will work.</p>
<p>In practice, you want at least 20 dB of spare margin ("headroom") to account for minor variations in signal. So your working budget for obstacles + distance is about 135 dB.</p>

<blockquote><p>Use the <strong>Signal Simulator</strong> tool in PestSense Academy to map a site layout with walls and obstacles before you install. It does the maths for you and gives a plain-language signal quality result for each device location.</p></blockquote>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-gw-2-4', moduleId: gatewayMod2.id,
      title: 'Mounting and Final Installation Checklist', slug: 'r3000-lg-installation-checklist',
      summary: 'A step-by-step installation checklist for the R3000-LG, from unboxing to confirming devices are online.',
      content: `<h2>R3000-LG Installation Checklist</h2>
<p>Use this checklist for every new gateway installation. It takes 20–40 minutes for a typical site.</p>

<h3>Pre-installation — at the office / before site visit</h3>
<ul>
<li>Confirm gateway has been provisioned in PestSense OneCloud for this site</li>
<li>Check 4G coverage at the site address — Optus coverage map + Telstra as fallback</li>
<li>Confirm devices are commissioned in the platform and assigned to this site</li>
<li>Bring: gateway, antennas, power adaptor, drill + M4 rawl plugs, ethernet cable (optional)</li>
</ul>

<h3>On site — pre-mount</h3>
<ul>
<li>Identify the preferred mounting location: high, central, near power point</li>
<li>Walk the site and identify any large metal obstacles between the planned gateway location and device zones</li>
<li>Check 4G signal at mounting height with your phone on Optus — at least 2 bars for reliable operation</li>
<li>If signal is poor, identify an alternative location or plan for external LTE antenna</li>
</ul>

<h3>Physical installation</h3>
<ol>
<li>Attach wall-mount bracket to wall — use 4 × M4 rawl plug + screw into masonry, or direct into timber stud</li>
<li>Clip unit onto bracket</li>
<li>Attach LoRa antenna to the LORA SMA port — hand tight, then quarter turn</li>
<li>Attach LTE antenna to the LTE SMA port — same method</li>
<li><strong>Never power on without both antennas attached</strong> — operating without a LoRa antenna can damage the concentrator</li>
<li>Connect ethernet cable if available</li>
<li>Connect DC power adaptor — route cable tidily to power outlet</li>
</ol>

<h3>Power-on and commissioning</h3>
<ol>
<li>Switch on power — PWR LED should turn solid green within 5 seconds</li>
<li>Wait 2–3 minutes for 4G registration — NET LED should turn solid green</li>
<li>Open PestSense OneCloud on your phone — confirm the gateway shows as Online</li>
<li>Walk to a device location and trigger a test transmission (hold device button or wait for next scheduled check-in)</li>
<li>Confirm the ACT LED on the gateway flashes blue when the device transmits</li>
<li>Confirm the device appears as Online in the platform</li>
</ol>

<h3>Sign-off</h3>
<ul>
<li>Photograph the installed gateway (mounting location, LEDs showing green)</li>
<li>Note the gateway MAC address / serial number in your site paperwork</li>
<li>Confirm all target devices are showing Online in the platform before leaving site</li>
<li>Brief the site contact on the LED indicators and what "normal" looks like</li>
</ul>
<blockquote><p>Leave a laminated copy of the LED guide (from Module 1: Field Troubleshooting) near the gateway for site staff reference.</p></blockquote>`,
      sortOrder: 4, status: 'PUBLISHED', version: '1.0',
    },
  ]

  const techMod1 = await prisma.module.upsert({
    where: { id: 'mod-tech-1' }, update: {},
    create: { id: 'mod-tech-1', courseId: techStartCourse.id, title: 'Module 1: Your First Login', sortOrder: 1, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-tech-1-1', moduleId: techMod1.id,
      title: 'Logging In for the First Time', slug: 'logging-in-first-time',
      summary: 'Current first-access steps for PestSense, including the live login URL and the difference between sign-in and self-registration.',
      content: `<h2>Accessing PestSense for the First Time</h2>
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
<blockquote><p>Bookmark <code>https://app.pestsense.com</code> once you know you are using the correct environment.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '2.0',
    },
    {
      id: 'lesson-tech-1-2', moduleId: techMod1.id,
      title: 'First Login and Quickstart', slug: 'navigating-the-dashboard',
      summary: 'What to expect on first sign-in, including the QUICKSTART / Test Site Mode flow used to create a safe practice site.',
      content: `<h2>What You See After Your First Login</h2>
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
<blockquote><p>If you are teaching this live, pause after the wizard finishes and point out the left-hand hierarchy cards before clicking deeper into the map.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '2.1',
    }
  )

  const techMod2 = await prisma.module.upsert({
    where: { id: 'mod-tech-2' }, update: {},
    create: { id: 'mod-tech-2', courseId: techStartCourse.id, title: 'Module 2: Sites and Devices', sortOrder: 2, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-tech-2-1', moduleId: techMod2.id,
      title: 'Finding a Site and Navigating the Hierarchy', slug: 'finding-a-site',
      summary: 'How to use Screens, the left-hand cards, and the map hierarchy to move from branch level down to site and zone views.',
      content: `<h2>Working in the OneCloud Screens View</h2>
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
<blockquote><p>If you lose track of where you are, look at the breadcrumb trail and the selected card on the left before clicking deeper.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '2.1',
    },
    {
      id: 'lesson-tech-2-2', moduleId: techMod2.id,
      title: 'Understanding Device Status and Alerts', slug: 'understanding-alerts',
      summary: 'How to read site counters, device cards, and the current action controls in the Screens view.',
      content: `<h2>Reading Status in Screens</h2>
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
<p>Always confirm the selected branch, customer, site, zone, and device before recording work. The current UI lets you move quickly, so it is easy to be in the wrong part of the hierarchy if you click too fast.</p>`,
      sortOrder: 2, status: 'PUBLISHED', version: '2.0',
    }
  )

  const adminMod1 = await prisma.module.upsert({
    where: { id: 'mod-admin-1' }, update: {},
    create: { id: 'mod-admin-1', courseId: adminPlatformCourse.id, title: 'Module 1: Account Access and First Setup', sortOrder: 1, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-admin-1-1', moduleId: adminMod1.id,
      title: 'Register and Confirm a New Account', slug: 'register-and-confirm-account',
      summary: 'How to create a new PestSense account from the live login page and confirm it by email.',
      content: `<h2>Create a New Account</h2>
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
</ul>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.1',
    },
    {
      id: 'lesson-admin-1-2', moduleId: adminMod1.id,
      title: 'Create a Test Site with Quickstart', slug: 'create-test-site-with-quickstart',
      summary: 'Use the first-login Quickstart flow to create a safe practice branch, customer, site, and first zone.',
      content: `<h2>Create a Test Site</h2>
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
<blockquote><p>This is a good way to create a safe training environment before touching a live customer setup.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.1',
    }
  )

  const adminMod2 = await prisma.module.upsert({
    where: { id: 'mod-admin-2' }, update: {},
    create: { id: 'mod-admin-2', courseId: adminPlatformCourse.id, title: 'Module 2: Products and Team Setup', sortOrder: 2, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-admin-2-1', moduleId: adminMod2.id,
      title: 'Add a Product and Assign Company Products', slug: 'add-and-assign-company-products',
      summary: 'Create a product record in App Settings and move it into the company product list.',
      content: `<h2>Manage Products</h2>
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
<blockquote><p>Once the product appears in <strong>Company Products</strong>, it is available in your company list for setup and servicing workflows.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '2.0', videoUrl: '/course-guides/product/add-product-guided-demo.mp4', videoProvider: 'local',
    },
    {
      id: 'lesson-admin-2-2', moduleId: adminMod2.id,
      title: 'Create a User and Review Access Options', slug: 'create-user-and-review-access',
      summary: 'Use Manage Users to create a new user, assign access, and decide whether to send an invite or force a password reset.',
      content: `<h2>Create a User</h2>
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
</ul>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.1',
    }
  )

  const signalMod1 = await prisma.module.upsert({
    where: { id: 'mod-signal-1' }, update: {},
    create: { id: 'mod-signal-1', courseId: signalCourse.id, title: 'Module 1: How the Network Works', sortOrder: 1, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-signal-1-1', moduleId: signalMod1.id,
      title: 'What is LoRaWAN? (Plain Language)', slug: 'what-is-lorawan',
      summary: 'A jargon-free explanation of LoRaWAN and why PestSense uses it.',
      content: '<h2>LoRaWAN in Plain English</h2><p>LoRaWAN is a type of wireless communication designed for low-power sensors that need to send small amounts of data over long distances.</p><h3>How It Connects</h3><ol><li>A <strong>device</strong> detects something and sends a tiny signal</li><li>The <strong>gateway</strong> picks up that signal</li><li>The gateway sends it over the internet to the <strong>PestSense cloud</strong></li><li>You see it on your <strong>dashboard</strong></li></ol>',
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-signal-1-2', moduleId: signalMod1.id,
      title: 'What Affects Signal', slug: 'what-affects-signal',
      summary: 'The real-world factors that affect how well devices communicate.',
      content: '<h2>What Affects Signal Quality</h2><h3>Things that HELP signal:</h3><ul><li>Gateway placed high up (2–5m or above)</li><li>Gateway in a central, open location</li><li>Clear line of sight between device and gateway</li></ul><h3>Things that HURT signal:</h3><ul><li>Thick concrete or stone walls</li><li>Metal shelving or walls between device and gateway</li><li>Underground or sub-basement placement</li></ul>',
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  const salesMod1 = await prisma.module.upsert({
    where: { id: 'mod-sales-1' }, update: {},
    create: { id: 'mod-sales-1', courseId: salesCourse.id, title: 'Module 1: Identifying the Right Customer', sortOrder: 1, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-sales-1-1', moduleId: salesMod1.id,
      title: 'Identifying Good-Fit Customers', slug: 'identifying-good-fit-customers',
      summary: 'The customer profile that gets the most value from PestSense.',
      content: '<h2>Who Benefits Most from PestSense?</h2><h3>Strong indicators of a good fit:</h3><ul><li><strong>Multiple sites</strong> — More devices = more value from remote monitoring</li><li><strong>Compliance-driven industries</strong> — Food manufacturing, hospitality, healthcare, aged care</li><li><strong>Sites that are hard to access regularly</strong> — Remote locations, 24/7 operations</li><li><strong>Current manual reporting pain</strong> — If they are spending hours generating reports</li></ul>',
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sales-1-2', moduleId: salesMod1.id,
      title: 'How to Explain Value', slug: 'how-to-explain-value',
      summary: 'Plain-language talking points for explaining what PestSense does.',
      content: '<h2>Explaining PestSense Value to Customers</h2><h3>Core value messages:</h3><ul><li><strong>"You will know what is happening between visits"</strong> — Real-time alerts mean you catch activity as it happens.</li><li><strong>"Less paper, less chasing"</strong> — Digital reporting means automatic records of every device check-in.</li><li><strong>"Prove your service is working"</strong> — Give your clients a portal login so they can see the data themselves.</li><li><strong>"Fewer unnecessary callouts"</strong> — Focus visits on devices that have activity.</li></ul>',
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  const device1Mod1 = await prisma.module.upsert({
    where: { id: 'mod-dev1-1' }, update: {},
    create: { id: 'mod-dev1-1', courseId: device1Course.id, title: 'Module 1: Getting to Know Device 1', sortOrder: 1, status: 'PUBLISHED' },
  })

  lessons.push(
    {
      id: 'lesson-dev1-1-1', moduleId: device1Mod1.id,
      title: 'Device 1 Overview', slug: 'device-1-overview',
      summary: 'What Device 1 is, what it detects, and where it is typically deployed.',
      content: '<h2>Device 1 Overview</h2><p>Device 1 is a compact LoRaWAN sensor designed for pest monitoring applications.</p><h3>Key specifications:</h3><ul><li>Battery-powered (standard AA batteries, 12–18 months typical life)</li><li>LoRaWAN Class A communication</li><li>IP65 rated — suitable for damp environments</li></ul>',
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-dev1-1-2', moduleId: device1Mod1.id,
      title: 'Device 1 Installation', slug: 'device-1-installation',
      summary: 'Step-by-step installation guide — from unboxing to confirmed online status.',
      content: '<h2>Installing Device 1</h2><ol><li>Choose your placement location.</li><li>Mount the bracket first.</li><li>Insert batteries into the device. The LED will flash briefly to confirm power.</li><li>Clip the device onto the bracket.</li><li>Open PestSense and navigate to the site → Add Device → Scan QR code.</li><li>The platform will confirm the device has checked in (this may take 2–5 minutes).</li></ol>',
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  const managerMod1 = await prisma.module.upsert({
    where: { id: 'mod-mgr-1' }, update: {},
    create: { id: 'mod-mgr-1', courseId: managerBasicsCourse.id, title: 'Module 1: Site-Level Oversight', sortOrder: 1, status: 'PUBLISHED' },
  })

  lessons.push({
    id: 'lesson-mgr-1-1', moduleId: managerMod1.id,
    title: 'Reviewing Site Activity', slug: 'reviewing-site-activity',
    summary: 'How to get a clear picture of what is happening across your sites.',
    content: '<h2>Reviewing Site Activity</h2><p>As a site manager, you have visibility across all devices at your assigned sites.</p><h3>Your site overview panel shows:</h3><ul><li>Total devices and status breakdown (online / offline / in-alert)</li><li>Unresolved alerts requiring attention</li><li>Last service visit date and technician name</li></ul>',
    sortOrder: 1, status: 'PUBLISHED', version: '1.0',
  })

  // === SALES COURSE MODULES AND LESSONS ===

  // Course 1: What Digital Is Really Selling
  const modSC1_1 = await prisma.module.upsert({
    where: { id: 'mod-sc1-1' }, update: {},
    create: { id: 'mod-sc1-1', courseId: salesC1.id, title: 'Module 1: The Mindset Shift', sortOrder: 1, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc1-1-1', moduleId: modSC1_1.id,
      title: "You're Not Selling Hardware", slug: 'not-selling-hardware',
      summary: 'Why leading with features kills deals — and how to shift the conversation to outcomes instead.',
      content: `<h2>You're Not Selling Hardware</h2><p>When a sales conversation opens with "our stations use LoRaWAN technology with bait weighing and motion sensors" — you've already lost the customer's attention. They don't care about the technology. They care about what it solves for their business.</p><h3>The Features vs Outcomes Gap</h3><p>Most pest control salespeople default to leading with product features. It's a natural instinct — you're proud of the technology. But customers hear features as complexity and cost, not value.</p><p>The shift is simple: <strong>every feature is only worth mentioning because of what it delivers</strong>. Features are the mechanism. Outcomes are the sale.</p><h3>What Customers Are Actually Worried About</h3><ul><li>Will pests damage my stock, shut down my operation, or fail my next audit?</li><li>Am I paying for pest control that I can't actually verify is working?</li><li>What's happening between visits — is anything keeping pests at bay?</li><li>How do I prove to an auditor that we're compliant?</li></ul><h3>The "Which Means" Rule</h3><p>Every time you mention a feature, immediately follow it with <strong>"which means..."</strong> and finish the sentence with a customer outcome.</p><table><thead><tr><th>Feature</th><th>Which means...</th></tr></thead><tbody><tr><td>24/7 bait weight monitoring</td><td>You know the moment a station is being hit — so your team responds the same day, not next month</td></tr><tr><td>OneCloud customer portal</td><td>Your customer can log in and see their site is protected right now — no more "trust me"</td></tr><tr><td>Automated site visit reports</td><td>Every audit is covered with photo evidence, timestamps, and technician notes — generated automatically</td></tr><tr><td>AI-powered detection rules</td><td>Your team only gets called when there's a real problem — false alarms are filtered out automatically</td></tr></tbody></table><blockquote><p><strong>The rule:</strong> Lead with the problem, not the product. Let the customer feel the pain first, then offer the solution.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc1-1-2', moduleId: modSC1_1.id,
      title: 'The 4 Outcomes Customers Buy', slug: 'four-outcomes-customers-buy',
      summary: 'The four core business outcomes that digital pest control delivers — and how to use them in every conversation.',
      content: `<h2>The 4 Outcomes Customers Actually Buy</h2><p>PestSense delivers four core outcomes. Build every sales conversation around these. Every feature, every product spec, every case study maps back to one of these four.</p><h3>1. Continuous Protection</h3><p>Traditional pest control leaves gaps between visits — problems can grow for weeks unnoticed. PestSense monitors 24/7.</p><ul><li>Round-the-clock site monitoring, even outside business hours</li><li>Early detection prevents minor issues from becoming infestations</li><li>No more scheduled surprises — problems detected instantly, not discovered at the next visit</li></ul><p><em>Ideal for: food facilities, hospitals, data centres — high-risk environments where constant vigilance is critical.</em></p><h3>2. Faster Response</h3><p>When something is detected, you know immediately — and you arrive at the site prepared to fix it.</p><ul><li>Alerts trigger the moment activity is detected</li><li>Technicians arrive knowing the exact station, activity type, and what tools they need</li><li>No time wasted opening untouched stations</li></ul><p><em>Case study: The Retail Rescue — digital monitoring pinpointed nest locations within 48 hours. Targeted control cleared the infestation in one week and the store reopened.</em></p><h3>3. Audit-Ready Compliance</h3><p>Auditors love digital. Every event is logged automatically with timestamps, photos, and technician notes.</p><ul><li>Replaces missing paperwork and handwritten notes with organised digital records</li><li>Trend data shows control is working over time</li><li>One-click PDF reports ready for any audit, any time</li></ul><p><em>Crucial for: HACCP-certified facilities, food factories, aged care, hospitality.</em></p><h3>4. Full Visibility</h3><p>Customers can see what's happening at their site without waiting for your next visit report.</p><ul><li>Customer portal access via OneCloud — live site status, maps, activity trends</li><li>Complete transparency builds trust and dramatically reduces customer churn</li><li>Easily report pest status to management or auditors at any time</li></ul><p><em>Ideal for: corporate offices, hotels, food processing plants, logistics companies.</em></p>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc1-1-3', moduleId: modSC1_1.id,
      title: 'How Digital Pest Control Became a Business Sale', slug: 'digital-became-business-sale',
      summary: 'Understanding the market shift — and why the traditional sales approach no longer works.',
      content: `<h2>How Digital Pest Control Became a Business Sale</h2><p>A decade ago, selling pest control was simple: visit frequency, chemical types, and price. Today, the conversation is completely different. Digital pest control is a business technology sale — and that requires a different approach.</p><h3>What Changed</h3><ul><li><strong>Compliance requirements went up.</strong> Food safety standards, HACCP audits, and regulatory reporting now require documentation that traditional services can't provide efficiently.</li><li><strong>Customers got more sophisticated.</strong> Decision-makers expect data, transparency, and digital reporting from all their service providers — not just pest control.</li><li><strong>The cost of failure went up.</strong> A pest incident at a food factory, hotel, or aged care facility is no longer just a pest problem — it's a media story, a regulatory investigation, and a potential shutdown.</li></ul><h3>The Old Conversation vs The New Conversation</h3><table><thead><tr><th>Old Conversation</th><th>New Conversation</th></tr></thead><tbody><tr><td>"How often do you want us to visit?"</td><td>"What are the consequences if pests get out of control here?"</td></tr><tr><td>"We use the best bait products."</td><td>"We give you real-time data so you can see it working."</td></tr><tr><td>"Our technicians are certified."</td><td>"Your auditors will have everything they need, automatically."</td></tr><tr><td>"We're cheaper than the other quote."</td><td>"Here's what a pest incident would cost your business."</td></tr></tbody></table><h3>Digital is the Premium Service</h3><p>PestSense is the premium pest control offer. Don't apologise for the price — position it correctly. Digital pest control is the gold standard. The customer is buying better risk management, not just more expensive stations.</p><blockquote><p><strong>Key message:</strong> "We're not the cheapest option. But we're the one that protects your business — not just your premises."</p></blockquote>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Course 2: Identifying the Right Customers
  const modSC2_1 = await prisma.module.upsert({
    where: { id: 'mod-sc2-1' }, update: {},
    create: { id: 'mod-sc2-1', courseId: salesC2.id, title: 'Module 1: Customer Segments', sortOrder: 1, status: 'PUBLISHED' },
  })
  const modSC2_2 = await prisma.module.upsert({
    where: { id: 'mod-sc2-2' }, update: {},
    create: { id: 'mod-sc2-2', courseId: salesC2.id, title: 'Module 2: Qualifying Your Opportunity', sortOrder: 2, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc2-1-1', moduleId: modSC2_1.id,
      title: 'The 4 Key Industry Segments', slug: 'four-key-industry-segments',
      summary: 'The four types of businesses that get the most value from digital pest control — and why each one cares.',
      content: `<h2>The 4 Key Industry Segments</h2><p>Not every business needs digital pest control — but four segments have near-universal need for it. Learning to identify these customers on sight saves you weeks of wasted effort.</p><h3>Segment 1: Food &amp; Compliance Sites</h3><p><strong>Who:</strong> Food factories, HACCP-certified facilities, food distribution centres, supermarkets</p><p><strong>Why they care:</strong> Zero pest tolerance, mandatory audit documentation, brand protection, product contamination risk</p><p><strong>Your opener:</strong> "What do your auditors ask to see about your pest management program?"</p><h3>Segment 2: Sensitive Public Places</h3><p><strong>Who:</strong> Hospitals, aged care facilities, schools, hotels</p><p><strong>Why they care:</strong> Protecting vulnerable populations, maintaining reputation, safety and regulatory compliance. Toxic bait products near patients or children is a liability. Disruption from regular service visits is a problem.</p><p><strong>Your opener:</strong> "What would happen to your reputation if a guest or patient encountered a pest problem?"</p><h3>Segment 3: High-Value Assets &amp; Multi-Site Operations</h3><p><strong>Who:</strong> Data centres, museums, large warehouses, national retail chains</p><p><strong>Why they care:</strong> Pest damage can cause downtime, fire risk (rodents chew cables), and significant financial loss across multiple sites. They need consistent service and consolidated reporting across all locations.</p><p><strong>Your opener:</strong> "How do you currently get visibility across all your sites from one place?"</p><h3>Segment 4: Hard-to-Service Sites</h3><p><strong>Who:</strong> Remote locations, extreme temperature rooms, crawl spaces, restricted-access areas</p><p><strong>Why they care:</strong> High service cost, safety risk for technicians, difficulty proving compliance in inaccessible areas. Digital reduces visit frequency without reducing protection.</p><p><strong>Your opener:</strong> "Are there any areas on your site that are difficult or expensive for us to access regularly?"</p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc2-1-2', moduleId: modSC2_1.id,
      title: 'Who to Walk Away From', slug: 'who-to-walk-away-from',
      summary: 'The customer profiles that are unlikely to convert — and why pushing them costs you more than walking away.',
      content: `<h2>Who to Walk Away From</h2><p>Equally important as knowing who to target is knowing who to avoid. Wasting time on wrong-fit customers takes you away from the right ones.</p><h3>Signs of a Poor Fit</h3><ul><li><strong>Price-only decision-making.</strong> If the first question is "what's your price?" and they compare solely on cost, they are not buying value. Digital pest control needs a value-oriented buyer.</li><li><strong>No compliance requirements.</strong> If the site has zero regulatory oversight and no consequences for a pest incident, digital is hard to justify.</li><li><strong>Single small premises with easy access.</strong> A one-room shop with no hard-to-reach areas and monthly visits that work fine — digital adds cost without proportionate benefit.</li><li><strong>Unwilling to sign a minimum term.</strong> The economics of digital pest control require a multi-year commitment. A customer unwilling to commit to 12+ months is not a digital customer.</li><li><strong>No interest in data or reporting.</strong> If the customer doesn't care about reports, trend data, or audit documentation, you're selling the wrong product to the wrong person.</li></ul><h3>The Right Way to Exit</h3><p>Don't just disappear. Offer them a traditional service quote if appropriate — and keep the door open. Some businesses that aren't ready for digital today may be forced there by a regulatory change or a pest incident. Stay in touch.</p><blockquote><p><strong>Remember:</strong> A wrong-fit customer who signs will cost you far more in support, complaints, and churn than the customer you never signed at all.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc2-2-1', moduleId: modSC2_2.id,
      title: 'Qualifying Questions That Open Up Conversations', slug: 'qualifying-questions',
      summary: 'The questions that reveal whether a prospect is a serious digital opportunity — and how to use the answers.',
      content: `<h2>Qualifying Questions That Open Up Conversations</h2><p>Good qualifying questions do two things at once: they reveal whether the customer is a real opportunity, and they make the customer think about problems they hadn't fully considered yet.</p><h3>The Discovery Checklist</h3><p>Use these questions in your first meeting. Pick the 3–4 most relevant to the customer's industry.</p><table><thead><tr><th>Area</th><th>Question</th></tr></thead><tbody><tr><td>Contracts</td><td>"When does your current pest contract renew? Would you consider a change for the better?"</td></tr><tr><td>Satisfaction</td><td>"Are you happy with the existing service? What could be improved?"</td></tr><tr><td>Pest Impact</td><td>"What are the consequences if pests get out of control at your site?"</td></tr><tr><td>Auditing</td><td>"What do your auditors look for? Are they happy with your current reports — can you show trends?"</td></tr><tr><td>Regulations</td><td>"What challenges do you face in meeting your regulatory requirements?"</td></tr><tr><td>Site Access</td><td>"Do you have any hard-to-access areas or sensitive spaces with special needs?"</td></tr><tr><td>Digital Awareness</td><td>"Have service providers ever used digital pest control with you before?"</td></tr><tr><td>Business Changes</td><td>"Have you recently changed premises, opened new locations, or expanded your compliance obligations?"</td></tr></tbody></table><h3>What to Listen For</h3><ul><li><strong>Green flags:</strong> Upcoming contract renewal, recent compliance failure or near-miss, audit pressure, multi-site expansion, unhappy with current provider</li><li><strong>Yellow flags:</strong> Happy with current service but open to improvement — use ROI and differentiation</li><li><strong>Red flags:</strong> Pure price focus, no compliance requirements, single low-risk site</li></ul><blockquote><p>The best qualifying question: <strong>"What would it cost your business if pests became a serious problem here?"</strong> If they can give you a real answer, you have a motivated buyer.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc2-2-2', moduleId: modSC2_2.id,
      title: 'Small, Medium and Large Account Strategies', slug: 'account-size-strategies',
      summary: "How your approach changes depending on the size and complexity of the business you're selling to.",
      content: `<h2>Account Size Strategies</h2><p>Digital pest control works across a wide range of business sizes, but your sales approach should change dramatically depending on who you're talking to.</p><h3>Small Operators (1–5 Sites)</h3><p><strong>Key concern:</strong> Cost. Every dollar matters. Make the ROI tangible and personal.</p><ul><li>Lead with a specific risk scenario relevant to their business type</li><li>Offer the bundled model — lower upfront cost, predictable monthly fee</li><li>Keep the pitch short — focus on 1–2 outcomes, not the full feature set</li><li>Offer a small trial or staged rollout</li></ul><h3>Medium Operators (5–15 Sites)</h3><p><strong>Key concern:</strong> Consistency and visibility across sites. They're managing multiple locations and need consolidated reporting.</p><ul><li>Lead with the multi-site dashboard and consolidated reporting angle</li><li>Show how OneCloud gives them a live view across all locations from one screen</li><li>Position audit-ready reporting as a major operational efficiency gain</li><li>Start with their highest-risk or most compliance-sensitive site as a pilot</li></ul><h3>Large Operators (15+ Sites)</h3><p><strong>Key concern:</strong> Standardisation, procurement process, and measurable ROI across their estate.</p><ul><li>Engage both operations (who care about service quality) and procurement (who care about cost and compliance)</li><li>Prepare a formal business case — use the Proposal Summary Generator in the Sales Hub</li><li>Focus on risk quantification: what does a pest incident cost across their entire estate?</li><li>Be prepared for a longer sales cycle — involve your PestSense partner manager early</li></ul>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Course 3: Building the Business Case
  const modSC3_1 = await prisma.module.upsert({
    where: { id: 'mod-sc3-1' }, update: {},
    create: { id: 'mod-sc3-1', courseId: salesC3.id, title: 'Module 1: From Features to Financial Arguments', sortOrder: 1, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc3-1-1', moduleId: modSC3_1.id,
      title: 'Translating Technology into Business Value', slug: 'translating-tech-to-business-value',
      summary: 'How to convert product specifications into the financial and operational arguments that decision-makers respond to.',
      content: `<h2>Translating Technology into Business Value</h2><p>Decision-makers don't approve budgets based on product specs. They approve budgets based on business outcomes. Your job is to be the translator.</p><h3>The Three Layers of Value</h3><p>PestSense delivers value at three levels. Most salespeople only talk about the first one.</p><table><thead><tr><th>Level</th><th>Example</th><th>Strength</th></tr></thead><tbody><tr><td>Functional value</td><td>"Our devices monitor 24/7 without you visiting"</td><td>Low — easy to dismiss</td></tr><tr><td>Operational value</td><td>"Your technicians skip untouched stations and only service active ones — saving 2+ hours per site visit"</td><td>Medium — tangible but indirect</td></tr><tr><td>Financial/risk value</td><td>"If a pest incident causes a 1-day closure at your facility, that's $15,000 in lost revenue. Digital costs $X/month to prevent that."</td><td>High — directly comparable to cost</td></tr></tbody></table><h3>The Three Questions That Build the Case</h3><ol><li><strong>"What happens if pests get out of control here?"</strong> — Force the customer to articulate their risk: stock damage, site closure, failed audit, reputational damage, product recall.</li><li><strong>"How often does that kind of incident happen in your industry?"</strong> — Help them understand frequency. It doesn't need to happen to them — it needs to happen to businesses like them.</li><li><strong>"How does that compare to the cost of digital monitoring?"</strong> — Now the math is obvious. The customer is comparing $150/month vs the risk of a $50,000 incident.</li></ol><h3>The Sustainability Angle</h3><p>For customers with ESG or sustainability goals: PestSense uses targeted baiting based on actual data. Case study: A major egg producer reduced rodenticide use by 80% — from 16kg per service down to targeted application only where activity was confirmed. This is a powerful additional value point for environmentally-conscious businesses.</p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc3-1-2', moduleId: modSC3_1.id,
      title: 'The Stock-Loss Conversation', slug: 'stock-loss-conversation',
      summary: "How to help customers quantify the real financial risk of a pest incident — before they've had one.",
      content: `<h2>The Stock-Loss Conversation</h2><p>One of the most powerful things you can do in a sales conversation is help a customer quantify what a pest incident would actually cost them. Most customers have never done this calculation — and the number is usually much bigger than they expect.</p><h3>The Risk Components</h3><p>A pest incident for most businesses involves some combination of:</p><ul><li><strong>Direct stock damage or loss</strong> — Contaminated product must be destroyed</li><li><strong>Remediation costs</strong> — Deep cleaning, emergency treatments, structural repairs</li><li><strong>Operational downtime</strong> — Site closure during treatment</li><li><strong>Regulatory penalties</strong> — Fines, licence suspension, audit failure</li><li><strong>Reputational damage</strong> — Customer loss, media coverage, review impact</li><li><strong>Emergency callout costs</strong> — Premium-rate reactive service</li></ul><h3>How to Run the Conversation</h3><ol><li>"What would a single pest incident look like for your business?" <em>(Let them describe it)</em></li><li>"If you had to close for even one day, what would that cost in lost production or sales?" <em>(Get a number)</em></li><li>"How many incidents have you had in the last 3 years — or how many have you heard about in your industry?" <em>(Establish probability)</em></li><li>"So if there's even a 1-in-3 chance of an incident over the next 3 years, you're looking at [risk exposure] vs [PestSense cost] — does that math make sense to you?"</li></ol><h3>The Break-Even Benchmark</h3><p>Reference: if 1 in every 3 similar businesses had to close for just 1 day over 3 years, incurring $6,000 in losses — the expected value of that risk over a 3-year contract exceeds the cost of a standard PestSense installation. Use the Risk Impact Tool in the Sales Hub to run these numbers live with a customer.</p><blockquote><p>"Cheap pest control is expensive when pests take hold." — PestSense</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc3-1-3', moduleId: modSC3_1.id,
      title: 'Using the Calculators in Your Sales Process', slug: 'using-calculators-in-sales',
      summary: 'How to use the four Sales Hub tools to build and present a compelling, data-driven business case.',
      content: `<h2>Using the Calculators in Your Sales Process</h2><p>The Sales Hub includes four interactive tools that turn your conversation into a structured, shareable business case. Here's how and when to use each one.</p><h3>1. Customer Fit Calculator</h3><p><strong>When:</strong> Early in the sales process, before you've invested significant time</p><p><strong>What it does:</strong> Scores a prospect across industry type, compliance requirements, site characteristics, and pest risk — gives you a Fit Score and recommendation.</p><p><strong>How to use it:</strong> Run it yourself between calls, or walk through it on screen during a discovery conversation. It demonstrates that you're using a structured approach, not guessing.</p><h3>2. Business Model A/B Calculator</h3><p><strong>When:</strong> When a customer is comparing their current traditional service to digital</p><p><strong>What it does:</strong> Compares the total cost of traditional service (visits × cost per visit + reactive callout costs) vs PestSense digital (device cost + connection fee + reduced visit frequency) over 3 years.</p><p><strong>How to use it:</strong> Run it live with the customer's own numbers. The break-even point is usually within 12–18 months.</p><h3>3. Stock-Loss / Risk Impact Tool</h3><p><strong>When:</strong> With food, compliance, or high-value asset customers</p><p><strong>What it does:</strong> Quantifies the expected financial risk of a pest incident based on business type, revenue, and incident probability. Compares risk exposure to PestSense cost.</p><h3>4. Proposal Summary Generator</h3><p><strong>When:</strong> After scoping is complete, before submitting the formal proposal</p><p><strong>What it does:</strong> Takes the customer name, site count, device count, and offer type (upfront vs bundled) and generates a formatted pricing summary.</p><p><strong>Note:</strong> Always submit to sales@pestsense.com for review and approval before presenting to a customer.</p>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Course 4: Changing the Service Model
  const modSC4_1 = await prisma.module.upsert({
    where: { id: 'mod-sc4-1' }, update: {},
    create: { id: 'mod-sc4-1', courseId: salesC4.id, title: 'Module 1: The Digital Service Model', sortOrder: 1, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc4-1-1', moduleId: modSC4_1.id,
      title: 'What Changes When You Go Digital', slug: 'what-changes-going-digital',
      summary: 'A clear comparison of how the pest control service model shifts from traditional to digital — and what that means for your team.',
      content: `<h2>What Changes When You Go Digital</h2><p>Moving to digital pest control isn't just about adding sensors. It fundamentally changes how you deliver, price, and demonstrate value in your service.</p><h3>Traditional vs Digital: The Core Differences</h3><table><thead><tr><th>Traditional</th><th>Digital</th></tr></thead><tbody><tr><td>Regular site visits required — problems grow between visits</td><td>Continuous 24/7 monitoring — site visits triggered by actual need</td></tr><tr><td>Limited evidence: technician experience determines actions</td><td>Real-time data guides remedial actions for more effective control</td></tr><tr><td>Site time wasted checking untouched stations</td><td>Go directly to active stations — more time for proofing and customer engagement</td></tr><tr><td>Reports manually prepared from incomplete data</td><td>Comprehensive digital reports always available, based on accurate data</td></tr><tr><td>Customer has no visibility between visits</td><td>Customer has real-time access to their site status via OneCloud portal</td></tr></tbody></table><h3>How Your Team's Role Changes</h3><p>Digital doesn't eliminate the technician — it makes them more effective:</p><ul><li><strong>Before digital:</strong> Arrive at site, open every station, check for activity, record findings, leave.</li><li><strong>After digital:</strong> Review alert data before arriving. Skip untouched stations. Go directly to active areas. Arrive prepared with the right control method. Spend more time on proofing and customer relationship.</li></ul><h3>The Monitor → Detect → Profile → Control Cycle</h3><ol><li><strong>Monitor:</strong> Deploy stations with non-toxic bait for ongoing activity data collection</li><li><strong>Detect:</strong> Get instant alerts for early and more effective action</li><li><strong>Profile:</strong> Build a picture of where and what the problem is — prepare a targeted control strategy</li><li><strong>Control:</strong> Apply baiting or snap traps only at active locations — faster results, less poison</li></ol>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc4-1-2', moduleId: modSC4_1.id,
      title: 'Fewer Visits, Same (or More) Revenue', slug: 'fewer-visits-same-revenue',
      summary: 'How to restructure your service model to generate the same or better revenue with fewer routine visits.',
      content: `<h2>Fewer Visits, Same (or More) Revenue</h2><p>One of the biggest concerns pest controllers have about digital is this: "If digital means fewer visits, won't I earn less?" The answer, done right, is no — and often the opposite is true.</p><h3>Why Fewer Visits Doesn't Mean Less Revenue</h3><ul><li><strong>Digital charges for monitoring, not just visits.</strong> The monthly connection fee replaces routine visit frequency. You're charging for 24/7 coverage, not just time on site.</li><li><strong>Escalation visits are triggered by data.</strong> When alerts fire, you respond — and that response is billable. The customer understands because the data justifies it.</li><li><strong>Higher-value customers.</strong> Digital customers are typically larger, longer-contract, and less price-sensitive than traditional clients.</li><li><strong>Reduced cost-to-serve.</strong> Fewer routine visits means less petrol, less time, less labour per site — your margin improves even if visit frequency drops.</li></ul><h3>A Simple Cost Comparison</h3><p><strong>Traditional model (medium site, 12 monthly visits):</strong></p><ul><li>12 visits/year × $165/visit = $1,980/year</li><li>+ avg 3 reactive callouts × $165 = $495</li><li>Total: ~$2,475/year</li></ul><p><strong>Digital model (same site, 20 devices, 1 gateway, Tier 3 pricing):</strong></p><ul><li>Monthly connection fees: ~$110/month = $1,320/year</li><li>6 data-triggered visits × $165 = $990</li><li>Total: ~$2,310/year — with dramatically better service delivered</li></ul><p>Use the Business Model A/B Calculator in the Sales Hub to run these numbers with your own pricing.</p><blockquote><p>The goal isn't fewer visits — it's smarter visits. You only go where the data tells you to go.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Course 5: Selling with Data
  const modSC5_1 = await prisma.module.upsert({
    where: { id: 'mod-sc5-1' }, update: {},
    create: { id: 'mod-sc5-1', courseId: salesC5.id, title: 'Module 1: Using OneCloud as a Sales Tool', sortOrder: 1, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc5-1-1', moduleId: modSC5_1.id,
      title: 'Demonstrating the Customer Portal', slug: 'demonstrating-customer-portal',
      summary: 'How to use a live or demo OneCloud session to make the value of digital pest control immediately tangible.',
      content: `<h2>Demonstrating the Customer Portal</h2><p>Nothing sells digital pest control faster than showing a customer the OneCloud portal. When they can see a live site map with colour-coded station status, trend graphs, and a report ready to export — the sale often closes itself.</p><h3>What to Show in a Demo</h3><ol><li><strong>The site map view</strong> — Show stations plotted on a floorplan or aerial map. Red/orange stations indicate activity. Green stations are inactive. "You can see exactly which stations are being hit and where."</li><li><strong>The activity timeline</strong> — Show the chronological log of events. "Every alert, every visit, every recommendation — all logged automatically with timestamps."</li><li><strong>Monthly activity heatmap</strong> — Show the trend graph over time. "This shows pest pressure is reducing — control is working. You can show this to your auditor."</li><li><strong>The visit report</strong> — Generate a one-click PDF. "This is what your auditor gets — branded, complete, photo evidence included."</li></ol><h3>Key Lines to Use During the Demo</h3><ul><li>"This is what your site looks like right now — from anywhere in the world."</li><li>"Your auditor can have access to this dashboard. There's nothing to prepare — it's already there."</li><li>"When we get an alert, we already know exactly which station, what type of activity, and what we need to bring."</li><li>"Your current service — can they show you this?"</li></ul><h3>Handling "Can I Try Before I Buy?"</h3><p>Some customers will ask for a trial — this is a positive sign. Options include: a 30-day trial on a small number of stations (seek PestSense partner approval), quotes for both traditional and digital side-by-side, or a single-site pilot before expanding to a full estate rollout.</p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc5-1-2', moduleId: modSC5_1.id,
      title: 'Site Visit Reports as a Sales Differentiator', slug: 'site-visit-reports-sales-tool',
      summary: 'Why automated, branded site visit reports are one of the most powerful differentiators you have — and how to use them in the sale.',
      content: `<h2>Site Visit Reports as a Sales Differentiator</h2><p>Site visit reports sound mundane. But when you show a prospect a PestSense-generated report — complete with their branding, station photos, technician notes, recommendations with assigned owners, and a customer signature — the reaction is usually the same: "Our current provider gives us a paper form."</p><h3>What PestSense Reports Deliver Automatically</h3><ul><li><strong>Branded PDF reports</strong> — Your logo and the customer's branding, generated automatically at the end of each visit</li><li><strong>Photo evidence</strong> — Photos captured during the visit flow directly into the report</li><li><strong>Recommendations with owners</strong> — Each action item has an assigned owner and due date</li><li><strong>On-site signatures</strong> — Technician and customer both sign on the device — proof of visit and acceptance</li><li><strong>Historical access</strong> — Every past report available instantly — no filing cabinets, no lost paperwork</li><li><strong>One-click PDF send</strong> — Email to the customer immediately after the visit, or set up auto-send</li></ul><h3>The Sales Angle</h3><p>For compliance-driven customers: "How long does your current provider take to get you a visit report after each service?" The typical answer is days, if the report arrives at all. The PestSense report is ready before the technician leaves the car park.</p><p>For audit-focused customers: "What happens if your auditor asks for records from 18 months ago?" With PestSense, it's a 30-second search. With a traditional service, it might be a box of paper in a storage room — if you're lucky.</p><blockquote><p><strong>Important:</strong> Site Visit Reporting is included in the standard monthly device subscription — it's not an add-on. This is worth calling out explicitly when presenting value.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Course 6: Handling Objections
  const modSC6_1 = await prisma.module.upsert({
    where: { id: 'mod-sc6-1' }, update: {},
    create: { id: 'mod-sc6-1', courseId: salesC6.id, title: 'Module 1: Price and Value Objections', sortOrder: 1, status: 'PUBLISHED' },
  })
  const modSC6_2 = await prisma.module.upsert({
    where: { id: 'mod-sc6-2' }, update: {},
    create: { id: 'mod-sc6-2', courseId: salesC6.id, title: 'Module 2: Operational and Trust Objections', sortOrder: 2, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc6-1-1', moduleId: modSC6_1.id,
      title: '"It Costs Too Much"', slug: 'objection-too-expensive',
      summary: 'The complete response framework for the most common objection in digital pest control sales.',
      content: `<h2>"It Costs Too Much"</h2><p>This is the most common objection you'll face. It almost always means one of two things: they haven't understood the value yet, or they're comparing to a traditional service price without adjusting for what's included.</p><h3>Step 1: Understand What They're Comparing To</h3><p>Before responding, ask: "Compared to what?" Are they comparing to their current traditional service (apples and oranges — digital does more), a competitor's digital offering (find out who and what they're quoting), or doing nothing (this is a risk conversation, not a cost conversation)?</p><h3>Step 2: Reframe as Investment, Not Cost</h3><p>Try: <strong>"I understand. Can I ask — what would a pest incident cost your business? Not the monthly monitoring fee — what would one real incident look like?"</strong></p><p>Then run through the stock-loss / risk calculation. Once a customer sees their risk exposure as a number, the monthly fee looks very different.</p><h3>Step 3: Compare Apples to Apples</h3><p>Use the A/B Business Model Calculator to show the total cost comparison including: current visit frequency vs data-triggered visits, emergency callout costs (digital nearly eliminates these), and risk cost reduction.</p><h3>Step 4: Offer a Path</h3><ul><li>Bundled model — lower upfront, predictable monthly cost</li><li>Start with one high-risk site and expand</li><li>Trial offer (with partner approval)</li><li>"Digital is for customers who need a superior service where being pest-free matters. If that's not the priority right now, I can quote traditional service too — but I want to make sure you have the full picture first."</li></ul>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc6-1-2', moduleId: modSC6_1.id,
      title: '"We\'re Happy with Our Current Provider"', slug: 'objection-happy-with-current',
      summary: "How to respond when a prospect isn't looking to change — without burning the relationship.",
      content: `<h2>"We're Happy with Our Current Provider"</h2><p>This is actually one of the easier objections to work with — because "happy" rarely means "no room for improvement." It usually means they haven't been shown what better looks like yet.</p><h3>Don't Attack the Competitor</h3><p>Never criticise the current provider directly. Instead, position PestSense as additive — a different category, not just a better version of what they have.</p><h3>The Shift Question</h3><p>Try: <strong>"That's great — what does your current service do for you when a problem appears between visits? Do you get alerted, or do you find out at the next scheduled service?"</strong></p><p>Most traditional service customers will admit they find out at the next visit — or worse, when a customer complains. This is your opening.</p><h3>The Transparency Question</h3><p><strong>"Do you currently have any visibility into what's happening on your site between visits?"</strong></p><p>If the answer is no — that's the gap. Offer to show them the OneCloud portal as a "what's possible" demo, with no commitment required.</p><h3>Play the Long Game</h3><ul><li>Ask when their contract renews — and schedule a follow-up 2–3 months before</li><li>Leave behind a comparison document or a demo login to OneCloud</li><li>Connect on a "for information only" basis — send relevant case studies and industry news about pest control failures</li></ul><blockquote><p>Often the best time to plant the seed is before there's a problem — so that when there is one, you're the first call they make.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc6-2-1', moduleId: modSC6_2.id,
      title: '"The Devices Will Disrupt Our Operations"', slug: 'objection-operational-disruption',
      summary: 'How to address concerns about device interference, battery safety, and installation downtime.',
      content: `<h2>"The Devices Will Disrupt Our Operations"</h2><p>Operational disruption concerns come in several forms: fire risk, device visibility, wireless interference, and installation downtime. Here's how to handle each.</p><h3>"What about fire risk? I've heard about lithium batteries."</h3><p><strong>The answer:</strong> PestSense Predictor devices use standard alkaline batteries (AA, same as a TV remote) — not lithium. There is zero fire risk. This was a decisive competitive differentiator that won one of the largest digital pest control rollouts in Australia, where a competitor's lithium-battery solution was blocked by the client for exactly this reason.</p><h3>"Will the installation disrupt our operations?"</h3><p><strong>The answer:</strong> Installation can be scheduled during off-hours, over multiple shifts, or phased by zone. The gateway requires one permanent power point and one network connection — typically the most involved part. Device installation is fast: unbox, insert batteries, scan QR code, mount. Most sites are commissioned within a single day.</p><h3>"Will the devices be visible to customers or guests?"</h3><p><strong>The answer:</strong> The Predictor I model is compact and designed for discreet internal placement. We can position devices in low-visibility locations without compromising function. Stations are professional and clean in appearance.</p><h3>"We use fewer stations — does that mean less coverage?"</h3><p><strong>The answer:</strong> Digital means smarter coverage, not less. Each station monitors continuously — equivalent to having a technician checking it 24/7. You need fewer stations because each one provides far more data than a traditional passive station.</p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc6-2-2', moduleId: modSC6_2.id,
      title: '"What if the Technology Doesn\'t Work?"', slug: 'objection-technology-reliability',
      summary: 'Handling concerns about reliability, battery life, connectivity, and what happens when things go wrong.',
      content: `<h2>"What if the Technology Doesn't Work?"</h2><p>Technology reliability is a legitimate concern — and a great opportunity to differentiate PestSense with honest, specific answers.</p><h3>Battery Life</h3><p>Predictor X and I models use 4 × AA alkaline batteries per device, providing approximately 2 years of battery life under normal conditions. Battery status is monitored remotely — you get a low-battery alert before the device goes offline, giving time to schedule a replacement during a routine visit.</p><h3>Network Connectivity</h3><p>The gateway uses LoRaWAN radio with deep building penetration — designed specifically for difficult industrial environments. It also includes a 4G cellular SIM (Optus/Vodafone with automatic Telstra fallback). For large sites, additional gateways or external antennas ($100 each) can extend coverage as needed.</p><h3>What Happens If a Device Goes Offline?</h3><p>The platform automatically generates an offline alert. You can see which device went offline, when, and how long it's been down. This triggers a service action — and the customer can see this in their portal too, demonstrating your responsiveness.</p><h3>"We've Had Bad Experiences with Technology Before"</h3><p>Acknowledge it honestly: "That's a fair concern — a lot of early IoT systems were unreliable. PestSense has been operating in Australia across some of the largest commercial sites in the country. The platform is purpose-built for pest control, not adapted from something else."</p><p>Offer references: "I can connect you with a similar business that's been running PestSense for 2+ years if you'd like to hear from them directly."</p>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Course 7: Pricing & Proposals
  const modSC7_1 = await prisma.module.upsert({
    where: { id: 'mod-sc7-1' }, update: {},
    create: { id: 'mod-sc7-1', courseId: salesC7.id, title: 'Module 1: Understanding the Pricing Model', sortOrder: 1, status: 'PUBLISHED' },
  })
  const modSC7_2 = await prisma.module.upsert({
    where: { id: 'mod-sc7-2' }, update: {},
    create: { id: 'mod-sc7-2', courseId: salesC7.id, title: 'Module 2: Presenting a Winning Proposal', sortOrder: 2, status: 'PUBLISHED' },
  })
  lessons.push(
    {
      id: 'lesson-sc7-1-1', moduleId: modSC7_1.id,
      title: 'Upfront vs. Bundled — Which to Lead With', slug: 'upfront-vs-bundled',
      summary: 'When to offer the upfront equipment model vs the bundled monthly rental — and how to position each.',
      content: `<h2>Upfront vs. Bundled — Which to Lead With</h2><p>PestSense offers two commercial structures. Understanding when to use each is key to structuring deals that close.</p><h3>The Upfront Offer</h3><p><strong>What it is:</strong> Customer purchases equipment upfront, then pays a monthly connection fee per active device.</p><ul><li>Equipment purchase at Tier pricing (e.g. Tier 3: $159/device, $450/gateway)</li><li>Monthly connection fee: e.g. $5.50/device/month (Tier 3, Y1–Y3)</li><li>Batteries not included — customer sources their own AA alkaline batteries</li><li>Minimum term: 12 months for connection fee</li><li>Equipment belongs to the PCO/customer from day one</li></ul><p><strong>Best for:</strong> Customers who prefer asset ownership, have capital budget, or want a lower ongoing monthly cost. Also better for large deployments where monthly fees compound significantly.</p><h3>The Bundled Offer</h3><p><strong>What it is:</strong> All-in monthly fee covering equipment rental, connection, and batteries supplied.</p><ul><li>Monthly fee per device: e.g. $12.50/device/month (Tier 3)</li><li>Batteries included (but not installed)</li><li>Minimum term: 36 months — equipment remains PestSense property until term end</li><li>At term end: bundled monthly fee switches to standard connection fee, ownership transfers to PCO</li></ul><p><strong>Best for:</strong> Customers with no capital budget, smaller operators, first-time digital buyers. Lower barrier to entry.</p><h3>Which to Lead With</h3><table><thead><tr><th>Customer Situation</th><th>Lead With</th></tr></thead><tbody><tr><td>Large rollout, existing capital budget</td><td>Upfront</td></tr><tr><td>First digital deployment, price-sensitive</td><td>Bundled</td></tr><tr><td>Operational expense preference (no capex)</td><td>Bundled</td></tr><tr><td>Long-term relationship, high trust</td><td>Either — show both</td></tr></tbody></table><p><strong>Always submit quotes to sales@pestsense.com for review and approval before presenting to a customer.</strong></p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc7-1-2', moduleId: modSC7_1.id,
      title: 'Pricing Tiers and Margins', slug: 'pricing-tiers-and-margins',
      summary: 'How the PestSense pricing tier system works and how to factor in your margin correctly.',
      content: `<h2>Pricing Tiers and Margins</h2><p>PestSense uses a volume-based pricing tier system. Your tier determines your cost price for devices — you apply a margin on top to create your customer price.</p><h3>Device Pricing Tiers (PCO Cost, AUD ex-GST, valid 1/1/2026)</h3><table><thead><tr><th>Tier</th><th>Volume Commitment</th><th>Predictor X/I Unit</th><th>Connection Fee /device/month</th><th>Bundled Monthly /device</th></tr></thead><tbody><tr><td>Tier 1</td><td>100 devices</td><td>$189</td><td>$7.00</td><td>$14.50</td></tr><tr><td>Tier 2</td><td>500+ devices</td><td>$179</td><td>$6.25</td><td>$13.50</td></tr><tr><td>Tier 3</td><td>1,000+ devices</td><td>$159</td><td>$5.50</td><td>$12.50</td></tr><tr><td>Tier 4</td><td>5,000+ devices</td><td>$149</td><td>$4.75</td><td>$11.50</td></tr></tbody></table><p><strong>Gateway:</strong> $450 at all tiers (no volume discount).</p><h3>Applying Your Margin</h3><p>The standard margin to add is 20% on top of PCO cost. Example at Tier 3, 20% margin:</p><ul><li>Predictor device: $159 × 1.2 = <strong>$190.80</strong> to customer</li><li>Monthly connection: $5.50 × 1.2 = <strong>$6.60/device/month</strong> to customer</li><li>Bundled monthly: $12.50 × 1.2 = <strong>$15.00/device/month</strong> to customer</li></ul><h3>What's Not Included in Pricing</h3><ul><li>Batteries — standard AA alkaline (Duracell/Energizer), ~$0.70 per battery in bulk. Each Predictor device takes 4 batteries.</li><li>Freight/shipping — additional cost</li><li>Installation labour — priced separately based on site complexity</li><li>External antenna (optional) — $100 per gateway for extended range</li></ul><p><strong>No CPI increases during contract term.</strong> Changes apply at renewal only.</p>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc7-1-3', moduleId: modSC7_1.id,
      title: 'Scoping a Site — Gateways and Devices', slug: 'scoping-a-site',
      summary: 'How to estimate the number of gateways and devices required for any site — accurately, before a formal survey.',
      content: `<h2>Scoping a Site — Gateways and Devices</h2><p>Accurate scoping is the foundation of a good proposal. Under-scoping means the site won't work properly. Over-scoping means an inflated price. Here's how to scope a site before a formal survey.</p><h3>Gateway Scoping</h3><p>Each gateway supports 400+ stations within range. The key question is site geography:</p><table><thead><tr><th>Site Size</th><th>Gateways Required</th></tr></thead><tbody><tr><td>Small — stations within 100m radius of gateway</td><td>1 gateway</td></tr><tr><td>Medium — stations within 200m radius</td><td>2 gateways</td></tr><tr><td>Large — stations extending 200m–500m</td><td>3 or more (contact PestSense)</td></tr></tbody></table><p><strong>Gateway placement:</strong> Central, high location. Permanent power required. Ethernet preferred; 4G cellular included as backup (verify mobile coverage using Optus/Vodafone/Telstra coverage maps before finalising a quote).</p><h3>Device Scoping</h3><ul><li><strong>Predictor X</strong> — External deployment. Full weatherproof housing included. Shipped in boxes of 4 only.</li><li><strong>Predictor I</strong> — Internal deployment. Smaller, lower-profile. Shipped in boxes of 4.</li><li><strong>Predictor TAG</strong> — Hard-to-reach areas: roof voids, attached to tincats and cage traps. Shipped in boxes of 8.</li></ul><h3>Rules of Thumb for Initial Estimates</h3><ul><li>External perimeter: 1 Predictor X per key entry point or corner</li><li>Internal: 1 Predictor I per ~50–80m² in sensitive areas</li><li>Start with a conservative estimate — note it as "preliminary, subject to site survey"</li><li>Include an external antenna ($100) in quotes where the site hasn't been surveyed yet</li></ul><blockquote><p>All quotes must be submitted to sales@pestsense.com for review and approval before presenting to a customer.</p></blockquote>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc7-2-1', moduleId: modSC7_2.id,
      title: 'Structuring the Digital Pest Control Proposal', slug: 'structuring-the-proposal',
      summary: 'The key sections of a winning PestSense proposal and what to include in each.',
      content: `<h2>Structuring the Digital Pest Control Proposal</h2><p>A strong proposal doesn't just list prices — it tells a story that leads the customer from their problem to your solution.</p><h3>Section 1: Their Digital Plan (Customised)</h3><p>Open with a summary of what you're proposing specifically for them. Reference the site audit, device count, and deployment timeline. Always customise this section.</p><p>Include three commitment statements tailored to the customer:</p><ul><li><strong>Seamless Installation and Integration</strong> — Non-disruptive deployment. Specify hours or shifts if agreed (e.g., "Installation completed over two shifts outside core operational hours").</li><li><strong>Predictive Management and Optimisation</strong> — 24/7 monitoring with guaranteed response SLA. Customise the SLA — e.g., "2-hour response to alerts".</li><li><strong>Site Audit and Digital Blueprint</strong> — Risk-based survey, sensor placement plan, commissioning strategy (e.g., "including mapping up to X devices across critical entry points").</li></ul><h3>Section 2: Value Proposition</h3><p>Four clear outcomes — adapt to what you learned in discovery:</p><ul><li>Reduced Infestation Risk and Property Damage</li><li>Enhanced Transparency and Compliance</li><li>Peace of Mind — Continuous, Proactive Monitoring and Early Detection</li><li>Increased Efficiency and Targeted Action</li></ul><h3>Section 3: Pricing Summary</h3><p>Use the Proposal Summary Generator in the Sales Hub. Include device count breakdown, offer type, total upfront cost, monthly ongoing cost (ex-GST), and always add: "Preliminary estimate — subject to site survey."</p><h3>Section 4: Terms Summary</h3><p>Key terms to state explicitly: contract term length, no CPI increase during term, early termination fees apply, batteries not included (upfront model), PestSense approval required before customer submission.</p>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sc7-2-2', moduleId: modSC7_2.id,
      title: 'Navigating Price Negotiations', slug: 'navigating-price-negotiations',
      summary: "How to hold your price, offer structural alternatives, and close without discounting the value you've built.",
      content: `<h2>Navigating Price Negotiations</h2><p>If you've built the value correctly, price negotiations should be about structure — not discounting. Here's how to handle the final hurdles without giving away margin.</p><h3>Hold the Line on Value First</h3><p>Before offering any concession, revisit the value conversation. Summarise what they get: 24/7 monitoring, instant alerts with prepared technician response, automated compliance-ready reporting, customer portal access, and dramatically reduced risk of costly pest incidents.</p><p>"You've agreed the risk exposure is [X] and the cost of the service is [Y]. Does the value make sense at that price?"</p><h3>Structural Concessions (Not Discounts)</h3><p>If you need to move, offer structural changes rather than price discounts:</p><ul><li>Switch from upfront to bundled model — lower upfront commitment</li><li>Start with fewer devices on one high-priority site, expand later</li><li>Offer a phased installation timeline to spread costs</li><li>Extend the contract term — longer term can support a slightly lower monthly rate (discuss with PestSense)</li></ul><h3>What Not to Do</h3><ul><li>Don't reduce device count below what the site actually needs — this sets up a failed implementation</li><li>Don't promise a discount without PestSense approval — all pricing changes require submission to sales@pestsense.com</li><li>Don't apologise for the price — it signals that you don't believe in the value yourself</li></ul><blockquote><p><strong>Final close:</strong> "I understand the investment feels significant. But you've told me that [specific risk] is a real concern for your business. This is the only service that removes that risk completely. Shall we move forward?"</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    }
  )

  // ─── PREDICTOR QUICK STARTER GUIDE COURSE ───────────────────────────────────

  const predictorCourse = await prisma.course.upsert({
    where: { slug: 'predictor-quick-starter-guide' }, update: { description: 'A hands-on video guide to setting up the Robustel R3000-LG gateway and the PestSense Predictor X device from unboxing to first power-on.', estimatedMins: 20 },
    create: { categoryId: hardwareCat.id, title: 'Predictor Quick Starter Guide', slug: 'predictor-quick-starter-guide', description: 'A hands-on video guide to setting up the Robustel R3000-LG gateway and the PestSense Predictor X device from unboxing to first power-on.', status: 'PUBLISHED', sortOrder: 2, estimatedMins: 20 },
  })
  for (const role of ['TECHNICIAN', 'SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: predictorCourse.id, role } }, update: {}, create: { courseId: predictorCourse.id, role } })
  }

  const predMod1 = await prisma.module.upsert({
    where: { id: 'mod-pred-1' }, update: {},
    create: { id: 'mod-pred-1', courseId: predictorCourse.id, title: 'Module 1: Gateway Setup', sortOrder: 1, status: 'PUBLISHED' },
  })
  const predMod2 = await prisma.module.upsert({
    where: { id: 'mod-pred-2' }, update: {},
    create: { id: 'mod-pred-2', courseId: predictorCourse.id, title: 'Module 2: Predictor Device Setup', sortOrder: 2, status: 'PUBLISHED' },
  })

  // Register the gateway video as an Asset
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.internal' } })
  const gwVideoAsset = await prisma.asset.upsert({
    where: { id: 'asset-gw-video-1' },
    update: {},
    create: {
      id: 'asset-gw-video-1',
      filename: 'a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4',
      originalName: 'Gateway 1.mp4',
      mimeType: 'video/mp4',
      size: 398000000,
      url: '/uploads/videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4',
      type: 'VIDEO',
      title: 'Gateway Setup — Unboxing to Power-On',
      description: 'Full gateway setup walkthrough: unboxing, antenna connection, SIM card installation, and first power-on.',
      status: 'PUBLISHED',
      framesExtracted: true,
      uploadedById: adminUser.id,
    },
  })
  const snapVideoAsset = await prisma.asset.upsert({
    where: { id: 'asset-snap-video-1' },
    update: {},
    create: {
      id: 'asset-snap-video-1',
      filename: 'b7462372-659a-444a-8078-237f301b4103.mp4',
      originalName: 'Switching from Baiting to Snaptrap.mp4',
      mimeType: 'video/mp4',
      size: 192000000,
      url: '/uploads/videos/b7462372-659a-444a-8078-237f301b4103.mp4',
      type: 'VIDEO',
      title: 'Switching from Bait Mode to Snap Trap Mode',
      description: 'Step-by-step demonstration of removing the bait bar and installing a snap trap in the Predictor X.',
      status: 'PUBLISHED',
      framesExtracted: true,
      uploadedById: adminUser.id,
    },
  })

  // Register extracted frames as IMAGE assets linked to their source video
  const gwFrameData = [
    { num: '0001', ts: 10, label: 'Sealed box — gateway still in packaging' },
    { num: '0002', ts: 20, label: 'Box opened — gateway and antennas in foam insert' },
    { num: '0003', ts: 30, label: 'Removing gateway from foam packaging' },
    { num: '0004', ts: 40, label: 'Green power terminal connector' },
    { num: '0005', ts: 50, label: 'Gateway front panel — ports and LEDs' },
    { num: '0006', ts: 60, label: 'Full front panel: green PCB, RUN/SIGNAL LEDs, SMA ports, USB, Ethernet' },
    { num: '0007', ts: 70, label: 'LoRa antenna attached, power supply alongside' },
    { num: '0008', ts: 80, label: 'Wide shot — fully assembled gateway with antenna' },
    { num: '0009', ts: 90, label: 'Gateway laid flat — front panel with yellow screwdriver' },
    { num: '0010', ts: 100, label: 'Back/side panel — SIM 1 and SIM 2 slots visible' },
    { num: '0011', ts: 110, label: 'Inserting SIM card into back panel' },
    { num: '0012', ts: 120, label: 'Close-up SIM slot during card insertion' },
    { num: '0013', ts: 130, label: 'Back panel — SIM card partially inserted, coloured power wires' },
    { num: '0014', ts: 140, label: 'Gateway upright — front LEDs lit (RUN LED green)' },
    { num: '0015', ts: 150, label: 'Pen/tool pushing SIM card into slot' },
    { num: '0016', ts: 160, label: 'Gateway standing upright with LoRa antenna, power cable attached' },
    { num: '0017', ts: 170, label: 'Gateway on side — green RUN LED glowing, Robustel branding, Ethernet ports' },
  ]
  for (const f of gwFrameData) {
    await prisma.asset.upsert({
      where: { id: `asset-gw-frame-${f.num}` },
      update: {},
      create: {
        id: `asset-gw-frame-${f.num}`,
        filename: `frame_${f.num}.jpg`,
        originalName: `gw_frame_${f.num}.jpg`,
        mimeType: 'image/jpeg',
        size: 80000,
        url: `/uploads/frames/gw-video/frame_${f.num}.jpg`,
        type: 'IMAGE',
        title: f.label,
        description: `Gateway setup video — frame at ${f.ts}s`,
        status: 'PUBLISHED',
        sourceVideoId: gwVideoAsset.id,
        videoTimestamp: f.ts,
        uploadedById: adminUser.id,
      },
    })
  }

  const snapFrameData = [
    { num: '0001', ts: 8, label: 'Predictor X closed — PestSense branding on lid' },
    { num: '0002', ts: 16, label: 'Opening Predictor X with green key' },
    { num: '0003', ts: 25, label: 'Interior with bait bar loaded — button panel visible (SERVICE, BAIT, TRAP)' },
    { num: '0004', ts: 33, label: 'Bait bar removed — empty trap zone with bait holders visible' },
    { num: '0005', ts: 41, label: 'Snap trap mechanism being inserted into trap zone' },
    { num: '0006', ts: 50, label: 'Victor snap trap positioned in trap zone (red V logo)' },
    { num: '0007', ts: 58, label: 'Snap trap in position — full interior view' },
    { num: '0008', ts: 67, label: 'Snap trap seated — BAIT LED amber visible' },
    { num: '0009', ts: 75, label: 'Snap trap ready — device interior' },
    { num: '0010', ts: 84, label: 'Device exterior — green ON/OFF button, battery compartment' },
  ]
  for (const f of snapFrameData) {
    await prisma.asset.upsert({
      where: { id: `asset-snap-frame-${f.num}` },
      update: {},
      create: {
        id: `asset-snap-frame-${f.num}`,
        filename: `frame_${f.num}.jpg`,
        originalName: `snap_frame_${f.num}.jpg`,
        mimeType: 'image/jpeg',
        size: 70000,
        url: `/uploads/frames/snap-video/frame_${f.num}.jpg`,
        type: 'IMAGE',
        title: f.label,
        description: `Snap trap switching video — frame at ${f.ts}s`,
        status: 'PUBLISHED',
        sourceVideoId: snapVideoAsset.id,
        videoTimestamp: f.ts,
        uploadedById: adminUser.id,
      },
    })
  }
  console.log('✅ Video assets and frames registered')

  lessons.push(
    // ── Module 1: Gateway Setup ──────────────────────────────────────────────
    {
      id: 'lesson-pred-1-1', moduleId: predMod1.id,
      title: 'Unboxing the R3000-LG Gateway', slug: 'unboxing-r3000-lg-gateway',
      summary: "What's in the box, what each component is, and how to handle the hardware safely.",
      videoUrl: '/uploads/videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4',
      videoProvider: 'local',
      duration: 168,
      content: `<h2>Unboxing the Robustel R3000-LG</h2>
<p>Watch the video above to see the full unboxing process. This lesson covers what's in the box and what each component does before you start connecting anything.</p>

<figure>
  <img src="/uploads/frames/gw-video/frame_0002.jpg" alt="Gateway unboxing — contents in foam insert" style="max-width:100%;border-radius:8px;" />
  <figcaption>Box opened: the R3000-LG gateway and antennas packed in protective foam</figcaption>
</figure>

<h3>What's in the Box</h3>
<ul>
  <li><strong>Robustel R3000-LG gateway unit</strong> — the main device (green and blue housing)</li>
  <li><strong>2 × SMA antennas</strong> — one for LoRaWAN (the longer rubber duck antenna), one for 4G cellular</li>
  <li><strong>Green power terminal connector</strong> — 4-pin screw terminal for DC power connection</li>
  <li><strong>DIN rail clip</strong> — for mounting inside an enclosure or on a rail</li>
  <li><strong>Power adapter</strong> — 12V DC wall-plug power supply (included)</li>
</ul>

<figure>
  <img src="/uploads/frames/gw-video/frame_0001.jpg" alt="Sealed box" style="max-width:100%;border-radius:8px;" />
  <figcaption>The gateway ships in a sealed cardboard box — inspect for shipping damage before opening</figcaption>
</figure>

<h3>Handling Tips</h3>
<ul>
  <li>Do not plug in the power before antennas are attached — transmitting without an antenna can damage the LoRa radio</li>
  <li>Keep the foam packaging — it's useful for transport if the gateway needs to be moved or returned</li>
  <li>Check that both SMA ports are clean and undamaged before attaching antennas</li>
</ul>

<blockquote><p><strong>Tip:</strong> Take a photo of the serial number label on the base of the unit before mounting. You'll need it for commissioning and for any support requests.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-pred-1-2', moduleId: predMod1.id,
      title: 'Connecting Antennas and Power', slug: 'connecting-antennas-and-power',
      summary: 'Step-by-step: attaching the LoRa and cellular antennas, wiring the power connector, and understanding the front panel.',
      videoUrl: '/uploads/videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4',
      videoProvider: 'local',
      duration: 168,
      content: `<h2>Connecting Antennas and Power</h2>
<p>Before powering on the gateway, you need to attach both antennas and wire the power connector. This must be done in the right order.</p>

<h3>Step 1 — Attach the Antennas First</h3>
<p><strong>Never apply power before antennas are attached.</strong> Transmitting RF without an antenna connected can permanently damage the radio module.</p>

<figure>
  <img src="/uploads/frames/gw-video/frame_0007.jpg" alt="Antennas attached to gateway" style="max-width:100%;border-radius:8px;" />
  <figcaption>LoRa antenna (tall rubber duck) and 4G cellular antenna both attached to SMA ports</figcaption>
</figure>

<ol>
  <li>Identify the two SMA antenna ports on the top of the unit</li>
  <li>The <strong>LoRa antenna port</strong> is labelled "ANT" — attach the longer black rubber duck antenna here</li>
  <li>The <strong>4G antenna port</strong> is labelled "MAIN" — attach the shorter 4G antenna here</li>
  <li>Hand-tighten only — do not use tools on the SMA connectors</li>
</ol>

<h3>Step 2 — Wire the Power Connector</h3>
<p>The R3000-LG uses a green 4-pin screw terminal for DC power input. The Quick Starter Guide wiring is:</p>
<ul>
  <li><strong>Red wire → + (positive)</strong></li>
  <li><strong>Yellow wire → − (negative/ground)</strong></li>
</ul>

<figure>
  <img src="/uploads/frames/gw-video/frame_0004.jpg" alt="Green power terminal connector" style="max-width:100%;border-radius:8px;" />
  <figcaption>The green 4-pin screw terminal connector — connect red to + and yellow to −</figcaption>
</figure>

<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Polarity Warning</strong><br/>
  Reversing the polarity (red to −) will damage the gateway. Double-check wiring before inserting the connector.
</div>

<h3>Understanding the Front Panel</h3>
<figure>
  <img src="/uploads/frames/gw-video/frame_0006.jpg" alt="Gateway front panel detail" style="max-width:100%;border-radius:8px;" />
  <figcaption>Front panel: green PCB with RUN and SIGNAL LEDs (red buttons), SMA ports, USB, and dual RJ45 Ethernet ports</figcaption>
</figure>

<table>
  <thead><tr><th>Port / Component</th><th>What it's for</th></tr></thead>
  <tbody>
    <tr><td>SMA × 2 (top)</td><td>Antenna connections — LoRa and 4G cellular</td></tr>
    <tr><td>USB-A</td><td>Configuration or firmware updates via USB drive</td></tr>
    <tr><td>ETH1 / ETH2</td><td>Wired Ethernet — ETH1 is the WAN port (connects to internet); ETH2 is LAN</td></tr>
    <tr><td>RUN LED</td><td>Red (booting) → Green (running normally)</td></tr>
    <tr><td>MODEM LED</td><td>Cellular modem status</td></tr>
    <tr><td>USR LED</td><td>User-configurable (typically LoRa activity)</td></tr>
  </tbody>
</table>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-pred-1-3', moduleId: predMod1.id,
      title: 'Installing the SIM Card', slug: 'installing-sim-card-r3000-lg',
      summary: 'How to locate the SIM tray, insert a nano-SIM, and verify the modem picks up cellular signal.',
      videoUrl: '/uploads/videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4',
      videoProvider: 'local',
      duration: 168,
      content: `<h2>Installing the SIM Card</h2>
<p>The R3000-LG has two SIM card slots on the rear panel, supporting automatic failover from SIM 1 to SIM 2. For standard PestSense deployments, only SIM 1 is required.</p>

<figure>
  <img src="/uploads/frames/gw-video/frame_0010.jpg" alt="Back panel showing SIM 1 and SIM 2 slots" style="max-width:100%;border-radius:8px;" />
  <figcaption>The rear panel — SIM 1 slot (top) and SIM 2 slot (bottom) clearly labelled</figcaption>
</figure>

<h3>What You Need</h3>
<ul>
  <li>A nano-SIM card (supplied by PestSense or your carrier — Optus/Vodafone)</li>
  <li>A SIM ejection tool or a thin pen/pencil</li>
</ul>

<h3>Step-by-Step</h3>
<ol>
  <li>Ensure the gateway is <strong>powered off</strong> before inserting a SIM</li>
  <li>Locate the rear panel — the SIM slots are behind a small cover or directly accessible depending on firmware revision</li>
  <li>Insert the nano-SIM into SIM 1 with the gold contacts facing down</li>
  <li>Push gently until you feel a click — the SIM is spring-loaded</li>
  <li>To remove: push in gently and release — the SIM will eject</li>
</ol>

<figure>
  <img src="/uploads/frames/gw-video/frame_0011.jpg" alt="SIM card being inserted into back panel" style="max-width:100%;border-radius:8px;" />
  <figcaption>Inserting the SIM card — push gently with gold contacts facing down</figcaption>
</figure>

<figure>
  <img src="/uploads/frames/gw-video/frame_0015.jpg" alt="Using a tool to fully seat the SIM card" style="max-width:100%;border-radius:8px;" />
  <figcaption>Use a pen tip or SIM tool to fully seat the card if it doesn't click by hand</figcaption>
</figure>

<h3>After Insertion</h3>
<p>Once the SIM is installed, power on the gateway. After 60–90 seconds, the MODEM LED should go steady green, indicating cellular registration. If it stays red or flashing after 3 minutes, check:</p>
<ul>
  <li>SIM card is fully seated (not partially inserted)</li>
  <li>SIM card is active and provisioned for data (not voice-only)</li>
  <li>4G coverage at the installation location — move gateway higher if signal is marginal</li>
</ul>

<blockquote><p><strong>Data plan note:</strong> PestSense SIM cards are pre-provisioned and data-only. Do not insert a standard phone SIM — it will not work without an APN configuration change.</p></blockquote>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-pred-1-4', moduleId: predMod1.id,
      title: 'Powering On — Reading the LEDs', slug: 'powering-on-reading-leds',
      summary: "What to expect when you first power on the gateway — LED sequence, boot time, and what 'ready' looks like.",
      videoUrl: '/uploads/videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4',
      videoProvider: 'local',
      duration: 168,
      content: `<h2>Powering On — Reading the LEDs</h2>
<p>Once the antennas are attached, the SIM is inserted, and power is wired correctly, you're ready for first power-on. Here's exactly what to expect.</p>

<h3>Boot Sequence (normal)</h3>
<ol>
  <li><strong>0–5 sec:</strong> All LEDs flash briefly (power-on test)</li>
  <li><strong>5–30 sec:</strong> RUN LED flashes red — system booting</li>
  <li><strong>30–60 sec:</strong> RUN LED turns steady green — OS loaded, gateway running</li>
  <li><strong>60–90 sec:</strong> MODEM LED goes steady — cellular registration complete</li>
  <li><strong>~2 min:</strong> Gateway fully operational — LoRa listening, data flowing to OneCloud</li>
</ol>

<figure>
  <img src="/uploads/frames/gw-video/frame_0017.jpg" alt="Gateway powered on — green RUN LED glowing" style="max-width:100%;border-radius:8px;" />
  <figcaption>Healthy gateway: green RUN LED steady. Robustel branding, dual Ethernet ports visible on the side</figcaption>
</figure>

<figure>
  <img src="/uploads/frames/gw-video/frame_0016.jpg" alt="Gateway standing upright with LoRa antenna" style="max-width:100%;border-radius:8px;" />
  <figcaption>Gateway upright with LoRa antenna — ideal temporary desk position for initial commissioning check</figcaption>
</figure>

<h3>LED Reference Table</h3>
<table>
  <thead><tr><th>LED</th><th>State</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>RUN</td><td>Flashing red</td><td>Booting — normal, wait 60 sec</td></tr>
    <tr><td>RUN</td><td>Steady green</td><td>✅ System running normally</td></tr>
    <tr><td>RUN</td><td>Steady red</td><td>Fault — check power supply voltage</td></tr>
    <tr><td>MODEM</td><td>Flashing green</td><td>Connecting to cellular network</td></tr>
    <tr><td>MODEM</td><td>Steady green</td><td>✅ Cellular registered and connected</td></tr>
    <tr><td>MODEM</td><td>Off</td><td>No SIM or SIM not recognised</td></tr>
    <tr><td>USR</td><td>Flashing</td><td>LoRa packets received from devices</td></tr>
  </tbody>
</table>

<h3>If the Gateway Won't Boot</h3>
<ul>
  <li><strong>No LEDs at all:</strong> Check power wiring polarity (red = +, yellow = −). Check power adapter is seated.</li>
  <li><strong>RUN stays red after 3 min:</strong> Try power cycling. If persists, escalate to PestSense support.</li>
  <li><strong>MODEM never goes green:</strong> Check SIM is fully seated. Verify 4G coverage at site. Check APN settings via gateway web interface.</li>
</ul>

<blockquote><p>Once the RUN LED is steady green and MODEM is steady green, the gateway is live. Log into OneCloud to confirm it appears in your gateway list — it typically shows within 2–3 minutes of first boot.</p></blockquote>`,
      sortOrder: 4, status: 'PUBLISHED', version: '1.0',
    },

    // ── Module 2: Predictor Device Setup ────────────────────────────────────
    {
      id: 'lesson-pred-2-1', moduleId: predMod2.id,
      title: 'Unboxing and Batteries', slug: 'predictor-unboxing-batteries',
      summary: "How to open a Predictor X unit, install the 4 × AA batteries, and power it on for the first time.",
      content: `<h2>Unboxing and Installing Batteries</h2>
<p>The Predictor X is a self-contained monitoring station. Before it can communicate with the gateway, you need to install batteries and power it on.</p>

<h3>What's in the Box</h3>
<ul>
  <li>Predictor X unit (black weatherproof housing with PestSense logo)</li>
  <li>Green security key — used to open the unit for servicing</li>
  <li>Mounting hardware (wall anchors and screws)</li>
  <li>QR code label (pre-applied to base — do not remove)</li>
</ul>

<h3>Opening the Unit</h3>
<ol>
  <li>Insert the green security key into the lock on the front face of the unit</li>
  <li>Turn clockwise to unlock</li>
  <li>Lift the lid — it opens from the top</li>
</ol>

<h3>Installing Batteries</h3>
<p>The Predictor X requires <strong>4 × AA alkaline batteries</strong> (not included). Use quality batteries — Duracell or Energizer recommended. Avoid cheap no-name batteries which can cause premature low-battery warnings.</p>
<ol>
  <li>Locate the battery compartment — it is on the interior base of the unit</li>
  <li>Insert 4 × AA batteries following the polarity markings (+/−)</li>
  <li>The unit will power on automatically once batteries are installed</li>
</ol>

<h3>Battery Life</h3>
<p>Under normal conditions, a full set of 4 × AA batteries provides approximately <strong>2 years of operation</strong>. The platform monitors battery voltage remotely and sends a low-battery alert when replacement is needed — usually 4–6 weeks before failure.</p>

<blockquote><p>Always commission new devices before mounting. Place the device near the gateway for initial commissioning — you can move it to its final location once it's confirmed live on the platform.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-pred-2-2', moduleId: predMod2.id,
      title: 'Service Mode and Bait Mode Setup', slug: 'service-mode-bait-mode-setup',
      summary: 'How to use SERVICE mode to configure the Predictor X in Bait Mode — calibration, loading the bait bar, and confirming.',
      content: `<h2>Service Mode and Bait Mode Setup</h2>
<p>Before a Predictor device can start monitoring, you need to configure it for the correct mode. This is done through the <strong>SERVICE menu</strong> inside the unit.</p>

<h3>Understanding the Button Panel</h3>
<p>The interior of the Predictor X has a button panel at the base with three main buttons:</p>
<ul>
  <li><strong>SERVICE</strong> (green) — enters service mode to reconfigure the device</li>
  <li><strong>BAIT</strong> (blue) — selects or configures bait mode</li>
  <li><strong>TRAP</strong> (orange/red) — selects or configures snap trap mode</li>
</ul>
<p>Above these, there is a status LED that shows the current mode (Green = Bait, Amber = Service, Red = Trap activity).</p>

<h3>Bait Mode Setup — Step by Step</h3>
<ol>
  <li><strong>Open the unit</strong> with the green security key</li>
  <li><strong>Press SERVICE</strong> — the LED turns solid <strong>Amber</strong></li>
  <li><strong>Press BAIT</strong> — the device enters bait calibration mode</li>
  <li><strong>Remove any existing bait bar</strong> from the rod (leave the rod empty for calibration)</li>
  <li><strong>Press BAIT again</strong> to zero the sensor (calibrates to empty weight)</li>
  <li><strong>Load a fresh bait bar</strong> onto the rod — push the block onto the centre pin so it's secure</li>
  <li><strong>Press BAIT a final time</strong> — the device records the starting bait weight and enters active monitoring</li>
  <li>The LED turns <strong>steady Green</strong> — bait mode is active</li>
  <li><strong>Close and lock</strong> the lid with the green key</li>
</ol>

<h3>What the Device Monitors in Bait Mode</h3>
<p>The bait sensor continuously weighs the bait bar. When rodents feed, the bar loses weight. The platform tracks:</p>
<ul>
  <li>Amount consumed (in grams, approximated)</li>
  <li>Time of activity (when consumption occurred)</li>
  <li>Alert threshold — you set this in OneCloud (e.g., alert when 30% consumed)</li>
</ul>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-pred-2-3', moduleId: predMod2.id,
      title: 'Switching from Bait Mode to Snap Trap Mode', slug: 'switching-bait-to-snap-trap',
      summary: 'How to safely remove the bait bar, install a snap trap in the Predictor X, and reconfigure the device for Trap Mode.',
      videoUrl: '/uploads/videos/b7462372-659a-444a-8078-237f301b4103.mp4',
      videoProvider: 'local',
      duration: 81,
      content: `<h2>Switching from Bait Mode to Snap Trap Mode</h2>
<p>Watch the video above to see the full switchover process. This lesson covers every step from removing the bait bar to confirming Trap Mode is active.</p>

<figure>
  <img src="/uploads/frames/snap-video/frame_0001.jpg" alt="PestSense Predictor X closed" style="max-width:100%;border-radius:8px;" />
  <figcaption>The Predictor X — a versatile monitoring station that supports both bait and snap trap configurations</figcaption>
</figure>

<h3>When to Switch to Snap Trap Mode</h3>
<p>Snap trap mode is used when:</p>
<ul>
  <li>The site has requested non-toxic control (e.g., food preparation areas, aged care)</li>
  <li>Compliance requirements prohibit rodenticide in certain zones</li>
  <li>An active infestation requires rapid knockdown with physical trapping</li>
  <li>The customer prefers snap trapping for any reason</li>
</ul>

<h3>What You Need</h3>
<ul>
  <li>Green security key</li>
  <li>Compatible snap trap (Victor brand snap trap — fits the Predictor X trap zone)</li>
  <li>Gloves (always wear gloves when handling traps)</li>
</ul>

<h3>Step 1 — Open and Enter Service Mode</h3>
<ol>
  <li>Open the unit with the green security key</li>
  <li>Press <strong>SERVICE</strong> — LED turns solid Amber</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0003.jpg" alt="Interior with bait bar and button panel" style="max-width:100%;border-radius:8px;" />
  <figcaption>Interior view showing the bait bar on the rod, and the button panel (SERVICE, BAIT, TRAP) with instructions printed below each button</figcaption>
</figure>

<h3>Step 2 — Remove the Bait Bar</h3>
<ol>
  <li>Slide the bait bar off the centre rod — grip firmly and pull towards you</li>
  <li>Dispose of used bait according to your chemical handling procedures</li>
  <li>The two white bait holders on either side of the trap zone can remain in place</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0004.jpg" alt="Bait bar removed, empty trap zone" style="max-width:100%;border-radius:8px;" />
  <figcaption>Bait bar removed — the trap zone is now clear. The two white bait holder clips are visible on either side</figcaption>
</figure>

<h3>Step 3 — Install the Snap Trap</h3>
<ol>
  <li>Arm the snap trap <strong>before</strong> placing it in the unit (safer than arming inside)</li>
  <li>Lower the trap into the trap zone — it sits on the base plate</li>
  <li>Align it so the trigger plate faces the entry tunnels (the L-shaped channels on each side of the unit)</li>
  <li>The trap clicks into position — it should sit flat and stable</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0005.jpg" alt="Snap trap being inserted into the trap zone" style="max-width:100%;border-radius:8px;" />
  <figcaption>Positioning the snap trap — lower it flat into the trap zone with the trigger plate facing the entry channels</figcaption>
</figure>

<figure>
  <img src="/uploads/frames/snap-video/frame_0006.jpg" alt="Snap trap fully installed — Victor brand with red V logo" style="max-width:100%;border-radius:8px;" />
  <figcaption>Snap trap correctly installed in the Predictor X trap zone — Victor brand trap with red "V" logo visible</figcaption>
</figure>

<h3>Step 4 — Configure Trap Mode</h3>
<ol>
  <li>With the snap trap installed and SERVICE mode still active, press <strong>TRAP</strong></li>
  <li>The device registers the trap presence and arms the detection sensor</li>
  <li>Press <strong>TRAP</strong> again to confirm</li>
  <li>The LED changes to indicate Trap Mode is active</li>
  <li>Close and lock the lid</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0009.jpg" alt="Snap trap in position — device ready" style="max-width:100%;border-radius:8px;" />
  <figcaption>Snap trap in position and Trap Mode configured — the device is now monitoring for trap trigger events</figcaption>
</figure>

<h3>How Trap Mode Works</h3>
<p>In Trap Mode, the Predictor X monitors for trap trigger events using an internal sensor. When the snap trap fires:</p>
<ul>
  <li>The device immediately transmits an alert to the gateway</li>
  <li>OneCloud records the event with timestamp and location</li>
  <li>You receive an alert (email/push) — "Trap triggered at [station name]"</li>
  <li>A service visit is required to reset the trap and dispose of the catch</li>
</ul>

<h3>Switching Back to Bait Mode</h3>
<p>To return to Bait Mode, reverse the process: enter SERVICE mode, remove the snap trap, re-load the bait bar, and recalibrate using the BAIT button sequence. The device is fully reversible — there's no hardware modification required.</p>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>✅ Trap Mode Checklist</strong>
  <ul style="margin:8px 0 0 0;">
    <li>Bait bar removed and disposed correctly</li>
    <li>Snap trap armed before placing in unit</li>
    <li>Snap trap flat in trap zone — trigger facing entry channels</li>
    <li>TRAP button pressed and confirmed (LED shows Trap Mode)</li>
    <li>Lid closed and locked</li>
    <li>Device appears in OneCloud as Trap Mode active</li>
  </ul>
</div>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    }
  )

  // ─── SITE VISIT QUICK REFERENCE COURSE ──────────────────────────────────────

  const siteVisitCourse = await prisma.course.upsert({
    where: { slug: 'conducting-a-site-visit' }, update: { description: 'A step-by-step walkthrough of conducting a PestSense site visit using the OneCloud mobile app — from Start Visit through to End Visit.' },
    create: { categoryId: softwareCat.id, title: 'Conducting a Site Visit', slug: 'conducting-a-site-visit', description: 'A step-by-step walkthrough of conducting a PestSense site visit using the OneCloud mobile app — from Start Visit through to End Visit.', status: 'PUBLISHED', sortOrder: 4, estimatedMins: 15 },
  })
  for (const role of ['TECHNICIAN', 'SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']) {
    await prisma.courseRole.upsert({ where: { courseId_role: { courseId: siteVisitCourse.id, role } }, update: {}, create: { courseId: siteVisitCourse.id, role } })
  }

  const svMod1 = await prisma.module.upsert({
    where: { id: 'mod-sv-1' }, update: {},
    create: { id: 'mod-sv-1', courseId: siteVisitCourse.id, title: 'Module 1: The Site Visit Workflow', sortOrder: 1, status: 'PUBLISHED' },
  })

  // Register PPTX screenshot images as assets
  const svImages = [
    { id: 'asset-sv-img-1', file: 'slide1_Picture_3.png', title: 'OneCloud mobile — site list view' },
    { id: 'asset-sv-img-2', file: 'slide1_Picture_5.png', title: 'OneCloud mobile — Start Visit form (visit reason, duration)' },
    { id: 'asset-sv-img-3', file: 'slide1_Picture_7.png', title: 'OneCloud mobile — site with Set Up location' },
    { id: 'asset-sv-img-4', file: 'slide2_Picture_18.png', title: 'Predictor X service mode instructions — inside lid' },
    { id: 'asset-sv-img-5', file: 'slide2_Picture_20.png', title: 'Predictor X bait mode setup steps' },
    { id: 'asset-sv-img-6', file: 'slide2_Picture_21.png', title: 'OneCloud mobile — bait station service form' },
    { id: 'asset-sv-img-7', file: 'slide3_Picture_18.png', title: 'Predictor X trap mode setup steps' },
    { id: 'asset-sv-img-8', file: 'slide3_Picture_3.png', title: 'Predictor X — 4b trap mode instructions inside lid' },
    { id: 'asset-sv-img-9', file: 'slide3_Picture_4.png', title: 'OneCloud mobile — trap station service form' },
    { id: 'asset-sv-img-10', file: 'slide4_Picture_5.png', title: 'OneCloud mobile — device list with all stations green' },
    { id: 'asset-sv-img-11', file: 'slide4_Picture_10.png', title: 'OneCloud mobile — site view ready to end visit' },
  ]
  for (const img of svImages) {
    await prisma.asset.upsert({
      where: { id: img.id }, update: {},
      create: {
        id: img.id, filename: img.file, originalName: img.file,
        mimeType: 'image/png', size: 200000,
        url: `/uploads/images/site-visit/${img.file}`,
        type: 'IMAGE', title: img.title, status: 'PUBLISHED',
        uploadedById: adminUser.id,
      },
    })
  }
  console.log('✅ Site visit assets registered')

  lessons.push(
    {
      id: 'lesson-sv-1-1', moduleId: svMod1.id,
      title: 'Starting a Site Visit', slug: 'starting-a-site-visit',
      summary: 'How to open the OneCloud app, navigate to your site, and log a Start Visit with the correct reason and duration.',
      content: `<h2>Starting a Site Visit</h2>
<p>Every service visit must be logged in OneCloud before you touch any stations. Starting a visit activates the service workflow and timestamps everything you do from that point forward.</p>

<h3>Step 1 — Navigate to Your Site</h3>
<ol>
  <li>Open the <strong>OneCloud mobile app</strong> on your phone</li>
  <li>Your assigned sites appear in the site list — tap the correct site</li>
  <li>You'll see the site overview showing all locations and their current status</li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide1_Picture_3.png" alt="OneCloud site list" style="max-width:100%;border-radius:8px;max-height:500px;object-fit:contain;" />
  <figcaption>The OneCloud site view — showing locations (e.g. Grana, Hinchcliff House Set Up) with device counts and status indicators</figcaption>
</figure>

<h3>Step 2 — Start the Visit</h3>
<ol>
  <li>Tap the <strong>site name</strong> to expand it and see site actions</li>
  <li>Tap <strong>"Start Visit"</strong></li>
  <li>Fill in the Start Visit form:
    <ul>
      <li><strong>Visit Reason</strong> — select from the dropdown (e.g. Routine Service, Callback, Installation)</li>
      <li><strong>Duration</strong> — estimated time for the visit (in minutes)</li>
    </ul>
  </li>
  <li>Tap <strong>Save</strong></li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide1_Picture_5.png" alt="Start Visit form" style="max-width:100%;border-radius:8px;max-height:500px;object-fit:contain;" />
  <figcaption>The Start Visit form — select your Visit Reason, set the duration, and tap Save to begin the visit clock</figcaption>
</figure>

<h3>Set Up Mode (for new installations)</h3>
<p>If you are commissioning new devices rather than servicing existing ones, switch the location to <strong>"Set Up"</strong> mode before starting. This tells the platform you're adding new devices rather than servicing existing ones.</p>

<blockquote><p><strong>Important:</strong> Always start the visit before scanning any stations. If you scan a station without an active visit, the service record won't be linked to a visit and may not appear correctly in reports.</p></blockquote>`,
      sortOrder: 1, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sv-1-2', moduleId: svMod1.id,
      title: 'Servicing Bait Stations', slug: 'servicing-bait-stations',
      summary: 'How to service a Predictor X in Bait Mode — using SERVICE mode on the device, then recording the service in the OneCloud app.',
      content: `<h2>Servicing Bait Stations</h2>
<p>Bait station service is a two-part process: you physically service the device (check bait, reload if needed), then record what you did in the OneCloud app by scanning the station's QR code.</p>

<h3>Part 1 — Service the Physical Device</h3>
<ol>
  <li>Open the Predictor X with your green security key</li>
  <li>Press <strong>SERVICE</strong> — the LED flashes <strong>Amber</strong>, indicating service mode is active</li>
  <li>Check the bait bar — note how much has been consumed</li>
  <li>Remove the old bait bar if it needs replacing</li>
  <li>Load a fresh bait bar onto the rod</li>
  <li>Press <strong>BAIT</strong> to recalibrate to the new bait weight</li>
  <li>The LED turns <strong>Green</strong> — bait mode is active and calibrated</li>
  <li>Close and lock the lid</li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide2_Picture_18.png" alt="Service mode and bait mode instructions inside lid" style="max-width:100%;border-radius:8px;" />
  <figcaption>The instruction label inside the Predictor X lid — before choosing mode, press SERVICE to enter service mode (amber LED). Ready indicator is flashing Amber &amp; Green.</figcaption>
</figure>

<figure>
  <img src="/uploads/images/site-visit/slide2_Picture_20.png" alt="Bait mode setup steps" style="max-width:100%;border-radius:8px;" />
  <figcaption>Step 4a — Bait Mode: calibrate the weighing system (press BAIT on empty rod), load bait block/sachet, press BAIT again to confirm. Amber &amp; Green LEDs flash together when ready.</figcaption>
</figure>

<h3>Part 2 — Record in OneCloud</h3>
<ol>
  <li>In the OneCloud app, tap <strong>Scan</strong> (the barcode icon at the bottom of the screen)</li>
  <li>Scan the <strong>QR code</strong> on the base of the Predictor X unit</li>
  <li>The station service form opens — complete all fields:
    <ul>
      <li><strong>Approx. Bait Taken %</strong> — how much was consumed before you replaced it</li>
      <li><strong>Did You Add Bait?</strong> — Yes / No</li>
      <li><strong>QTY</strong> — quantity of bait product added</li>
      <li><strong>Lot Number</strong> — from the bait packaging (required for compliance)</li>
      <li><strong>Pest Type</strong> — Norway Rat, House Mouse, etc.</li>
      <li><strong>Next Check</strong> — scheduled date for next service</li>
    </ul>
  </li>
  <li>Tap <strong>Save</strong></li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide2_Picture_21.png" alt="OneCloud bait station service form" style="max-width:100%;border-radius:8px;max-height:500px;object-fit:contain;" />
  <figcaption>The bait station service form in OneCloud — fill in consumption %, bait added, lot number, pest type, and next check date</figcaption>
</figure>

<blockquote><p><strong>Lot number matters.</strong> The lot number from the bait packaging links back to the chemical batch for HACCP and regulatory compliance. Don't skip it — it's the difference between a compliant record and a gap in your audit trail.</p></blockquote>`,
      sortOrder: 2, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sv-1-3', moduleId: svMod1.id,
      title: 'Servicing Snap Trap Stations', slug: 'servicing-snap-trap-stations',
      summary: 'How to service a Predictor X in Trap Mode — checking for catches, resetting the trap, and recording in OneCloud.',
      content: `<h2>Servicing Snap Trap Stations</h2>
<p>Trap station service is similar to bait station service, but the recording requirements are different — you're capturing catch data, not bait consumption.</p>

<h3>Part 1 — Check and Reset the Trap</h3>
<ol>
  <li>Open the Predictor X with your green security key</li>
  <li>Check whether the snap trap has fired (trigger bar will be down if triggered)</li>
  <li>If a catch is present: dispose of it according to your site's pest management procedures, wearing gloves</li>
  <li>Re-arm the snap trap — push the trigger bar back until it clicks into the armed position</li>
  <li>Press <strong>SERVICE</strong> → LED turns Amber → press <strong>TRAP</strong> to re-confirm trap mode</li>
  <li>Close and lock the lid</li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide3_Picture_3.png" alt="Trap mode instructions inside lid" style="max-width:100%;border-radius:8px;" />
  <figcaption>Step 4b — Trap Mode: place your snap trap in the Trap Zone, press TRAP button to confirm. Green LED indicates trap mode is set.</figcaption>
</figure>

<h3>Part 2 — Record in OneCloud</h3>
<ol>
  <li>Scan the <strong>QR code</strong> on the base of the unit</li>
  <li>The trap service form opens:
    <ul>
      <li><strong>Clear any messages</strong> — if the station triggered, confirm the alert has been actioned</li>
      <li><strong>Attractant Added?</strong> — Yes / No (if using attractant with the snap trap)</li>
      <li><strong>Did you catch any animal?</strong> — Yes / No</li>
      <li><strong>Pest Type</strong> — if Yes, specify species</li>
      <li><strong>Next Check</strong> — scheduled next service date</li>
      <li><strong>Station Id / Device Name</strong> — pre-filled from QR scan</li>
    </ul>
  </li>
  <li>Tap <strong>Save</strong></li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide3_Picture_4.png" alt="OneCloud trap station service form" style="max-width:100%;border-radius:8px;max-height:500px;object-fit:contain;" />
  <figcaption>The trap station service form — record whether a catch occurred, attractant used, pest type, and schedule the next check</figcaption>
</figure>

<blockquote><p><strong>Always clear triggered alerts.</strong> If the device shows a triggered alert in the app, confirming it during service tells OneCloud the station has been attended to. Uncleared alerts will flag the station as needing attention even after you've serviced it.</p></blockquote>`,
      sortOrder: 3, status: 'PUBLISHED', version: '1.0',
    },
    {
      id: 'lesson-sv-1-4', moduleId: svMod1.id,
      title: 'Ending the Visit', slug: 'ending-the-site-visit',
      summary: 'How to verify all stations are green, then log the End Visit to close out the service record.',
      content: `<h2>Ending the Visit</h2>
<p>Before you leave the site, confirm that every station has been serviced and the site is showing a clean status — then close the visit. This creates the official service record that feeds into reports and audit documentation.</p>

<h3>Step 1 — Check All Stations Are Green</h3>
<ol>
  <li>In the OneCloud app, navigate to the <strong>Devices</strong> view for the location</li>
  <li>Scroll through all stations — each should now show a <strong>green status</strong> (serviced)</li>
  <li>If any station is still showing amber or red, go back and service it before ending the visit</li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide4_Picture_5.png" alt="Device list showing all stations serviced" style="max-width:100%;border-radius:8px;max-height:500px;object-fit:contain;" />
  <figcaption>All stations showing green — every device has been scanned and its service form completed. This is the expected state before ending a visit.</figcaption>
</figure>

<h3>Step 2 — End the Visit</h3>
<ol>
  <li>Navigate back to the site/location view</li>
  <li>Tap the location name to expand it and see site actions</li>
  <li>Tap <strong>"End Visit"</strong></li>
  <li>The visit is closed and timestamped</li>
</ol>

<figure>
  <img src="/uploads/images/site-visit/slide4_Picture_10.png" alt="Site view showing End Visit option" style="max-width:100%;border-radius:8px;max-height:500px;object-fit:contain;" />
  <figcaption>After checking all devices are green, expand the site actions and tap End Visit to finalise the service record</figcaption>
</figure>

<h3>What Happens After You End the Visit</h3>
<ul>
  <li>A service record is created in OneCloud with a full summary — stations visited, bait consumption, catches recorded, duration</li>
  <li>The record is available immediately in the customer portal if they have access</li>
  <li>The visit feeds into automated PDF reports that can be exported for audits</li>
  <li>Any unresolved alerts remain visible in the platform for follow-up</li>
</ul>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>✅ End-of-Visit Checklist</strong>
  <ul style="margin:8px 0 0 0;">
    <li>All stations scanned and forms completed</li>
    <li>All stations showing green in device list</li>
    <li>Any triggered alerts cleared</li>
    <li>Bait lot numbers recorded where applicable</li>
    <li>End Visit tapped and confirmed in app</li>
  </ul>
</div>

<blockquote><p>A visit that's started but never ended stays open in the platform indefinitely and will appear on management reports as an incomplete visit. Always end the visit before leaving the site — even if you had no stations to service.</p></blockquote>`,
      sortOrder: 4, status: 'PUBLISHED', version: '1.0',
    }
  )

  // Update gateway and snaptrap lessons with transcript-enhanced content
  await prisma.lesson.update({
    where: { id: 'lesson-pred-1-1' },
    data: {
      content: `<h2>Unboxing the Robustel R3000-LG</h2>
<p>Watch the video above to see the full unboxing. Dylan walks through every component before connecting anything.</p>

<figure>
  <img src="/uploads/frames/gw-video/frame_0002.jpg" alt="Gateway unboxing — contents in foam insert" style="max-width:100%;border-radius:8px;" />
  <figcaption>Box opened: the R3000-LG gateway and antennas packed in protective foam. There may be more packaging in yours — the video uses a pre-opened unit.</figcaption>
</figure>

<h3>What's in the Box</h3>
<ul>
  <li><strong>Robustel R3000-LG gateway unit</strong> — main device (green PCB + blue housing)</li>
  <li><strong>LoRaWAN antenna</strong> — the longer rubber duck antenna. Look for the frequency printed on it: <strong>915 MHz</strong> (Australia) or 868 MHz (Europe). Make sure yours says 915.</li>
  <li><strong>4G cellular antenna</strong> — shorter antenna for mobile internet</li>
  <li><strong>Green 4-pin power terminal</strong> — screw-terminal connector for DC power wiring</li>
  <li><strong>Power adapter</strong> — 12V DC wall-plug supply</li>
  <li><strong>DIN rail clip</strong> — for mounting in an enclosure</li>
</ul>

<figure>
  <img src="/uploads/frames/gw-video/frame_0001.jpg" alt="Sealed box" style="max-width:100%;border-radius:8px;" />
  <figcaption>The gateway ships in a standard sealed cardboard box — inspect for damage before opening</figcaption>
</figure>

<h3>What You'll Also Need (not in the box)</h3>
<ul>
  <li>A <strong>flathead screwdriver</strong> — for tightening the screws on the power terminal connector</li>
  <li>A <strong>nano-SIM card</strong> — supplied separately by PestSense</li>
</ul>

<blockquote><p><strong>Tip:</strong> Photograph the serial number label on the base of the unit before mounting. You'll need it for commissioning in OneCloud and for any support requests.</p></blockquote>`,
      version: '1.1',
    }
  })

  await prisma.lesson.update({
    where: { id: 'lesson-pred-1-2' },
    data: {
      content: `<h2>Connecting Antennas and Power</h2>
<p>Always attach antennas before applying power. The order matters — transmitting without an antenna can permanently damage the LoRa radio module.</p>

<h3>Step 1 — Attach the Cellular Antenna (MAIN port)</h3>

<figure>
  <img src="/uploads/frames/gw-video/frame_0006.jpg" alt="Gateway front panel — SMA ports labelled" style="max-width:100%;border-radius:8px;" />
  <figcaption>The front panel — two gold SMA ports at the top. The port labelled <strong>MAIN</strong> is for the cellular antenna.</figcaption>
</figure>

<ol>
  <li>Find the SMA port labelled <strong>"MAIN"</strong> — this is the 4G cellular antenna port</li>
  <li>Screw on the shorter 4G cellular antenna — <strong>finger tight only</strong>, no tools needed</li>
  <li>The cellular cable is long — tuck it out of the way so it's not in your road</li>
</ol>

<h3>Step 2 — Attach the LoRa Antenna (LORA port)</h3>
<ol>
  <li>Find the SMA port labelled <strong>"LORA"</strong> — just above the USB port</li>
  <li>Screw on the longer LoRaWAN rubber duck antenna — <strong>finger tight only, no tools</strong></li>
</ol>

<figure>
  <img src="/uploads/frames/gw-video/frame_0007.jpg" alt="Both antennas attached" style="max-width:100%;border-radius:8px;" />
  <figcaption>Both antennas attached and hand-tightened. Never use a spanner or pliers on SMA connectors.</figcaption>
</figure>

<h3>Step 3 — Wire the Power Connector</h3>
<p>The green terminal connector uses a screw-clamp design. You'll need a flathead screwdriver.</p>

<figure>
  <img src="/uploads/frames/gw-video/frame_0004.jpg" alt="Green power terminal connector" style="max-width:100%;border-radius:8px;" />
  <figcaption>The green 4-pin screw terminal — the power supply wires clamp into the terminal openings</figcaption>
</figure>

<ul>
  <li><strong>Red wire → + (positive terminal)</strong></li>
  <li><strong>Yellow wire → − (negative/ground terminal)</strong></li>
</ul>

<p>Push each wire into its terminal opening and tighten the screw until the wire is secure and can't pull out. <em>"Make sure it's nice and tight and can't fall back out."</em></p>

<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>⚠️ Polarity Check</strong><br/>
  Red = positive (+). Yellow = negative (−). Getting this backwards will damage the gateway. There is only one correct orientation — double check before plugging the connector in.
</div>

<h3>Front Panel Port Reference</h3>
<table>
  <thead><tr><th>Port / Component</th><th>Label</th><th>What it's for</th></tr></thead>
  <tbody>
    <tr><td>SMA (top left)</td><td>MAIN</td><td>4G cellular antenna</td></tr>
    <tr><td>SMA (top right)</td><td>LORA</td><td>LoRaWAN antenna — above USB port</td></tr>
    <tr><td>USB-A</td><td>USB</td><td>Firmware updates via USB drive</td></tr>
    <tr><td>RJ45 × 2</td><td>ETH1 / ETH2</td><td>Wired Ethernet (ETH1 = WAN/internet)</td></tr>
    <tr><td>LED (top)</td><td>RUN</td><td>System status — red booting, green running</td></tr>
    <tr><td>LED (middle)</td><td>MODEM</td><td>Cellular connection status</td></tr>
  </tbody>
</table>`,
      version: '1.1',
    }
  })

  await prisma.lesson.update({
    where: { id: 'lesson-pred-1-4' },
    data: {
      content: `<h2>Powering On — Reading the LEDs</h2>
<p>With antennas attached and power wired, plug in the power supply. The gateway takes <strong>3–5 minutes to fully boot</strong> — don't assume something is wrong if it's taking a while.</p>

<h3>Normal Boot Sequence</h3>
<ol>
  <li><strong>0–5 sec:</strong> All LEDs flash briefly (power-on self-test)</li>
  <li><strong>5–60 sec:</strong> RUN LED flashes red — OS loading</li>
  <li><strong>~60 sec:</strong> RUN LED turns <strong>steady green</strong> — gateway is running</li>
  <li><strong>60–120 sec:</strong> MODEM LED activates — connecting to cellular network</li>
  <li><strong>~3–5 min:</strong> Fully operational — LoRa radio listening, data flowing to OneCloud</li>
</ol>

<figure>
  <img src="/uploads/frames/gw-video/frame_0017.jpg" alt="Gateway powered on — green RUN LED" style="max-width:100%;border-radius:8px;" />
  <figcaption>Healthy booted gateway: steady green RUN LED. The two Ethernet ports and power terminal are visible on the side.</figcaption>
</figure>

<figure>
  <img src="/uploads/frames/gw-video/frame_0016.jpg" alt="Gateway upright with LoRa antenna" style="max-width:100%;border-radius:8px;" />
  <figcaption>Gateway standing upright with LoRa antenna attached — ideal desk position for initial commissioning verification before wall mounting</figcaption>
</figure>

<h3>LED Reference Table</h3>
<table>
  <thead><tr><th>LED</th><th>State</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>RUN</td><td>Flashing red</td><td>Booting — normal, wait up to 5 min</td></tr>
    <tr><td>RUN</td><td>Steady green</td><td>✅ System running normally</td></tr>
    <tr><td>RUN</td><td>Steady red</td><td>Fault — check power supply voltage</td></tr>
    <tr><td>MODEM</td><td>Flashing green</td><td>Connecting to cellular network</td></tr>
    <tr><td>MODEM</td><td>Steady green</td><td>✅ Cellular registered and connected</td></tr>
    <tr><td>MODEM</td><td>Off after boot</td><td>No SIM detected or SIM rejected</td></tr>
    <tr><td>USR</td><td>Flashing</td><td>LoRa radio receiving packets from devices</td></tr>
  </tbody>
</table>

<h3>Troubleshooting First Boot</h3>
<ul>
  <li><strong>No LEDs at all:</strong> Check power wiring — red = +, yellow = −. Check adapter is plugged in and terminal screws are tight.</li>
  <li><strong>RUN stays red after 5 min:</strong> Power cycle (unplug and replug). If persists, contact PestSense support.</li>
  <li><strong>MODEM never lights up:</strong> SIM card likely not fully seated. Power off, reseat SIM, power on.</li>
  <li><strong>Gateway doesn't appear in OneCloud after 5 min:</strong> Check 4G coverage at the install location. Try moving the gateway to a higher position.</li>
</ul>

<blockquote><p>Once RUN is steady green and MODEM is steady green, log into OneCloud — the gateway should appear in your gateway list within 2–3 minutes of first connection.</p></blockquote>`,
      version: '1.1',
    }
  })

  await prisma.lesson.update({
    where: { id: 'lesson-pred-2-3' },
    data: {
      content: `<h2>Switching from Bait Mode to Snap Trap Mode</h2>
<p>Watch the video above — Dylan walks through the full process from opening the unit to confirming trap mode. The whole switchover takes under two minutes.</p>

<figure>
  <img src="/uploads/frames/snap-video/frame_0001.jpg" alt="PestSense Predictor X" style="max-width:100%;border-radius:8px;" />
  <figcaption>The Predictor X — supports both bait and snap trap configurations without any hardware modifications</figcaption>
</figure>

<h3>When to Switch to Snap Trap Mode</h3>
<ul>
  <li>Site requires non-toxic control (food prep areas, aged care, schools)</li>
  <li>Active infestation needing rapid physical knockdown</li>
  <li>Customer preference or compliance requirement</li>
</ul>

<h3>What You Need</h3>
<ul>
  <li>Green security key</li>
  <li>A snap trap — <strong>rat trap or mouse trap, either works</strong>. It does not matter what brand or size you use as long as it fits the trap zone.</li>
  <li>Gloves</li>
</ul>

<h3>Step 1 — Open and Remove Bait</h3>
<ol>
  <li>Open the unit with the green security key</li>
  <li>Remove the bait bar by sliding it off the rod</li>
  <li><strong>Tip:</strong> The old bait bar can be stored in behind the hinges on the lid — it just slips in. Useful if you think you might switch back.</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0003.jpg" alt="Interior with bait bar and button panel" style="max-width:100%;border-radius:8px;" />
  <figcaption>Interior showing the bait bar on the rod, and the SERVICE / BAIT / TRAP button panel at the base</figcaption>
</figure>

<figure>
  <img src="/uploads/frames/snap-video/frame_0004.jpg" alt="Bait bar removed — empty trap zone" style="max-width:100%;border-radius:8px;" />
  <figcaption>Bait bar removed — trap zone clear. Two white bait holder clips are on either side (leave them in place).</figcaption>
</figure>

<h3>Step 2 — Place the Snap Trap</h3>
<ol>
  <li>Place your snap trap in the feeding chamber / hallway of the device</li>
  <li>It should sit flat on the base plate with the trigger facing the entry tunnels</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0006.jpg" alt="Victor snap trap installed in trap zone" style="max-width:100%;border-radius:8px;" />
  <figcaption>Snap trap positioned in the trap zone — trigger plate facing the entry channel</figcaption>
</figure>

<h3>Step 3 — Configure Trap Mode (can do before or after placing the trap)</h3>
<ol>
  <li>Press <strong>SERVICE</strong> — the LED turns <strong>Amber</strong></li>
  <li>Press <strong>TRAP</strong> — the LED begins flashing green</li>
  <li>Once it flashes green, you're done — <em>"the flashing will stop in about another one second"</em></li>
  <li>Close and lock the lid</li>
</ol>

<figure>
  <img src="/uploads/frames/snap-video/frame_0009.jpg" alt="Device configured in trap mode" style="max-width:100%;border-radius:8px;" />
  <figcaption>Trap mode set — the LED sequence confirms the device is now monitoring for trap trigger events</figcaption>
</figure>

<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin:16px 0;">
  <strong>✅ Switchover Checklist</strong>
  <ul style="margin:8px 0 0 0;">
    <li>Bait bar removed (store behind hinges if switching back later)</li>
    <li>Snap trap placed in trap zone — any brand, any size that fits</li>
    <li>SERVICE pressed → Amber LED</li>
    <li>TRAP pressed → Green flashing → stops = done</li>
    <li>Lid closed and locked with green key</li>
    <li>Station updated in OneCloud to Trap Mode</li>
  </ul>
</div>

<h3>Switching Back to Bait Mode</h3>
<p>Reverse the process: open unit, remove snap trap, reload bait bar, press SERVICE → BAIT to recalibrate. The device is fully reversible at any time.</p>`,
      version: '1.1',
    }
  })
  for (const lesson of lessons) {
    const { id, ...rest } = lesson
    await prisma.lesson.upsert({
      where: { id },
      update: { content: rest.content, title: rest.title, summary: rest.summary, version: rest.version, videoUrl: rest.videoUrl || null, videoProvider: rest.videoProvider || null, duration: rest.duration || null },
      create: lesson
    })
  }
  console.log('✅ Modules and lessons created')

  // Apply transcript-enhanced content AFTER the upsert loop so it wins
  console.log('✅ Existing lessons updated with transcript content')
  console.log('\n✅ Seed complete!')
  console.log('\nDemo accounts:')
  console.log('  Admin:   admin@example.internal   / ChangeMe123!')
  console.log('  Tech:    tech@pestsense.com    / Tech1234!')
  console.log('  Manager: manager@pestsense.com / Manager1234!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
