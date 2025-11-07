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
