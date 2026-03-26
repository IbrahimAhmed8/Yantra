# Design System Strategy: High-End Editorial AI

## 1. Overview & Creative North Star
**The Creative North Star: "The Obsidian Library"**

This design system is engineered to feel like a high-end cinematic experience rather than a typical SaaS dashboard. The objective is to facilitate deep learning through a "quiet" interface that recedes into the background, leaving only the content and the AI interaction in focus. 

By leveraging a monochrome palette and generous spacing, we create a sense of digital "luxury." We break the standard grid template through **intentional asymmetry**: large-scale display typography (Space Grotesk) is often offset or overlapped by glassmorphic containers, creating a sense of depth and physical presence. This is not just a UI; it is an immersive environment for the mind.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, absolute darkness, accented by pure light.

### The "No-Line" Rule
Traditional 1px solid borders for sectioning are strictly prohibited. They clutter the visual field and feel "engineered" rather than "designed." Instead, use:
- **Tonal Transitions:** Defining a section by shifting from `surface` (#131313) to `surface_container_low` (#1b1b1b).
- **Negative Space:** Using the `24` or `20` spacing tokens to separate concepts.

### Surface Hierarchy & Nesting
Think of the UI as layers of dark obsidian and frosted glass.
- **Base:** `surface` (#131313) or absolute black (#000000) for hero sections.
- **Secondary Surfaces:** `surface_container` (#1f1f1f) for nested content blocks.
- **Glassmorphism:** For floating elements (Modals, Hover states, Chat bubbles), use a semi-transparent `surface_container_highest` with a `backdrop-blur` of 20px-40px.

### Signature Textures
To provide a "soul" to the monochrome look, use a subtle radial gradient behind primary CTA areas. Transition from `primary` (#ffffff) to a 10% opacity white to create a soft, smoky glow that mimics ambient light hitting a screen.

---

## 3. Typography
The typographic system is the voice of the platform: authoritative, modern, and precise.

- **Display & Headlines (Space Grotesk):** High-contrast, bold, and condensed. Use `display-lg` for primary hero statements. The wide tracking and verticality of the font convey a futuristic, cinematic tone.
- **Body (Inter):** The workhorse. Used for all long-form educational content. It provides a neutral, highly readable counterpoint to the aggressive display type.
- **Labels & Microcopy (Space Grotesk - Monospaced Style):** Used for technical data, AI status, and categories. 
    - **Rule:** Labels must be Uppercase with a letter-spacing (tracking) of `0.1em` to `0.2em`.

---

## 4. Elevation & Depth
In a cinematic dark UI, shadows must be felt, not seen.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_highest` card sitting on a `surface_dim` background creates a natural lift.
- **Ambient Shadows:** When a floating effect is required, use a shadow with a blur of `64px` and an opacity of `8%`, tinted with the `on_surface` color.
- **The Ghost Border Fallback:** If a container needs more definition (e.g., in a complex glassmorphic stack), use the `outline_variant` token at **15% opacity**. This creates a "hairline" edge that catches light like the bevel of a lens.
- **Glassmorphism:** All primary interactive cards should utilize a blur effect. This allows the background fluid/smoky effects to bleed through, ensuring the UI feels integrated into the environment.

---

## 5. Components

### Buttons
- **Primary:** Solid `primary` (#ffffff) with `on_primary` (#1a1c1c) text. Use the `xl` (3rem) corner radius.
- **Secondary:** Transparent background with a "Ghost Border" (outline_variant at 20%).
- **Interaction:** On hover, primary buttons should have a soft `surface_bright` outer glow.

### Cards & Lists
- **Rule:** No divider lines.
- **Execution:** Separate list items using the `3` or `4` spacing scale. For cards, use `surface_container_low` and the `lg` (2rem) border radius.
- **Editorial Card:** In hero sections, use a large `display-sm` number (e.g., "01") in `surface_variant` behind the title to create an editorial, numbered-list feel.

### Input Fields
- **Style:** Minimalist. A bottom border using `outline_variant` at 40%.
- **Focus State:** The border transitions to `primary` (white), and the label (monospaced) shifts upward with 0.15s ease-in-out.

### Additional Component: The "AI Pulse"
- A small, circular element (8px) using the `primary` token with a persistent, soft breathing animation (opacity 40% to 100%). Use this next to "AI-Native" labels to signify an active system.

---

## 6. Do's and Don'ts

### Do
- **Use "Breathing Room":** If you think there is enough space, add one more level from the spacing scale.
- **Layer with Purpose:** Only use Glassmorphism for elements that literally "float" over other content.
- **Scale Typography:** Feel free to use `display-lg` for impact, even if the text is short.

### Don't
- **No Pure Grey Shadows:** Shadows should never look like "mud." Use low-opacity whites or transparent tints.
- **No Default Grids:** Avoid the "3-column card row" whenever possible. Try overlapping cards or asymmetrical widths (e.g., a 60/40 split).
- **No High-Contrast Borders:** If a border looks like a "line," it is too dark. It should look like a "reflection."
- **No Generic Icons:** Use ultra-thin (1pt or 1.5pt) monochrome stroke icons only. Avoid filled, "bubbly" icons.