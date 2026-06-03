<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# CarHub Monorepo

Project is split into:

- `frontend`: React + Vite app
- `backend`: Node.js + Express + TypeScript API

## Run Locally

**Prerequisites:** Node.js

Install dependencies from the repository root:

```bash
npm install
```

Run frontend:

```bash
npm run dev:frontend
```

Run backend in another terminal:

```bash
npm run dev:backend
```

Frontend: `http://localhost:3000`
Backend health check: `http://localhost:4000/api/health`

## API Overview

- `GET /api/posts`: community feed posts
- `POST /api/posts`: create a post with nested images
- `POST /api/posts/community`: compatibility endpoint for community post creation
- `GET /api/vehicles`: marketplace listings
- `POST /api/vehicles`: create marketplace listing
- `GET /api/vehicles/images`: seed vehicle image metadata for database import
- `GET /api/garage/vehicles`: user garage vehicles
- `POST /api/garage/vehicles`: create garage vehicle
- `GET /api/articles`: editorial/blog articles
- `POST /api/auth/login`: demo login with `alex@example.com` / `password123`

## Database

Backend uses PostgreSQL with Prisma.

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL`, for example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/carhub?schema=public
```

Generate Prisma client:

```bash
npm run db:generate --workspace backend
```

Create tables:

```bash
npm run db:migrate --workspace backend
```

Seed 1 user and 2 posts with images:

```bash
npm run db:seed --workspace backend
```

Create a post with images:

```http
POST http://localhost:4000/api/posts
Content-Type: application/json
```

```json
{
  "title": "My first garage post",
  "summary": "Short intro for the post",
  "content": "Long post content goes here.",
  "status": "PUBLISHED",
  "authorId": "USER_ID_FROM_SEED_OR_DATABASE",
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200",
      "publicId": "posts/my-first-image",
      "caption": "Main garage photo"
    }
  ]
}
```

Query posts with author and images:

```bash
curl http://localhost:4000/api/posts
```

For a destructive local reset of app-owned tables:

```bash
npm run db:drop-schema --workspace backend
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```
