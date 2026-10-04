# AI usage

This project was built with AI assistance. This file records how I used it.

I chose the car-build tracking problem, planned the vehicle and modification workflows, selected visual references and colors, and reviewed the app on desktop and phone. I wrote the spending totals, phone layout improvements, installed-part photo flow, local-development setup, and hosted photo and deployment setup described in section 3, then sent my code to Codex to check and polish. Codex built much of the remaining code and documentation from my requirements. This account separates my own code and decisions from Codex-written work.

My planning is recorded in the [proposal](docs/01-proposal.md), [wireframes](docs/02-wireframes.md), [design system](docs/03-design-system.md), and [Week 1 journal](docs/journal/week-1.md). The commits in section 3 show the resulting code; they do not separate my first drafts from Codex's later polish.

## 1. How I used AI

### September 2026 - Project planning

* Tool: Codex.
* What I asked for: Turn my car modification tracker idea into a proposal, screen map, component breakdown, and design system that fit the course rubric.
* What it gave back: Planning documents and a design-system PDF.
* What I kept, what I changed, and why: I kept the vehicle and modification flows. I checked the rubric, requested color changes, and pointed out overlapping controls in the PDF so the plan would be usable when building.
* Commit: [Initial app and documentation](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b); the documents were later [organized under `docs/`](https://github.com/AllanPasion/BuildSpec/commit/a8a49b95c41728abdcab42d040cf4497e1430e85).

### September 2026 - First working app

* Tool: Codex.
* What I asked for: Build the full app after the first implementation covered only part of the plan.
* What it gave back: Much of the React client, Express API, Prisma models, and vehicle and modification routes, plus checks and polish on code I wrote.
* What I kept, what I changed, and why: I kept the flow from planned to purchased to installed parts because it matched how I wanted to track each build. I wrote the specific contributions listed in section 3 and continued checking the rest of the app and requesting corrections.
* Commit: [Initial BuildSpec app](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).

### September 2026 - Visual revisions

* Tool: Codex and UI/UX skills.
* What I asked for: Apply my design references and fix problems I showed in screenshots of the garage and dashboard.
* What it gave back: Changes to typography, layout, vehicle image framing, card padding, color roles, beige surfaces, and dark mode.
* What I kept, what I changed, and why: I kept the editorial, car-focused direction but asked for further changes where photos, spacing, and surfaces looked inconsistent.
* Commit: [Revised client in the initial app commit](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).

### 2026-09-21 - Local development setup

* Tool: Codex.
* What I asked for: Check and polish the local-development setup I wrote and make its instructions clearer.
* What it gave back: A reviewed single-command workflow with the root command, port check, Vite configuration, and documentation updates.
* What I kept, what I changed, and why: I kept the one-command startup and explicit port checks because they make development easier to repeat on another computer.
* Commit: [Single-command local development](https://github.com/AllanPasion/BuildSpec/commit/5ba94a89946d0610be6095be046e1b0dfe746392).

### 2026-09-25 - Private garage access

* Tool: Codex.
* What I asked for: Limit garage editing to my GitHub account while allowing visitors to see the public showcase.
* What it gave back: GitHub OAuth, server-side sessions, route protection, client sign-in state, and authentication tests.
* What I kept, what I changed, and why: I kept the distinction between public viewing and private editing because visitors should not be able to change my builds.
* Commit: [GitHub owner authentication](https://github.com/AllanPasion/BuildSpec/commit/ce46550a770dd14bf05d5df3cdaa28678bff80ce).

### 2026-10-02 - Hosted photos and deployment

* Tool: Codex.
* What I asked for: Check the hosted photo storage and deployment setup I wrote, and polish its error handling.
* What it gave back: Review and polish of the storage, upload, migration, and deployment code, including error cases.
* What I kept, what I changed, and why: I kept private photo storage and the cross-computer deployment setup. I used Codex's error-handling polish so failed configuration, uploads, or migration steps would be easier to detect.
* Commit: [Hosted photo storage and Vercel deployment](https://github.com/AllanPasion/BuildSpec/commit/727357fc00c7138f9956577d8c2feac4e7194d68).

### 2026-10-02 - Deployment documentation

* Tool: Codex.
* What I asked for: Document the live setup so I could continue the project on another PC.
* What it gave back: Deployment steps, environment-variable guidance, and notes on what had and had not been tested.
* What I kept, what I changed, and why: I kept the instructions because local and production OAuth settings differ, and the database and photo storage need separate backups.
* Commit: [Production deployment and setup documentation](https://github.com/AllanPasion/BuildSpec/commit/ad886368007b56f844bfbe0ac7bdbe56ba8c5cd9).

## 2. Where the AI got it wrong

These are intermediate outputs I reviewed in screenshots. The linked commits contain the versions that landed; the screenshots themselves were shared in our conversation rather than committed.

### Case 1 - Design-system controls overlapped

* What it gave me: A design-system PDF with buttons and form controls crowding or overlapping inside its examples.
* What was wrong with it: The layout was hard to read and would be a poor guide for the actual interface.
* What I did instead: I sent screenshots and asked Codex to correct the spacing. I also replaced the palette after the first color revision did not look right to me.
* Commit: [Design-system PDF added under `docs/`](https://github.com/AllanPasion/BuildSpec/commit/a8a49b95c41728abdcab42d040cf4497e1430e85).

### Case 2 - Vehicle photos did not fit the cards

* What it gave me: Garage cards whose photos fit inconsistently because the source images had different dimensions.
* What was wrong with it: The car images looked awkward in their fixed-height holders.
* What I did instead: I showed the result and asked Codex to use consistent image frames. The cards use `object-fit: cover` to fill the frame without stretching the car, although edges can be cropped.
* Commit: [Garage styling in the initial app](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).

### Case 3 - White panels broke the beige design

* What it gave me: Vehicle cards, a progress block, and modification rows with light panels that looked separate from the beige page.
* What was wrong with it: Those surfaces did not match the color direction I had chosen.
* What I did instead: I sent screenshots and asked Codex to make those panels use the page's beige background while keeping the dark header and photo heroes for contrast.
* Commit: [Client styling in the initial app](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).

## 3. Who wrote what

### Written by me

#### Overall build spending

* File: [`client/src/App.jsx`](client/src/App.jsx) contains `HeaderTotals`; [`server/routes/vehicles.js`](server/routes/vehicles.js) contains paid and projected cost rules.
* Commit: [Initial BuildSpec app](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).
* What it does and why it is built this way: I wrote the spending calculation and display. The API totals each vehicle's modification prices in two ways: purchased and installed parts count as paid, while planned parts count only toward the all-parts projection. `HeaderTotals` fetches the vehicles, adds those amounts across builds, and refreshes when build data changes. The two totals let me see money already spent separately from the cost of the full plan.

#### Phone layout and touch controls

* File: [`client/src/App.css`](client/src/App.css) contains responsive rules.
* Commit: [Initial BuildSpec app](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).
* What it does and why it is built this way: I wrote the phone layout changes so the garage would work on the device I plan to use most. Below 768 px, the main grids become single columns, navigation moves into a drawer, and key buttons become full-width or easier to tap. Narrower screens also simplify the statistics and modification actions.

#### Installed-part photos

* File: [`client/src/App.jsx`](client/src/App.jsx) contains photo input and preview UI; [`server/routes/uploads.js`](server/routes/uploads.js) handles uploads.
* Commit: [Initial app and photo flow](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).
* What it does and why it is built this way: I wrote the installed-part photo input and preview flow so I could keep a visual record of the fitted part. `PhotoUpload` lets me choose or take an image, shows a preview after upload, and reports loading or errors. The upload route accepts JPG, PNG, or WebP files up to 8 MB. I later wrote the hosted storage and deployment setup described below.

#### Local development workflow

* File: [`package.json`](package.json), [`scripts/check-dev-ports.cjs`](scripts/check-dev-ports.cjs), and [`client/vite.config.js`](client/vite.config.js).
* Commit: [Single-command local development](https://github.com/AllanPasion/BuildSpec/commit/5ba94a89946d0610be6095be046e1b0dfe746392).
* What it does and why it is built this way: I wrote the local-development setup so I could start both parts of BuildSpec with one command. The root `npm run dev` command checks that the API and website ports are available, then starts both development servers together. The script checks local IPv4 and IPv6 addresses and gives a clear error if a port is in use; Vite stays on its configured port instead of silently switching. This makes local setup more predictable.

#### Hosted photos and deployment

* File: [`server/storage.js`](server/storage.js), [`server/routes/uploads.js`](server/routes/uploads.js), [`server/scripts/migrate-photos.js`](server/scripts/migrate-photos.js), [`api/index.js`](api/index.js), and [`vercel.json`](vercel.json).
* Commit: [Hosted photo storage and Vercel deployment](https://github.com/AllanPasion/BuildSpec/commit/727357fc00c7138f9956577d8c2feac4e7194d68).
* What it does and why it is built this way: I wrote the setup that uses local photo storage during development and a private Supabase bucket when hosted. The upload route checks image type and size, and the migration script copies existing photos and verifies their contents after upload. The Vercel files route API and photo requests to the server while serving the React site. I built this so my photos and app would work across computers; I sent it to Codex to check and polish the error handling.

### Later features I specified and Codex built or edited

- **BuildSpec app and visual direction:** I set the car-build purpose, selected the palette and references, reviewed screenshots, and requested UI fixes. Codex built much of the React and API code. [Commit](https://github.com/AllanPasion/BuildSpec/commit/d361566a8a9cc3f26f19b2a48ea91e1c0e41857b).
- **Private garage access:** I asked for owner-only editing and a public showcase. Codex implemented the authentication flow and tests. [Commit](https://github.com/AllanPasion/BuildSpec/commit/ce46550a770dd14bf05d5df3cdaa28678bff80ce).

### The AI-written part I understand best

* File: [`server/auth.js`](server/auth.js).
* Commit: [GitHub owner authentication](https://github.com/AllanPasion/BuildSpec/commit/ce46550a770dd14bf05d5df3cdaa28678bff80ce).
* What it does and why we kept it: Codex wrote much of this file. It starts GitHub sign-in, checks that the returning user is the allowed owner, and creates a session before private routes can run. The browser receives an HTTP-only session cookie, while the database stores a hash of the session token rather than the raw token. I kept this arrangement because visitors should be able to view the showcase but not edit my garage. This is an AI-written example, not a claim that I coded the authentication flow myself.
