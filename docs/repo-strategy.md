# Repo Strategy

## Purpose

This repo is the reusable LMS foundation extracted from the working PestSense Academy approach.

It is intended to become the place where we keep:

- the LMS platform architecture
- the authoring/admin model
- the training import workflow
- the QA review model
- the localization/media pipeline

Then, for each real project, we either:

1. fork this starter repo, or
2. clone/copy it into a new project-specific repo and rebrand it

## Why A Separate Repo Is The Right Move

Yes, this is the right way to approach it.

Benefits:

- other VMs can pull a known-good base quickly
- AI can work from one reusable context instead of reconstructing the system every time
- project-specific branding/content can live in project repos instead of cluttering the core pattern
- fixes to the reusable LMS foundation can be shared forward

## Recommended Reuse Pattern

### Core repo

Use this repo as:

- the LMS starter
- the documentation source
- the architecture pattern library

### Project repo

For each actual deployment:

- copy/fork this repo
- rename it for the target project
- update branding, seed content, URLs, glossary, screenshots, and media
- keep the core platform and review patterns unless there is a good reason to change them

## What Belongs In The Starter

- generic infrastructure
- generic content model
- admin workflows
- training import helpers
- localization scaffolding
- QA workflows
- docs and checklists

## What Should Stay Project-Specific

- visual brand
- product glossary
- course seed data
- screenshots and videos
- project QA findings
- domain and reverse proxy details
