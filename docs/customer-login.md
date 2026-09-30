# Đăng nhập khách hàng và quản trị viên

- POST `/api/auth/login`: JSON `{ "identifier": "email hoặc số điện thoại", "password": "..." }`.
- Khách hàng: đối chiếu `user` và `customer` qua số điện thoại; yêu cầu role `CUSTOMER` và status `Đang hoạt động`.
- Quản trị viên: đăng nhập bằng số điện thoại của `user` có role `ADMIN`, không cần bản ghi `customer`. API trả `redirectTo: "/admin"`; khách hàng nhận `redirectTo: "/"`. Role lấy từ database, không lấy từ form.
- Mật khẩu dùng định dạng scrypt. Riêng ADMIN cũ có mật khẩu văn bản thuần (không chứa dấu `:`), lần đăng nhập đúng đầu tiên tự chuyển sang scrypt trước khi cấp phiên. CUSTOMER không chấp nhận mật khẩu văn bản thuần.
- `/admin/*` yêu cầu phiên ADMIN; API nhân viên và thao tác tạo/sửa/xóa chuyến xe kiểm tra quyền ADMIN mỗi request (403 nếu không có quyền). Header quản trị hiển thị tên tài khoản và nút đăng xuất.
- Phiên ký HMAC có thời hạn 24 giờ, lưu trong cookie HttpOnly, SameSite=Lax, Secure khi chạy production. `getCurrentCustomer()` kiểm tra lại role và trạng thái trong database; dùng hàm này tại các API cần xác thực khách hàng.
- POST `/api/auth/logout` xóa cookie trên trình duyệt. Token đã sao chép trước khi đăng xuất vẫn có hiệu lực đến hết hạn; phiên hiện dùng chữ ký, không có bảng thu hồi token.
- Cấu hình `SESSION_SECRET` ít nhất 32 ký tự ngẫu nhiên trong môi trường triển khai, dùng chung giữa các instance và giữ bí mật. Đã tạo giá trị cho `.env` cục bộ. Thay secret sẽ vô hiệu hóa tất cả phiên hiện có.
- Chạy kiểm thử: `node --test --experimental-test-isolation=none tests/login.test.cjs tests/register.test.cjs`.
