# Cộng tác phát triển CarHub

## Thiết lập lần đầu

```powershell
git clone https://github.com/PhamQuang138/KTPM_ProjectX.git
cd KTPM_ProjectX
npm install
Copy-Item backend/.env.example backend/.env
```

Điền các biến môi trường thật vào `backend/.env`. Không gửi mật khẩu database,
JWT secret hoặc token Vercel Blob qua GitHub.

```powershell
npm run db:generate --workspace backend
npm run db:migrate:deploy --workspace backend
npm run dev
```

Ứng dụng local:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api/health`

## Quy trình làm việc

Mỗi thành viên nên tạo nhánh riêng cho từng chức năng:

```powershell
git switch main
git pull origin main
git switch -c feature/ten-chuc-nang
```

Sau khi sửa:

```powershell
npm run lint
npm run build
git add .
git commit -m "mo ta ngan gon thay doi"
git push -u origin feature/ten-chuc-nang
```

Tạo Pull Request trên GitHub để một thành viên khác kiểm tra trước khi merge vào
`main`.

Trước khi bắt đầu công việc mới:

```powershell
git switch main
git pull origin main
```

## Quy tắc dữ liệu và bảo mật

- Không commit `.env`, `.env.vercel`, thư mục `.vercel`, log hoặc `node_modules`.
- Chỉ commit các file `.env.*.example` không chứa thông tin bí mật.
- Không chạy `db:seed` trên database dùng chung nếu chưa thống nhất, vì script seed
  có thể xóa dữ liệu hiện có.
- Dùng migration Prisma khi thay đổi schema database.
- Không force-push vào `main`.
- Nếu có xung đột Git, giải quyết trên nhánh chức năng và kiểm tra lại trước khi merge.
