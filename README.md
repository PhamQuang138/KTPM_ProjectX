# CarHub Garage

CarHub Garage là nền tảng web full-stack dành cho cộng đồng yêu ô tô, kết hợp giữa mạng xã hội chia sẻ nội dung, quản lý Garage cá nhân, chợ mua bán xe và trợ lý tìm xe bằng AI.

Dự án được xây dựng theo mô hình monorepo với frontend và backend tách biệt, sử dụng PostgreSQL để lưu trữ dữ liệu, OpenRouter cho tính năng AI và Vercel Blob để lưu trữ hình ảnh trên môi trường production.

---

# Công nghệ sử dụng

## Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS
* Zustand

## Backend

* Node.js
* Express
* TypeScript
* Prisma ORM

## Database

* PostgreSQL
* Neon PostgreSQL (khuyến nghị)

## AI

* OpenRouter
* Hỗ trợ tìm kiếm xe bằng ngôn ngữ tự nhiên và nhận diện xe từ hình ảnh

## Lưu trữ hình ảnh

* Vercel Blob Storage

---

# Chức năng chính

## Quản lý tài khoản

Người dùng có thể:

* Đăng ký tài khoản
* Đăng nhập, đăng xuất
* Quên mật khẩu và đặt lại mật khẩu
* Cập nhật thông tin cá nhân
* Thay đổi ảnh đại diện và ảnh bìa
* Theo dõi thành viên khác
* Đánh giá thành viên
* Nhận huy hiệu xác thực (Verified)

---

## Cộng đồng ô tô

Người dùng có thể:

* Tạo bài viết chia sẻ
* Đăng nhiều hình ảnh trong một bài viết
* Thích bài viết
* Bình luận bài viết
* Lưu bài viết
* Chia sẻ bài viết
* Xem bảng tin cộng đồng
* Đọc các bài viết chuyên đề về ô tô

---

## Garage cá nhân

Người dùng có thể:

* Thêm xe vào Garage cá nhân
* Quản lý thông tin xe
* Cập nhật hoặc xóa xe
* Lưu trữ nhiều hình ảnh cho mỗi xe

Garage đóng vai trò là nơi quản lý các phương tiện đang sở hữu trước khi đưa lên Marketplace.

---

## Marketplace

Người dùng có thể:

* Đăng tin bán xe
* Tạo tin bán trực tiếp từ Garage
* Chỉnh sửa hoặc xóa tin bán
* Đánh dấu xe đã bán
* Tìm kiếm xe theo nhiều tiêu chí
* Lưu tin yêu thích
* Bình luận trên tin bán
* Đánh giá người bán

Hệ thống hỗ trợ:

* Tìm kiếm theo hãng xe
* Kiểu xe
* Năm sản xuất
* Nhiên liệu
* Hộp số
* Tình trạng xe
* Sắp xếp theo mới nhất hoặc phổ biến nhất

---

## Nhắn tin

Người dùng có thể:

* Tạo cuộc trò chuyện với thành viên khác
* Liên hệ trực tiếp với người bán từ tin đăng
* Gửi và nhận tin nhắn
* Theo dõi trạng thái đã đọc

---

## Thông báo

Hệ thống hỗ trợ thông báo cho các hoạt động:

* Like bài viết
* Bình luận
* Theo dõi tài khoản
* Tương tác Marketplace
* Tin nhắn mới

---

## Trợ lý AI tìm xe

CarHub tích hợp chatbot AI hỗ trợ:

* Tìm xe bằng tiếng Việt tự nhiên
* Tìm xe theo ngân sách
* Tìm xe theo nhu cầu sử dụng
* So sánh các mẫu xe
* Nhận diện xe từ hình ảnh
* Hiểu hội thoại nhiều lượt
* Đề xuất xe phù hợp từ dữ liệu thực trong hệ thống

Ví dụ:

* "Tìm SUV dưới 1 tỷ"
* "Xe Nhật nào đáng mua?"
* "Cho tôi 3 xe gia đình dưới 800 triệu"
* "Chiếc xe trong ảnh là gì?"

AI chỉ hỗ trợ phân tích và tìm kiếm, không tự tạo dữ liệu hoặc tin đăng giả.

---

## Quản trị hệ thống

Tài khoản quản trị có thể:

* Quản lý người dùng
* Quản lý bài viết cộng đồng
* Quản lý Garage
* Quản lý tin đăng Marketplace
* Quản lý bài viết chuyên đề
* Xác thực tài khoản
* Kiểm duyệt nội dung hệ thống

---

# Cài đặt dự án

## Yêu cầu

* Node.js 20 trở lên
* PostgreSQL hoặc Neon PostgreSQL
* npm

## Cài đặt thư viện

Tại thư mục gốc của dự án:

```bash
npm install
```

---

# Cấu hình môi trường

Tạo file:

```text
backend/.env
```

Sử dụng file:

```text
backend/.env.example
```

làm mẫu cấu hình.

---

# Cấu hình cơ sở dữ liệu

Tạo Prisma Client:

```bash
npm run db:generate --workspace backend
```

Chạy migration:

```bash
npm run db:migrate:deploy --workspace backend
```

Tạo tài khoản quản trị:

```bash
npm run db:ensure-admin --workspace backend
```

Sinh dữ liệu mẫu:

```bash
npm run db:seed --workspace backend
```

---

# Chạy dự án

Chạy đồng thời frontend và backend:

```bash
npm run dev
```

Hoặc chạy riêng:

```bash
npm run dev:frontend
npm run dev:backend
```

Sau khi chạy:

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:4000/api/health
```

---

# Triển khai

Dự án được cấu hình để triển khai trên Vercel theo mô hình Multi-Service:

* Frontend 
* Backend 

Các dịch vụ cần thiết trên môi trường production:

* PostgreSQL (Neon)
* Vercel Blob Storage
* OpenRouter API

Backend tự động chạy Prisma Migration trong quá trình build và deploy.

---

# Ghi chú

* Hình ảnh được lưu trên Vercel Blob, không lưu trực tiếp trong cơ sở dữ liệu.
* AI chỉ được gọi từ backend để bảo vệ API Key.
* Dữ liệu trong PostgreSQL chỉ lưu metadata và đường dẫn ảnh.
* Hệ thống hỗ trợ mở rộng thêm tính năng Marketplace, AI và Social Community trong tương lai.
