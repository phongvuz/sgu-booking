-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th9 24, 2026 lúc 04:50 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `sgu-booking`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking`
--
CREATE DATABASE `sgu-booking`;
USE `sgu-booking`;
CREATE TABLE `booking` (
  `id` int(11) NOT NULL,
  `seatNumber` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'CONFIRMED',
  `totalPrice` double NOT NULL,
  `userId` int(11) NOT NULL,
  `tripId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `booking`
--

INSERT INTO `booking` (`id`, `seatNumber`, `status`, `totalPrice`, `userId`, `tripId`, `createdAt`) VALUES
(5, 'A01', 'CONFIRMED', 300000, 7, 6, '2026-09-21 08:31:45.318'),
(6, 'B05', 'PENDING', 350000, 8, 7, '2026-09-21 08:31:45.322');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trip`
--

CREATE TABLE `trip` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `from` varchar(191) NOT NULL,
  `to` varchar(191) NOT NULL,
  `time` datetime(3) NOT NULL,
  `price` double NOT NULL,
  `availableSeats` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `trip`
--

INSERT INTO `trip` (`id`, `code`, `from`, `to`, `time`, `price`, `availableSeats`, `createdAt`) VALUES
(6, 'SG-DL-01', 'Hồ Chí Minh', 'Đà Lạt', '2026-10-01 21:00:00.000', 300000, 32, '2026-09-21 08:31:45.298'),
(7, 'SG-DL-02', 'Hồ Chí Minh', 'Đà Lạt', '2026-10-01 23:00:00.000', 350000, 22, '2026-09-21 08:31:45.302'),
(8, 'SG-NHA-01', 'Hồ Chí Minh', 'Nha Trang', '2026-10-01 22:30:00.000', 280000, 30, '2026-09-21 08:31:45.305'),
(9, 'SG-VT-01', 'Hồ Chí Minh', 'Vũng Tàu', '2026-10-01 07:30:00.000', 160000, 26, '2026-09-21 08:31:45.308'),
(10, 'SG-HAN-01', 'Hồ Chí Minh', 'Hà Nội', '2026-10-01 08:00:00.000', 900000, 34, '2026-09-21 08:31:45.312'),
(11, 'DL-SG-01', 'Đà Lạt', 'Hồ Chí Minh', '2026-10-01 21:30:00.000', 300000, 28, '2026-09-21 08:31:45.315');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`id`, `fullName`, `phone`, `password`, `role`, `createdAt`) VALUES
(7, 'Nguyễn Văn An', '0901234567', 'password123', 'USER', '2026-09-21 08:31:45.290'),
(8, 'Trần Thị Bình', '0987654321', 'password123', 'ADMIN', '2026-09-21 08:31:45.294');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employee`
--

CREATE TABLE `employee` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL,
  `department` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Đang làm việc',
  `avatar` text DEFAULT NULL,
  `identityCard` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `startDate` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `employee`
--

INSERT INTO `employee` (`id`, `name`, `email`, `phone`, `role`, `department`, `status`, `avatar`, `identityCard`, `address`, `startDate`, `createdAt`) VALUES
('EMP-001', 'Nguyễn Văn A', 'nguyenvana@nhaxe.vn', '0901234567', 'Tài xế', 'Đội xe', 'Đang làm việc', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', '079201001234', 'Quận 1, TP. Hồ Chí Minh', '2023-01-15', '2026-09-26 01:05:38.390'),
('EMP-002', 'Trần Thị B', 'tranthib@nhaxe.vn', '0912345678', 'Văn phòng', 'Phòng vé', 'Đang làm việc', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '079202002345', 'Quận 5, TP. Hồ Chí Minh', '2023-03-20', '2026-09-26 01:05:38.394'),
('EMP-003', 'Lê Hoàng C', 'lehoangc@nhaxe.vn', '0923456789', 'Phụ xe', 'Đội xe', 'Nghỉ phép', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', '079203003456', 'TP. Thủ Đức, TP. Hồ Chí Minh', '2023-06-10', '2026-09-26 01:05:38.398'),
('EMP-004', 'Phạm Văn D', 'phamvand@nhaxe.vn', '0934567890', 'Tài xế', 'Đội xe', 'Đang làm việc', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '079204004567', 'Quận Bình Thạnh, TP. Hồ Chí Minh', '2023-09-01', '2026-09-26 01:05:38.401'),
('EMP-005', 'Hoàng Thị E', 'hoangthie@nhaxe.vn', '0945678901', 'Quản lý', 'Ban điều hành', 'Đang làm việc', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', '079205005678', 'Quận 3, TP. Hồ Chí Minh', '2022-11-15', '2026-09-26 01:05:38.404'),
('EMP-006', 'Vũ Minh Tuấn', 'tuanvm@nhaxe.vn', '0967890123', 'Tài xế', 'Đội xe', 'Đang làm việc', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', '079206006789', 'Quận 10, TP. Hồ Chí Minh', '2024-01-08', '2026-09-26 01:05:38.409'),
('EMP-007', 'Đặng Thu Thảo', 'thaodt@nhaxe.vn', '0978901234', 'Văn phòng', 'Kế toán', 'Đang làm việc', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '079207007890', 'Quận Phú Nhuận, TP. Hồ Chí Minh', '2024-02-14', '2026-09-26 01:05:38.411'),
('EMP-008', 'Bùi Quốc Hưng', 'hungbq@nhaxe.vn', '0989012345', 'Điều hành', 'Ban điều hành', 'Đang làm việc', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', '079208008901', 'Quận Gò Vấp, TP. Hồ Chí Minh', '2024-03-01', '2026-09-26 01:05:38.415'),
('EMP-009', 'Ngô Thanh Hằng', 'hangnt@nhaxe.vn', '0918765432', 'Văn phòng', 'Phòng vé', 'Đã nghỉ việc', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', '079209009012', 'Quận Tân Bình, TP. Hồ Chí Minh', '2023-04-12', '2026-09-26 01:05:38.418'),
('EMP-010', 'Đinh Công Trình', 'trinhdc@nhaxe.vn', '0932145678', 'Tài xế', 'Đội xe', 'Đang làm việc', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', '079210001023', 'Quận 12, TP. Hồ Chí Minh', '2024-05-20', '2026-09-26 01:05:38.421'),
('EMP-011', 'Lý Hải Đăng', 'danglh@nhaxe.vn', '0943215678', 'Phụ xe', 'Đội xe', 'Đang làm việc', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', '079211002134', 'Huyện Hóc Môn, TP. Hồ Chí Minh', '2024-06-01', '2026-09-26 01:05:38.425'),
('EMP-012', 'Phan Kim Oanh', 'oanhpk@nhaxe.vn', '0954321678', 'Văn phòng', 'Kế toán', 'Nghỉ phép', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', '079212003245', 'Quận 7, TP. Hồ Chí Minh', '2024-06-15', '2026-09-26 01:05:38.428');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Cấu trúc cho bảng `customer`
--
CREATE TABLE `customer` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Đang hoạt động',
  `address` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Đang đổ dữ liệu cho bảng `customer`
--
INSERT INTO `customer` (`id`, `name`, `email`, `phone`, `status`, `address`, `startDate`) VALUES
('CUS-001', 'Nguyễn Minh Tuấn', 'tuannguyen@gmail.com', '0903456789', 'Đang hoạt động', 'Quận 10, TP. Hồ Chí Minh'),
('CUS-002', 'Trần Ngọc Mai', 'maitran@gmail.com', '0914567890', 'Đang hoạt động', 'Quận Bình Thạnh, TP. Hồ Chí Minh'),
('CUS-003', 'Lê Hoàng Nam', 'namle@gmail.com', '0935678901', 'Ngừng hoạt động', 'TP. Thủ Đức, TP. Hồ Chí Minh');


--
-- Chỉ mục cho bảng `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_email_key` (`email`),
  ADD UNIQUE KEY `customer_phone_key` (`phone`);



--
-- Chỉ mục cho bảng `employee`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_email_key` (`email`),
  ADD UNIQUE KEY `customer_phone_key` (`phone`);
SHOW INDEX FROM `customer`;
--
-- Chỉ mục cho bảng `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Booking_userId_fkey` (`userId`),
  ADD KEY `Booking_tripId_fkey` (`tripId`);

--
-- Chỉ mục cho bảng `trip`
--
ALTER TABLE `trip`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Trip_code_key` (`code`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `booking`
--
ALTER TABLE `booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `trip`
--
ALTER TABLE `trip`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `Booking_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trip` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
