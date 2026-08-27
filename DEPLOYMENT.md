# 🚀 WorkAble Deployment Guide (Render + Vercel + Docker)

This guide covers deploying the **WorkAble** platform to production:
- **Backend (Spring Boot REST API + Context Engine)**: Deployed on **[Render](https://render.com/)** using Docker containers.
- **Frontend (React SPA)**: Deployed on **[Vercel](https://vercel.com/)** (or via Docker container).
- **Databases**: Managed PostgreSQL (Render / Neon / Supabase) and MongoDB (MongoDB Atlas).

---

## 🏗️ Architecture Overview

```
+-------------------------------------------------------------------+
|                        VERCEL (Frontend)                          |
|  React 18 SPA + Tailwind CSS                                      |
|  URL: https://workable-frontend.vercel.app                        |
|  Env: REACT_APP_API_URL=https://workable-backend.onrender.com/api |
+---------------------------------+---------------------------------+
                                  |
                                  | HTTPS REST Requests
                                  v
+-------------------------------------------------------------------+
|                         RENDER (Backend)                          |
|  Java 17 Spring Boot Container (Port: $PORT / 10000)              |
|  URL: https://workable-backend.onrender.com                       |
|  Health Check: /api/health                                        |
+-------------------+-----------------------------+-----------------+
                    |                             |
      +-------------v-------------+ +-------------v-------------+
      |    PostgreSQL Database    | |      MongoDB Database     |
      |   (Users, Jobs, Apps)     | |         (Resumes)         |
      +---------------------------+ +---------------------------+
```

---

## 1. ☕ Backend Deployment on Render (Docker)

### Option A: 1-Click Render Blueprint (Recommended)

1. Push your repository to **GitHub**.
2. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New +** > **Blueprint**.
4. Connect your `WorkAble` repository.
5. Render will automatically read [`render.yaml`](render.yaml) and configure:
   - `workable-backend` (Spring Boot Web Service via Docker)
   - `workable-postgres` (Managed PostgreSQL Database)
   - `workable-context-engine` (FastAPI Python Service via Docker)
6. Fill in required environment variables (like `MONGODB_URI` and `GEMINI_API_KEY`).
7. Click **Apply**.

---

### Option B: Manual Web Service Setup on Render

1. Go to **[Render Dashboard](https://dashboard.render.com/)** > **New +** > **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Name**: `workable-backend`
   - **Region**: Oregon (or nearest region)
   - **Root Directory**: `backend-java`
   - **Runtime**: **Docker**
   - **Dockerfile Path**: `backend-java/Dockerfile`
   - **Instance Type**: Free / Starter

4. Add **Environment Variables**:

| Variable Name | Example Value / Description | Required |
|---|---|---|
| `PORT` | `10000` (Render handles this dynamically) | ✅ Yes |
| `SPRING_PROFILES_ACTIVE` | `production` | ✅ Yes |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>:<port>/<dbname>` | ✅ Yes |
| `SPRING_DATASOURCE_USERNAME` | `<postgres_user>` | ✅ Yes |
| `SPRING_DATASOURCE_PASSWORD` | `<postgres_password>` | ✅ Yes |
| `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/ai-job-accessibility?retryWrites=true&w=majority` | ✅ Yes |
| `JWT_SECRET` | `a_very_long_secure_random_secret_string_32_chars_min` | ✅ Yes |
| `GEMINI_API_KEY` | `AIzaSy...` (Google AI Studio Key) | ⚠️ Recommended |
| `CONTEXT_ENGINE_URL` | `http://localhost:8000` or URL of context engine | ⚪ Optional |
| `JOB_SYNC_ENABLED` | `true` | ⚪ Optional |

5. **Health Check Path**: `/api/health`
6. Click **Create Web Service**.

> **Note on PostgreSQL**: If you create a Render PostgreSQL database, copy the **External Connection String** (or Internal if in same Render region) and prefix it with `jdbc:` if not already present, e.g.:
> `SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-xxxxx:5432/ai_job_accessibility`

---

## 2. ⚡ Frontend Deployment on Vercel

### Step-by-Step Deployment:

1. Go to **[Vercel Dashboard](https://vercel.com/new)**.
2. Click **Add New...** > **Project** and import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click `Edit` and select `frontend`
4. Expand **Environment Variables**:
   - Add:
     - **Key**: `REACT_APP_API_URL`
     - **Value**: `https://<YOUR-RENDER-BACKEND-NAME>.onrender.com/api`
     *(Example: `https://workable-backend.onrender.com/api`)*
5. Click **Deploy**.

### SPA Routing & Redirects:
The [`frontend/vercel.json`](frontend/vercel.json) file handles all SPA rewrites automatically, ensuring routes like `/dashboard`, `/jobs`, and `/resume-builder` load without 404 errors on page reload.

---

## 3. 🐳 Local Multi-Container Deployment (Docker Compose)

To spin up the entire full-stack platform (PostgreSQL + MongoDB + Context Engine + Spring Boot Backend + React Nginx Frontend) locally with one command:

```bash
# 1. Start all containers
docker compose up --build

# 2. To run in background:
docker compose up -d --build

# 3. To stop all containers:
docker compose down
```

### Local Access Endpoints:
- 🎨 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- ☕ **Spring Boot Backend**: [http://localhost:5001](http://localhost:5001)
- 🧠 **AI Context Engine**: [http://localhost:8000](http://localhost:8000)
- 🩺 **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- 🐘 **PostgreSQL**: `localhost:5432` (`user: postgres`, `pass: postgrespassword`, `db: ai_job_accessibility`)
- 🍃 **MongoDB**: `localhost:27017` (`db: ai-job-accessibility`)

---

## 4. 🧪 Verification & Health Checks

Once deployed:

1. **Verify Backend Health**:
   ```bash
   curl -i https://<YOUR-BACKEND>.onrender.com/api/health
   ```
   *Expected Response:*
   ```json
   {
     "status": "UP",
     "service": "ai-job-accessibility-backend-java",
     "framework": "Spring Boot 3.3.4",
     "timestamp": 1724800000000
   }
   ```

2. **Verify Frontend**:
   - Open your Vercel URL: `https://<YOUR-FRONTEND>.vercel.app`
   - Test Sign Up / Login, Job Search, Resume Upload, and Voice Navigation.
   - Verify network requests in browser DevTools point to `https://<YOUR-BACKEND>.onrender.com/api/...` with HTTP 200 responses.
