# Source Assets

## Purpose

This file tracks the non-runtime materials currently informing the build.

These assets remain where they are for now because cleanup or relocation should happen only with approval.

## Dashboard Design Inputs

### `Dashboard/DESIGN.md`

- design-system notes for the dashboard direction
- emphasizes cinematic monochrome UI, glassmorphism, asymmetry, and editorial hierarchy

### `Dashboard/code.html`

- reference implementation of the dashboard sample
- useful for section structure and content layout

### `Dashboard/screen.png`

- visual screenshot of the dashboard target state
- used to align composition, spacing, and hierarchy

## Build Plan Inputs

### `Yantra_AI_Build_Plan.pdf`

- broader product vision and long-range strategy
- includes architecture, practice rooms, AI teacher, curriculum, smartboard, and roadmap ideas

### `tmp_yantra_pdf.txt`

- extracted text from the PDF
- helpful for searching sections quickly without reopening the PDF

## How To Use These Assets

- use them as product and design references
- do not treat them as the exact implementation contract
- prefer the live codebase and docs folder as the current source of truth

## Recommended Future Move

When approved, move these materials into a more intentional reference structure:

```text
docs/reference/
|-- dashboard-sample/
`-- build-plan/
```

That move is recommended, but intentionally not performed yet.
