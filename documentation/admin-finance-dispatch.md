# Quản trị vé, thu/hoàn tiền và phân công chuyến

## 1. Vé khác giao dịch tiền

Một lượt đặt có một PNR và có thể có nhiều vé. Mỗi vé ứng với một ghế.
Vé có trạng thái `PENDING`, `CONFIRMED` hoặc `CANCELLED`.
Trạng thái thanh toán được tính từ các dòng thu/hoàn, không lưu trùng trên vé.

Bảng `BookingTransaction` lưu:

| Trường | Ý nghĩa |
| --- | --- |
| `bookingId` | Vé liên quan |
| `kind` | `RECEIPT` là thu, `REFUND` là hoàn |
| `amount` | Số nguyên đồng, lớn hơn 0 |
| `method` | Tiền mặt, chuyển khoản, demo hoặc dữ liệu cũ |
| `reference` | Mã lần thu/hoàn; một lần thu nhiều ghế dùng chung mã |
| `actorId` | Tài khoản xử lý lấy từ phiên đăng nhập, không lấy từ form |
| `createdAt` | Thời điểm ghi sổ |

Ví dụ đặt 3 ghế, mỗi ghế 200.000 đồng, thu cùng lúc tại quầy:

1. Danh sách hiển thị 1 lượt đặt, 3 vé, 1 giao dịch tiền.
2. Mỗi vé có dòng thu 200.000 đồng, cùng `reference`.
3. Hủy 1 vé trả 1 ghế. Khoản đã thu vẫn là 600.000 đồng; chờ hoàn là 200.000 đồng.
4. Nhân viên thực sự hoàn 200.000 đồng rồi bấm **Hoàn tiền** trên vé đó.
5. Hệ thống thêm dòng hoàn. Đã thu là 600.000 đồng; đã hoàn là 200.000 đồng; chờ hoàn bằng 0.

Nút **Thu tiền** và **Hoàn tiền** chỉ ghi sổ, không gọi ngân hàng chuyển tiền.
Server tự tính toàn bộ số tiền còn thiếu/cần hoàn của vé. Hiện chưa có form nhập thu/hoàn một phần hoặc phí hủy.
Mỗi lần ghi sổ và đổi vé dùng cùng transaction. Bấm lại hoặc hai nhân viên thao tác đồng thời không ghi trùng khoản đã xử lý.

## 2. Đọc báo cáo

- Đã thu: tổng dòng `RECEIPT`.
- Đã hoàn: tổng dòng `REFUND`.
- Chờ hoàn: tiền đã thu trừ đã hoàn trên vé `CANCELLED`.
- Còn phải thu: giá vé trừ số tiền đang giữ trên vé chưa hủy, tối thiểu 0.
- Tiền ròng theo tháng/ngày trên dashboard: khoản thu trong kỳ trừ khoản hoàn trong kỳ, dựa trên `createdAt` của giao dịch.

Vì vậy, hủy vé trong tháng 11 không xóa khoản thu tháng 10. Nếu hoàn trong tháng 11, khoản hoàn thuộc tháng 11.
Đây là báo cáo dòng tiền, không phải ghi nhận doanh thu kế toán theo thời điểm hoàn thành chuyến.

Dashboard loại trừ `DEMO`. Danh sách vé và lịch sử vẫn hiển thị demo để kiểm tra, có nhãn phân biệt.
`LEGACY` là khoản thu suy ra từ vé cũ; cần đối soát vì không biết chắc phương thức và người thu trước đây.
Không tự tạo dòng hoàn cho vé cũ nếu không có chứng từ.

## 3. Phân công chuyến

Tạo chuyến ở trạng thái **Dự kiến** (`DRAFT`). Trước khi chọn **Mở bán** (`OPEN`), cần:

1. Chọn xe đang hoạt động; sức chứa theo số ghế của xe.
2. Chọn nhân viên có vai trò **Tài xế**, trạng thái **Đang làm việc**.
3. Nhập giờ xuất bến và giờ kết thúc dự kiến hợp lệ.
4. Không trùng khoảng thời gian với chuyến `OPEN` hoặc `DEPARTED` dùng cùng xe hoặc tài xế.

Chuyến trước kết thúc đúng lúc chuyến sau bắt đầu được chấp nhận. Chưa tính thời gian quay đầu, nghỉ bắt buộc hoặc thời gian di chuyển giữa hai bến.
Tên tài xế dạng chuỗi trên hồ sơ xe chỉ là thông tin cũ; phân công thực tế dùng `trip.driverId` liên kết nhân viên.

Các bước chuyển trạng thái:

| Hiện tại | Được chuyển sang |
| --- | --- |
| Dự kiến | Mở bán, Hủy |
| Mở bán | Dự kiến, Đã xuất bến, Hủy |
| Đã xuất bến | Hoàn thành |
| Hoàn thành, Hủy | Không mở lại |

Chỉ chuyến `OPEN` chưa đến giờ xuất bến mới nhận đặt/giữ ghế.
Trước khi đóng bán hoặc hủy chuyến, hủy từng vé hiệu lực để theo dõi khoản cần hoàn.
Chuyến có lịch sử vé không được xóa; giữ để đối soát.
Xe/tài xế đang được phân công `OPEN` hoặc `DEPARTED` không được sửa sang trạng thái không khả dụng.

## 4. Ghế đang giữ và bộ lọc URL

Khi còn `SeatHold` chưa hết hạn, không đổi hành trình, giờ xuất bến, xe/sức chứa, đóng bán hoặc xóa chuyến.
Kiểm tra và cập nhật nằm trong cùng transaction để tránh khách giữ/đặt ghế đúng lúc admin sửa chuyến.

Trang `/admin/orders?search=PNR` đọc bộ lọc từ URL. Tìm kiếm, trạng thái, ngày, sắp xếp và trang được giữ khi tải lại hoặc quay lại.
Mỗi PNR mở chi tiết bằng hàng mở rộng, hiển thị riêng trạng thái và tiền cần thu/hoàn từng vé.
Bộ lọc chọn lượt đặt có ít nhất một vé phù hợp; vẫn hiển thị toàn bộ vé trong lượt để đối chiếu.
Trang thanh toán giữ lịch sử cổng thanh toán cũ và bổ sung sổ thu/hoàn; hai bảng có ý nghĩa khác nhau.

## 5. Đọc code theo thứ tự

1. `prisma/schema.prisma`: bảng dữ liệu và quan hệ.
2. `lib/booking-money.ts`: cộng khoản thu/hoàn, tính số dư; không truy cập database.
3. `services/bookingFinanceService.ts`: đọc vé, kiểm tra, ghi thu/hoàn trong transaction.
4. `app/api/admin/orders/[id]/payment/route.ts`: xác thực admin, kiểm tra form, gọi service.
5. `components/admin/orders/OrderPaymentModal.tsx`: form chọn phương thức, không tự tính tiền để gửi lên server.
6. `services/orderService.ts`: nhóm PNR, hủy/khôi phục ghế; `hooks/useOrders.ts`: bộ lọc URL.
7. `lib/trip-status.ts` và `services/tripService.ts`: trạng thái, kiểm tra phân công và ghế giữ.

## 6. Nâng cấp và kiểm tra

Với database cũ: dừng server, chạy `npm run db:upgrade`, `npx prisma generate`, rồi khởi động lại.
Script nâng cấp sao lưu vào `.local-backups/`; không đưa bản sao chứa dữ liệu khách lên Git.
Migration `20261107000000_finance_and_dispatch` giữ vé và ghế, bổ sung PNR thiếu và khoản thu có bằng chứng từ trạng thái/thời điểm xác nhận cũ.
Phương thức/người xử lý không biết được giữ là `LEGACY`/trống, không gán nhân viên giả.

**Chuyến tương lai cũ chuyển về DRAFT. Admin phải chọn xe, tài xế và giờ kết thúc rồi mới mở bán lại.**
Chuyến quá giờ được chuyển `DEPARTED`; cần hoàn tất nghiệp vụ để chuyển `COMPLETED`.

```sh
npm test
npm run typecheck
npm run test:finance-db
npm run test:admin-db
npm run build
```

Unit test không cần database. Hai bộ database test tạo database riêng, cần MySQL/MariaDB local và quyền tạo/xóa database kiểm thử.
