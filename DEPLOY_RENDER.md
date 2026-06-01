# 🚀 CodeSphere — Deploy on Render (Complete Guide)

> **Step-by-step guide to deploy the CodeSphere Online Code Execution Platform on [Render](https://render.com).**

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [Step 1 — Set Up External Services](#step-1--set-up-external-services)
  - [1a. MongoDB Atlas (Database)](#1a-mongodb-atlas-database)
  - [1b. Upstash Redis (Queue & Cache)](#1b-upstash-redis-queue--cache)
- [Step 2 — Push Code to GitHub](#step-2--push-code-to-github)
- [Step 3 — Deploy the Backend on Render](#step-3--deploy-the-backend-on-render)
- [Step 4 — Deploy the Frontend on Render](#step-4--deploy-the-frontend-on-render)
- [Step 5 — Deploy the Executor Service on Render](#step-5--deploy-the-executor-service-on-render)
- [Step 6 — Verify Everything Works](#step-6--verify-everything-works)
- [Environment Variables Reference](#-environment-variables-reference)
- [⚠️ Important Limitations](#️-important-limitations)
- [Troubleshooting](#-troubleshooting)

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        RENDER                                │
│                                                              │
│  ┌─────────────────┐   ┌─────────────────┐                   │
│  │   Frontend       │   │   Backend        │                  │
│  │   (Static Site)  │──▶│   (Web Service)  │                  │
│  │   React Build    │   │   Node.js/Express │                 │
│  └─────────────────┘   └────────┬──────────┘                  │
│                                 │                             │
│                     ┌───────────┼───────────┐                 │
│                     ▼                       ▼                 │
│         ┌──────────────────┐   ┌──────────────────┐           │
│         │  MongoDB Atlas    │   │  Upstash Redis   │          │
│         │  (External)       │   │  (External)      │          │
│         └──────────────────┘   └────────┬──────────┘          │
│                                         │                     │
│                              ┌──────────▼──────────┐          │
│                              │  Executor Service    │         │
│                              │  (Background Worker) │         │
│                              │  ⚠️ See limitations  │         │
│                              └─────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

Before you start, make sure you have:

- [x] A **[Render](https://render.com)** account (free tier works for testing)
- [x] A **[GitHub](https://github.com)** account with your CodeSphere repo pushed
- [x] A **[MongoDB Atlas](https://www.mongodb.com/atlas)** account (free M0 cluster)
- [x] An **[Upstash](https://upstash.com)** account (free Redis instance)
- [x] Your repo: `https://github.com/adityaa099/CodeSphere.git`

---

## Step 1 — Set Up External Services

### 1a. MongoDB Atlas (Database)

> Render doesn't have a built-in MongoDB service, so we use **MongoDB Atlas** (free tier).

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in
2. Create a **Free Shared Cluster** (M0 tier — free forever)
3. Choose **AWS** provider and a region close to your Render region (e.g., **US East**)
4. Under **Database Access**, create a database user:
   - Username: `codesphere_user`
   - Password: _(choose a strong password)_
   - Role: **Read and write to any database**
5. Under **Network Access**, add IP address:
   - Click **"Allow Access from Anywhere"** → adds `0.0.0.0/0`
   - ⚠️ This is required because Render uses dynamic IPs
6. Go to **Database → Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://codesphere_user:<password>@cluster0.xxxxx.mongodb.net/codesphere?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add `/codesphere` as the database name before the `?`

---

### 1b. Upstash Redis (Queue & Cache)

> Render doesn't offer a managed Redis on the free tier. **Upstash** provides a free serverless Redis.

1. Go to [https://console.upstash.com](https://console.upstash.com) and sign in
2. Click **Create Database**
3. Configure:
   - **Name**: `codesphere-redis`
   - **Region**: Select one close to your Render services (e.g., **US-East-1**)
   - **TLS (SSL)**: Enabled ✅
4. After creation, copy the **`REDIS_URL`** from the Details page. It looks like:
   ```
   rediss://default:<token>@<endpoint>.upstash.io:6379
   ```
   > ⚠️ Note: It starts with `rediss://` (double `s`) — this means TLS-secured connection.

---

## Step 2 — Push Code to GitHub

Make sure your latest code is pushed to GitHub:

```bash
cd "g:\devops project"
git add .
git commit -m "prepare for Render deployment"
git push origin main
```

> **Important**: Make sure `.env` is in your `.gitignore` (it already is ✅). Never push secrets to GitHub.

---

## Step 3 — Deploy the Backend on Render

### 3a. Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo: `adityaa099/CodeSphere`
3. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `codesphere-backend` |
| **Region** | Oregon (US West) or your preferred region |
| **Root Directory** | `backend` |
| **Runtime** | **Node** |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Instance Type** | Free (or Starter for better performance) |

### 3b. Set Environment Variables

Go to the **Environment** tab and add these variables:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://codesphere_user:<password>@cluster0.xxxxx.mongodb.net/codesphere?retryWrites=true&w=majority` |
| `REDIS_URL` | `rediss://default:<token>@<endpoint>.upstash.io:6379` |
| `JWT_SECRET` | _(generate a strong random string — e.g., `openssl rand -hex 32`)_ |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGIN` | `https://codesphere-frontend.onrender.com` _(your frontend URL — update after deploying frontend)_ |
| `EXECUTION_TIMEOUT` | `10000` |
| `MAX_MEMORY` | `256m` |
| `MAX_CPUS` | `1` |

4. Click **Create Web Service**
5. Wait for the build to complete. Once deployed, you'll get a URL like:
   ```
   https://codesphere-backend.onrender.com
   ```
6. Test the health endpoint:
   ```
   https://codesphere-backend.onrender.com/api/health
   ```
   You should see:
   ```json
   {
     "status": "OK",
     "service": "CodeSphere Backend",
     "timestamp": "...",
     "uptime": ...
   }
   ```

---

## Step 4 — Deploy the Frontend on Render

### Option A: Deploy as Static Site (Recommended ✅)

This is the best option — it's **free** and optimized for React apps.

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Static Site**
2. Connect your GitHub repo: `adityaa099/CodeSphere`
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `codesphere-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

4. Add Environment Variable (under **Environment**):

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://codesphere-backend.onrender.com/api` |

> ⚠️ **Important**: `REACT_APP_` env vars are baked into the build at **build time** in Create React App. If you change this variable, you **must re-deploy** (trigger a manual deploy) for the change to take effect.

5. Under **Redirects/Rewrites**, add a rule to support client-side routing:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | **Rewrite** |

> This ensures React Router works correctly — without it, refreshing on `/dashboard` or `/editor` will show a 404.

6. Click **Create Static Site**
7. Once deployed, your frontend will be live at:
   ```
   https://codesphere-frontend.onrender.com
   ```

### Option B: Deploy as Web Service (Alternative)

If you prefer running the `serve` static server (uses more resources):

| Setting | Value |
|---|---|
| **Name** | `codesphere-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build && npm install -g serve` |
| **Start Command** | `serve -s build -l $PORT` |
| **Instance Type** | Free |

> ⚠️ Add `REACT_APP_API_URL` as an environment variable (same as above).

---

## Step 5 — Deploy the Executor Service on Render

> [!CAUTION]
> **The executor service requires Docker-in-Docker** (`/var/run/docker.sock`), which is **NOT available on Render's free or standard tiers**. This is the biggest limitation of deploying on Render.

### Your Options:

#### Option A: Skip Executor Service (Quick Demo Deploy)

Deploy only the **frontend + backend** on Render. The app will work for auth, snippets, and dashboard — but **code execution will fail** because there's no Docker engine to run user code.

This is fine for:
- Demoing the UI and authentication flow
- Portfolio/resume showcasing
- Testing frontend ↔ backend integration

#### Option B: Run Executor on a VPS with Docker (Recommended for Full Functionality)

Deploy **frontend + backend** on Render, but run the **executor-service** on a cheap VPS that has Docker:

1. Get a VPS from **[Railway](https://railway.app)**, **[DigitalOcean](https://www.digitalocean.com)** ($4/mo droplet), or **[AWS EC2 Free Tier](https://aws.amazon.com/free/)**
2. Install Docker on the VPS:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Clone your repo and run only the executor:
   ```bash
   git clone https://github.com/adityaa099/CodeSphere.git
   cd CodeSphere/executor-service
   npm install
   ```
4. Set environment variables:
   ```bash
   export REDIS_URL="rediss://default:<token>@<endpoint>.upstash.io:6379"
   export EXECUTION_TIMEOUT=10000
   ```
5. Pull the required language Docker images:
   ```bash
   docker pull python:3.11-slim
   docker pull node:20-slim
   docker pull gcc:13
   docker pull eclipse-temurin:17-jdk-alpine
   docker pull golang:1.21-alpine
   docker pull rust:1.74-slim
   docker pull php:8.2-cli
   docker pull ruby:3.2-slim
   ```
6. Start the worker:
   ```bash
   node src/worker.js
   ```
   Or run with `pm2` for persistence:
   ```bash
   npm install -g pm2
   pm2 start src/worker.js --name codesphere-executor
   pm2 save
   pm2 startup
   ```

> Since the executor communicates with the backend **only through Redis** (Upstash), it doesn't matter where the executor runs — it just needs access to the same Redis instance.

#### Option C: Use Render Docker Environment (Paid)

On Render's **paid plans** ($7+/mo per service), you can deploy with a custom Docker runtime:

1. Go to **New** → **Web Service** (or **Background Worker**)
2. Connect your repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `codesphere-executor` |
| **Root Directory** | `executor-service` |
| **Runtime** | **Docker** |
| **Instance Type** | **Starter ($7/mo)** or higher |
| **Docker Command** | _(leave default — uses your Dockerfile)_ |

4. Add environment variables:

| Key | Value |
|---|---|
| `REDIS_URL` | `rediss://default:<token>@<endpoint>.upstash.io:6379` |
| `EXECUTION_TIMEOUT` | `10000` |

> ⚠️ Even with Render Docker, you may not have access to the Docker socket (`/var/run/docker.sock`). The executor requires **Docker-in-Docker** or a Docker socket mount, which most PaaS providers restrict for security reasons.

---

## Step 6 — Verify Everything Works

### 1. Backend Health Check
```bash
curl https://codesphere-backend.onrender.com/api/health
```
Expected: `{ "status": "OK", ... }`

### 2. Frontend
Visit `https://codesphere-frontend.onrender.com` in your browser.
- You should see the CodeSphere landing page
- Try registering a new account
- Try logging in

### 3. Update CORS (After Frontend Deploy)
Go back to your **backend** service on Render → **Environment** → Update:
```
CORS_ORIGIN=https://codesphere-frontend.onrender.com
```
Then trigger a **Manual Deploy** on the backend to apply the change.

### 4. Code Execution (If executor is running)
- Go to the editor page
- Select a language (e.g., Python)
- Write some code and click **Run**
- Check the output panel

---

## 📝 Environment Variables Reference

### Backend (`codesphere-backend`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port (Render sets this automatically) | `5000` |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/codesphere` |
| `REDIS_URL` | ✅ | Upstash Redis connection URL | `rediss://default:token@endpoint.upstash.io:6379` |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens | _(random 64-char hex string)_ |
| `JWT_EXPIRE` | ✅ | Token expiry duration | `7d` |
| `CORS_ORIGIN` | ✅ | Frontend URL for CORS | `https://codesphere-frontend.onrender.com` |
| `EXECUTION_TIMEOUT` | ❌ | Code execution timeout (ms) | `10000` |
| `MAX_MEMORY` | ❌ | Max memory per execution | `256m` |
| `MAX_CPUS` | ❌ | Max CPUs per execution | `1` |

### Frontend (`codesphere-frontend`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `REACT_APP_API_URL` | ✅ | Backend API URL (baked at build time) | `https://codesphere-backend.onrender.com/api` |

### Executor Service (if deployed)

| Variable | Required | Description | Example |
|---|---|---|---|
| `REDIS_URL` | ✅ | Same Upstash Redis URL as backend | `rediss://default:token@endpoint.upstash.io:6379` |
| `EXECUTION_TIMEOUT` | ❌ | Code execution timeout (ms) | `10000` |

---

## ⚠️ Important Limitations

### 🐌 Cold Starts on Free Tier
Render **spins down** free-tier web services after 15 minutes of inactivity. The first request after that takes **30–60 seconds** to respond. This is normal for free tier.

> **Tip**: Use [UptimeRobot](https://uptimerobot.com/) (free) to ping your backend URL every 14 minutes to keep it alive.

### 🐳 No Docker-in-Docker
Render does **not** provide Docker socket access on free/starter tiers. This means the **executor service** (which spawns Docker containers to run user code) won't work natively on Render.

### 🔒 No `/var/run/docker.sock`
The executor service uses `dockerode` to communicate with the Docker daemon via socket. This requires privileged access that Render doesn't provide.

### 📦 Build Size
The frontend build may take 2-4 minutes on Render's free tier. Be patient during first deployment.

---

## 🔧 Troubleshooting

### "Application failed to respond" / 502 Error
- Check **Logs** in Render Dashboard
- Make sure `PORT` env var matches what your app listens on
- Render auto-assigns a `PORT` — your backend already uses `process.env.PORT || 5000`, so this should work

### MongoDB Connection Errors
- Verify your `MONGO_URI` is correct (no `< >` brackets around password)
- Check MongoDB Atlas → **Network Access** → `0.0.0.0/0` is allowed
- Check MongoDB Atlas → **Database Access** → user has correct permissions

### Redis Connection Errors
- Verify the `REDIS_URL` starts with `rediss://` (with double `s` for TLS)
- Check Upstash dashboard to see if connections are coming through
- Make sure the Upstash database is in a region close to your Render service

### Frontend Shows Blank Page or API Errors
- Check that `REACT_APP_API_URL` was set **before** the build
- If you changed it after deploying, trigger a **Manual Deploy** to rebuild
- Open browser DevTools → **Console** and **Network** tab to check for errors
- Make sure CORS is configured on the backend (`CORS_ORIGIN` env var)

### "CORS policy" Errors in Browser
- Update the `CORS_ORIGIN` env var on the backend to exactly match your frontend URL
- Don't include a trailing slash: ✅ `https://codesphere-frontend.onrender.com` ❌ `https://codesphere-frontend.onrender.com/`
- Redeploy the backend after changing the env var

### React Router 404 on Page Refresh
- For Static Site: Add a rewrite rule `/* → /index.html` (see Step 4)
- For Web Service: The `serve -s` flag handles this automatically

---

## 🎯 Quick Deploy Checklist

```
[ ] MongoDB Atlas cluster created & connection string copied
[ ] Upstash Redis created & REDIS_URL copied
[ ] Code pushed to GitHub (main branch)
[ ] Backend deployed as Render Web Service
[ ] Backend env vars set (MONGO_URI, REDIS_URL, JWT_SECRET, CORS_ORIGIN)
[ ] Backend health check passes (/api/health)
[ ] Frontend deployed as Render Static Site
[ ] Frontend env var set (REACT_APP_API_URL)
[ ] Rewrite rule added for React Router (/* → /index.html)
[ ] CORS_ORIGIN updated on backend with actual frontend URL
[ ] Backend redeployed after CORS update
[ ] Registration & login tested on live site
[ ] (Optional) Executor service deployed on VPS with Docker
```

---

## 📚 Useful Links

- [Render Documentation](https://docs.render.com)
- [Render Node.js Deploy Guide](https://docs.render.com/deploy-node-express-app)
- [Render Static Sites](https://docs.render.com/static-sites)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/docs/atlas/getting-started/)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [CodeSphere GitHub Repo](https://github.com/adityaa099/CodeSphere)

---

> **Made with ❤️ for CodeSphere** | Last updated: June 2026
