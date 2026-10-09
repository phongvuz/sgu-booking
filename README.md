# Nhà xe Sài Gòn

Bài học CRUD thực hành: [tự viết API quản lý đơn hàng](docs/exercises/orders/README.md). Các API đơn hàng đang có TODO để hoàn thành theo bài học; bản gốc và hướng dẫn khôi phục nằm trong tài liệu.

Ứng dụng đặt vé xe dùng Next.js App Router, React, TypeScript, Prisma và MySQL. Khách có thể tìm chuyến, chọn ghế, tra cứu vé; trang `/admin` quản lý chuyến xe, vé, xe, nhân viên và tài khoản.

## Chạy ở máy cá nhân

Cần Node.js 20.9 trở lên và MySQL đang chạy.

```sh
npm ci
```

Tạo file `.env` tại thư mục gốc, thay các giá trị mẫu bằng cấu hình của bạn:

```dotenv
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@localhost:3306/nha_xe_sai_gon"
SESSION_SECRET="thay-bang-chuoi-ngau-nhien-it-nhat-32-ky-tu"
```

Tạo Prisma Client, chạy migration cho database mới và khởi động ứng dụng:

```sh
npx prisma generate
npm run db:deploy
npm run dev
```

Database đã import từ `sgu-booking.sql`: dùng `npm run db:upgrade`. Lệnh này kiểm tra dữ liệu, sao lưu vào `.local-backups/`, bổ sung bảng còn thiếu, xác nhận baseline và chạy migration. Không reset database.

Migration đang dùng nằm tại `prisma/admin-migrations/` và được khai báo trong `prisma.config.ts`. Thư mục `prisma/migrations/` giữ lịch sử cũ để đối chiếu. Script nâng cấp dừng nếu database đang dùng một lịch sử migration khác.

Chuyến xe dùng `id` tự tăng và `tripId` kiểu số nguyên dương. API JSON nhận `tripId` là số (ví dụ `123`); tham số URL được chuyển sang số trước khi xử lý. Chuyến xe không còn trường `code`. Migration `20261009040000_numeric_trip_id` bỏ cột này và giữ nguyên ID, quan hệ vé/giữ ghế và các mã PNR đã lưu. Với database hiện có, chạy `npm run db:upgrade` để sao lưu trước khi áp dụng migration, sau đó chạy `npx prisma generate` và khởi động lại ứng dụng.

Mở `http://localhost:3000`. Tài khoản quản trị cần có role `ADMIN` trong database.

Nếu cần dữ liệu mẫu, thiết lập biến môi trường `SEED_PASSWORD` (6–128 ký tự) rồi chạy `npx prisma db seed`. Seed chỉ chạy trên database hoàn toàn trống, lưu mật khẩu đã hash và không xóa dữ liệu hiện có. Tài khoản ADMIN mẫu dùng số điện thoại `0987654321` với mật khẩu bạn đã thiết lập.

## Kiểm tra và build

```sh
npm run lint
npm run typecheck
npm test
npm run test:admin-db
npm run build
npm start
```

`npm start` chạy bản production đã tạo bằng `npm run build`. `npm test` chạy test độc lập với database. `npm run test:admin-db` tạo database tạm, kiểm tra nghiệp vụ với MySQL/MariaDB thật rồi xóa riêng database tạm đó. Người dùng database cần quyền CREATE DATABASE và DROP DATABASE để chạy lệnh kiểm tra này.

## Tìm code ở đâu

- `app/`: trang và API.
- `components/`: giao diện được chia theo tính năng.
- `hooks/`: state của danh sách, bộ lọc, tải dữ liệu và hành động bất đồng bộ.
- `services/*Service.ts`: truy vấn database phía server; `services/client*Service.ts`: gọi API từ trình duyệt.
- `lib/api-client.ts`: xử lý HTTP và thông báo lỗi dùng chung.
- `lib/validations/`: schema Zod kiểm tra dữ liệu nhập.
- `lib/record-mappers.ts`: chuyển bản ghi database thành dữ liệu trả về cho giao diện.
- `types/`: kiểu dữ liệu dùng chung; `prisma/`: schema, migration và seed; `tests/`: test hồi quy.

Màu thương hiệu và font được cấu hình trong `app/globals.css` và `app/layout.tsx`. Các tuyến và giá vé trên trang chủ lấy từ database; ảnh và nội dung gợi ý du lịch nằm trong `components/home/content.tsx` và `lib/home-content.ts`.


## Nghiệp vụ admin

- ADMIN đang hoạt động mới truy cập được trang và API quản trị. Có nút đăng xuất, bảo vệ tài khoản đang đăng nhập và quản trị viên hoạt động cuối cùng.
- Tài khoản USER là hồ sơ người mua vé; CUSTOMER là khách đã đăng ký có hồ sơ email. Chỉnh sửa CUSTOMER đồng bộ tên, điện thoại và trạng thái với bảng customer. Khóa tài khoản giữ lịch sử vé và vô hiệu hóa các phiên đăng nhập hiện có.
- Hồ sơ nhân viên quản lý thông tin nhân sự, không tự tạo tài khoản đăng nhập. Tạo tài khoản quản trị tại mục Tài khoản.
- Chuyến lưu sức chứa riêng. Ghế trống = sức chứa − số vé CONFIRMED/PENDING. Sơ đồ ghế lấy từ sức chứa; admin không nhập trực tiếp số ghế trống. Với dữ liệu cũ, migration suy ra sức chứa từ ghế trống, số vé hiệu lực và mã ghế lớn nhất. Nên đối chiếu sức chứa này với xe thực tế.
- Chuyến đã có vé hiệu lực không đổi hành trình/giờ xuất bến. Giá mới chỉ áp dụng cho vé tạo sau đó. Chuyến và tài khoản có lịch sử vé không bị xóa.
- Vé online bắt đầu PENDING. Vé tại quầy chọn PENDING hoặc CONFIRMED theo việc thu tiền. Mỗi lượt tối đa 5 ghế, cùng mã PNR; tên và điện thoại hành khách được lưu riêng với tài khoản.
- Hủy vé trả lại ghế đúng một lần và giữ lịch sử. Khôi phục chỉ khi chuyến chưa xuất bến, ghế thuộc sơ đồ hiện tại và chưa bị đặt/giữ. DELETE vé cũng là hủy có giữ lịch sử. Hoàn tiền thực tế xử lý tại quầy.
- Doanh thu tính vé CONFIRMED theo thời điểm xác nhận thu tiền; vé hủy được loại khỏi doanh thu hiện tại. Với vé cũ, thời điểm này lấy từ ngày tạo vì dữ liệu trước đây chưa lưu ngày thu tiền. Thống kê tại các danh sách áp dụng cùng bộ lọc với bảng; ngày/tháng tính theo giờ Việt Nam.
- Database có khóa duy nhất cho ghế hiệu lực, khóa ngoại bảo vệ lịch sử và CHECK số ghế/trạng thái. Các thao tác đặt, hủy, khôi phục và đổi sức chứa dùng transaction Serializable.
