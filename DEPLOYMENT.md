# Deployment Guide

## 0. Prerequisites: MongoDB Atlas + Upstash Redis

### MongoDB Atlas (free M0 cluster)
1. Go to https://www.mongodb.com/cloud/atlas/register and create an account.
2. Create a new **free (M0) cluster** in the region closest to your Render region.
3. Under **Database Access**, add a database user with a username/password (autogenerate a strong password).
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — Render's outbound IPs are dynamic on free plans, so this is required unless you're on a paid Render plan with static IPs.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name to the path so it doesn't default to `test`: `.../sirix?retryWrites=true&w=majority`. This full string is your `MONGO_URI`.

### Upstash Redis (free tier)
Render's own free Redis add-on has been retired, so use Upstash (free tier, TLS-only):
1. Go to https://upstash.com and create an account.
2. Create a new **Redis** database, choosing a region close to your Render backend.
3. On the database's detail page, copy the **`rediss://` connection string** shown under "Connect" (it includes the password and requires TLS — note the extra `s` in `rediss`).
4. This is your `REDIS_URL`.

## 1. Backend on Render

1. Push the repository to GitHub.
2. In Render, create a new **Web Service** and connect this repository.
3. Set **Root Directory** to `backend`.
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: `18` or newer (already pinned via `engines` in `package.json`)
   - Health Check Path: `/health`
5. Environment variables:
   - `NODE_ENV=production`
   - `API_PREFIX=/api/v1`
   - `MONGO_URI=<your Atlas connection string, from step 0>`
   - `JWT_ACCESS_SECRET=<strong random string>`
   - `JWT_REFRESH_SECRET=<a different strong random string>`
   - `REDIS_URL=<your Upstash rediss:// URL, from step 0>`
   - `CLIENT_URL=https://<your-vercel-app>.vercel.app` (set after you know the Vercel URL; comma-separate multiple origins if you add a custom domain)
   - `RESET_PASSWORD_URL=https://<your-vercel-app>.vercel.app/reset-password`
   - Leave `PORT` unset — Render injects its own `PORT` and the app already reads `process.env.PORT`.
6. Deploy. Render builds and starts the service; wait for the health check to pass.
7. Verify: `https://<your-render-url>/health` should return `{"success":true,...}`.
8. Seed the default admin/roles once, using Render's **Shell** tab on the service:
   ```
   npm run seed
   ```
   Then log in with `admin@sirix.io` / `Admin@12345` and change the password immediately.

## 2. Frontend on Vercel

1. In Vercel, **Add New → Project** from the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Build settings (Vercel auto-detects Vite, confirm these):
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment variables (Project Settings → Environment Variables, applied to Production):
   - `VITE_API_BASE_URL=https://<your-render-url>/api/v1`
   - `VITE_SOCKET_URL=https://<your-render-url>`
5. Deploy.
6. Go back to Render and update `CLIENT_URL` with the real `https://<your-vercel-app>.vercel.app` URL, then redeploy the backend (env var changes require a restart).
7. Open the Vercel URL and verify login, refresh-on-401, and the dashboard's socket connection.

## Notes / things that were fixed to make this work

- **Cross-site cookies**: the frontend (vercel.app) and backend (onrender.com) are different origins in production, so the refresh-token cookie needs `SameSite=None; Secure` to be sent at all — plain `SameSite=Strict` (the previous default) silently breaks refresh-on-401 and login persistence in production. `backend/src/controllers/authController.js` now sets `sameSite: env.isProd ? 'none' : 'strict'`.
- **Redis TLS**: `ioredis` needs an explicit TLS option (or a `rediss://` URL) to talk to Upstash; host/port/password alone silently fail to connect. `backend/src/config/redis.js` and `env.js` now support `REDIS_URL` (preferred) or `REDIS_TLS=true` alongside the old host/port vars.
- **`frontend/vercel.json`**: replace `YOUR_RENDER_BACKEND_URL` with your real Render URL before your first deploy (only matters if you route `/api/*` through the rewrite instead of calling the backend directly — the default setup here calls it directly via `VITE_API_BASE_URL`). A catch-all rewrite to `/index.html` was added so refreshing on a client-side route like `/dashboard` doesn't 404.
- If you add a custom domain to either app, add it to `CLIENT_URL` on the backend and re-deploy.