# 🚀 Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide provides step-by-step instructions for deploying your **Smart Attendance System** web application with the frontend hosted on **Vercel** and the Node.js / Express backend hosted on **Render**.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Step 1: MongoDB Database Setup (Atlas)](#step-1-mongodb-database-setup-atlas)
3. [Step 2: Deploy Backend to Render](#step-2-deploy-backend-to-render)
4. [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
5. [Step 4: Final Environment Linking](#step-4-final-environment-linking)
6. [Troubleshooting & Gotchas](#-troubleshooting--gotchas)

---

## 🛠 Prerequisites

- A **GitHub / GitLab / Bitbucket** account with your project repository pushed.
- A **MongoDB Atlas** account (free cluster available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)).
- A **Render** account ([render.com](https://render.com)).
- A **Vercel** account ([vercel.com](https://vercel.com)).

---

## Step 1: MongoDB Database Setup (Atlas)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (Free M0 cluster works great).
3. Under **Database Access**, create a database user (e.g. `dbuser` with a strong password).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render servers can connect.
5. Click **Connect** on your cluster -> **Drivers** -> Copy your Connection String (`MONGO_URI`), which looks like:
   ```env
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/attendance_system?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Blueprints (Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Select the repository branch and point to `backend/render.yaml`.
5. Render will automatically detect the web service configuration. Fill in the required secret environment variables:
   - `MONGO_URI`: Your MongoDB Atlas Connection String from Step 1.
   - `CLIENT_URL`: Your Vercel domain (you can update this after Step 3, e.g. `https://your-app.vercel.app`).
6. Click **Apply**.

### Option B: Manual Web Service Setup

1. On Render Dashboard, click **New +** -> **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `smart-attendance-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add **Environment Variables**:
   - `PORT` = `10000`
   - `MONGO_URI` = `your_mongodb_atlas_connection_string`
   - `JWT_SECRET` = `your_jwt_secret_key`
   - `CLIENT_URL` = `https://your-frontend-name.vercel.app` (or `*` during initial testing)
5. Click **Create Web Service**.
6. Copy your deployed backend URL (e.g. `https://smart-attendance-backend.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://smart-attendance-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://smart-attendance-backend.onrender.com`
   *(Replace `smart-attendance-backend.onrender.com` with your actual Render URL from Step 2)*.
6. Click **Deploy**.
7. Copy your deployed Vercel URL (e.g. `https://smart-attendance-frontend.vercel.app`).

---

## Step 4: Final Environment Linking

1. Go back to your **Render Dashboard** -> Your Backend Web Service -> **Environment**.
2. Update `CLIENT_URL` to your official Vercel domain:
   ```env
   CLIENT_URL=https://smart-attendance-frontend.vercel.app
   ```
3. Save changes. Render will automatically redeploy the backend with proper CORS security.

---

## 🔍 Troubleshooting & Gotchas

### 1. WebSockets / Socket.io on Render
- Render free tier web services support WebSockets natively!
- Ensure `VITE_SOCKET_URL` in Vercel environment settings matches your Render host domain without `/api` or trailing slashes (e.g. `https://your-app.onrender.com`).

### 2. Cold Starts on Render Free Tier
- On the free plan, Render puts web services to sleep after 15 minutes of inactivity.
- The first request after sleep may take ~30 seconds to spin up.
- The `/api/health` endpoint can be used with a free monitoring service like UptimeRobot to keep the instance active if needed.

### 3. File Uploads (`/uploads`)
- Local file storage (`uploads/`) on Render is ephemeral (files are deleted when the service restarts or redeploys).
- For persistent production image/face storage, consider integrating Cloudinary, AWS S3, or Firebase Storage in future updates.

### 4. Client-side Routing 404s
- The included `frontend/vercel.json` configures SPA rewrites so React Router links (e.g., `/student`, `/teacher`) continue to work seamlessly when refreshed directly in the browser.
