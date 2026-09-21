# Weekly Increment Report

## Week of: September 19, 2026

## What changed this week

- I completed the BuildSpec app proposal and defined its purpose, intended user, four core routes, important data, and main development risk.
- I created a screen map showing how the user moves between My Garage, the Vehicle Form, the Vehicle Dashboard, and the Modification Form.
- I created separate desktop and phone wireframes for all four screens and documented how each layout should respond on smaller screens.
- I broke the planned interface into reusable React components using atoms, molecules, organisms, pages, and a shared layout.
- I assigned each important piece of state to an owning component so that vehicle data, modifications, filters, form data, loading states, and errors have clear responsibilities.
- I created the BuildSpec design system using plain CSS as the planned styling approach, an 8px spacing system, a three-level type scale, responsive breakpoints, and accessibility requirements.
- I produced a three-page visual design-system PDF containing color swatches, contrast results, typography, spacing, component examples, and responsive dashboard examples.
- I corrected overlapping buttons, fields, cards, and dashboard elements in the first PDF version by reducing component widths and improving the internal spacing.
- I replaced the earlier color schemes with the final supplied palette: `#AF4963`, `#D4E3EF`, `#8B9EB6`, `#E2E3E1`, and `#810F31`.
- I checked the intended text and background combinations for WCAG contrast and documented that blue-grey is decorative only because it is not suitable behind normal-sized text.
- I added a BuildProgress component to both the wireframe and design-system plans so the documents remain consistent.
- I inspected the local workspace and confirmed that it started empty. Node.js `v24.18.0` and npm `11.16.0` are available, but Git and PostgreSQL's `psql` command were not available on the normal PowerShell path during the inspection.
- No React, Express, Prisma, PostgreSQL, or other application code was written this week. The work was intentionally limited to planning and documentation.

## Why

These changes were needed to turn the original BuildSpec idea into a specific plan that can guide development. Defining the routes and state first makes it clearer what the React app must manage and prevents unrelated features from being added too early.

The desktop and phone wireframes establish where each screen's content belongs before any JSX or CSS is written. The component breakdown also shows which interface elements should be built once and reused instead of duplicated.

The design system gives the project one consistent visual direction. Verifying the color contrast and responsive behavior now should reduce accessibility and layout problems later. Revising the palette and spacing before development was also easier than rebuilding finished components after the application had already been styled.

## What broke or what I got stuck on

- The first visual design-system PDF had several spacing problems. Some buttons, form fields, and statistic cards extended beyond their component panels.
- The Add Modification button in the first responsive dashboard example was too close to the table below it.
- The first two color directions did not match the visual style I wanted, so the palette had to be revised more than once.
- Some combinations from the final supplied palette do not meet the 4.5:1 contrast requirement. In particular, the blue-grey color is not dark enough to carry normal text. I kept it for borders and decoration and used deep burgundy for readable text.
- The workspace did not contain starter code, an existing Git repository, dependencies, or database configuration.
- Git and the PostgreSQL `psql` command were not available from the normal PowerShell path during the environment check. These prerequisites still need to be installed or correctly added to the path before database development begins.
- I have not started the React or backend setup yet, so there is no running application, API endpoint, database connection, or application screenshot to report this week.

## What is left

- Install or locate Git and PostgreSQL and confirm that their commands work from PowerShell.
- Initialize the Git repository and create sensible commits for real development milestones.
- Create the separated `client/` and `server/` project structure.
- Set up the React frontend with Vite and React Router.
- Set up the Node.js and Express backend.
- Add environment-variable support and an `.env.example` without real credentials.
- Configure Prisma and connect it to PostgreSQL.
- Create and test a backend health endpoint.
- Confirm that the React frontend can successfully request data from Express.
- Create the Vehicle and Modification database models and their relationship.
- Build and test Vehicle CRUD before beginning Modification CRUD.
- Build the Garage, Vehicle Form, Vehicle Dashboard, and Modification Form screens from the completed wireframes.
- Add dashboard totals, modification filtering, validation messages, deletion confirmation, and build history after the core CRUD features work.
- Write the public README using commands and features that have actually been tested.
- Capture a real screenshot only after the application is running.
- Complete the reflection journal using the development work and problems that are actually encountered.
