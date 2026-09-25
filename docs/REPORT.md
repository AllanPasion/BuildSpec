# Weekly Increment Report

## Week 2: September 20–25, 2026

## What changed this week

- I moved BuildSpec from planning documents to a React and Vite website with an Express API.
- I built the Garage, Vehicle Form, Vehicle Dashboard, Modification Form, and Completed Builds showcase for desktop and phone layouts.
- I added vehicle and modification create, view, edit, and delete flows. Deleting a vehicle also removes its modifications.
- I added Planned, Purchased, and Installed modification states. Installed parts require an installation date.
- I added search, status and category filters, sorting, progress, status counts, paid cost, and projected cost in Philippine pesos.
- I added garage, installed-part, and final-build photo uploads. The API accepts JPG, PNG, and WebP files up to 8 MB.
- I added explicit showcase publishing. A vehicle needs at least one modification, all parts installed, and a final photo. Changing a modification or final photo removes the vehicle from the showcase until it is published again.
- I created Vehicle and Modification models, Prisma migrations, a seed script, and a backup command for PostgreSQL. The documentation records the move to a Supabase PostgreSQL database.
- I added GitHub OAuth sign-in for the approved owner. The API now checks the signed-in session before allowing garage access, modification access, or photo uploads. Completed Builds remains publicly viewable.
- I added a database table for server-side sessions, sign-out, protected photo access, and authentication checks for signed-out requests, wrong origins, and invalid OAuth state.
- I added validation, loading and empty states, error feedback, delete confirmations, and browser-saved drafts for new forms.
- I set up `npm run dev` to start the API and website together and added setup instructions and safe environment examples.
- I created a Git repository and uploaded the application and documentation to GitHub.

## Why

The week 1 proposal and wireframes described the user flow but did not yet provide a usable application. This increment lets a car owner add a vehicle, track parts through purchase and installation, and see the resulting cost and progress. The showcase gives completed builds a separate destination while keeping publication under the owner's control.

Totals come from modification records so they cannot drift from the saved parts. Validation, confirmation dialogs, and clear loading and error states make the main editing flows easier to understand. Owner sign-in separates the private garage from the public showcase.

## What broke or what I got stuck on

- The planning-stage README and report became inaccurate once the application existed and needed to be rewritten.
- Database records and uploaded photos live in different places. Moving or backing up PostgreSQL alone does not move files in `server/uploads/`.
- The original API allowed access without a login. Adding GitHub OAuth required a callback, a session table, protected routes, and a way for the client to check sign-in status.
- Photo uploads use the API server's disk. A host with temporary storage would lose them unless the upload system changes.
- Keeping forms, API validation, dashboard totals, and showcase eligibility consistent took more work than building the initial screens alone.

## What is left

- Move photos to persistent hosted storage and migrate existing files and references.
- Configure production GitHub OAuth callback and cookie settings, then test sign-in and the full user flow in the intended deployment environment.
- Capture real application screenshots for the submission.
- Extend automated tests beyond the new authentication checks to cover vehicle, modification, and showcase rules.
- Continue hands-on accessibility and mobile testing.

## Evidence and current limits

The repository contains the React client in `client/`, the Express API and Prisma schema in `server/`, authentication code in `server/auth.js`, and setup instructions in the root `README.md`. The API has a health route at `/api/health` and authentication tests in `server/tests/auth.test.js`. This report describes the code currently present; it does not claim a public deployment or production security review.
