# Huong dan cai dat va phat trien CarHub

Tai lieu nay danh cho thanh vien moi clone project ve may va chay lan dau tren Windows/VS Code.

## 1. Yeu cau phan mem

Can cai truoc:

- Node.js 20 tro len
- npm
- PostgreSQL 17 hoac ban tuong duong
- Git
- VS Code

Kiem tra trong terminal:

```powershell
node -v
npm -v
git --version
```

Neu chua co Node.js:

```powershell
winget install OpenJS.NodeJS.LTS
```

Neu chua co PostgreSQL:

```powershell
winget install PostgreSQL.PostgreSQL.17
```

Sau khi cai Node.js hoac PostgreSQL, nen dong VS Code va mo lai de terminal nhan PATH moi.

## 2. Lay source code va cai thu vien

```powershell
git clone https://github.com/PhamQuang138/KTPM_ProjectX.git
cd KTPM_ProjectX
npm install
```

Project dung npm workspace:

- `frontend`: React + Vite
- `backend`: Express + Prisma

Khong chay `npm install` rieng trong tung folder neu khong can thiet. Hay chay o thu muc goc project.

## 3. Cau hinh bien moi truong

Tao file backend `.env` tu file mau:

```powershell
copy backend\.env.example backend\.env
```

Neu dang dung PowerShell, lenh nay cung duoc:

```powershell
Copy-Item backend\.env.example backend\.env
```

Mo file:

```text
backend/.env
```

Kiem tra cac dong quan trong:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://postgres:123456@127.0.0.1:5432/carhub?schema=public
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
```

Sua `DATABASE_URL` cho dung mat khau PostgreSQL tren may ban.

Vi du neu mat khau PostgreSQL la `postgres`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/carhub?schema=public
```

`JWT_SECRET` phai dai it nhat 32 ky tu. Vi du local:

```env
JWT_SECRET=local-development-secret-at-least-32-chars
```

Frontend co the khong can `.env` khi chay local, vi Vite da proxy `/api` sang backend. Neu can tao:

```powershell
copy frontend\.env.example frontend\.env
```

## 4. Tao database PostgreSQL

Mac dinh project can database ten:

```text
carhub
```

Neu `createdb` da co trong PATH:

```powershell
createdb -U postgres carhub
```

Neu Windows khong nhan lenh `createdb`, dung duong dan day du:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres carhub
```

Neu bao database da ton tai thi co the bo qua.

Kiem tra PostgreSQL co dang chay khong:

```powershell
Get-Service postgresql*
```

Neu service chua chay:

```powershell
Start-Service postgresql-x64-17
```

## 5. Chay migration va nap du lieu mau

Chay trong thu muc goc project:

```powershell
npm run db:generate --workspace backend
npm run db:migrate:deploy --workspace backend
npm run db:seed --workspace backend
```

Ghi chu:

- `db:migrate:deploy` dung de ap cac migration co san.
- `db:seed` nap du lieu mau va co the xoa/ghi lai du lieu mau. Khong chay tren database dung chung neu chua thong nhat voi nhom.

## 6. Chay ung dung local

Chay ca frontend va backend:

```powershell
npm run dev
```

Dia chi:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:4000/api/health`

Chay rieng tung phan:

```powershell
npm run dev:backend
npm run dev:frontend
```

Neu PowerShell bao loi `npm.ps1 cannot be loaded because running scripts is disabled`, dung:

```powershell
npm.cmd run dev
```

Hoac doi Execution Policy cho user hien tai:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 7. Tai khoan va du lieu mau

Sau khi chay seed, project se co du lieu mau cho:

- bai viet cong dong
- xe trong Garage
- tin dang marketplace
- bai viet editorial

Co the tao them admin bang:

```powershell
npm run db:ensure-admin --workspace backend
```

Thong tin admin lay tu `backend/.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123456
```

## 8. Lenh kiem tra truoc khi commit

Chay TypeScript check:

```powershell
npm run lint
```

Build project:

```powershell
npm run build
```

Neu sua database schema:

```powershell
npm run db:migrate --workspace backend
```

Sau do commit ca file trong `backend/prisma/migrations`.

## 9. Quy trinh lam viec voi Git

Tao nhanh rieng cho moi chuc nang:

```powershell
git switch main
git pull origin main
git switch -c feature/ten-chuc-nang
```

Sau khi sua:

```powershell
npm run lint
npm run build
git status
git add .
git commit -m "mo ta ngan gon thay doi"
git push -u origin feature/ten-chuc-nang
```

Tao Pull Request tren GitHub de thanh vien khac review truoc khi merge vao `main`.

Truoc khi bat dau viec moi:

```powershell
git switch main
git pull origin main
```

## 10. Quy tac bao mat va du lieu

- Khong commit `backend/.env`, `frontend/.env`, `.vercel`, log, `node_modules`, file build trong `dist`.
- Chi commit cac file `.env.example`.
- Khong dua mat khau database, JWT secret, SMTP password, OpenRouter key, Vercel Blob token len GitHub.
- Khong chay seed/reset tren database production hoac database dung chung neu chua thong nhat.
- Dung Prisma migration khi thay doi schema.
- Khong force-push vao `main`.

## 11. Loi thuong gap

### `npm` hoac `node` is not recognized

Node.js chua duoc cai hoac terminal chua nhan PATH.

```powershell
winget install OpenJS.NodeJS.LTS
```

Dong VS Code va mo lai, sau do kiem tra:

```powershell
node -v
npm -v
```

### Prisma `P1001: Can't reach database server`

PostgreSQL chua chay hoac sai host/port.

```powershell
Get-Service postgresql*
Start-Service postgresql-x64-17
```

### Prisma `P1000: Authentication failed`

Sai mat khau trong `DATABASE_URL`.

Mo `backend/.env` va sua:

```env
DATABASE_URL=postgresql://postgres:<mat-khau-dung>@127.0.0.1:5432/carhub?schema=public
```

### Database `carhub` does not exist

Tao database:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres carhub
```

### Tao tai khoan tren web bi loi 500

Thuong la backend chua ket noi duoc database hoac chua migrate.

```powershell
npm run db:migrate:deploy --workspace backend
npm run db:seed --workspace backend
npm run dev
```

Xem log terminal backend de biet loi chi tiet.
