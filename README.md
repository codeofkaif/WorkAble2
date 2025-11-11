# AI Job Accessibility — Project README

Quick, systematic guide for developers.

## What this project is
A full-stack web app to help persons with disabilities build accessible resumes and find inclusive jobs. It includes:
- Frontend: React + TypeScript with accessibility-first components
- Backend: Node.js + Express + MongoDB for auth and resume persistence
- Accessibility features: keyboard navigation, voice input, high-contrast theme, font sizing
- AI features: resume generation (OpenAI integration) and PDF export

## Repo layout (essential)
- `frontend/` — React app (TypeScript)
  - `src/components/` — UI components (ResumeBuilder, AccessibilityToolbar)
  - `src/contexts/AccessibilityContext.tsx` — global accessibility state
  - `src/hooks/` — `useKeyboardNavigation`, `useVoiceCommands`
  - `src/services/resumeAPI.ts` — API client
- `backend/` — Node + Express
  - `server.js` — server entry
  - `models/` — `User.js`, `Resume.js`
  - `routes/` — `resumeRoutes.js`
  - `middleware/auth.js` — JWT middleware
  - `config.env` — environment variables (not checked into VCS)
- `database/` — DB scripts or exports (if present)

## Quick start (developer)
Open two terminals: one for backend, one for frontend.

1) Backend

```zsh
cd ai-job-accessibility/backend
npm install
# create a config.env based on config.env.example (or set env vars)
# Example env vars:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/ai-job-accessibility
# JWT_SECRET=change-this
npm start
```

2) Frontend

```zsh
cd ai-job-accessibility/frontend
npm install
npm start
```

Frontend default: http://localhost:3000
Backend default: http://localhost:5000 (check `config.env`)

If `npm start` is not defined, try `node server.js` in backend and `npm run dev` in frontend depending on scripts.

## API (essential endpoints)
- POST /api/auth/register — register user
- POST /api/auth/login — login and receive JWT
- POST /api/resume — create resume (protected)
- GET /api/resume — list resumes for user (protected)
- POST /api/resume/generate — AI generate resume

## Development tips
- Check `ai-job-accessibility/backend/package.json` and `ai-job-accessibility/frontend/package.json` for exact scripts and port overrides.
- Use MongoDB Atlas or a local MongoDB instance. Set `MONGODB_URI` in `config.env`.
- For voice features, use HTTPS in production (Web Speech API requires secure context).

## Quick architecture/data flow
1. User interacts with React UI components.
2. Accessibility context + hooks manage state and controls (keyboard/voice).
3. UI calls `resumeAPI` which hits backend routes.
4. Express uses Mongoose models to persist resumes and users in MongoDB.
5. AI generation calls OpenAI from the backend and returns structured resume content.

## Checklist for a clean local run (if things fail)
- [ ] Node (v16+) installed
- [ ] MongoDB running and reachable via `MONGODB_URI`
- [ ] `config.env` exists in `backend/` with required keys
- [ ] Frontend and backend dependencies installed
- [ ] Use browser console and backend logs to debug CORS or API errors

## Next improvements (small, safe)
- Add root-level scripts to start both services with `concurrently` or a Makefile
- Add a small `dev:env` example file in `backend/` (`config.env.example`) and mention it in this README
- Add a smoke test that posts a sample resume to `/api/resume` after startup

## Where to look for more details
- Accessibility list: `ACCESSIBILITY-FEATURES.md`
- Resume builder notes: `ResumeBuilder-README.md`
- Backend routes and models: `backend/routes/` and `backend/models/`

---

If you want, I can:
- Add exact `npm`/`node` scripts to a root `package.json` or Makefile to start both services with one command.
- Open and verify the `package.json` scripts now and update this README with precise commands.

Choose next step: inspect scripts and update README with exact commands, or add a one-command dev starter. (Reply with your preference.)
