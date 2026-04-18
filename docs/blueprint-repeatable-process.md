# LMS Blueprint: Repeatable Process

This repo is based on a working pattern proved out in PestSense Academy.

## The core pattern

Build the LMS as four connected systems:

1. training platform
2. content-authoring system
3. QA/security review surface
4. multilingual media pipeline

That combination is what made the Academy useful and repeatable.

## Build order

### 1. Core LMS first

Start with:

- auth
- roles
- category/course/module/lesson hierarchy
- lesson progress tracking
- asset uploads
- learner dashboard
- admin content CRUD

Do not start with dubbing, localization, or automation.

### 2. Draft-import workflow

Use raw training recordings as the source material.

Import them into draft courses/lessons, then refine them into polished learner content.

Important rule:

- imported drafts are scaffolding
- polished lessons are a separate step

### 3. Keep learner content separate from QA

Track:

- bugs
- UX issues
- copy issues
- security findings

in a dedicated QA workflow, not inside final learner lessons.

### 4. Add multilingual safely

Keep English as canonical.

Then add:

- locale-prefixed routes
- locale-specific content rows
- locale-specific asset variants
- subtitles first
- dubbing second

### 5. Add quality gates

Use:

- content audits
- asset audits
- browser dogfood checks
- review docs and release gates

## Why this works

This pattern lets us move quickly without losing structure:

- training stays usable
- QA stays evidence-based
- localization stays safe
- AI and humans can collaborate on the same process

## Recommended future extraction work

To make this starter even better, the next round should:

- extract branding into config
- simplify the default seed data
- template the QA board and training-import flow
- create a cleaner project bootstrap path for new domains and new brands
