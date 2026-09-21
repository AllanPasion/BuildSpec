# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a car enthusiast managing one or more personal vehicles. The user opens BuildSpec while planning a build, purchasing parts, reviewing installation progress, or checking how much has been spent.

**Assumption pending confirmation:** The current version is single-user and does not require accounts, roles, or shared garages.

## Product Purpose

BuildSpec is a personal car modification tracker. It gives the owner one place to organize vehicles and their planned, purchased, and installed modifications, while calculating current and projected build costs in Philippine pesos.

Success means the user can quickly answer three questions: what is installed, what still needs to be bought or installed, and how much the build currently costs.

## Positioning

BuildSpec organizes modifications around each real vehicle and its build lifecycle rather than treating parts as a generic shopping list. Modification status, cost, and vehicle context remain connected so the garage dashboard always reflects the current build.

## Operating Context

The main workflow begins in **My Garage**. The user adds or selects a vehicle, opens its dashboard, reviews build totals and progress, filters modifications by status or category, and adds or updates parts as the build changes.

The application is designed for desktop and phone browsers. Vehicle and modification data are stored locally in PostgreSQL through an Express API and Prisma.

## Capabilities and Constraints

- Create, view, edit, and delete vehicles.
- Create, view, edit, and delete vehicle modifications.
- Track `PLANNED`, `PURCHASED`, and `INSTALLED` modification states.
- Filter modifications by status and category.
- Calculate modification counts, current costs, projected costs, and installed progress from database records.
- Store optional vehicle images as URLs and provide a fallback when an image is unavailable.
- Require an installation date when a modification is marked installed.
- Delete a vehicle's modifications when that vehicle is deleted.
- Use React and Vite for the frontend, Express for the API, and PostgreSQL with Prisma for persistence.
- Use Philippine pesos for monetary values.
- Remain a manageable academic final project; authentication, cloud hosting, collaboration, and external parts APIs are outside the confirmed scope.

## Brand Commitments

The product name is **BuildSpec**. Its voice is direct, practical, and enthusiast-friendly without using exaggerated automotive claims.

The confirmed palette uses burgundy red, muted rose, pale blue, blue-gray, and light gray: `#810f31`, `#af4963`, `#d4e3ef`, `#8b9eb6`, and `#e2e3e1`.

## Evidence on Hand

- Product proposal: `01-proposal.md`
- Screen flows, responsive wireframes, and component plan: `02-wireframes.md`
- Design-system decisions and palette: `03-design-system.md`
- Working React application: `client/src/`
- Express and Prisma API: `server/`
- Sample 2020 Honda Civic build seeded through `server/prisma/seed.js`

No testimonials, customer claims, performance benchmarks, partnerships, or commercial proof have been provided. Future work must not fabricate them.

## Product Principles

1. Keep the current state of a build understandable at a glance.
2. Derive totals and progress from modification records so the interface cannot drift from the data.
3. Make every primary task usable on both phone and desktop without relying on hover.
4. Prefer honest empty, loading, validation, and error states over pretending data exists.
5. Keep the scope focused on personal vehicle and modification tracking.

## Accessibility & Inclusion

Core actions must remain keyboard accessible, visibly focused, and usable with labeled controls. Status must be communicated with readable text rather than color alone. Responsive layouts must avoid horizontal scrolling at phone widths, and normal text should meet a minimum 4.5:1 contrast target.
