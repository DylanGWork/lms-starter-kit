# Adoption Checklist

Use this when turning the starter into a real project LMS.

## 1. Project identity

- Choose the project name.
- Choose the learner-facing hostname.
- Replace visible brand text in the login page, layout, sidebar, header, and metadata.
- Set support/admin contact details in `.env`.

## 2. Environment and deploy

- Copy `.env.example` to `.env`.
- Set secure values for `POSTGRES_PASSWORD` and `NEXTAUTH_SECRET`.
- Set `NEXTAUTH_URL` and `NEXTAUTH_URL_INTERNAL`.
- Confirm Docker service names, ports, and reverse proxy plan.
- Bring the stack up and verify login works.

## 3. Content model

- Replace seed categories.
- Replace seed courses, modules, and lessons.
- Remove project-specific helper links tied to old course slugs.
- Review dashboard copy so it matches the new product.

## 4. Media and uploads

- Replace screenshots and course images.
- Replace videos and subtitle assets.
- Review upload paths and storage expectations.
- Decide whether local storage is enough or whether object storage is needed later.

## 5. QA and review

- Clear inherited QA findings.
- Seed a fresh QA board for the new project.
- Verify admin review flows still make sense for the new team.
- Run a first-pass dogfood review before inviting users in.

## 6. Localization

- Decide which locales are actually needed for v1.
- Keep English as the canonical source.
- Publish only reviewed locale rows and asset variants.
- Verify lessons, screenshots, subtitles, and videos fall back cleanly to English.

## 7. Automation

- Update `scripts/run-training-import.sh` defaults for the new environment.
- Confirm draft import paths and upload volume names.
- Disable automation you do not need yet rather than carrying it blindly.

## 8. Final pre-launch check

- Test login, browse, lessons, search, and admin access.
- Test uploads and asset rendering.
- Test at least one draft-import run if you plan to use training ingestion.
- Document the deployment and recovery steps for the new project.
