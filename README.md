# Nhà xe Sài Gòn

Đăng nhập/đăng ký dùng modal và cookie phiên 24 giờ; đăng ký tự đăng nhập, trang/API quản trị yêu cầu ADMIN. Chi tiết: [bảo mật và phân quyền](documentation/security/README.md).

Hướng dẫn Realtime chọn ghế bằng SSE, giải thích từng file và kiểm thử hai trình duyệt: [documentation/seat-realtime.md](documentation/seat-realtime.md).

API quản lý đơn hàng đã hỗ trợ xem chi tiết, xác nhận và hủy vé có giữ lịch sử; mọi thao tác yêu cầu tài khoản ADMIN.

Ứng dụng đặt vé xe dùng Next.js App Router, React, TypeScript, Prisma và MySQL. Khách có thể tìm chuyến, chọn ghế, tra cứu vé; trang `/admin` quản lý chuyến xe, vé, xe, nhân viên và tài khoản.

## Demo tái lập bằng một lệnh

Trên máy có Node.js và MySQL/MariaDB local, dùng thông tin kết nối server từ `DEMO_SERVER_URL` hoặc `DATABASE_URL` trong `.env`, rồi chạy:

```sh
npm run demo
```

Lệnh chuẩn bị dependency, Prisma Client, database demo riêng, dữ liệu mẫu và khởi động ứng dụng tại `http://127.0.0.1:3001`. Database ứng dụng hiện tại không được dùng để tạo dữ liệu demo. Chỉ database do công cụ tạo và có dấu nhận diện phù hợp mới được dùng lại; công cụ không reset database có sẵn. Thư mục build demo `.next-demo` tách khỏi `.next`.

Hướng dẫn điều kiện chạy, tài khoản ADMIN/CUSTOMER, cơ chế bảo vệ dữ liệu và kiểm chứng: [Khả năng tái lập](documentation/reproducibility.md). Chỉ chuẩn bị môi trường, chưa mở server: `npm run demo:prepare`.

## Tài liệu API tự sinh và bảo mật

Sau khi chạy server, mở `/api-docs` để đọc tài liệu và `/api/openapi` để lấy đặc tả OpenAPI. Sinh lại và kiểm tra tài liệu khớp route/schema:

```sh
npm run api:docs
npm run api:docs:check
```

`npm run build` kiểm tra tài liệu API trước khi build. Đặc tả, hướng dẫn và phạm vi sinh tự động: [documentation/api/README.md](documentation/api/README.md).

Checklist OWASP, chính sách cùng nguồn, kiểm tra XSS/CORS, header bảo mật và các giới hạn được ghi tại [documentation/security/README.md](documentation/security/README.md). Chạy bộ kiểm tra liên quan bằng `npm run security:check`. Đây là kiểm tra phạm vi đồ án, không phải chứng nhận kiểm toán bảo mật toàn hệ thống.

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

Migration `20261105000000_integer_vnd` chuyển giá chuyến và giá vé sang số nguyên đồng. Với database hiện có, dừng server rồi chạy `npm run db:upgrade`, `npx prisma generate` và khởi động lại. Migration dừng nếu dữ liệu cũ có giá lẻ hoặc ngoài giới hạn số nguyên; cần đối chiếu giá đó trước, không tự làm tròn hay thay đổi tiền trên vé cũ.

Chuyến xe dùng `id` tự tăng và `tripId` kiểu số nguyên dương. API JSON nhận `tripId` là số (ví dụ `123`); tham số URL được chuyển sang số trước khi xử lý. Chuyến xe không còn trường `code`. Migration `20261009040000_numeric_trip_id` bỏ cột này và giữ nguyên ID, quan hệ vé/giữ ghế và các mã PNR đã lưu. Với database hiện có, chạy `npm run db:upgrade` để sao lưu trước khi áp dụng migration, sau đó chạy `npx prisma generate` và khởi động lại ứng dụng.

Nếu database import đã có sức chứa và nghiệp vụ vé mới nhưng vẫn giữ cột `trip.code` bắt buộc, thao tác tạo chuyến sẽ thất bại dù form hợp lệ. Chạy `npm run db:trips` để sửa riêng phần lệch này. Lệnh kiểm tra schema/phụ thuộc, sao lưu toàn bộ bảng `trip` cùng ánh xạ ID–mã cũ vào `.local-backups/`, rồi bỏ cột `code`; không đổi ID, vé, PNR hoặc lịch sử migration. Chạy lại là no-op. Lệnh này không thay thế toàn bộ `db:upgrade`.

Mở `http://localhost:3000`. Tài khoản quản trị cần có role `ADMIN` trong database.

Nếu cần dữ liệu mẫu, thiết lập biến môi trường `SEED_PASSWORD` (6–128 ký tự) rồi chạy `npx prisma db seed`. Seed chỉ chạy trên database hoàn toàn trống, lưu mật khẩu đã hash và không xóa dữ liệu hiện có. Tài khoản ADMIN mẫu dùng số điện thoại `0987654321` với mật khẩu bạn đã thiết lập.

## Thanh toán online thử nghiệm

Thanh toán bằng VietQR Quick Link: QR điền sẵn ngân hàng, tài khoản, tổng tiền và mã đơn hàng. Khi bật `PAYMENT_DEMO_ENABLED`, nút “Tôi đã chuyển khoản” tạo giao dịch giả lập và hoàn tất vé; quản trị xem tại `/admin/payments`. Không cần API key, SDK hay webhook. Cấu hình tài khoản nhận tiền và giải thích code tại [PAYMENT.md](PAYMENT.md). Xác nhận Demo không kiểm chứng tiền đã vào ngân hàng.

## Kiểm tra và build

```sh
npm run lint
npm run typecheck
npm test
npm run test:admin-db
node tests/booking-fixes-db.cjs
npm run build
npm start
```

`npm start` chạy bản production đã tạo bằng `npm run build`. `npm test` chạy test độc lập với database. `npm run test:admin-db` tạo database tạm, kiểm tra nghiệp vụ với MySQL/MariaDB thật rồi xóa riêng database tạm đó. Người dùng database cần quyền CREATE DATABASE và DROP DATABASE để chạy lệnh kiểm tra này.

Nếu môi trường Windows/sandbox chặn test runner tạo tiến trình con (`spawn EPERM`), chạy `npm test` trong môi trường cho phép tiến trình con. Bộ test đầy đủ cần cách ly từng file vì có fixture thay đổi biến môi trường và module cache. `security:check` chỉ chạy nhóm kiểm tra đã xác minh tương thích cùng tiến trình; không thay thế toàn bộ unit test, kiểm thử database hoặc trình duyệt.

`node tests/booking-fixes-db.cjs` kiểm tra riêng migration tiền nguyên đồng và các luồng guest, tra cứu, giữ ghế, quản lý vé, tìm chuyến trên database tạm rồi xóa database đó. Kiểm tra này dùng schema hiện tại, không thay thế việc kiểm tra toàn bộ lịch sử migration trong `test:admin-db`.

Sau khi build, trên Windows có Google Chrome, chạy `node --test tests/booking-fixes.browser.cjs` để kiểm tra hai phiên trình duyệt độc lập: cookie chọn ghế, chặn giả mạo ID, đặt/hủy ghế và khôi phục sau mất mạng. Test tự tạo server, database và profile Chrome tạm rồi dọn riêng các tài nguyên đó; không cần cài Playwright.

Trên MySQL hiện tại, `test:admin-db` gặp lỗi 3823 ở migration cũ `20261009010000_admin_business_rules`: CHECK `booking_active_seat_check` tham chiếu cột đang dùng trong khóa ngoại có CASCADE. Cần xử lý tương thích lịch sử migration trước khi dùng `db:upgrade` trên máy này; các migration đã áp dụng không được tự sửa checksum. Kiểm thử các sửa lỗi mới dùng database tạm độc lập, không thay đổi database ứng dụng.

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
- Vé online PENDING hết hạn sau tối đa 5 phút, không muộn hơn giờ xuất bến. Worker chạy trong Node server, xử lý tối đa 100 vé mỗi lượt và chờ 15 giây sau mỗi lượt; khi hết hạn, vé được hủy và trả ghế đúng một lần. Server phải đang chạy để worker hoạt động. Vé tại quầy và vé cũ có expiresAt = NULL vẫn do nhân viên xác nhận hoặc hủy.
- Hủy vé trả lại ghế đúng một lần và giữ lịch sử. Khôi phục chỉ khi chuyến chưa xuất bến, ghế thuộc sơ đồ hiện tại và chưa bị đặt/giữ. DELETE vé cũng là hủy có giữ lịch sử. Hoàn tiền thực tế xử lý tại quầy.
- Doanh thu tính vé CONFIRMED theo thời điểm xác nhận thu tiền; vé hủy được loại khỏi doanh thu hiện tại. Với vé cũ, thời điểm này lấy từ ngày tạo vì dữ liệu trước đây chưa lưu ngày thu tiền. Thống kê tại các danh sách áp dụng cùng bộ lọc với bảng; ngày/tháng tính theo giờ Việt Nam.
- Database có khóa duy nhất cho ghế hiệu lực, khóa ngoại bảo vệ lịch sử và CHECK số ghế/trạng thái. Các thao tác đặt, hủy, khôi phục và đổi sức chứa dùng transaction Serializable.

## Tra cứu, tài khoản và tìm chuyến

- Tra cứu công khai yêu cầu cả PNR và số điện thoại hành khách khớp chính xác, giới hạn 20 lượt/phút/số điện thoại và 60 lượt/phút/nguồn. Giới hạn chạy trong từng tiến trình Node; triển khai nhiều worker cần bộ đếm dùng chung và proxy quản lý địa chỉ nguồn. Lịch sử `/bookings` chỉ hiển thị vé thuộc tài khoản đang đăng nhập.
- Đặt vé vãng lai không đăng ký số điện thoại hành khách thành tài khoản. Khi đăng ký bằng số từng dùng mua vé, tài khoản mới không tự nhận lịch sử vé cũ; khách vẫn tra cứu bằng PNR và số điện thoại.
- Tìm chuyến chỉ trả chuyến chưa xuất bến và còn ghế. Bộ lọc giờ dùng giờ Việt Nam; bộ lọc xe dựa trên sức chứa cố định. Bộ lọc và phân trang được giữ trong URL.
- API chuyến công khai hỗ trợ phân trang; chế độ quản trị yêu cầu `admin=true` và xác thực ADMIN.
- Realtime chọn ghế dùng cookie HttpOnly để kiểm tra quyền thao tác; mã client trong sự kiện công khai không phải token quyền sở hữu. Trạng thái ghế đã đặt được tải lại khi kết nối và sau thay đổi đặt/hủy vé.
