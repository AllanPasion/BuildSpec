# BuildSpec deployment on Vercel

The website and Express API are deployed as one Vercel project at `https://buildspec-garage.vercel.app`. The former `https://buildspec-sigma.vercel.app` address permanently redirects to it. The initial deployment was made directly from the local folder. Production GitHub sign-in and sign-out have been verified.

## Photos and database

The application database is in Supabase PostgreSQL. Its photo fields still contain paths such as `/uploads/example.jpg`; the API now resolves those paths through a private Supabase Storage bucket named `buildspec-photos`. The bucket is restricted to JPG, PNG, and WebP files up to 8 MB. The 23 photos present on the original PC were uploaded and verified byte for byte; six are currently referenced by database records. The original files and a database/local-photo backup remain on that PC.

Hosted uploads use short-lived, owner-authorized signed upload URLs so image files go directly from the browser to Supabase instead of passing through a Vercel Function. Image views redirect through the API to short-lived signed download URLs; the API checks whether the image belongs to a published showcase vehicle or requires the owner session.

The server needs these private environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Supabase Session pooler PostgreSQL URL |
| `PHOTO_STORAGE` | `supabase` |
| `SUPABASE_URL` | This project's HTTPS Supabase URL |
| `SUPABASE_SECRET_KEY` | Supabase `sb_secret_...` key, server only |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | A GitHub OAuth App for the deployed domain |
| `GITHUB_ALLOWED_USER_ID` | The approved owner's GitHub numeric ID (shown in `server/.env.supabase.example`) |
| `CLIENT_URL` | `https://buildspec-garage.vercel.app` |
| `GITHUB_CALLBACK_URL` | The same origin plus `/api/auth/github/callback` |
| `COOKIE_SAME_SITE` | `lax` for the single-origin deployment |

Set these in Vercel Project Settings → Environment Variables for Production. Do not set `VITE_API_URL` for this single-origin setup: the production client uses its own origin. Keep secrets out of `VITE_` variables and out of the repository. Vercel sets `NODE_ENV=production`, which makes session cookies `Secure` and requires hosted photo storage.

## First deployment and GitHub sign-in

1. The local project is linked to Vercel project `buildspec` and deployed. `vercel.json` installs the root, server, and client dependencies, builds `client/dist`, and routes `/api/*` and `/uploads/*` to the Express function. It also routes browser paths to `index.html` for React Router.
2. `DATABASE_URL`, `PHOTO_STORAGE`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `GITHUB_ALLOWED_USER_ID`, `COOKIE_SAME_SITE`, `CLIENT_URL`, and `GITHUB_CALLBACK_URL` are configured in Vercel Production. The values of secrets are hidden.
3. A **separate production GitHub OAuth App** was registered so the localhost callback keeps working. Its homepage URL is `https://buildspec-garage.vercel.app` and its callback is `https://buildspec-garage.vercel.app/api/auth/github/callback`. Its client ID and secret are configured in Vercel Production. Do not use the localhost app's secret here.
4. The live `/api/health`, public showcase, GitHub sign-in, private garage/vehicle details, existing photos, and sign-out have passed basic checks. A new vehicle/photo upload, modification write flow, and showcase publishing still need hands-on production checks. Test a photo close to the app's 8 MB limit to confirm the direct upload route works.

The production OAuth App allows the stable `buildspec-garage.vercel.app` callback. A preview deployment uses a different domain and should not be assumed to support sign-in without its own allowed callback configuration. Use the stable production domain for the owner sign-in test. `COOKIE_SAME_SITE=lax` is appropriate because the website and API share that domain.

## Local checks and backups

Run `npm --prefix server test`, `npm --prefix server run check`, and `npm --prefix client run build`. Before changing the database, `npm --prefix server run db:backup` saves a PostgreSQL dump and a copy of any local uploads. That backup does **not** include photos uploaded later to Supabase Storage. Keep separate backups of the Storage bucket and never run `prisma migrate reset` on the live database.

Do not delete the old `server/uploads/` files or the backup until production photos and the full user flow are confirmed. Do not expose the Supabase secret key to the browser or make the photo bucket public.
