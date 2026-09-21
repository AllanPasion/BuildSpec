# BuildSpec

BuildSpec is a personal car modification tracker. Its React website lets you manage vehicles, record planned and installed modifications, track parts costs, upload photos, and view a showcase. An Express API stores vehicle and modification data in PostgreSQL.

## Run the website locally

1. Start PostgreSQL and create a `buildspec` database.
2. Copy `server/.env.example` to `server/.env`, then set `DATABASE_URL` to your private PostgreSQL connection string.
3. Install and start the API from `server/`:

   ```bash
   cd server
   npm install
   npm run db:migrate
   npm run dev
   ```

4. In another terminal, install and start the website from `client/`:

   ```bash
   cd client
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173`. The API runs at `http://localhost:3000` by default.

If the API uses another origin, copy `client/.env.example` to `client/.env` and set `VITE_API_URL`. Set `CLIENT_URL` in `server/.env` to the website's origin if it differs from the default. Restart the development servers after changing environment variables.

## Project layout

| Path | Contents |
| --- | --- |
| [`client/`](client/README.md) | React and Vite website, styling, and static assets |
| `server/` | Express API, Prisma schema and migrations, and backup script |
| [`docs/`](docs/README.md) | Product, design, setup, and project documentation |

Run `npm run build` in `client/` to create a production website in `client/dist/`. Set `VITE_API_URL` to the deployed API origin before building. Values beginning with `VITE_` are included in browser code, so keep credentials only in the server environment.

The API currently has no user authentication. Review the [deployment limitations](docs/README.md#supabase-migration) before exposing it publicly.
