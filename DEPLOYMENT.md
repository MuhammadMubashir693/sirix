# Deployment Guide

## Backend on Render

1. Push the repository to GitHub.
2. In Render, create a new Web Service and connect this repository.
3. Set the service root to `backend`.
4. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: `18` or newer
5. Add the following environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `API_PREFIX=/api/v1`
   - `MONGO_URI=<your MongoDB connection string>`
   - `JWT_ACCESS_SECRET=<strong random string>`
   - `JWT_REFRESH_SECRET=<strong random string>`
   - `REDIS_HOST=<your Redis host>`
   - `REDIS_PORT=6379`
   - `REDIS_PASSWORD=<optional>`
   - `CLIENT_URL=https://<your-vercel-app>.vercel.app`
6. Deploy the service and note the generated Render URL.
7. Verify the health endpoint: `https://<your-render-url>/health`

## Frontend on Vercel

1. In Vercel, create a new project from the same GitHub repository.
2. Set the project root to `frontend`.
3. Use these build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the following environment variables:
   - `VITE_API_BASE_URL=https://<your-render-url>/api/v1`
   - `VITE_SOCKET_URL=https://<your-render-url>`
5. Deploy the project.
6. After deployment, open the Vercel URL and verify login and dashboard flows.

## Notes

- Replace the placeholder backend URL in [frontend/vercel.json](frontend/vercel.json) with your actual Render URL before the first deploy.
- If you use a custom domain, add it to `CLIENT_URL` and the Vercel frontend origin list.
