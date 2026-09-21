---
name: BuildSpec
description: A private automotive build archive shaped like a precise editorial workshop.
colors:
  burgundy: "#810f31"
  burgundy-deep: "#5d0b24"
  muted-rose: "#af4963"
  warm-surface: "#dedad4"
  neutral-scrollbar: "#8b8782"
  canvas: "#e8e7e2"
  vehicle-photo-bg: "#e8e7e2"
  paper: "#f8f7f3"
  ink: "#151515"
  copy: "#4d4d4d"
  rule: "#c8c7c2"
  soft-rose: "#f2e4e8"
  focus: "#810f31"
  success: "#34704a"
  purchased: "#5f5956"
  workshop: "#17191c"
typography:
  display:
    fontFamily: '"Chivo Mono", "Courier New", monospace'
    fontSize: "clamp(3.1rem, 8vw, 7.25rem)"
    fontWeight: 560
    lineHeight: 0.87
    letterSpacing: "-0.045em"
  cover-title:
    fontFamily: '"Chivo Mono", "Courier New", monospace'
    fontSize: "clamp(2.5rem, 5vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  body:
    fontFamily: '"Chivo Mono", "Courier New", monospace'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Chivo Mono", "Courier New", monospace'
    fontSize: "0.65rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  square: "0"
  pill: "999px"
  image: "clamp(24px, 3vw, 44px)"
  photo-small: "24px"
spacing:
  1: "8px"
  2: "16px"
  3: "24px"
  4: "32px"
  5: "40px"
  6: "48px"
  8: "64px"
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.burgundy}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "46px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "46px"
  field:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "13px 0"
    height: "52px"
  showcase-cover:
    backgroundColor: "#e2e3e1"
    textColor: "#171716"
    rounded: "{rounded.image}"
    padding: "32px 24px 24px"
---

# Design System: BuildSpec

## Overview

**Creative North Star: "The Cover Drive"**

BuildSpec is a private automotive archive with the discipline of a workshop ledger and the presence of an enthusiast magazine. It pairs oversized Chivo Mono type with documentary vehicle photography, hard editorial rules, restrained utility labels, and tabular figures. Burgundy marks intent and achievement; near-black provides mechanical authority; warm paper and neutral gray surfaces keep dense build data calm and legible.

The operating garage remains direct and task-oriented. Completed Builds is its celebratory expression: each deliberately published vehicle becomes a full automotive cover, not a generic dashboard card. The photograph carries the first viewport, while the lower dossier states identity, completion date, installed count, paid total, and one unmistakable action.

**Key Characteristics:**

- Mobile-first, image-led automotive storytelling.
- Capsule controls, rounded photographic windows, hard rules, and flat tonal surfaces.
- Oversized display type balanced by compact uppercase utility labels.
- Burgundy used for committed actions and completion signals, not ambient decoration.
- Costs and counts use tabular numerals and remain scannable at a glance.

## Colors

The palette feels like burgundy paint, black workshop steel, warm concrete, and archival paper.

### Primary

- **Build Burgundy:** The decisive accent for primary actions, completed-build ribbons, progress, selection, and the rare moment that must carry brand ownership.
- **Deep Burgundy:** The pressed and hover state for primary actions; it should read as the same material becoming denser.

### Secondary

- **Muted Rose:** A supporting accent for secondary branded emphasis, never a competing call to action.
- **Warm Surface:** A beige-gray informational field for incomplete completion states, placeholders, and quiet utility surfaces.
- **Neutral Scrollbar:** A restrained warm gray for browser chrome and supporting detail.

### Neutral

- **Workshop Ink:** Primary text, mastheads, dark readiness panels, and structural contrast.
- **Archive Canvas:** The principal page ground, intentionally warmer and denser than pure white.
- **Clean Paper:** High-contrast text on dark surfaces and the cleanest elevated reading surface.
- **Graphite Copy:** Explanatory text that must recede without losing readability.
- **Mechanical Rule:** Borders and dividers; structure is drawn, not floated.

**The Burgundy Is a Decision Rule.** Reserve burgundy for actions, active progress, and completed-build identity. A screen should never become a field of red decoration.

**The Cover Stays Literal Rule.** Published cover cards keep a fixed near-black-on-pale-paper palette so the photographic archive remains consistent even when the surrounding app uses dark mode.

## Typography

**Display Font:** Chivo Mono (with Courier New and monospace fallbacks)  
**Cover Title Font:** Chivo Mono  
**Body and Label Font:** Chivo Mono

**Character:** Chivo Mono gives the entire archive a precise, architectural voice inspired by workshop labels and editorial specification sheets. Weight, scale, and spacing—not a font-family change—separate display headlines, operational copy, and utility labels.

### Hierarchy

- **Display:** Extra-large, medium-heavy, tightly tracked, and compressed vertically. Use for page identity and vehicle heroes, with a short measure rather than a full-width sentence.
- **Cover Title:** Bold and tightly set. Use only for the year/make/model identity inside the Completed Builds cover.
- **Headline:** Strong Chivo Mono with compact line-height for section and card titles.
- **Body:** Regular Chivo Mono with a generous reading line-height; descriptive blocks stay near 66 characters wide.
- **Label:** Bold uppercase Chivo Mono with expanded tracking for statuses, metadata, and small operational captions.
- **Figures:** Use tabular numerals for pesos, percentages, dates, and counts so changing data does not jitter.

**The Two Speeds Rule.** Headlines are oversized and compressed; labels are tiny, uppercase, and tracked. Avoid an undifferentiated middle-sized hierarchy.

## Layout

The shared desktop content shell is centered to a maximum width of 1160px with 24px side gutters. The header uses a wider independent rail up to 1600px with 48px gutters, allowing the brand and utility cluster to occupy the screen edges while navigation remains mathematically centered. Spacing follows an 8px base rhythm, using 16–32px for component interiors and 48–104px for section separation. Rules align across headings, filters, statistics, forms, and lists to form a visible editorial grid.

The oversized BuildSpec footer wordmark is optically centered within the content rail at every breakpoint; it does not use negative side offsets.

At 980px, dense statistics and the completion workflow simplify their columns. At 767px, the product becomes intentionally phone-first: gutters contract to 16px, multi-column forms and cards stack, secondary filters disclose on demand, actions become full-width where useful, and the add-modification action may remain thumb-reachable at the bottom edge. At 430px, dense statistic and action grids resolve to one column.

The Completed Builds showcase is the signature responsive exception. On a 390px phone, the standard header is followed immediately by a dominant portrait photograph; introductory copy becomes visually hidden, cards run edge to edge, and the pale information band contains every fact and a full-width View Build action without horizontal scrolling. On wider screens, the introduction returns and covers form a two-column editorial grid with generous vertical gaps.

**The Photograph Leads Rule.** On the phone showcase, navigation remains visible but no gallery heading may delay the first final-build image.

**The Thumb Has the Last Word Rule.** The primary next step must be at least 44px tall, full-width when the phone layout benefits, and reachable without hover.

## Elevation & Depth

BuildSpec is flat by default. Depth comes from image contrast, tonal blocks, overlays, and one-pixel rules rather than card shadows. Photography may receive a dark gradient when text sits over it; operational surfaces separate through borders and background shifts. Focus uses a clear external outline rather than glow.

**The No Floating Paper Rule.** Do not add generic soft shadows to cards, forms, or showcase covers. If hierarchy is weak, improve scale, tone, spacing, or rules first.

## Shapes

BuildSpec mixes two deliberate geometries. Actions and compact utility controls use full capsules for a distinctive, thumb-friendly silhouette. Vehicle imagery uses large, generous corners that make photographs feel framed rather than dropped into generic cards. Data fields, rules, badges, progress bars, and structural containers remain square to preserve the mechanical publication character.

Borders are usually one-pixel rules in ink or the mechanical neutral. Images are clipped to intentional aspect ratios: the mobile cover uses a tall 390:422 frame, working modification photos use 4:3, and garage imagery adapts between cinematic 16:9 and practical 4:3 crops.

Garage vehicle cutouts sit on the active Archive Canvas: beige (`#e8e7e2`) in light mode and workshop black (`#181817`) in dark mode. Transparent PNG and WebP pixels reveal the matching surface automatically, and letterboxed space uses the same theme-aware color. Do not sample or infer a background from the uploaded image.

**The Soft Frame, Hard Data Rule.** Round the controls people press and the memories they view; keep the data structure underneath crisp and square.

## Components

### Buttons

- **Shape:** Full capsule with a one-pixel border and a minimum 46px height; showcase actions increase to 50px.
- **Primary:** Transparent with burgundy text and rule, bold and centered. Hover fills with the same burgundy and reverses the text to white; active state reduces opacity.
- **Secondary:** Transparent with an ink rule; hover fills with the same ink and reverses the text to paper.
- **Focus / Disabled:** A three-pixel burgundy focus outline sits outside the control. Disabled controls retain their footprint and fall to reduced opacity.

### Status Badges

- **Style:** Square, compact, uppercase, and outlined in their status color. Text always names the state; color is never the only signal.
- **Completed Build Ribbon:** A solid burgundy label overlaps the join between the final photograph and paper dossier, making completion feel earned rather than ornamental.

### Cards / Containers

- **Garage Cards:** Flat canvas surfaces structured by a generously rounded photograph, progress line, status counts, and a full-width capsule action.
- **Showcase Cover:** A dominant rounded portrait image over a pale paper dossier. Identity is the largest text; date follows; installed parts and paid total share a ruled two-column ledger; View Build closes the card.
- **Completion Panel:** Warm neutral while requirements remain; near-black when the vehicle is eligible. The tonal change communicates readiness, while checklist copy preserves the exact reason.

### Inputs / Fields

- **Style:** Transparent square fields with a single ink underline, 52px minimum height, and labels above.
- **Focus / Error:** The shared burgundy external focus outline remains visible. Invalid fields shift the underline and surface to the error palette and include readable error text.
- **Photo Upload:** Show a real preview or explicit empty preview, then a labeled Choose or take photo / Replace photo control. Preserve the local-private nature of the memory; never imply a public cloud gallery.

### Navigation

The sticky near-black header places Garage and Showcase at left, the BuildSpec wordmark at the true desktop center, and build totals plus the capsule theme control at right. The wordmark stands alone without a monogram tile. A restrained burgundy underline identifies the active desktop destination. On phones, BuildSpec returns to the practical left position and the header resolves into a compact masthead plus a quieter totals row; Garage and Showcase move into a dedicated right-side navigation drawer opened by a circular menu control. The drawer contains navigation only, marks the active destination in burgundy, and keeps its theme and menu controls at identical 44px dimensions.

### Completed Build Publishing

Publishing is a deliberate owner action, never an automatic consequence of reaching 100%. A vehicle becomes eligible only when it has at least one tracked modification, every tracked modification is installed, and a final portrait exists. The checklist must show those gates plainly. Publish to Showcase and Remove from Showcase are explicit reversible actions; after publishing, Open Showcase provides the immediate path to the finished memory.

## Do's and Don'ts

### Do:

- **Do** let the final vehicle photograph dominate the first mobile showcase viewport.
- **Do** preserve capsule actions, rounded photo frames, hard data rules, tabular figures, and strong type contrast across new surfaces.
- **Do** keep completion eligibility, final-photo status, and publishing status visible as separate facts.
- **Do** retain keyboard focus, text status labels, 44px minimum touch targets, and reduced-motion behavior.
- **Do** make mobile composition a designed state, not merely a collapsed desktop grid.

### Don't:

- **Don't** round every container indiscriminately; reserve softness for controls and photographic memories.
- **Don't** publish automatically when the final modification becomes installed or when a photo is uploaded.
- **Don't** expose private uploads as a public feed, social profile, or cloud-sharing promise.
- **Don't** use burgundy as broad background decoration or allow pale-blue utility surfaces to compete with the primary action.
- **Don't** hide essential navigation, build facts, or publishing controls behind hover-only behavior.
