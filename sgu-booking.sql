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

--
-- Chỉ mục cho các bảng đã đổ
--

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
