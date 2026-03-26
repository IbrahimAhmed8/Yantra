# Marketing Site

## Route

- `/`
- Entry file: `app/page.tsx`
- Main implementation: `src/App.tsx`

## Purpose

The marketing site is the public-facing narrative layer of Yantra.

It is currently responsible for:

- explaining the platform
- positioning the product for learners and institutions
- driving waitlist and demo-style intent
- providing entry points into the AI chat experience

## Main Sections In `src/App.tsx`

- navigation
- hero
- ticker
- about
- stats
- academics/capabilities
- gallery/use cases
- contact/access CTA
- footer

## Current Strengths

- strong branded visual identity
- clear monochrome cinematic design language
- integrated AI CTA flow
- clear top-level product framing

## Current Weaknesses

- implemented in one large component file
- content is static
- no CMS or structured content source
- no routing to deeper marketing pages yet

## Recommended Future Work

- split `src/App.tsx` into feature sections
- move static content into dedicated data/config files
- add a direct dashboard link when appropriate
- add deeper public pages if product messaging expands
