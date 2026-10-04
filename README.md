# BuildSpec

[![Made with AI assistance](https://img.shields.io/badge/Made_with-AI_assistance-blue)](AI-USAGE.md)

BuildSpec is a personal car modification tracker for planning parts, recording purchases and installations, and seeing progress and spending across vehicles. Its React website includes a private garage and a public completed-build showcase; an Express API stores data in PostgreSQL and handles photo access.

This is my project idea and design direction. I wrote the specific features listed in [AI-USAGE.md](AI-USAGE.md) and sent them to Codex for checking and polish. I also used Codex extensively to build other parts of the client and API, plan the design, and document deployment.

## Run the website locally

1. Install Node.js with npm, Git, access to PostgreSQL, and the PostgreSQL client tool `pg_dump` (the migration command makes a backup first). Clone the repository:

   ```bash
   git clone https://github.com/AllanPasion/BuildSpec.git
   cd BuildSpec
   ```

2. Install dependencies from the project root:

   ```bash
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

3. Create an empty local PostgreSQL database or a Supabase project. Copy `server/.env.example` to `server/.env` for the local database, or use `server/.env.supabase.example` for Supabase and hosted photos. Set `DATABASE_URL` to your database connection. For local photo storage, use `PHOTO_STORAGE=local`; for hosted storage, use `PHOTO_STORAGE=supabase` plus `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. The example files list every setting. Never commit `server/.env` or put secrets in a `VITE_` variable.

4. Create a GitHub OAuth App under **Settings → Developer settings → OAuth Apps**. Set its homepage to `http://localhost:5173` and callback to `http://localhost:3000/api/auth/github/callback`. Put its client ID and secret in `server/.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`; set `GITHUB_ALLOWED_USER_ID` to the numeric ID of the GitHub account allowed to edit the garage. The repository's example uses my account, `AllanPasion` (`186479337`).

5. Apply database migrations, then start the API and website together:

   ```bash
   npm --prefix server run db:deploy
   npm run dev
   ```

6. Open `http://localhost:5173` and sign in with the approved GitHub account. The API runs at `http://localhost:3000` by default, and `/api/health` reports its status. Visitors can browse the public showcase without signing in. Stop both servers with Ctrl+C. The startup script reports if either port is already in use. To add sample data to an empty database, run `npm --prefix server run db:seed`.

If the API uses another origin, copy `client/.env.example` to `client/.env` and set `VITE_API_URL`. Set `CLIENT_URL` in `server/.env` to the website's origin if it differs from the default. Restart the development servers after changing environment variables.

## Project layout

| Path | Contents |
| --- | --- |
| [`client/`](client/README.md) | React and Vite website, styling, and static assets |
| `server/` | Express API, Prisma schema and migrations, and backup script |
| [`docs/`](docs/README.md) | Product, design, setup, and project documentation |

Run `npm --prefix client run build` from the project root to create a production website in `client/dist/`. On the current single-origin Vercel deployment, leave `VITE_API_URL` unset; set it only if the API is hosted at a different origin. Values beginning with `VITE_` are included in browser code, so keep credentials only in the server environment.

GitHub OAuth authenticates the approved owner; server-side sessions live in PostgreSQL. The published showcase stays public. For this project's hosted deployment, the existing local photos were copied and verified in the private `buildspec-photos` bucket; their database paths did not change, and the local originals were kept. New hosted uploads go directly from the browser to Supabase using an owner-authorized signed URL.

The site is live at [BuildSpec on Vercel](https://buildspec-garage.vercel.app). The former `buildspec-sigma.vercel.app` address redirects there. Production GitHub sign-in and sign-out have been verified. See [Vercel deployment](docs/DEPLOYMENT.md) for the production callback, environment settings, and remaining release checks.
