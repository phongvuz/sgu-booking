# Đăng ký khách hàng

`POST /api/auth/register` nhận `fullName`, `email`, `phone`, `address` (tùy chọn), `password`, `confirmPassword`, `agreeTerms`.

API tạo `user` với role `CUSTOMER` và `customer` trong cùng transaction. Mật khẩu lưu theo định dạng `scrypt:salt:hash`; không lưu mật khẩu gốc. Hai bản ghi dùng chung số điện thoại duy nhất. Chưa thêm khóa ngoại vì cấu trúc bảng được cung cấp không có cột liên kết. `customer.id` sinh bằng cuid, `status` mặc định `Đang hoạt động`, `createdAt` do database sinh.

## Cấu hình database

Tạo `.env` tại thư mục gốc với URL MySQL thực tế:

```dotenv
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/sgu-booking"
```

Database cần có bảng `user` với khóa chính `id` tự tăng như bản SQL của dự án. Migration mới nhắm đến tên bảng viết thường theo SQL được cung cấp. Nếu database dùng tên `User` trên MySQL phân biệt hoa thường, cần thống nhất tên bảng và các khóa ngoại trước khi áp dụng.

Với database được quản lý bằng Prisma Migrate và đã đồng bộ migration history, chạy `npx prisma migrate deploy`, rồi `npx prisma generate`.

Với database import từ SQL/phpMyAdmin, không chạy lại migration khởi tạo. Áp dụng riêng file `prisma/migrations/20260926000000_customer_registration/migration.sql` một lần rồi chạy `npx prisma generate`. File này tạo bảng customer nếu chưa có và thêm unique index cho `user.phone`, `customer.email`, `customer.phone`. Nếu các index đã có, bỏ qua câu tạo index tương ứng. Cần xử lý dữ liệu trùng trước khi thêm index; không tự động xóa dữ liệu cũ. Nếu customer đã tồn tại, bảng cần có khóa chính id như model Prisma.

## Kiểm tra

Chạy `node --test tests/register.test.cjs`. Các test dùng database giả lập để kiểm tra validation, dữ liệu ghi, băm mật khẩu và xử lý lỗi; không thay thế kiểm thử MySQL thực tế.

Sau khi cấu hình database, đăng ký qua `/register` rồi kiểm tra cả hai bảng. Thử đăng ký lại cùng email/số điện thoại: API phải trả 409 và không thêm bản ghi. Khi một thao tác ghi thất bại, transaction Prisma phải rollback cả hai thao tác.

Trang đăng nhập hiện vẫn là giao diện mô phỏng có sẵn. Chức năng đăng nhập sau này cần kiểm tra hash scrypt trong `user.password`; đăng ký không tự tạo phiên đăng nhập.
