# Known Project-Specific Items

This starter is derived from PestSense Academy, so some project-specific material is still present.

## Current project-specific areas

- visible `PestSense` brand text in parts of the UI
- current seed data is still heavily PestSense-focused
- some helper/admin pages reference PestSense-specific course slugs
- some scripts assume the current Academy operating environment
- some app copy and metadata still describe pest-control training specifically

## What this means

The repo is reusable, but it is not yet a perfect white-label LMS.

It is best thought of as:

- a working foundation
- a strong pattern library
- a starter implementation that still needs a rebrand pass before use on another project

## Recommended cleanup order for a new project

1. Update environment values and domain settings.
2. Replace visible branding in layout, auth pages, and sidebar/header.
3. Replace seed content with project-specific categories/courses/modules/lessons.
4. Remove or rewrite any manager/admin helper pages tied to old slugs.
5. Replace screenshots, videos, and asset references.
6. Rebuild QA board seed data for the new project instead of carrying old findings forward.

## Why we are keeping it this way for now

This repo is meant to get reuse started quickly.

A full debranding/productization pass is a second stage. Doing that properly means:

- extracting branding to configuration
- extracting seed content to templates
- converting project-specific assumptions into feature flags or documented extension points

That is worth doing, but it is a bigger cleanup than just getting the reusable repo online.
