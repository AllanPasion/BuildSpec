# BuildSpec handoff — continue on another PC

Updated September 25, 2026. Repository: https://github.com/AllanPasion/BuildSpec

## What is working

BuildSpec is a React/Vite website with an Express API and Prisma/PostgreSQL database. The private garage lets the approved GitHub owner manage vehicles, modifications, costs, progress, and photos. A completed build can be published to the public showcase after every tracked part is installed and a final photo is saved. The app uses Philippine pesos. The project includes GitHub OAuth sign-in, server-side sessions, and five authentication tests.

## First steps on the other PC

1. Install Git, Node.js and npm, and PostgreSQL client tools (`pg_dump` is required by the backup and migration commands). Sign in to GitHub with an account that can clone this repository.
2. Clone the project and install dependencies:

   ```powershell
   git clone https://github.com/AllanPasion/BuildSpec.git
   cd BuildSpec
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

3. Create `server/.env` from `server/.env.supabase.example`. Fill in the private Supabase Session pooler `DATABASE_URL` and the GitHub OAuth values. Retrieve the database password and OAuth client secret through your own secure records or the respective service dashboards. Do not put them in Git, this handoff file, or chat messages. The example contains the variable names and approved GitHub user ID.
4. The local GitHub OAuth App callback must be `http://localhost:3000/api/auth/github/callback`, and its homepage should be `http://localhost:5173`. If the same OAuth App is already configured with these local URLs, reuse its client ID and secret. Set `CLIENT_URL=http://localhost:5173`, `GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback`, and `COOKIE_SAME_SITE=lax` in `server/.env`.
5. The client expects the API at `http://localhost:3000`. Only create `client/.env` from `client/.env.example` if the API uses another origin; set `VITE_API_URL` to that origin. Never place a secret in a `VITE_` variable.
6. The Supabase database is shared across PCs. Check migration status from `server/` with `npx prisma migrate status`. If any committed migrations are pending, run `npm --prefix server run db:deploy` from the project root. That command backs up the database first and needs `pg_dump`. Do not run `prisma migrate reset` or seed an existing garage.
7. From the project root, run `npm run dev`. Open `http://localhost:5173`, sign in with the approved GitHub account, and check the garage and showcase. The API health endpoint is `http://localhost:3000/api/health`.

## Files GitHub does not transfer

- `server/.env` contains private database and OAuth settings. Recreate it securely on the other PC.
- `server/uploads/` contains uploaded photos and is ignored by Git. This PC currently has 24 uploaded photo files. Copy the files to the same `server/uploads/` path on the other PC, preserving their filenames. Database records refer to `/uploads/<filename>`; without matching files, those photos will not appear. Do not commit personal uploads to the public repository.
- `server/backups/` is also ignored. The backup command includes a database dump and a copy of uploads. If both PCs use the same Supabase database, do not restore a backup over it just to move photos; transfer the upload files separately.
- Browser-saved form drafts, theme preference, and sign-in cookies stay in the old browser. Sign in again on the other PC.
- The three week 2 submission copies are in `Downloads/BuildSpec-week-2/` on this PC. The repository versions are `docs/REPORT.md`, `docs/README.md`, and `docs/journal/week-2.md`.

Use a private transfer method for `.env` and uploaded photos. Keep an independent backup before changing database configuration or moving machines.

## Checks and current limits

Run `npm --prefix server test`, `npm --prefix server run check`, and `npm --prefix client run build` to check authentication tests, server syntax, and the client build. The latest checks on this PC passed. The auth tests do not yet cover every vehicle, modification, or showcase flow.

Photos still live on the API server's disk, so public deployment needs persistent photo storage and migration of the current files. Production also needs the deployed GitHub callback URL, website/API origins, HTTPS, and appropriate cookie settings. A production deployment and application screenshots have not yet been documented.

## Continue the work

Start with the [root README](README.md) and [week 2 documentation](docs/README.md). The next useful tasks are moving photos to persistent storage, testing the full user flow, expanding automated tests, checking mobile and keyboard use, and capturing actual application screenshots for the submission.
