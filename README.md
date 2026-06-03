# 🚗 CarHub Garage

> Nền tảng mua bán xe và cộng đồng dành cho những người yêu xe.

## 📖 Giới thiệu

**CarHub Garage** là hệ thống web được xây dựng nhằm kết hợp giữa **sàn giao dịch mua bán xe** và **cộng đồng chia sẻ kiến thức về xe** trên cùng một nền tảng.

Người dùng có thể đăng tin bán xe, tìm kiếm phương tiện phù hợp, tham gia cộng đồng, chia sẻ kinh nghiệm sử dụng xe và cập nhật các bài viết chuyên sâu về lĩnh vực ô tô.

Dự án được phát triển theo mô hình **Full-Stack Web Application** với kiến trúc tách biệt giữa Frontend và Backend, sử dụng PostgreSQL để lưu trữ dữ liệu.

---

# 🎯 Mục tiêu dự án

* Xây dựng hệ thống web hoàn chỉnh theo quy trình phát triển phần mềm.
* Áp dụng các kiến thức về:

  * Phân tích yêu cầu phần mềm (SRS)
  * Thiết kế hệ thống bằng UML
  * Thiết kế cơ sở dữ liệu
  * Lập trình Web Full-Stack
  * Kiểm thử và triển khai hệ thống
* Tạo môi trường kết nối giữa người mua, người bán và cộng đồng yêu xe.

---

# ✨ Chức năng chính

## 👤 Người dùng

### Quản lý tài khoản

* Đăng ký tài khoản
* Đăng nhập
* Đăng xuất

### Cộng đồng

* Tạo bài viết chia sẻ
* Đăng tải hình ảnh cho bài viết
* Xem danh sách bài viết cộng đồng
* Đọc các bài viết chuyên đề về ô tô

### Mua bán xe

* Đăng tin bán xe
* Quản lý xe trong Garage cá nhân
* Xem danh sách xe đang bán
* Tìm kiếm và xem thông tin xe

---

## 🛠️ Quản trị viên

* Quản lý người dùng
* Quản lý bài viết cộng đồng
* Quản lý tin đăng xe
* Kiểm duyệt nội dung hệ thống

---

# 🏗️ Kiến trúc hệ thống

Dự án được tổ chức theo mô hình **Monorepo**:

```text
CarHub-Garage/
│
├── frontend/      # Giao diện người dùng
├── backend/       # API và xử lý nghiệp vụ
│
└── README.md
```

## Frontend

* React
* TypeScript
* Vite

## Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication

## Cơ sở dữ liệu

* PostgreSQL
* Prisma ORM

---

# 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ               |
| ---------- | ----------------------- |
| Frontend   | React, Vite, TypeScript |
| Backend    | Node.js, Express.js     |
| Database   | PostgreSQL              |
| ORM        | Prisma                  |
| Xác thực   | JWT                     |
| API        | RESTful API             |

---

# 🚀 Hướng dẫn cài đặt

## Yêu cầu hệ thống

Trước khi chạy dự án cần cài đặt:

* Node.js
* PostgreSQL
* npm

---

## Cài đặt thư viện

Tại thư mục gốc của dự án:

```bash
npm install
```

---

# ⚙️ Cấu hình môi trường

Tạo file:

```bash
backend/.env
```

Dựa trên file:

```bash
backend/.env.example
```

Ví dụ:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/carhub?schema=public"
JWT_SECRET="your-secret-key"
```

---

# 🗄️ Thiết lập cơ sở dữ liệu

## Tạo Prisma Client

```bash
npm run db:generate --workspace backend
```

## Chạy Migration

```bash
npm run db:migrate --workspace backend
```

## Khởi tạo dữ liệu mẫu

```bash
npm run db:seed --workspace backend
```

## Mở Prisma Studio

```bash
npm run db:studio --workspace backend
```

---

# ▶️ Chạy hệ thống

## Chạy Backend

```bash
npm run dev:backend
```

Địa chỉ:

```text
http://localhost:4000
```

Kiểm tra API:

```text
http://localhost:4000/api/health
```

---

## Chạy Frontend

Mở terminal mới:

```bash
npm run dev:frontend
```

Địa chỉ:

```text
http://localhost:3000
```

---

# 🔐 Tài khoản thử nghiệm

Sau khi chạy lệnh seed dữ liệu:

```text
Email: alex@example.com
Mật khẩu: password123
```

---

# 📡 API chính

## Xác thực người dùng

| Phương thức | Endpoint         |
| ----------- | ---------------- |
| POST        | /api/auth/signup |
| POST        | /api/auth/login  |
| POST        | /api/auth/logout |

---

## Quản lý bài viết

| Phương thức | Endpoint             |
| ----------- | -------------------- |
| GET         | /api/posts           |
| POST        | /api/posts           |
| GET         | /api/posts/community |
| POST        | /api/posts/community |

---

## Quản lý xe

| Phương thức | Endpoint             |
| ----------- | -------------------- |
| GET         | /api/vehicles        |
| POST        | /api/vehicles        |
| GET         | /api/vehicles/images |

---

## Garage cá nhân

| Phương thức | Endpoint             |
| ----------- | -------------------- |
| GET         | /api/garage/vehicles |
| POST        | /api/garage/vehicles |

---

## Bài viết chuyên đề

| Phương thức | Endpoint      |
| ----------- | ------------- |
| GET         | /api/articles |

---

# 🔄 Khởi tạo lại dữ liệu

⚠️ Lưu ý: Thao tác này sẽ xóa toàn bộ dữ liệu hiện có.

```bash
npm run db:drop-schema --workspace backend
npm run db:migrate --workspace backend
npm run db:seed --workspace backend
```

---

# 🚀 Hướng phát triển

Trong tương lai, hệ thống có thể được mở rộng với các chức năng:

* Gợi ý xe thông minh bằng AI
* So sánh xe tự động
* Dự đoán giá xe theo thị trường
* Phân tích hình ảnh xe bằng AI
* Đánh giá và xếp hạng người bán
* Danh sách yêu thích
* Chat trực tiếp giữa người mua và người bán
* Hệ thống khuyến nghị cá nhân hóa

---

# 👨‍💻 Nhóm phát triển

**Đề tài môn Kỹ thuật phần mềm**

**CarHub Garage – Lái đam mê, Chia sẻ, Kết nối.**
