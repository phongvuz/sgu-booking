# Chương 7 — Triển khai, tích hợp và minh chứng kết quả

- [Bản Word chỉnh sửa được](Chuong_7_Trien_khai_tich_hop_va_minh_chung_ket_qua_cap_nhat.docx)
- [PDF xem trước](Chuong_7_Trien_khai_tich_hop_va_minh_chung_ket_qua_cap_nhat.pdf)
- [Nội dung Markdown](content.md)

Bản cập nhật đối chiếu nền commit `1f2bedb` và các thay đổi được commit cùng tài liệu này. Sau khi đồng bộ `origin/huy`, bộ test đạt **162/162**; lint, TypeScript, kiểm tra đặc tả API và production build trong môi trường demo đều đạt. Xem [biên bản kiểm tra](../../evidence/verification.json) và các log `pre-push-*` trong cùng thư mục bằng chứng.

Chương giữ cấu trúc 7.1, 7.2.1–7.2.7, sáu bảng và bốn hình. Hai ảnh runtime được chụp trên database demo riêng trước khi đồng bộ remote; hai hình còn lại là sơ đồ kỹ thuật. Các kết quả HTTP/MySQL cũ có ghi rõ phạm vi và không được coi là đã chạy lại sau đồng bộ. Biên bản trước cập nhật vẫn được giữ tại [verification-before-sync.json](../../evidence/verification-before-sync.json).

Word và PDF dùng cùng nội dung và hình. PDF là bản xem trước do PyMuPDF dàn trang, không phải bản xuất từ Microsoft Word; phân trang có thể khác khi mở Word. Bản Word gốc người dùng cung cấp không bị sửa.

Các tệp trong `assets/` và `evidence/` được sao từ bộ làm việc cục bộ `docs/chapter7/`; metadata giữ đường dẫn và hash tại lúc tạo để truy vết. Cache, thư viện Python, bản PDF tạm và tài liệu đầu vào gốc không thuộc bộ tài liệu được commit.
