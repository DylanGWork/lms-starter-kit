import { PrismaClient, ContentStatus, Role } from '@prisma/client'
import { slugify } from '../src/lib/utils'

const prisma = new PrismaClient()

const COURSE_SLUG = 'rodenticides-for-baited-devices'
const LESSON_SLUG = 'add-rodenticides-to-company-products'
const COURSE_ROLES: Role[] = [Role.SITE_MANAGER, Role.BUSINESS_ADMIN, Role.SUPER_ADMIN]
const TAGS = ['software', 'admin', 'bait', 'rodenticide', 'products']

const lessonContent = `
<h2>What This Lesson Solves</h2>
<p>Customers usually discover this step when they try to add bait to a device and the product is missing. In the current PestSense flow, the bait or rodenticide product must already exist in <strong>Company Products</strong> before it can be used during device servicing.</p>

<blockquote><p>If your team cannot pick the bait later during servicing, check <strong>App Settings &gt; Manage Products</strong> first. The missing prerequisite is usually here.</p></blockquote>

<h2>Where To Do This</h2>
<ul>
  <li><strong>Platform:</strong> <code>https://app.pestsense.com</code></li>
  <li><strong>Menu path:</strong> <strong>App Settings</strong> &gt; <strong>Manage Products</strong></li>
  <li><strong>Outcome:</strong> the bait product is available in <strong>Company Products</strong> for later device baiting</li>
</ul>

<h2>Short Walkthrough Video</h2>
<p>The guided clip below focuses only on the prerequisite setup: checking <strong>Company Products</strong>, creating a missing bait product, choosing the rodenticide active ingredient, and handling the generic validation warning if it appears.</p>

<h2>Step 1: Confirm The Product Is In Company Products</h2>
<p>Start in <strong>Manage Products</strong> and check the <strong>Company Products</strong> list on the right-hand side. If the bait or rodenticide is not on the right, it will not be available when the team tries to add bait to a device later.</p>
<figure style="margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;">
  <img src="/course-guides/rodenticide/rodenticide-step-01-company-products.jpg" alt="Manage Company Products screen showing the company product list and transfer arrows" style="display:block;width:100%;height:auto;" />
</figure>

<h2>Step 2: Create The Missing Product If Needed</h2>
<p>If the product is missing, use the <strong>+</strong> button to create it. Complete the product name and the required setup fields before saving.</p>
<figure style="margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;">
  <img src="/course-guides/rodenticide/rodenticide-step-02-create-product.jpg" alt="New Product form used to create a missing bait product" style="display:block;width:100%;height:auto;" />
</figure>

<h2>Step 3: Choose The Active Ingredient Carefully</h2>
<p>This is the most important product detail for customer teams. Use the <strong>Active Ingredient</strong> list to match the real rodenticide used in the bait. If this is wrong, the product record may be misleading even if it saves successfully.</p>
<figure style="margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;">
  <img src="/course-guides/rodenticide/rodenticide-step-03-active-ingredient.jpg" alt="Active Ingredient dropdown used to select the rodenticide for the bait product" style="display:block;width:100%;height:auto;" />
</figure>

<h2>Step 4: Save And Watch For Validation Problems</h2>
<p>The current interface may show a generic <strong>Please fill out all required fields</strong> alert rather than pointing to the missing field directly. If that happens, re-check the starred fields, the active ingredient area, and any percentage/expiry values before trying again.</p>
<figure style="margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;">
  <img src="/course-guides/rodenticide/rodenticide-step-04-validation-alert.jpg" alt="Generic validation alert shown after trying to save the product form" style="display:block;width:100%;height:auto;" />
</figure>

<h2>Step 5: Confirm The Product Is Ready For Use</h2>
<p>After the product saves cleanly, make sure it is available to your company. That final confirmation is what unlocks the product for later bait entry during device servicing.</p>
<figure style="margin:20px 0;overflow:hidden;border:1px solid #e5e7eb;border-radius:24px;background:#ffffff;">
  <img src="/course-guides/rodenticide/rodenticide-step-05-ready-to-save.jpg" alt="Completed bait product form ready to save" style="display:block;width:100%;height:auto;" />
</figure>

<h2>Customer Checklist</h2>
<ol>
  <li>Open <strong>App Settings</strong> and go to <strong>Manage Products</strong>.</li>
  <li>Check whether the bait or rodenticide already appears in <strong>Company Products</strong>.</li>
  <li>If it does not, create the product and complete the required fields.</li>
  <li>Choose the correct <strong>Active Ingredient</strong>.</li>
  <li>Save the record and confirm the product is available to your company.</li>
  <li>Only then move on to device baiting.</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
  <li><strong>The product will not save:</strong> review all starred fields because the current alert is generic.</li>
  <li><strong>The product saved but still cannot be used later:</strong> confirm it appears in <strong>Company Products</strong>, not only in the wider product library.</li>
  <li><strong>Not sure what to choose for Active Ingredient:</strong> match the actual rodenticide being used rather than guessing from the bait name.</li>
</ul>

<blockquote><p>Customer perspective fix: the real goal is not just “create a product”. The real goal is “make sure the correct bait product is available to the company before anyone tries to add bait to a device.”</p></blockquote>
`

async function ensureTags(lessonId: string) {
  await prisma.lessonTag.deleteMany({ where: { lessonId } })

  for (const tagName of TAGS) {
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

async function main() {
  const softwareCategory = await prisma.category.findUnique({
    where: { slug: 'software' },
  })

  if (!softwareCategory) {
    throw new Error('Software category not found')
  }

  const courseTitle = 'Add Rodenticides To Company Products'
  const courseDescription = 'Customer admin guide for making bait and rodenticide products available before staff try to add bait to devices.'

  const course = await prisma.course.upsert({
    where: { slug: COURSE_SLUG },
    update: {
      title: courseTitle,
      description: courseDescription,
      estimatedMins: 8,
      status: ContentStatus.PUBLISHED,
      sortOrder: 4,
    },
    create: {
      categoryId: softwareCategory.id,
      title: courseTitle,
      slug: COURSE_SLUG,
      description: courseDescription,
      estimatedMins: 8,
      status: ContentStatus.PUBLISHED,
      sortOrder: 4,
    },
  })

  await prisma.courseRole.deleteMany({ where: { courseId: course.id } })
  await prisma.courseRole.createMany({
    data: COURSE_ROLES.map(role => ({ courseId: course.id, role })),
    skipDuplicates: true,
  })

  const existingModule = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { sortOrder: 'asc' },
  })

  const module = existingModule
    ? await prisma.module.update({
        where: { id: existingModule.id },
        data: {
          title: 'Module 1: Company Product Prerequisites',
          description: 'Prepare bait and rodenticide products before staff try to add bait to devices.',
          status: ContentStatus.PUBLISHED,
          sortOrder: 1,
        },
      })
    : await prisma.module.create({
        data: {
          courseId: course.id,
          title: 'Module 1: Company Product Prerequisites',
          description: 'Prepare bait and rodenticide products before staff try to add bait to devices.',
          status: ContentStatus.PUBLISHED,
          sortOrder: 1,
        },
      })

  const lesson = await prisma.lesson.upsert({
    where: { slug: LESSON_SLUG },
    update: {
      moduleId: module.id,
      title: 'Required Before Bait Can Be Added To Devices',
      summary: 'Before bait can be added to devices, the bait or rodenticide product must already be available in Company Products.',
      content: lessonContent,
      videoUrl: '/course-guides/rodenticide/rodenticide-bait-setup-demo.mp4',
      videoProvider: 'local',
      duration: 130,
      status: ContentStatus.PUBLISHED,
      version: '1.1',
      sortOrder: 1,
      lastReviewedAt: new Date(),
    },
    create: {
      moduleId: module.id,
      title: 'Required Before Bait Can Be Added To Devices',
      slug: LESSON_SLUG,
      summary: 'Before bait can be added to devices, the bait or rodenticide product must already be available in Company Products.',
      content: lessonContent,
      videoUrl: '/course-guides/rodenticide/rodenticide-bait-setup-demo.mp4',
      videoProvider: 'local',
      duration: 130,
      status: ContentStatus.PUBLISHED,
      version: '1.1',
      sortOrder: 1,
      lastReviewedAt: new Date(),
    },
  })

  await ensureTags(lesson.id)

  console.log(`Published course ${course.title}`)
  console.log(`Lesson route: /lessons/${lesson.id}`)
  console.log(`Course route: /learn/software/${course.slug}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
