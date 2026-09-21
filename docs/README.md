# BuildSpec

BuildSpec is a personal car modification tracker. The React client sends vehicle and modification requests to an Express API. Prisma stores those records in PostgreSQL. Uploaded photos are stored separately in `server/uploads/`.

## Documentation

- [Product overview](PRODUCT.md) and [proposal](01-proposal.md)
- [Wireframes](02-wireframes.md)
- [Design system](03-design-system.md), [design notes](DESIGN.md), and [visual PDF](buildspec-design-system.pdf)
- [Project report](REPORT.md) and [weekly journal](journal/week-1.md)

## Local setup

The ignored `server/.env` on this computer points to Supabase. On another machine, copy `server/.env.supabase.example` to `server/.env` and add the private database password.

From the project root, install dependencies once:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

Then run `npm run dev` from the project root. This starts Express and Vite together in one terminal. Stop both with Ctrl+C. The command reports a clear error if either default port is already in use.

Optionally, run `npm --prefix server run db:seed` to add a sample vehicle **only when the vehicle table is empty**. It skips an existing garage. The cloud database already contains real records, so seeding is unnecessary.

The client normally runs at `http://localhost:5173`. The API health endpoint is `http://localhost:3000/api/health`. If the API uses another origin, set `VITE_API_URL` in `client/.env` and `CLIENT_URL` in `server/.env` to the client origin.

## Supabase migration

The BuildSpec Supabase project now contains the two application tables, their two Prisma migration records, 6 vehicles, and 1 modification. The vehicle and modification records were verified against local PostgreSQL after import. The current ignored `server/.env` targets the Supabase Session pooler. The previous local database settings are preserved in the ignored `server/.env.local-backup` for rollback.

To configure another machine or deployment, copy `server/.env.supabase.example` to its private environment settings, replace `YOUR_DATABASE_PASSWORD` with the database password from the project's **Connect** panel, and keep the URL private. Use the Session pooler on port 5432. For deployment, set `CLIENT_URL` to the deployed client origin. Run `npm run db:deploy` from `server/` to back up the remote `public` schema and apply any pending Prisma migrations. The imported migrations are already recorded as applied. `prisma migrate status` confirms the cloud schema is up to date.

The cloud tables have row level security enabled and no direct Data API access for anonymous or authenticated roles. The Express server accesses PostgreSQL directly. The server currently has no user login or API authorization, so protect the API before making it publicly reachable.

Six database photo fields still reference `/uploads/...` files on this computer. The photo binaries are outside PostgreSQL and have **not** been migrated to Supabase Storage. The current server also writes new uploads to local disk. Move the referenced files and update upload handling before deployment to a host with temporary storage.

## Keeping your data

Vehicle and modification records live in the PostgreSQL database selected by `DATABASE_URL`, not in the website's source files. Keep that database and connection string when reinstalling dependencies or rebuilding the client. `npm install` and `npm run dev` do not reset records. The sample seed now leaves an existing garage untouched.

Run `npm run db:backup` from `server/` whenever you want a manual backup. It uses `pg_dump`, so PostgreSQL client tools must be installed. Backups go into the ignored `server/backups/` directory. Each backup contains a PostgreSQL custom-format archive and a copy of `server/uploads/`.

Do not use `prisma migrate reset` on a database with data you want to keep; it recreates the schema and removes records. The project migration commands back up the database before applying pending migrations. Keep another copy of important backups outside this workspace before changing database setup, deleting the project, or moving computers. A database backup alone does not include uploaded photos.

The old version of this README described a documentation-only project. The app, Prisma schema, and migrations now exist.
