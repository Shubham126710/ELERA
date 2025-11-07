# Elera – Adaptive Learning (MERN)

An adaptive practice platform with a rules-driven engine, per-topic mastery tracking, and a pastel minimalist React UI.

## Features
- JSON-based rules to scale difficulty and spaced repetition
- Per-topic mastery with streaks and time-on-task
- Dynamic question selection with coverage and recency filtering
- Immediate feedback with hints and explanations
- JWT auth with roles (student/instructor)
- Instructor analytics (heatmap + trajectory)
- Seed scripts and Docker Compose
 - Multiple courses/subjects with standard MCQs seeded

## Quickstart

### 1) Backend

Create `.env` in `backend/` (ports are pinned for easy multi-service dev):

```
PORT=5050
MONGO_URI=mongodb://localhost:27017/elera
JWT_SECRET=devsecret
```

Install and seed:

```
cd backend
npm install
npm run seed
npm run dev:5050   # or use dev:5000 if you prefer the original port
```

API will be at http://localhost:5050 (or http://localhost:5000 if you used `dev:5000`)

If MongoDB is not running locally, the server automatically falls back to an in-memory database (mongodb-memory-server) so you can develop & run tests without a real instance.

### 2) Frontend

```
cd ../frontend
npm install
npm run dev:api5050  # ensures VITE_API_BASE aligns with backend on 5050
```

Open http://localhost:5173 (frontend port pinned by Vite)

Demo account: `demo@elera.test` / `password`

### Courses & Subjects

- Standard courses are seeded in `backend/seed/seed.js`:
  - Mathematics (subjects: Algebra, Geometry)
  - Computer Science (subject: Data Structures)
- The React UI lets a learner select a Course and Subject before fetching the next question.
- Backend endpoints:
  - `GET /api/courses` (auth required) → list courses
  - `GET /api/courses/:course/subjects` (auth required) → list subjects for a course
  - `GET /api/courses/:course/questions?topic=...&difficulty=...` (auth required) → browse questions
  - `POST /api/quiz/next` accepts optional `{ course, topic }` for filtered adaptive selection

### Theming & UI

- Final palette: peach `#ffd6c9` base, cobalt `#1e4fff` accents
- Animated loading splash: wordmark + cobalt stroke underline (SVG path draw)
- Hero headline with matching animated underline for brand continuity
- Minimal navbar with animated underline hover indicator
- Flip‑card auth component (login / signup) with 3D rotation
- CTA button sheen + caret slide animation
- Playful cobalt graffiti-style SVG doodles (stroke draw + float animations)

## Docker

```
docker compose up --build
```

Backend: http://localhost:5050  |  MongoDB: mongodb://localhost:27017

## Tests

```
cd backend
npm test
```

Includes an end‑to‑end auth → courses → quiz integration test (`tests/authFlow.test.js`) using supertest against the exported Express app and the in‑memory Mongo fallback.

## Notes
- Rules are defined per topic (see `backend/models/Rule.js`) and seeded.
- Spacing: engine avoids repeating a question within its cooldown window.
- Mastery updates use an EWMA; alpha varies by assessment mode.
- Frontend environment variable: `VITE_API_BASE` (see `package.json` scripts) pins API host.
- Expand the UI as needed; endpoints are mounted under `/api/*` in `server.js`.

## Deploying to Netlify (Vite + React)

This repo is a monorepo; the frontend lives in `frontend/` and is built with Vite (outputs to `frontend/dist`). We've added a `netlify.toml` at the repo root so Netlify builds the right subfolder and publishes the correct directory.

What Netlify uses:

- Build command: `npm ci && npm --prefix frontend run build`
- Publish directory: `frontend/dist`
- Node version: 20

Single‑page app routing:

- We included `frontend/public/_redirects` with:
  
  `/* /index.html 200`
  
  This ensures client‑side routing (if added later) works by serving `index.html` for any route.

Environment variables:

- Vite uses the `VITE_` prefix. Set this in Netlify → Site settings → Environment variables:
  
  `VITE_API_BASE=https://<your-backend-host>`
  
  If you leave it unset, the app will call relative `/api/...` paths on the same origin.

Troubleshooting blank screen on Netlify:

- Make sure Netlify is publishing `frontend/dist`, not the raw `frontend/` folder. If the raw source is published, the HTML will reference `/src/main.jsx` which doesn’t exist in production, leading to a blank page.
- Check the browser console for 404s on JS assets or CORS errors.

## Deploying the Backend to Render

You can deploy the Node/Express backend quickly using Render. A `render.yaml` blueprint is included at the repo root.

### Steps
1. Push the latest commits so `render.yaml` is in `main`.
2. Log in to Render and choose New + Blueprint.
3. Point to your GitHub repo (main branch). Render will parse `render.yaml`.
4. Accept defaults or choose the free plan for the `elera-backend` service.
5. Environment variables automatically provisioned:
  - `JWT_SECRET` (auto‑generated)
  - (Optional) Add `MONGO_URI` if you want persistent storage (Mongo Atlas or Render Mongo service). If omitted, the server falls back to the in‑memory Mongo for demo behavior—data resets on each deploy.
6. Deploy; note the generated service URL like: `https://elera-backend.onrender.com`

### After Deploy
- Health check: curl the root: `curl https://elera-backend.onrender.com/` → `Adaptive Learning API Running ✅`
- Auth endpoints will be at `https://elera-backend.onrender.com/api/auth/login` etc.

## Connecting Frontend (Netlify) to Backend (Render)

Set the frontend env var so API calls hit the live backend:

Netlify → Site settings → Environment variables:

`VITE_API_BASE=https://elera-backend.onrender.com`

Redeploy the site or trigger a new build. The React app now uses absolute URLs for all fetch calls.

### Verify End‑to‑End
1. Open the Netlify site.
2. Sign up or login (demo account still works if seeded questions exist on backend).
3. Open DevTools Network tab; requests should go to the Render domain.
4. If CORS errors appear, ensure backend has `cors()` (already configured in `server.js`).

### Common Issues
- Blank responses: Check backend logs in Render dashboard.
- 404 on `/api/...`: Backend still warming or deploy failed—retry after a minute.
- In‑memory Mongo lost data: Provide a persistent `MONGO_URI` so data survives restarts.
