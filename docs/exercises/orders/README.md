# Học CRUD với quản lý đơn hàng trong Next.js

Bạn sẽ tự viết API cho trang `/admin/orders`. Phần xử lý CRUD trong **hai file Route Handler** đã được bỏ và thay bằng `TODO`. Giao diện, schema kiểm tra dữ liệu, hook gọi API và service database được giữ làm khung cho bài học đầu tiên. Mục tiêu lần này là hiểu cách nối HTTP request với service, rồi trả HTTP response.

Các API chưa hoàn thành trả HTTP `501`, `success: false` và thông báo tên bài. Vì vậy danh sách đơn hàng tạm thời báo lỗi; thêm, sửa, hủy chưa hoạt động qua các API này. Đây là trạng thái chờ bạn viết bài, không phải mất dữ liệu. Việc chuẩn bị bài tập chỉ sửa code, không chạy thao tác ghi database.

## 1. CRUD là gì?

| Chữ | Ý nghĩa | Ví dụ trong dự án | HTTP và đường dẫn |
| --- | --- | --- | --- |
| C — Create | Tạo dữ liệu mới | Tạo vé tại quầy | `POST /api/admin/orders` |
| R — Read | Đọc dữ liệu | Danh sách vé | `GET /api/admin/orders` |
| R — Read | Đọc một bản ghi | Chi tiết vé theo ID | `GET /api/admin/orders/123` |
| U — Update | Sửa dữ liệu hiện có | Xác nhận thanh toán | `PATCH /api/admin/orders/123` |
| D — Delete | Xóa hoặc loại khỏi trạng thái hoạt động | Hủy vé, giữ lịch sử | `DELETE /api/admin/orders/123` |

`GET` dùng để đọc; `POST` dùng để tạo. Trong bài này `PATCH` chỉ đổi trường `status`, nên không cần gửi lại toàn bộ thông tin vé. `DELETE` được dự án quy ước là chuyển sang `CANCELLED`. Bản ghi vẫn còn để đối chiếu lịch sử, và ghế được trả lại đúng một lần.

Một lượt đặt nhiều ghế tạo nhiều bản ghi vé dùng chung PNR. `id` ở URL là **ID của một bản ghi vé**, không phải PNR, ID chuyến xe hay ID cả nhóm vé. Hủy một ID chỉ hủy vé của ghế đó.

## 2. Next.js tham gia ở đâu?

Next.js App Router ánh xạ vị trí file thành URL:

```text
app/api/admin/orders/route.ts       → /api/admin/orders
app/api/admin/orders/[id]/route.ts  → /api/admin/orders/123
```

Trong `route.ts`, bạn export các hàm đặt tên theo HTTP method: `GET`, `POST`, `PATCH`, `DELETE`. Các hàm chạy trên server. Trang `app/admin/orders/page.tsx` là Client Component, có `"use client"` để xử lý sự kiện và state trong trình duyệt.

Luồng xử lý của dự án:

```text
Người dùng bấm nút trên /admin/orders
  → hooks/useOrders.ts
  → services/clientOrderService.ts gửi HTTP request
  → app/api/admin/orders/.../route.ts kiểm tra và xử lý request
  → services/orderService.ts hoặc services/bookingService.ts
  → Prisma → MySQL
  → JSON response → hook tải lại danh sách → giao diện cập nhật
```

Hai file tên gần giống nhau có vai trò khác nhau: `clientOrderService.ts` gọi API từ trình duyệt; `orderService.ts` truy vấn database trên server. Không import service database vào Client Component.

Ba nguồn dữ liệu của request:

- **Query string:** `/api/admin/orders?page=2&status=PENDING`. Đọc qua `new URL(request.url).searchParams`. Giá trị lấy được là chuỗi hoặc `null`; phải chuyển đổi khi cần số.
- **Route parameter:** `/api/admin/orders/123`. Trong phiên bản Next.js đang cài, `params` là Promise; lấy ID bằng `const { id } = await params`. ID vẫn là chuỗi.
- **Body JSON:** POST nhận thông tin đặt vé; PATCH nhận `{ "status": "CONFIRMED" }`. `readJson(request)` đọc body và xử lý JSON lỗi. Chỉ đọc body một lần, sau đó kiểm tra dữ liệu trước khi gọi service.

`await` chờ tác vụ bất đồng bộ hoàn thành. `NextResponse.json(...)` tạo HTTP response dạng JSON; tham số thứ hai đặt mã HTTP, ví dụ `{ status: 201 }`. `success` trong JSON và mã HTTP cần thống nhất: không trả HTTP 200 cho một request thất bại.

Khung đã giữ `requireAdmin(request)` và `try/catch` với `apiError`. `requireAdmin` hiện đang có chế độ review cho phép truy cập như code gốc; tên hàm không có nghĩa dự án hiện đã bắt buộc đăng nhập. Bài này không thay đổi cơ chế đó. `apiError` chuyển lỗi nghiệp vụ/database sang response phù hợp.

Tài liệu đã đối chiếu với phiên bản cài trong `node_modules/next/dist/docs/`. Đọc thêm: [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [tham số của route.ts](https://nextjs.org/docs/app/api-reference/file-conventions/route#parameters).

## 3. Thứ tự thực hành: R1 → R2 → C → U → D

Chỉ viết một hàm mỗi lần. Thay `return` trả 501 của hàm đó bằng phần xử lý thật; tự thêm import cần thiết. Giữ các phần kiểm tra dữ liệu và bắt lỗi có sẵn.

### Bài R1 — Lấy danh sách

Mở `app/api/admin/orders/route.ts`, tìm `TODO R1`.

1. Import `queryOrdersAdmin` từ `@/services/orderService` và kiểu `OrderQueryParams` từ `@/types`.
2. Làm bản đầu với `page: 1`, `limit: 8` để hiểu luồng gọi service.
3. Gọi service bằng `await`. Kết quả gồm `data`, `pagination`, `stats`.
4. Trả HTTP 200 với JSON `{ success: true, data, pagination, stats, message }`. Giao diện cần đủ ba trường dữ liệu này.
5. Khi danh sách hoạt động, bổ sung query string: `search`, `status`, `date`, `tripId`, `page`, `limit`, `sortBy`, `sortOrder`.

Gợi ý: page mặc định 1, limit mặc định 8; `queryOrdersAdmin` chuẩn hóa phân trang. Dùng `parseTripId` từ `@/lib/trip-id` nếu query có `tripId`. Dùng `readOption` từ `@/lib/query-params` cho `sortBy` (`createdAt`, `totalPrice`, `id`) và `sortOrder` (`asc`, `desc`); mặc định lần lượt `id`, `desc`. Date có dạng `YYYY-MM-DD`.

**Đạt yêu cầu:** mở `/admin/orders` thấy danh sách hoặc danh sách rỗng hợp lệ; tìm kiếm, lọc, đổi trang hoạt động sau bước 5. JSON có `data` là mảng, `pagination` có `page`, `limit`, `total`, `totalPages`, và `stats` có thống kê.đa

### Bài R2 — Lấy chi tiết

Mở `app/api/admin/orders/[id]/route.ts`, tìm `TODO R2`.

1. Dùng ID đã lấy từ `await params`. Kiểm tra ID chỉ chứa chữ số và khi chuyển sang số là số nguyên dương không vượt `2147483647`; ID sai định dạng trả 400.
2. Import và gọi `getOrderById(id)` từ `@/services/orderService`.
3. Service trả `null` thì trả HTTP 404 với `success: false` và thông báo.
4. Có đơn thì trả HTTP 200 với `{ success: true, data: order }`.

**Đạt yêu cầu:** ID có thật trả một vé; ID hợp lệ nhưng không tồn tại trả 404; `abc`, `0`, `1.5` trả 400. Modal chi tiết hiện dùng bản ghi đã tải trong danh sách, nên kiểm tra API chi tiết trực tiếp bằng URL hoặc Console; bấm modal chưa chứng minh bạn đã viết R2 đúng.

### Bài C — Tạo vé

Trong `app/api/admin/orders/route.ts`, tìm `TODO C`.

1. Dữ liệu đã được kiểm tra bằng `offlineOrderSchema.safeParse(body)`. Lấy dữ liệu hợp lệ từ `validationResult.data`.
2. Import `createBooking` từ `@/services/bookingService`; truyền `tripId`, `seats`, `fullName`, `phone`, `status`.
3. Trả HTTP **201** với `success: true`, `data` là kết quả tạo vé và `message` chứa PNR.

Kết quả tạo vé là `BookingResult`, gồm `pnr`, `tripId`, `passenger`, `seats`, `totalPrice`, `bookingIds`; khác với một `OrderItem` của API chi tiết. Service tính giá từ chuyến xe, tạo mã vé và giữ ghế trong transaction.

Ví dụ body để hiểu cấu trúc; thay tripId và ghế bằng một chuyến tương lai có ghế trống trong database thực hành:

```json
{
  "tripId": 123,
  "seats": ["A01"],
  "fullName": "Khách thực hành",
  "phone": "0901234567",
  "status": "PENDING"
}
```

**Đạt yêu cầu:** tạo từ nút “Tạo vé tại quầy” trả 201 và thấy vé mới sau khi danh sách tải lại. Sai dữ liệu trả 400; đặt trùng ghế trả 409. `tripId` trong JSON phải là số. Một lượt có 1–5 ghế khác nhau. Chuyến không tồn tại trả 404.

### Bài U — Cập nhật trạng thái

Trong `app/api/admin/orders/[id]/route.ts`, tìm `TODO U`.

1. Body và status đã được kiểm tra trong khung. Kiểm tra ID như R2, tìm đơn; không có đơn trả 404.
2. Import `getOrderById`, `updateOrderStatus` từ `@/services/orderService`.
3. Gọi `updateOrderStatus(id, status as BookingStatus)`; kết quả null trả 404, còn lại trả HTTP 200 với `success`, `data`, `message`.

**Đạt yêu cầu:** đổi PENDING → CONFIRMED cập nhật bảng và doanh thu. Status lạ trả 400. CONFIRMED → PENDING trả 409 theo quy tắc hiện có. Khi hủy/khôi phục, service kiểm tra thời gian xuất bến và ghế; lỗi nghiệp vụ cần đi qua `apiError`.

### Bài D — Hủy vé

Trong `app/api/admin/orders/[id]/route.ts`, tìm `TODO D`.

1. Kiểm tra ID như R2; gọi `getOrderById`; không có đơn trả 404.
2. Import và gọi `deleteOrder(id)` từ `@/services/orderService`.
3. Nếu trả false, trả 404; thành công trả HTTP 200 với `{ success: true, message }`.

Nút xác nhận hủy đã được nối sang `deleteOrder` của hook để gọi **DELETE**. Mục đổi trạng thái vẫn dùng PATCH. Service DELETE gọi chung nghiệp vụ chuyển trạng thái sang CANCELLED: giữ bản ghi và trả ghế đúng một lần.

**Đạt yêu cầu:** hủy một vé của chuyến chưa xuất bến; lọc CANCELLED vẫn thấy lịch sử; số ghế trống tăng 1. Gửi DELETE lần nữa cùng ID không tăng ghế lần thứ hai. Hủy vé chưa hủy của chuyến đã xuất bến trả 409.

## 4. Tự kiểm tra khi viết

Chạy `npm run dev`, mở `/admin/orders`, rồi F12 → Network. Quan sát URL, method, body, mã HTTP và JSON response của mỗi thao tác. Những thao tác tạo/sửa/hủy khi bạn viết xong API sẽ thay đổi database đang cấu hình, nên dùng dữ liệu thực hành.

Kiểm tra R1 bằng cách mở `/api/admin/orders?page=1&limit=8` trong trình duyệt. Kiểm tra R2 bằng cách mở `/api/admin/orders/ID_THAT`, thay ID_THAT bằng ID từ danh sách.

Hoặc trong Console của trang localhost, dùng mẫu đọc dữ liệu sau:

```js
const response = await fetch("/api/admin/orders?page=1&limit=8");
console.log(response.status, await response.json());
```

Các mã cần phân biệt: 200 thành công, 201 tạo mới, 400 dữ liệu sai, 404 không tìm thấy, 409 xung đột nghiệp vụ, 500 lỗi server, 501 bài chưa viết.

Sau mỗi bài chạy `npm run typecheck`; dùng `npm run lint` để kiểm tra code. `npm test` chạy test hồi quy hiện có, chưa đánh giá đủ năm API bạn tự viết. Các tiêu chí thủ công ở trên là phần kiểm tra chức năng của bài học. Typecheck chạy được khi còn TODO không có nghĩa CRUD đã hoàn thành.

Nếu vẫn thấy 501 sau khi viết: tìm `TODO` và `status: 501` trong hai file, kiểm tra đúng hàm ứng với HTTP method, rồi thay response tạm bằng response thật.

## 5. Bản gốc và khôi phục

`reference/` chứa bản sao nguyên trạng của ba file trước bài tập. Đuôi `.txt` giúp chúng không trở thành route hoặc code được biên dịch. Có thể mở để đối chiếu sau khi tự làm. Bản gốc không có các kiểm tra ID bổ sung yêu cầu trong bài R2/U/D.

Để khôi phục, chạy các lệnh PowerShell dưới đây từ thư mục gốc dự án. Các lệnh này ghi đè phần bài làm của bạn trong đúng ba file, vì vậy hãy lưu riêng bài làm nếu muốn giữ:

```powershell
Copy-Item -LiteralPath 'docs/exercises/orders/reference/orders-route.ts.txt' -Destination 'app/api/admin/orders/route.ts'
Copy-Item -LiteralPath 'docs/exercises/orders/reference/order-id-route.ts.txt' -Destination 'app/api/admin/orders/[id]/route.ts'
Copy-Item -LiteralPath 'docs/exercises/orders/reference/orders-page.tsx.txt' -Destination 'app/admin/orders/page.tsx'
```

Bắt đầu với **R1**. Trước khi viết, hãy tự trả lời: trình duyệt gửi gì, server gọi hàm nào, giao diện cần nhận những trường nào? Viết xong R1, gửi phần hàm GET để được giải thích và góp ý, rồi tiếp tục R2.
