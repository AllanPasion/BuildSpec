# BuildSpec

## 1. Overview

BuildSpec is a personal car modification tracker. A user can keep several vehicles in a garage, record planned, purchased, and installed parts, review costs and progress, and publish a finished vehicle to a showcase. The website uses React and Vite; an Express API uses Prisma and PostgreSQL. Monetary amounts are shown in Philippine pesos.

The private garage uses GitHub OAuth sign-in for one approved owner. Completed Builds is publicly viewable. The application runs locally; production deployment still needs hosted photo storage and deployment testing.

## 2. Setup and installation

Install Node.js and npm, Git, and access to a PostgreSQL database. PostgreSQL client tools such as `pg_dump` are needed for backups. The private database URL belongs in `server/.env`; use the repository's `server/.env.example` for a local database or `server/.env.supabase.example` for a Supabase Session pooler connection. Do not commit credentials.

Clone the [BuildSpec repository](https://github.com/AllanPasion/BuildSpec), then install dependencies from the project root:

```bash
git clone https://github.com/AllanPasion/BuildSpec.git
cd BuildSpec
npm install
npm --prefix server install
npm --prefix client install
```

Create a GitHub OAuth App under GitHub **Settings → Developer settings → OAuth Apps**. For local development, use `http://localhost:5173` as the homepage and `http://localhost:3000/api/auth/github/callback` as the authorization callback. Add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, and `GITHUB_ALLOWED_USER_ID` to `server/.env`. The committed examples show the required names and the approved owner's ID. Keep the client secret private.

Apply the committed database migrations, including the session table, from the project root:

```bash
npm --prefix server run db:deploy
```

The migration command runs a database backup first and requires `pg_dump`. The optional `npm --prefix server run db:seed` command adds a sample build only when the vehicle table is empty.

## 3. How to run it

From the project root:

```bash
npm run dev
```

Open `http://localhost:5173` and sign in with the approved GitHub account to manage the garage. Other visitors can browse `/showcase` without signing in. The API runs at `http://localhost:3000` by default, and `http://localhost:3000/api/health` returns an API status response. Stop both development servers with Ctrl+C. The root command checks whether the default ports are already occupied.

If the origins differ, set `CLIENT_URL` in `server/.env` to the website origin and set `VITE_API_URL` in `client/.env` to the API origin. Update `GITHUB_CALLBACK_URL` and the GitHub OAuth App callback when the API origin changes. Restart the servers after changing environment variables. Never put a credential in a `VITE_` variable because it is included in browser code.

## 4. Features and usage

1. Sign in with the approved GitHub account, open **Garage**, and add a vehicle with its year, make, and model. Other specifications and a garage photo are optional.
2. Open the vehicle dashboard and add modifications. Each part has a name, category, price, and Planned, Purchased, or Installed status. Optional details include brand, purchase date, installer, notes, and an installed-part photo. Installed parts require an installation date.
3. Review installed progress, status counts, paid cost, and all-parts cost. Search, filter, and sort the modification list; edit or delete records when the build changes.
4. Add a final build portrait once every tracked modification is installed, then explicitly publish the vehicle to **Completed Builds**. Publishing can be reversed.

The website also has mobile navigation, light and dark themes, form validation, delete confirmations, loading and error states, and local drafts for new forms. The API accepts JPG, PNG, and WebP uploads up to 8 MB. Sign-out ends the server-side session. Private garage photos require owner sign-in; a published showcase portrait is public.

The main website routes are `/`, `/showcase`, `/vehicles/new`, `/vehicles/:id`, `/vehicles/:id/edit`, `/vehicles/:id/modifications/new`, and `/modifications/:modificationId/edit`. The API provides health, authentication, vehicle, modification, showcase, and upload routes under `/api/`.

## 5. Project structure

```text
BuildSpec/
|-- client/             React website and static assets
|-- server/             Express API, GitHub OAuth, Prisma schema and migrations
|-- docs/               Proposal, wireframes, design system, reports, journals
|-- scripts/            Development port check
|-- README.md           Quick-start instructions
`-- package.json        Command to start both development servers
```

The design-system reference is `docs/buildspec-design-system.pdf`. The proposal and wireframes are `docs/01-proposal.md` and `docs/02-wireframes.md`. The week 2 report and reflection are `docs/REPORT.md` and `docs/journal/week-2.md` in the repository.

## 6. Screenshots

The repository contains design documentation and application image assets, but no verified screenshot of the running week 2 application is included here. A submission screenshot should be captured from the actual local site after both servers are running.

## 7. Known issues and next steps

- Uploaded photos are stored in `server/uploads/`, outside PostgreSQL. They need persistent storage and migration before deployment to a host with temporary disk storage.
- The authentication tests cover signed-out access, rejected origins, and invalid OAuth state; the main CRUD and publication flows still need automated tests.
- A production deployment and its screenshots are not yet documented.

For production, register the deployed GitHub callback URL, set `CLIENT_URL`, `GITHUB_CALLBACK_URL`, and `VITE_API_URL` to the deployed origins, and use HTTPS. If the website and API are on different sites, set `COOKIE_SAME_SITE=none`; otherwise keep `lax`.

The server's `npm run db:backup` command writes database and upload backups into ignored `server/backups/`. Keep a separate copy of important backups. Avoid `prisma migrate reset` on a database whose records you want to preserve.
