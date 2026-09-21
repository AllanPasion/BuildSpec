# BuildSpec website

This folder contains the React and Vite website for BuildSpec, a personal car modification tracker. The website shows a garage and showcase, vehicle dashboards, modification records, cost totals, and photo uploads. It calls the Express API in `../server` for saved data.

## Run locally

1. Set up and start the API using the instructions in [the project documentation](../docs/README.md). The website expects it at `http://localhost:3000` by default.
2. From this `client` folder, install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`.

If the API runs elsewhere, copy `.env.example` to `.env` and set `VITE_API_URL` to the API origin, such as `http://localhost:3000`. Restart Vite after changing environment variables. The API must allow the website's origin through its `CLIENT_URL` setting.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the static website into `dist/` |
| `npm run preview` | Preview the built website locally |
| `npm run lint` | Run Oxlint |

## Data and deployment

The website reads and writes vehicles and modifications through the API. Uploaded photos are served by the API; browser storage holds only the theme preference and unfinished form drafts. Set `VITE_API_URL` to the deployed API origin when building for deployment. Vite embeds `VITE_` variables in browser code, so never put credentials in them.

See [the project documentation](../docs/README.md) for database setup, backups, and deployment limitations.
