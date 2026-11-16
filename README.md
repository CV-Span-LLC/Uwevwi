# Uwevwi

The Uwevwi Studios website, its admin, and the API behind them, in one repo. Built from the Figma file
`BRdf0X4G2mI6A61UJwEuCh`.

| Part | Where | What |
| --- | --- | --- |
| Website | `src/app/` (everything outside `admin/`) | Expo Router app (web, iOS, Android) |
| Admin | `src/app/admin/`, `src/admin/` | Sign-in, dashboard, research, exhibitions, website images, comments, enquiries |
| Backend | `server/` | Hono API on Node, SQLite (`node:sqlite`), image uploads |

## Run it

```bash
npm install
npm run dev        # API on :8787 and the web app on :8092
```

Or run them separately: `npm run server` and `npm run web:dev`.

On first start the API creates the admin account and loads the existing research and exhibition content.
Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` (see `.env.example`) or read the generated password from the server log.
Sign in at `/admin`. Password reset links are printed to the server console until an email provider is added.

The data lives in `server/data/` and uploads in `server/uploads/`; both are git-ignored.

## Checks

```bash
npm run typecheck  # app and server
npm run lint
```

## Notes

- Research content is stored as a small Markdown subset (headings, bold, italic, links, lists, quotes, tables).
- Enquiries from the contact form are stored in the `enquiries` table and read in the admin under Engagement, Enquiries.
- The API authenticates admins with a bearer token. In production set `CORS_ORIGIN` to your site's address (the Docker setup does this).
- To host it on a VPS (Docker Compose + Caddy with automatic HTTPS), see [DEPLOY.md](DEPLOY.md).
