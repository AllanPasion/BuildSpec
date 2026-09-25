# Week 2: September 20–25, 2026

## My goal this week

My goal was to turn the week 1 BuildSpec plan into an application I could run and use. I wanted the basic journey to work: add a vehicle, record a part, update its status, and see the cost and progress change on the dashboard. I also wanted the README to describe the real project rather than the earlier plan.

## What I did

I created the React and Vite client and the Express backend, then connected the backend to PostgreSQL through Prisma. I added Vehicle and Modification models and migrations. The garage now lists vehicles, and each vehicle has a dashboard for its details, parts, progress, and costs.

I built forms to add and edit vehicles and modifications. Parts can move through Planned, Purchased, and Installed states. The dashboard supports searching, filtering, and sorting, and it calculates paid and projected costs from the modification records. I added photo uploads and a Completed Builds showcase. A build can be published only after it has at least one modification, every part is installed, and a final photo has been added.

I also worked on validation messages, loading and empty states, delete confirmations, mobile navigation, a light and dark theme, and drafts saved locally while I fill out new forms. I added a root command to start both development servers and uploaded the code and documentation to GitHub.

Later in the week, I added GitHub sign-in for the approved owner. The garage and editing actions now require a server-side session, while visitors can still see published completed builds. I added a session table, a sign-out action, protected access to private photos, and tests for unauthenticated requests and invalid sign-in attempts.

## What blocked me

Moving beyond the planning documents meant keeping the React forms, API validation, Prisma schema, and database records aligned. I had to think about when the dashboard should refresh so counts and costs reflected edits. The showcase also needed a clear rule for what counts as complete and what happens if a published build changes.

I learned that a database backup does not cover uploaded images by itself. The current API stores photos in `server/uploads/`, so moving to another server will require transferring the files too. Adding owner sign-in also meant checking access on the API, not just hiding buttons in React.

## What I learned

The week 1 screen map helped me build one route at a time, but the most useful lesson was to make the data rules explicit. Progress and costs come from modification records. Publication depends on installed statuses and a final photo, and edits can remove a build from the showcase until it is published again.

I also learned that a working local app and a deployable public app are different milestones. The client, API, database, and owner sign-in now exist, but hosted photo storage, broader tests, and deployment checks are still future work. For the next increment, I want to test the full flow more systematically, solve those deployment limits, and capture screenshots from the running app.
