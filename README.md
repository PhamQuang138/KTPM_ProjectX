# CarHub Garage

CarHub Garage is a full-stack web application for vehicle marketplace listings and automotive community posts.

## Project Structure

- `frontend`: React + Vite + TypeScript
- `backend`: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM

## Main Features

### User

Account management:

- Register account
- Login
- Logout

Community:

- Create sharing posts
- Upload/add images to posts
- View community post feed
- Read automotive editorial articles

Marketplace:

- Create vehicle sale listings
- Manage vehicles in personal Garage
- View vehicles currently for sale
- Search and view vehicle information

### Admin

- Manage users
- Manage community posts
- Manage vehicle listings
- Moderate system content

Admin login is configured with `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `backend/.env`.

Admin page:

```txt
http://localhost:3000/admin
```

## Requirements

- Node.js
- npm
- PostgreSQL

## Install

From the repository root:

```bash
npm install
```

## Environment

Create:

```txt
backend/.env
```

Use `backend/.env.example` as a template:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/carhub?schema=public
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

Generate a local JWT secret in PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Replace the example values for `JWT_SECRET` and `ADMIN_PASSWORD` before starting the backend.

## Database

Generate Prisma client:

```bash
npm run db:generate --workspace backend
```

Run migrations:

```bash
npm run db:migrate --workspace backend
```

Create or update the admin account without deleting user data:

```bash
npm run db:ensure-admin --workspace backend
```

Seed demo data. This resets app data:

```bash
npm run db:seed --workspace backend
```

Open Prisma Studio:

```bash
npm run db:studio --workspace backend
```

## Cloud Database Setup

Recommended provider: Neon PostgreSQL.

1. Create a Neon project.
2. Click `Connect` in the Neon dashboard.
3. Copy the direct PostgreSQL connection string. It should look like:

```txt
postgresql://USER:PASSWORD@HOST.neon.tech/DB_NAME?sslmode=require
```

4. Paste that value into `backend/.env` as `DATABASE_URL`.
5. Run:

```bash
npm run db:generate --workspace backend
npm run db:migrate --workspace backend
npm run db:ensure-admin --workspace backend
```

Use the same `DATABASE_URL` on every teammate's machine to share the same cloud data.

## Run

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Frontend URL:

```txt
http://localhost:3000
```

Backend health check:

```txt
http://localhost:4000/api/health
```

## Demo User

After seeding:

```txt
email: alex@example.com
password: password123
```

## API Overview

Authentication:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Community posts:

- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/community`
- `POST /api/posts/community`

Vehicles:

- `GET /api/vehicles`
- `POST /api/vehicles`
- `GET /api/vehicles/images`

Garage:

- `GET /api/garage/vehicles`
- `POST /api/garage/vehicles`

Articles:

- `GET /api/articles`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/posts`
- `PATCH /api/admin/posts/:id/status`
- `DELETE /api/admin/posts/:id`
- `GET /api/admin/vehicles`
- `DELETE /api/admin/vehicles/:id`

## Local Reset

This deletes app-owned tables and data:

```bash
npm run db:drop-schema --workspace backend
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```
