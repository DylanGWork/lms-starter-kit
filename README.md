# LMS Starter Kit

Reusable learning-management starter derived from the working PestSense Academy codebase and operating process.

This repo is meant to make it easier to:

- pull a proven LMS foundation onto another VM
- stand up a training/admin platform quickly
- reuse the authoring, QA, localization, and media workflow we already validated
- give AI and humans the same clean repo/context to build from

Built with:

- Next.js 14
- PostgreSQL
- Prisma
- NextAuth
- Docker Compose

## What This Repo Is

This is a **starter repo**, not a fully generic white-label product yet.

It already contains a working LMS platform shape, including:

- learner dashboard
- course/category/module/lesson model
- admin content system
- asset upload flow
- training-draft import tooling
- QA review/admin workflow
- multilingual/localization plumbing
- subtitle and dubbed-video support

It is derived from PestSense Academy, so some project-specific branding, demo content, and product language still exist in the codebase. That is intentional for v1 of this starter: the goal is reuse with a clear extraction path, not pretending all the project-specific work has magically disappeared.

## Best Use Of This Repo

Use this when you want to launch a project-specific LMS quickly by:

1. cloning this repo
2. changing the branding, seed content, and domain values
3. pruning any project-specific modules you do not need
4. then layering in your own screenshots, videos, QA board, and multilingual content

For the repeatable operating model behind this repo, read:

- [docs/blueprint-repeatable-process.md](docs/blueprint-repeatable-process.md)
- [docs/repo-strategy.md](docs/repo-strategy.md)
- [docs/known-project-specifics.md](docs/known-project-specifics.md)
- [docs/adoption-checklist.md](docs/adoption-checklist.md)
- [docs/new-project-bootstrap.md](docs/new-project-bootstrap.md)

## Quick Start

### 1. Clone to a VM

```bash
git clone <your-repo-url>
cd lms-starter-kit
cp .env.example .env
```

### 2. Set core environment values

Update at minimum:

- `POSTGRES_PASSWORD`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_URL_INTERNAL`
- `AUTH_TRUST_HOST`

### 3. Start the stack

```bash
docker compose up -d --build
```

This will:

1. start PostgreSQL
2. build the app
3. run Prisma setup/migrations
4. seed starter content
5. expose the app on port `3000`

### 4. Open the platform

Browse to:

- `http://YOUR-VM-IP:3000`

Then sign in with the demo accounts defined by the current seed data.

## Current State Of Reuse

### Already reusable

- platform architecture
- Docker-based deployment
- auth/roles/content hierarchy
- admin authoring model
- QA board pattern
- localization architecture
- training-video import pattern
- media/subtitle/dub scaffolding

### Still project-specific

- visible PestSense branding in parts of the UI
- current demo seed content
- some project-specific course slugs and help references
- some scripts and text geared toward the Academy’s current operating environment

That is documented here:

- [docs/known-project-specifics.md](docs/known-project-specifics.md)

## Suggested Reuse Process

1. Keep this repo as the reusable LMS foundation.
2. Create one repo per real deployment or brand on top of it.
3. Rebrand UI, seed content, uploads, and glossary per project.
4. Keep QA, localization, and training-import patterns intact unless you have a strong reason to simplify them.

## Project Structure

```text
lms-starter-kit/
├── docker-compose.yml
├── .env.example
├── nginx/
├── app/
│   ├── Dockerfile
│   ├── prisma/
│   ├── scripts/
│   └── src/
├── docs/
└── scripts/
```

## Deployment Notes

### Local VM

The simplest path is:

- app on port `3000`
- PostgreSQL in Docker
- optional reverse proxy later

### Reverse proxy later

You can front the app with Caddy or nginx once the project-specific hostname is chosen.

Example Caddy block:

```caddy
training.example.internal {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3000
}
```

## Backup Basics

### Database

```bash
docker exec lms_starter_db pg_dump -U lms lms_platform > backup_$(date +%Y%m%d).sql
```

### Uploaded files

```bash
docker run --rm -v lms_starter_uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

## Common Commands

```bash
docker compose up -d
docker compose down
docker compose logs -f app
docker compose logs -f postgres
docker compose up -d --build app
```

## Recommended Next Step

If you want this repo to become a truly generic product starter, the next pass should focus on:

1. removing project-specific seed content
2. extracting branding into a config/theme layer
3. renaming project-specific slugs and helper pages
4. converting the best parts of the PestSense workflow into clean templates

---

## AI Content Pipeline (Future)

The database schema already includes:
- `Lesson.transcript` — for storing video transcripts
- `Lesson.aiSummary` — for AI-generated summaries
- `Lesson.aiFaqDraft` — JSON array of `{q, a}` pairs
- `Asset.isSourceRecording` — flag for raw training recordings
- `AIProcessingJob` model — for tracking processing jobs

When you're ready to add AI processing:
1. Create a processor service that reads `AIProcessingJob` records
2. Call your preferred AI services for transcription, summaries, and FAQs
3. Write results back to the relevant `Lesson` or `Asset` fields
4. The lesson editor will surface these fields automatically

---

## Technology

- **Frontend/Backend:** Next.js 14 (App Router)
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **Auth:** NextAuth.js (JWT sessions)
- **Styling:** Tailwind CSS
- **Fonts:** Geologica, Plus Jakarta Sans, Audiowide (Google Fonts)
- **Deployment:** Docker Compose

---

## Support

Contact your internal admin or platform owner for help with this deployment.
