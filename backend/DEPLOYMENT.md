# Render deployment

Create a Render **Web Service** from the repository with:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Node version | Node.js 24.x (package engine allows `>=22 <25`) |

Set `NODE_ENV=production`. Render supplies `PORT`; do not hardcode or override it.
The service binds the HTTP port before connecting to MySQL and retries transient
database connection failures. `/health` returns HTTP 503 until the database is
reachable, then returns HTTP 200.

## Required service configuration

Set these in Render's Environment page:

- `FRONTEND_URL`: deployed frontend origin, including `https://` and no path.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: credentials for a reachable
  production MySQL database. Set `DB_PORT` if the provider does not use 3306.
- `JWT_SECRET` and `JWT_REFRESH_SECRET`: distinct randomly generated secrets;
  use at least 32 characters for each.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, and `EMAIL_PASS`:
  SMTP credentials required for verification, OTP login, and password reset.

`CORS_ORIGIN` is optional and accepts additional comma-separated frontend
origins. Production CORS does not allow arbitrary origins. For a frontend on a
different site, set `COOKIE_SAME_SITE=none`; production cookies use HTTPS-only
`secure` mode. Leave `COOKIE_SAME_SITE` unset to use the production default.
Requests that change state are also rejected when their browser `Origin` is not
in the configured CORS allowlist.

`API_BASE_URL` is optional; set it to the public backend origin if generated
upload URLs should use a fixed canonical URL. Razorpay credentials
(`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are optional unless Razorpay checkout
is enabled. Online checkout returns HTTP 503 when those keys are unavailable;
it does not create a placeholder payment order.

## Database and uploads

Provision MySQL outside the Web Service, allow network access from Render, and
import the schema/data from `../database/watch_st (1).sql` before relying on API
routes. Render does not provide this project's MySQL database automatically.

Uploaded files are not durable on a normal Render service filesystem. For a
single service instance, attach a Render persistent disk mounted at
`/var/data`, then set `UPLOAD_DIR=/var/data/uploads`. The application continues
to serve the repository's existing upload files as a fallback. For multiple
instances or a plan without persistent disks, migrate uploads to an object
storage service (for example S3 or Cloudinary); that integration is not included.

## One-time admin setup

To create the initial admin, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` temporarily
and run `npm run create-admin` against the production database. Remove those
variables after the command completes. Never commit `.env` or production
credentials.
