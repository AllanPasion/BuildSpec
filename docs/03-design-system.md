# 3. Design System — Current BuildSpec

This file records the visual system implemented in `client/src/index.css` and `client/src/App.css`. The site uses an automotive editorial style with large monospace headings, prominent vehicle photography, fine rules, and restrained burgundy accents.

## Styling and tokens

The client uses plain CSS, shared class names, and CSS custom properties. `index.css` defines global and theme tokens; `App.css` styles page components and responsive layouts. The earlier light-blue palette and system sans-serif proposal are no longer the implemented design.

| Token | Light | Dark | Main use |
| --- | --- | --- | --- |
| `--color-primary` | `#810f31` | `#c75b79` | Brand accent, progress, primary actions. |
| `--color-primary-deep` | `#5d0b24` | `#a63f5f` | Deeper brand accent. |
| `--color-accent` | `#af4963` | `#dc8199` | Supporting accent. |
| `--color-canvas` | `#e8e7e2` | `#181817` | Page background. |
| `--color-paper` | `#f8f7f3` | `#242321` | Contrasting surface. |
| `--color-ink` | `#151515` | `#f2f0ea` | Primary text and rules. |
| `--color-copy` | `#4d4d4d` | `#bbb8b0` | Supporting copy. |
| `--color-line` | `#c8c7c2` | `#484742` | Dividers and progress tracks. |
| `--color-surface-muted` | `#dedad4` | `#2b2927` | Archive panels and image surfaces. |
| `--color-success` | `#34704a` | `#6eae82` | Installed action and positive feedback. |
| `--color-danger` | `#9d2630` | `#e16f78` | Delete, errors, invalid fields. |
| `--color-focus` | `#810f31` | `#e08aa3` | Keyboard focus outline. |

Additional tokens cover purchased, warning, rose-soft and error-soft surfaces, photo backgrounds, and the dark workshop panel. Status and progress information always includes text or numbers. The theme toggle saves `light` or `dark` in local storage; the initial theme follows the saved value or system preference.

## Typography and layout

The implemented display and body family is **Chivo Mono**, loaded from Google Fonts, with Courier New and generic monospace fallbacks. Headings use tight letter spacing and responsive `clamp()` sizes. The main page heading scales from about 3.1rem to 7.25rem; body copy uses roughly 1rem with a 1.65 line height. Small uppercase labels distinguish counts, metadata, and section cues. Currency is formatted as PHP with `en-PH` and no displayed fractional digits.

The content width token is `1160px`. Main content and footer are centered within it. At wider sizes the page uses 24px side gutters; at phone sizes it uses 16px. Spacing tokens use an 8px base: `--space-1` through `--space-6` represent 8, 16, 24, 32, 40, and 48px, with `--space-8` at 64px. Larger editorial gaps use responsive `clamp()` values. Buttons are pill shaped; image frames have large responsive radii; forms use underlined controls and section rules.

## Component rules

| Pattern | Implemented appearance and behavior |
| --- | --- |
| Header | Dark full-width band, Garage/Showcase navigation, centered wordmark, aggregate paid/all-parts cost, theme toggle; phone menu drawer. |
| Vehicle card | Large rounded image or letter placeholder, title, nickname tag, progress bar and exact installed count, status counts, spent amount, full-width next-action link. |
| Showcase cover | Final portrait with Completed build label, vehicle title, completion date, installed count, paid amount, and View Build link. |
| Dashboard hero | Large rounded photo with dark gradient overlay, white title and specs, and Edit Vehicle action. |
| Build overview | Paid amount, installed progress, and a five-item stats row for Installed, Purchased, Planned, Total mods, and All parts cost. |
| Completion panel | Checklist, final portrait uploader, and Publish/Remove action. A ready build changes to a dark workshop surface. |
| Modification row/card | Optional installed photo, status badge, name, brand/category, price, notes, next-status action, Edit, Delete. |
| Form | Visible labels, underlined controls, two-column desktop grid, expandable optional sections, error summary, field errors, Cancel and Save. |
| Dialog | Named confirmation or installation task, backdrop, Escape handling, contained keyboard focus, and focus return on close. |
| Feedback | Textual loading/empty/error states, inline notices, and timed success toast. |

Primary buttons are outlined burgundy until hover. Purchased and Installed actions use their respective semantic colors. Secondary buttons use the current ink color; dangerous actions use the danger token. Buttons have at least 46px height in the main style, and smaller card actions have at least 42px height. Keyboard focus uses a 3px outline with a 4px offset.

## Responsive behavior

| Width | Current layout |
| --- | --- |
| Above 980px | Full header navigation, two-column garage, desktop filters, five-column dashboard statistics. |
| 768–980px | Intermediate header and content adjustments. |
| Below 768px | Phone gutters, navigation drawer, one-column garage/showcase, stacked forms and part cards, expandable secondary filters, sticky Add Modification bar. |
| Below 430px | Dashboard statistics become one column and modification actions stack. |

Photos maintain their display frame and use `object-fit` appropriate to the context. Motion is restrained, and the `prefers-reduced-motion` media query removes or minimizes transitions and animations.

## Accessibility and current limits

The current implementation has a skip link, a main landmark, heading focus after navigation, semantic form labels, text error summaries linked to fields, descriptive image alternatives, text status labels, `aria-expanded` on expandable navigation and filters, and focus management in dialogs. Loading, error, empty, and success states use visible text. Contrast values in the original design-system draft applied to colors no longer used by the site; this document does not claim a completed contrast audit of both themes. The checked-in PDF at `output/pdf/buildspec-design-system.pdf` may also reflect an earlier version and should be regenerated before sharing it as the current design system.
