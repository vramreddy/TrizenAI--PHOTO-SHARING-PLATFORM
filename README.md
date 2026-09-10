# SnapShare — Collaborative Event Photo Sharing Platform

> A full-stack photo-sharing application built for the TrizenAI Full-Stack Internship Challenge. Enables photography teams to collaboratively upload event photos, allows admins to curate and publish galleries, and provides customers with PIN-protected gallery access — no account required.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Design](#-database-design)
- [Features](#-features)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Deployment](#-deployment)
- [Demo Credentials](#-demo-credentials)
- [API Documentation](#-api-documentation)
- [Known Limitations](#-known-limitations)

---

## 🎯 Project Overview

SnapShare solves the real-world problem of collaborative event photography management:

1. **Admin/Lead** creates an event and adds team members
2. **Team Members** upload photos from the event
3. **Admin** reviews, selects the best photos, and publishes a gallery
4. **Customer** receives a shareable link + PIN to view the published gallery

```
Admin → Creates Event → Adds Team → Team Uploads → Admin Selects → Publishes Gallery
                                                                          ↓
                                                        Customer → PIN → Views Gallery
```

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18 + Vite | Fast builds, HMR, component-based UI |
| **Styling** | Tailwind CSS v4 | Utility-first, responsive design system |
| **Animations** | Framer Motion | Smooth page transitions, micro-interactions |
| **Backend** | Express.js 5 | Minimal, flexible Node.js framework |
| **Database** | MongoDB Atlas + Mongoose | Flexible schemas, free tier, cloud-hosted |
| **Image Storage** | Cloudinary | Object storage with built-in transformations (thumbnails, optimization) |
| **Authentication** | JWT (access + refresh) + bcrypt | Stateless auth, secure password hashing |
| **Validation** | Joi | Schema-based request validation |
| **File Upload** | Multer (memoryStorage) | Zero-disk-IO, buffers uploaded directly to Cloudinary |
| **Testing** | Jest + Supertest + mongodb-memory-server | API integration tests with in-memory DB |
| **Deployment** | Vercel (frontend) + Render (backend) | Free tiers, Git-based deployments |

---

## 🏗 Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │  REST   │              │  ODM    │              │
│  React SPA   │────────▶│  Express.js  │────────▶│  MongoDB     │
│  (Vercel)    │◀────────│  API Server  │         │  Atlas       │
│              │         │  (Render)    │         │              │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │
                         ┌──────▼───────┐
                         │  Cloudinary  │
                         │  (Images)    │
                         └──────────────┘
```

### Key Architecture Decisions

- **Separate gallery access tokens**: Public gallery access uses a separate JWT (not user auth tokens), issued after PIN verification, valid for 2 hours
- **Memory-based uploads**: Files are held in memory buffers, never written to server disk, and streamed directly to Cloudinary
- **Hashed PINs**: Gallery PINs are bcrypt-hashed just like passwords — never stored in plaintext
- **Eager thumbnails**: Cloudinary generates 400×400 thumbnails via transformations, stored as separate URLs in the database

---

## 📊 Database Design

### Collections

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│    User    │     │   Event    │     │   Photo    │     │  Gallery   │
├────────────┤     ├────────────┤     ├────────────┤     ├────────────┤
│ _id        │◀────│ createdBy  │     │ eventId    │────▶│ eventId    │
│ name       │     │ _id        │◀────│ _id        │     │ _id        │
│ email      │◀──┐ │ name       │     │ uploadedBy │     │ title      │
│ password   │   │ │ description│     │ filename   │     │ slug       │
│ role       │   └─│ teamMembers│     │ storageUrl │     │ pinHash    │
│ createdAt  │     │ status     │     │ thumbnailUrl│    │ published  │
└────────────┘     │ createdAt  │     │ publicId   │     │ publishedAt│
                   └────────────┘     │ fileSize   │     │ photoCount │
                                      │ selected   │     │ createdBy  │
                                      │ createdAt  │     └────────────┘
                                      └────────────┘
```

### Indexes
- `Photo: { eventId, createdAt }` — Fast photo listing by event
- `Photo: { eventId, selected }` — Fast gallery photo queries
- `Gallery: { slug }` — Unique slug lookups for public access
- `Event: { createdBy, createdAt }` — Admin's events

---

## ✨ Features

### Core Features
- ✅ Admin registration & login
- ✅ Event creation & management
- ✅ Team member management (add/remove)
- ✅ Multi-file photo upload (up to 20 at once)
- ✅ Photo selection/deselection (bulk operations)
- ✅ Gallery creation with custom title & description
- ✅ PIN-protected gallery access (bcrypt-hashed)
- ✅ Shareable gallery link generation
- ✅ Customer gallery view (no account needed)

### Security
- ✅ JWT authentication with refresh tokens
- ✅ Role-based authorization (admin vs team_member)
- ✅ Event membership verification
- ✅ Hashed gallery PINs (never stored as plaintext)
- ✅ Separate gallery access tokens (2-hour TTL)
- ✅ File type & size validation (JPEG/PNG/WebP, 10MB max)
- ✅ Rate limiting (general + auth-specific)
- ✅ Helmet security headers
- ✅ CORS configuration

### UX/UI
- ✅ Dark mode glassmorphism design
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Drag-and-drop photo upload with previews
- ✅ Animated page transitions (Framer Motion)
- ✅ Individual PIN digit input with auto-advance
- ✅ Masonry photo grid layout
- ✅ Full-screen lightbox with keyboard navigation
- ✅ Infinite scroll pagination
- ✅ Toast notifications
- ✅ Loading states & empty states

### Bonus Features
- ✅ Bulk upload (up to 20 files)
- ✅ Auto-generated thumbnails (via Cloudinary)
- ✅ Infinite scroll pagination
- ✅ Photo filtering (all/selected/unselected)
- ✅ Photo download from lightbox
- ✅ Demo data seed script

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free M0 tier)
- Cloudinary account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/snapshare.git
cd snapshare

# Install all dependencies (root + client + server)
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your credentials (see section below)

# Seed demo data
cd server && npm run seed && cd ..

# Start development servers (both client + server)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 🔐 Environment Variables

Create `server/.env` based on `server/.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret` |
| `JWT_EXPIRES_IN` | Access token TTL | `1d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `CLIENT_URL` | Frontend URL (CORS) | `http://localhost:5173` |
| `GALLERY_TOKEN_SECRET` | Gallery access token secret | `gallery-secret` |
| `GALLERY_TOKEN_EXPIRES_IN` | Gallery token TTL | `2h` |

> ⚠️ Never commit the `.env` file to Git. It is included in `.gitignore`.

---

## 🧪 Running Tests

```bash
cd server
npm test
```

Tests use `mongodb-memory-server` for an isolated in-memory database — no external MongoDB needed.

### Test Coverage

| Suite | Tests |
|-------|-------|
| Authentication | Register, login, token validation, protected routes |
| Authorization | Admin vs team_member access controls |
| Events | CRUD, team member management, access isolation |
| Gallery | Creation, publishing, PIN verification, token-based access |

---

## 🌍 Deployment

### Frontend → Vercel
1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL = https://your-backend.onrender.com/api`

### Backend → Render
1. Create Web Service on [render.com](https://render.com)
2. Set root directory: `server`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add all environment variables from `.env.example`

### MongoDB → MongoDB Atlas
1. Create free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user and whitelist IP (0.0.0.0/0 for Render)
3. Copy connection string to `MONGODB_URI`

### Cloudinary
1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Copy cloud name, API key, and API secret to `.env`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@snapshare.com | admin123 |
| Team Member | rahul@snapshare.com | member123 |
| Team Member | priya@snapshare.com | member123 |

| Gallery | Value |
|---------|-------|
| URL | `/gallery/{slug}` (shown in admin dashboard) |
| PIN | `482917` |

> Run `npm run seed` in the server directory to populate these demo accounts and sample data.

---

## 📡 API Documentation

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register admin |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Public | Refresh token |
| GET | `/api/auth/me` | Auth | Current user |

### Events
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/events` | Admin | Create event |
| GET | `/api/events` | Auth | List events |
| GET | `/api/events/:id` | Auth | Event details |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Delete event |
| POST | `/api/events/:id/members` | Admin | Add member |
| DELETE | `/api/events/:id/members/:uid` | Admin | Remove member |

### Photos
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/events/:eid/photos` | Auth (member) | Upload photos |
| GET | `/api/events/:eid/photos` | Auth (member/admin) | List photos |
| PATCH | `/api/events/:eid/photos/select` | Admin | Select/deselect |
| DELETE | `/api/events/:eid/photos/:pid` | Auth (owner/admin) | Delete photo |

### Gallery
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/events/:eid/gallery` | Admin | Create/update gallery |
| PUT | `/api/events/:eid/gallery/publish` | Admin | Publish gallery |
| GET | `/api/events/:eid/gallery` | Admin | Gallery details |
| GET | `/api/gallery/:slug` | Public | Gallery metadata |
| POST | `/api/gallery/:slug/verify` | Public | Verify PIN |
| GET | `/api/gallery/:slug/photos` | Gallery Token | Gallery photos |

---

## ⚠️ Known Limitations

1. **No real-time updates** — Team member uploads don't auto-refresh on admin dashboard (would need WebSocket/SSE)
2. **No photo reordering** — Gallery photos are sorted by upload date only
3. **Single admin model** — Each admin sees only their own events (no multi-admin collaboration per event)
4. **No password reset** — Not implemented for this MVP
5. **Client-side only search** — No server-side full-text photo search

---

## 📁 Project Structure

```
snapshare/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Shared UI components
│   │   ├── context/                 # React context (auth)
│   │   ├── layouts/                 # Layout wrappers
│   │   ├── pages/
│   │   │   ├── admin/               # Admin dashboard, events, detail
│   │   │   ├── auth/                # Login, register
│   │   │   ├── gallery/             # Public gallery (PIN, viewer)
│   │   │   └── team/                # Team member dashboard, upload
│   │   ├── services/                # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # DB, Cloudinary config
│   │   ├── controllers/             # Route handlers
│   │   ├── middleware/              # Auth, upload, validation, errors
│   │   ├── models/                  # Mongoose schemas
│   │   ├── routes/                  # API routes
│   │   ├── seeds/                   # Demo data seeder
│   │   ├── tests/                   # Jest + Supertest tests
│   │   ├── utils/                   # Validators, Cloudinary, slug
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── README.md
├── .gitignore
└── package.json                     # Root (concurrently)
```

---

## 👤 Author

**Venkata Rami Reddy**

Built for the TrizenAI Full-Stack Internship Challenge.

---

## 📄 License

MIT
