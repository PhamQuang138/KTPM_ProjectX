# CarHub Garage

CarHub Garage la nen tang mua ban xe va cong dong danh cho nguoi yeu xe. Du an hien duoc to chuc theo monorepo:

- `frontend`: React + Vite
- `backend`: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM

## Chuc Nang Chinh

- Dang ky, dang nhap, dang xuat
- Dang bai viet cong dong co hinh anh
- Luu bai viet vao PostgreSQL, refresh van con du lieu
- Dang tin ban xe tu My Garage
- Xem cac bai viet va listing xe cua user hien tai
- Marketplace va community feed thong qua REST API

## Run Locally

Prerequisites:

- Node.js
- PostgreSQL

Install dependencies from the repository root:

```bash
npm install
```

Run backend:

```bash
npm run dev:backend
```

Run frontend in another terminal:

```bash
npm run dev:frontend
```

Frontend: `http://localhost:3000`

Backend health check: `http://localhost:4000/api/health`

## Database Setup

Create `backend/.env` from `backend/.env.example`, then set:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/carhub?schema=public
```

Generate Prisma client:

```bash
npm run db:generate --workspace backend
```

Run migrations:

```bash
npm run db:migrate --workspace backend
```

Seed test data:

```bash
npm run db:seed --workspace backend
```

Open Prisma Studio:

```bash
npm run db:studio --workspace backend
```

## Test Account

After seeding:

```txt
email: alex@example.com
password: password123
```

## API Overview

- `POST /api/auth/signup`: create user and return JWT
- `POST /api/auth/login`: login and return JWT
- `POST /api/auth/logout`: logout response for client-side token removal
- `GET /api/posts`: get posts with author and images
- `POST /api/posts`: create post with nested images
- `GET /api/posts/community`: get posts in frontend community-card format
- `POST /api/posts/community`: create community post
- `GET /api/vehicles`: get vehicle listings
- `POST /api/vehicles`: create vehicle listing
- `GET /api/vehicles/images`: get seed vehicle image metadata
- `GET /api/garage/vehicles`: get current user's garage vehicles by `sellerId`
- `POST /api/garage/vehicles`: create garage vehicle/listing
- `GET /api/articles`: get editorial articles

## Example Create Post

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
  "authorId": "USER_ID_FROM_DATABASE",
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200",
      "publicId": "posts/my-first-image",
      "caption": "Main garage photo"
    }
  ]
}
```

## Local Reset

For a destructive local reset of app-owned tables:

```bash
npm run db:drop-schema --workspace backend
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```
