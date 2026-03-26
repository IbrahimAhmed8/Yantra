# Marketing Site

## Route

- `/`
- Entry file: `app/page.tsx`
- Main implementation: `src/features/marketing/MarketingLandingPage.tsx`

## Purpose

The marketing site is the public-facing narrative layer of Yantra.

It is currently responsible for:

- explaining the platform
- positioning the product for learners and institutions
- driving waitlist and demo-style intent
- providing entry points into the AI chat experience

## Main Sections

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

- still implemented in one large feature file
- content is static
- no CMS or structured content source
- no routing to deeper marketing pages yet

## Recommended Future Work

- split `src/features/marketing/MarketingLandingPage.tsx` into smaller section files
- move static content into dedicated data/config files
- add a direct dashboard link when appropriate
- add deeper public pages if product messaging expands
