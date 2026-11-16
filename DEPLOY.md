# Deploying Uwevwi

The repo builds into **one container** (the default `Dockerfile` target, `app`). The Node API also serves the exported website, so a single service runs the site, the admin and the API. Everything that must survive a redeploy, the SQLite database and the uploaded images, lives in one folder, `/data`.

There are two ways to run it:

- **[A. A hosting panel](#a-the-wexxaro-panel-or-any-host-that-runs-one-container)** (Wexxaro Engine, Railway, Coolify and similar). Recommended.
- **[B. Docker Compose on a VPS](#b-docker-compose-on-a-vps)** with Caddy handling HTTPS.

## A. The Wexxaro panel (or any host that runs one container)

### 1. Put the code in Git

The panel imports from a Git repository (GitHub, or any Git URL it can reach). Create a repository, commit this project and push it. A private repository needs the panel to have a `GITHUB_ACCESS_TOKEN` (or a GitHub App) configured on its server.

### 2. Create the service

In the panel, open the **Uwevwi** project, then **Add service → Git Repository**:

| Setting | Value |
| --- | --- |
| Repository / branch | your repo, `main` |
| Directory | `/` (the repo root) |
| Build | the `Dockerfile` at the root; keep the default target (`app`) |
| Port | `8787` |
| Persistent volume | mount at `/data` |
| Health check (if asked) | `/api/health` |

Environment variables:

| Name | Value |
| --- | --- |
| `APP_URL` | `https://uwevwi.org` |
| `ADMIN_EMAIL` | the first admin's email |
| `ADMIN_NAME` | e.g. `Nazerin Gbinije` |
| `ADMIN_PASSWORD` | a strong password |

The three `ADMIN_*` values are only used the first time the app starts with an empty database. Change the password in the admin afterwards. `NODE_ENV`, `PORT`, `DATA_DIR` and `WEB_DIR` are already set in the image. Leave `CORS_ORIGIN` unset: the site and API share one origin, so no other origin is allowed.

Without the `/data` volume the database and uploads are lost on every deploy, so confirm the volume is attached before the first real use.

### 3. Domain and DNS (Hostinger)

`uwevwi.org` is managed at Hostinger, and its DNS currently points at a live WordPress site, with email on Hostinger's Titan. Changing the A records replaces that site, so switch over deliberately:

1. **Try it on a subdomain first.** In Hostinger hPanel, open **Domains → uwevwi.org → DNS / Nameservers** and add an `A` record named `new` pointing at the panel server's IP. Add `new.uwevwi.org` as the domain on the service in the panel and wait for its certificate. Check the whole site and the admin there. Nothing public changes.
2. **When you are happy, cut over.** Change the `@` `A` records (there are two, to Hostinger's addresses) to the server's IP. Replace the `www` record, currently a CNAME to `www.uwevwi.org.cdn.hstgr.net`, with a CNAME to `uwevwi.org`. Add `uwevwi.org` and `www.uwevwi.org` as domains on the service.
3. **Leave the `MX` and `TXT` records alone.** They keep your email working. Do not move the nameservers.
4. Keep a backup of the WordPress site (hPanel backups) before you cut over, in case anything on it is needed.

### 4. Updating

Push to the branch and redeploy from the panel. The data volume is untouched.

### 5. Backups

Back up the `/data` folder regularly: `uwevwi.db` (plus its `-wal`/`-shm` files) and `uploads/`. If the panel can open a shell in the container, this makes a consistent copy of the database:

```bash
node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync('/data/uwevwi.db').exec(\"VACUUM INTO '/data/backup.db'\")"
```

Download `backup.db` and the `uploads` folder somewhere off the server.

### Notes

- Password-reset links are written to the service's log, because no email provider is connected yet. Read them from the panel's logs.
- Contact-form enquiries are stored in the admin under Engagement, Enquiries.

## B. Docker Compose on a VPS

`docker-compose.yml` runs Caddy (HTTPS, static site, proxy) in front of the API, as two containers. It is an alternative to the single-container setup above.

1. Point the domain's A record at the VPS. SSH to it as root.
2. Once: `bash deploy/setup-server.sh` (installs Docker, opens ports 22, 80 and 443, adds swap).
3. Copy `deploy/production.env.example` to `/opt/uwevwi/.env` on the server and fill it in.
4. From your computer: `./deploy/deploy.sh root@SERVER_IP` (repeat for every update).
5. Backups: `deploy/backup.sh` writes a database copy and an uploads archive to `backups/`; schedule it with cron:
   `15 3 * * * cd /opt/uwevwi && ./deploy/backup.sh >> backups/backup.log 2>&1`

Useful commands on the server: `docker compose ps`, `docker compose logs -f api`, `docker compose logs -f web`.

## Troubleshooting

- **Blank page or 502 after a deploy**: check the service log; the app prints `Uwevwi API listening on …` when ready.
- **Login works but data disappears after a redeploy**: the `/data` volume is not attached.
- **Certificate not issued**: the DNS record has not propagated yet, or points at the wrong IP.
- **Build killed or out of memory**: the site build needs about 3 GB of memory.
