# CarHub Garage - Product & System Presentation

Deck 24 slide trình bày đầy đủ bài toán, nghiệp vụ, trải nghiệm sản phẩm, kiến
trúc, dữ liệu, AI, bảo mật, triển khai và định hướng của CarHub Garage.

Deck sử dụng presenter mode và có lời thuyết trình tiếng Việt trong từng slide.

## Cách sử dụng

- Mở `index.html` trong trình duyệt.
- `←` `→` hoặc Space: chuyển slide.
- `S`: mở cửa sổ presenter gồm slide hiện tại, slide kế tiếp, lời thuyết trình
  và bộ đếm thời gian.
- `F`: toàn màn hình.
- `O`: xem tổng quan slide.
- `T`: đổi theme.
- `N`: mở nhanh speaker notes.

Theme mặc định là `tokyo-night`; có thể chuyển sang Dracula, Catppuccin Mocha,
Nord hoặc Corporate Clean bằng phím `T`.

## Xuất PowerPoint chỉnh sửa được

Chạy từ thư mục gốc:

```powershell
& ".agents/skills/html-ppt/scripts/export-editable-pptx.ps1" `
  -HtmlPath ".agents/skills/html-ppt/examples/carhub-overview/index.html" `
  -OutputPath ".agents/skills/html-ppt/examples/carhub-overview/CarHub-Garage-Editable.pptx"
```

File xuất dùng text box và shape native của PowerPoint nên có thể sửa chữ,
màu sắc, kích thước và vị trí từng thành phần.
