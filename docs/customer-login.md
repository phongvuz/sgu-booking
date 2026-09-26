# Đăng nhập khách hàng

- POST `/api/auth/login`: JSON `{ "identifier": "email hoặc số điện thoại", "password": "..." }`.
- Đối chiếu `user` và `customer` qua số điện thoại; chỉ chấp nhận role `CUSTOMER` và status `Đang hoạt động`.
- Mật khẩu dùng định dạng scrypt do chức năng đăng ký tạo. Không chấp nhận mật khẩu lưu dạng văn bản thuần.
- Phiên ký HMAC có thời hạn 24 giờ, lưu trong cookie HttpOnly, SameSite=Lax, Secure khi chạy production. `getCurrentCustomer()` kiểm tra lại role và trạng thái trong database; dùng hàm này tại các API cần xác thực khách hàng.
- POST `/api/auth/logout` xóa cookie trên trình duyệt. Token đã sao chép trước khi đăng xuất vẫn có hiệu lực đến hết hạn; phiên hiện dùng chữ ký, không có bảng thu hồi token.
- Cấu hình `SESSION_SECRET` ít nhất 32 ký tự ngẫu nhiên trong môi trường triển khai, dùng chung giữa các instance và giữ bí mật. Đã tạo giá trị cho `.env` cục bộ. Thay secret sẽ vô hiệu hóa tất cả phiên hiện có.
- Chạy kiểm thử: `node --test --experimental-test-isolation=none tests/login.test.cjs tests/register.test.cjs`.
