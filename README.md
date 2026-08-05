# VARUNA — AI-Powered Smart Municipal Flood & Waterlogging Management System

VARUNA connects citizens and municipal drainage teams on a single platform. Citizens report
waterlogging issues with a photo and automatic GPS location; municipal staff triage, assign,
and resolve those reports from a live command dashboard — both talking to the same backend.

```
varuna/
├── backend/                # Node.js + Express + MongoDB REST API
├── citizen-portal/         # React + Vite + Tailwind — public-facing citizen app
├── municipal-dashboard/    # React + Vite + Tailwind — internal admin console
└── README.md                (this file)
```

---

## 1. Architecture overview

| Layer                | Stack                                             | Port (dev) |
|-----------------------|----------------------------------------------------|:---------:|
| Backend API            | Node.js, Express, MongoDB/Mongoose, JWT, Multer    | `5000`    |
| Citizen Portal         | React 18, Vite, Tailwind CSS, React Router          | `5173`    |
| Municipal Dashboard    | React 18, Vite, Tailwind CSS, Recharts, Leaflet     | `5174`    |

Both frontends talk to the **same backend** over REST (`/api/...`). Auth is JWT-based with a
`role` claim (`citizen` or `admin`); each frontend stores its own token under a different
`localStorage` key so a citizen and an admin session can coexist in the same browser during
development.

### Database collections
- **Users** — citizens and admins (role-based), addresses, auth
- **Complaints** — category, severity, description, photo, GeoJSON location, status timeline,
  assigned worker
- **Workers** — municipal field staff, ward/zone, workload, ratings
- **Notifications** — per-citizen status/assignment alerts

---

## 2. Prerequisites

- Node.js **18+** and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

---

## 3. Backend setup

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed               # optional: populates demo admin, citizens, workers, complaints
npm run dev                 # starts on http://localhost:5000 (nodemon)
# or: npm start
```

Health check: `GET http://localhost:5000/api/health`

If you ran `npm run seed`, you can log in immediately with:
- **Admin:** `admin@varuna.gov.in` / `admin123`
- **Citizen:** `anisha@example.com` / `citizen123`

### Key environment variables (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/varuna
JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRES_IN=7d
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174
MAX_FILE_SIZE_MB=5
```

---

## 4. Citizen Portal setup

```bash
cd citizen-portal
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

Features: registration/login (JWT), home page, report waterlogging (photo upload + browser
geolocation + category/severity/description), complaint history with search/filter/pagination,
complaint tracking with a visual status timeline, notifications, emergency contacts, and profile
management. Fully responsive from mobile to desktop.

---

## 5. Municipal Dashboard setup

```bash
cd municipal-dashboard
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5174
```

Features: admin login, analytics dashboard (trend/status/category/severity charts via Recharts),
interactive Leaflet map of reported locations, complaints management (search, filter, pagination,
assign to worker, update status with citizen-visible notes), citizen management (activate/
deactivate accounts), and field worker management (add/update/remove, duty status).

---

## 6. Running all three together

Open three terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd citizen-portal && npm run dev

# Terminal 3
cd municipal-dashboard && npm run dev
```

Then visit:
- Citizen Portal → http://localhost:5173
- Municipal Dashboard → http://localhost:5174

Both apps call the backend at `http://localhost:5000/api` by default (configurable via
`VITE_API_BASE_URL` in each frontend's `.env`).

---

## 7. REST API summary

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

**Auth**
- `POST /auth/register` — citizen self-registration
- `POST /auth/login` — citizen or admin login (`role` optional filter)
- `GET /auth/me` / `PUT /auth/me` — profile
- `PUT /auth/change-password`

**Complaints**
- `POST /complaints` *(citizen, multipart)* — create with photo
- `GET /complaints` *(citizen: own only; admin: all, with `search/status/category/severity/page/limit`)*
- `GET /complaints/:id`
- `PUT /complaints/:id/status` *(admin)*
- `PUT /complaints/:id/assign` *(admin)*
- `DELETE /complaints/:id` *(admin)*
- `GET /complaints/map/locations` *(admin)*
- `GET /complaints/analytics/summary` *(admin)*

**Workers** *(admin only)* — `GET/POST /workers`, `GET/PUT/DELETE /workers/:id`

**Users (citizens)** *(admin only)* — `GET /users`, `GET /users/:id`, `PUT /users/:id/status`

**Notifications** — `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`,
`DELETE /notifications/:id`

Uploaded complaint photos are served statically from `/uploads/complaints/<filename>`.

---

## 8. Production notes

- Set a strong, random `JWT_SECRET` and restrict `CLIENT_ORIGINS` to your real domains.
- Put the backend behind HTTPS; set `NODE_ENV=production`.
- Swap local disk storage (Multer) for S3/Cloud Storage if deploying to an ephemeral filesystem
  (e.g. most PaaS platforms wipe local disk on redeploy).
- Both frontends are static builds (`npm run build` → `dist/`) — deploy to any static host
  (Vercel, Netlify, S3+CloudFront, Nginx) and point `VITE_API_BASE_URL` at your deployed backend.
- Add MongoDB indexes are already defined in the schemas (`2dsphere` on complaint location,
  plus status/category/citizen indexes) for query performance at scale.

---

## 9. Tech stack summary

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Recharts, React-Leaflet, Lucide icons
- **Backend:** Express 4, Mongoose 8, JSON Web Tokens, Multer, Helmet, express-rate-limit,
  express-validator
- **Database:** MongoDB (GeoJSON for complaint locations)
