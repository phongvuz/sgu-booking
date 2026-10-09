-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 09, 2026 lúc 11:39 AM
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
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `pnr` varchar(191) DEFAULT NULL,
  `passengerName` varchar(191) DEFAULT NULL,
  `passengerPhone` varchar(191) DEFAULT NULL,
  `activeSeat` varchar(191) DEFAULT NULL,
  `confirmedAt` datetime(3) DEFAULT NULL
) ;

--
-- Đang đổ dữ liệu cho bảng `booking`
--

INSERT INTO `booking` (`id`, `seatNumber`, `status`, `totalPrice`, `userId`, `tripId`, `createdAt`, `pnr`, `passengerName`, `passengerPhone`, `activeSeat`, `confirmedAt`) VALUES
(5, 'A01', 'CONFIRMED', 300000, 7, 6, '2026-09-21 08:31:45.318', 'NHAXE-SG-DL-01-75', 'Nguyễn Văn An', '0901234567', '6:A01', '2026-09-21 08:31:45.318'),
(6, 'B05', 'PENDING', 350000, 8, 7, '2026-09-21 08:31:45.322', 'NHAXE-SG-DL-02-86', 'Trần Thị Bình', '0987654321', '7:B05', NULL),
(7, 'C09', 'CONFIRMED', 160000, 9, 9, '2026-10-01 08:27:39.466', 'NHAXE-SG-VT-01-97', 'a', '1', '9:C09', '2026-10-01 08:27:39.466'),
(8, 'B01', 'CONFIRMED', 160000, 10, 9, '2026-10-01 09:12:19.920', 'NHAXE-SG-VT-01-108', 'áda', 'sdasd', '9:B01', '2026-10-01 09:12:19.920'),
(9, 'A02', 'CONFIRMED', 160000, 10, 9, '2026-10-01 09:12:19.928', 'NHAXE-SG-VT-01-109', 'áda', 'sdasd', '9:A02', '2026-10-01 09:12:19.928'),
(10, 'B02', 'CONFIRMED', 160000, 10, 9, '2026-10-01 09:12:19.931', 'NHAXE-SG-VT-01-1010', 'áda', 'sdasd', '9:B02', '2026-10-01 09:12:19.931'),
(11, 'C09', 'CONFIRMED', 900000, 11, 10, '2026-10-09 07:07:17.028', 'NHAXE-SG-HAN-01-1111', 'a', '123', '10:C09', '2026-10-09 07:07:17.028'),
(12, 'C08', 'CONFIRMED', 900000, 11, 10, '2026-10-09 07:07:17.035', 'NHAXE-SG-HAN-01-1112', 'a', '123', '10:C08', '2026-10-09 07:07:17.035'),
(13, 'C07', 'PENDING', 280000, 12, 8, '2026-10-09 08:21:53.247', 'NHAXE-8-2CEA642504BBE3DB', 'vu', '0932234567', '8:C07', NULL),
(14, 'C06', 'PENDING', 280000, 12, 8, '2026-10-09 08:21:53.251', 'NHAXE-8-2CEA642504BBE3DB', 'vu', '0932234567', '8:C06', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bus`
--

CREATE TABLE `bus` (
  `id` varchar(191) NOT NULL,
  `plate` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `seats` int(11) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Đang hoạt động',
  `brand` varchar(191) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `driverName` varchar(191) DEFAULT NULL,
  `driverPhone` varchar(191) DEFAULT NULL,
  `lastMaintenance` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer`
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `seathold`
--

CREATE TABLE `seathold` (
  `id` int(11) NOT NULL,
  `tripId` int(11) NOT NULL,
  `seatNumber` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `seathold`
--

INSERT INTO `seathold` (`id`, `tripId`, `seatNumber`, `clientId`, `expiresAt`, `createdAt`) VALUES
(67, 10, 'C01', 'lz2bo01lcyp', '2026-10-01 13:24:57.960', '2026-10-01 13:19:57.965'),
(69, 10, 'C03', 'lz2bo01lcyp', '2026-10-01 13:25:08.259', '2026-10-01 13:20:08.265');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trip`
--

CREATE TABLE `trip` (
  `id` int(11) NOT NULL,
  `from` varchar(191) NOT NULL,
  `to` varchar(191) NOT NULL,
  `time` datetime(3) NOT NULL,
  `price` double NOT NULL,
  `availableSeats` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `capacity` int(11) NOT NULL
) ;

--
-- Đang đổ dữ liệu cho bảng `trip`
--

INSERT INTO `trip` (`id`, `from`, `to`, `time`, `price`, `availableSeats`, `createdAt`, `capacity`) VALUES
(6, 'Hồ Chí Minh', 'Đà Lạt', '2026-10-01 21:00:00.000', 300000, 32, '2026-09-21 08:31:45.298', 33),
(7, 'Hồ Chí Minh', 'Đà Lạt', '2026-10-01 23:00:00.000', 350000, 22, '2026-09-21 08:31:45.302', 23),
(8, 'Hồ Chí Minh', 'Nha Trang', '2026-10-09 22:30:00.000', 280000, 28, '2026-09-21 08:31:45.305', 30),
(9, 'Hồ Chí Minh', 'Vũng Tàu', '2026-10-01 07:30:00.000', 160000, 23, '2026-09-21 08:31:45.308', 27),
(10, 'Hồ Chí Minh', 'Hà Nội', '2026-10-01 08:00:00.000', 900000, 32, '2026-09-21 08:31:45.312', 34),
(11, 'Đà Lạt', 'Hồ Chí Minh', '2026-10-01 21:30:00.000', 300000, 28, '2026-09-21 08:31:45.315', 28);

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
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`id`, `fullName`, `phone`, `password`, `role`, `createdAt`, `isActive`) VALUES
(7, 'Nguyễn Văn An', '0901234567', 'password123', 'USER', '2026-09-21 08:31:45.290', 1),
(8, 'Trần Thị Bình', '0987654321', 'password123', 'ADMIN', '2026-09-21 08:31:45.294', 1),
(9, 'a', '1', 'guest_password', 'USER', '2026-10-01 08:27:39.456', 1),
(10, 'áda', 'sdasd', 'guest_password', 'USER', '2026-10-01 09:12:19.909', 1),
(11, 'a', '123', 'guest_password', 'USER', '2026-10-09 07:07:17.011', 1),
(12, 'vu', '0932234567', 'scrypt:de3e76057450ae354f71f776b91e552e:790ce28d12e857d9f479fe48138b21f05aae738352b08b58ae88ce31d93d665efc97d4b985b8735407cff6724d906e608212e22cb95cbc75a5a5e5f3c32545cf', 'USER', '2026-10-09 08:21:53.245', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('23c957a5-9590-49f2-be4d-221d86314c67', '5b6eed1ab396626114f6b0f3c80ce8347963b2bc313f8e938c34578e9dacaa99', '2026-10-09 07:29:57.345', '20261009000000_baseline', '', NULL, '2026-10-09 07:29:57.345', 0),
('968a1039-7ddc-4a65-a09e-399f788c230a', '080015226160ae8fc029ad90709ad5a46185e281b8469643939ca13043bd719c', '2026-10-09 07:29:58.871', '20261009010000_admin_business_rules', NULL, NULL, '2026-10-09 07:29:58.535', 1),
('d3a5042b-3649-4fce-ac96-e2d35b66b495', '3c621125a2df92d1c239a92f4912e07e8d255532a7b46dd8f0f2cb2b731be101', '2026-10-09 07:34:33.934', '20261009030000_payment_time', NULL, NULL, '2026-10-09 07:34:33.908', 1),
('d58546da-2311-4ad4-ada2-98d283b52392', 'd91a320809857cbfb3677cb8bbcbdfc3f57ee6b069f90f7a8cedd65cda35e8f7', '2026-10-09 08:23:42.794', '20261009040000_numeric_trip_id', NULL, NULL, '2026-10-09 08:23:42.781', 1),
('feb324f3-cc06-4619-af06-22d5b349b0c5', '7c0159bc32012805fb5616eebcb6b1085cc447d647d387809f0c99caa7748c9b', '2026-10-09 07:32:31.503', '20261009020000_account_status', NULL, NULL, '2026-10-09 07:32:31.491', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_activeSeat_key` (`activeSeat`),
  ADD KEY `booking_pnr_idx` (`pnr`),
  ADD KEY `booking_status_createdAt_idx` (`status`,`createdAt`),
  ADD KEY `Booking_tripId_fkey` (`tripId`),
  ADD KEY `Booking_userId_fkey` (`userId`),
  ADD KEY `booking_status_confirmedAt_idx` (`status`,`confirmedAt`);

--
-- Chỉ mục cho bảng `bus`
--
ALTER TABLE `bus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bus_plate_key` (`plate`);

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
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_email_key` (`email`),
  ADD UNIQUE KEY `employee_phone_key` (`phone`);

--
-- Chỉ mục cho bảng `seathold`
--
ALTER TABLE `seathold`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SeatHold_tripId_seatNumber_key` (`tripId`,`seatNumber`),
  ADD KEY `SeatHold_expiresAt_idx` (`expiresAt`);

--
-- Chỉ mục cho bảng `trip`
--
ALTER TABLE `trip`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trip_time_idx` (`time`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_phone_key` (`phone`);

--
-- Chỉ mục cho bảng `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `booking`
--
ALTER TABLE `booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `seathold`
--
ALTER TABLE `seathold`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT cho bảng `trip`
--
ALTER TABLE `trip`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `Booking_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trip` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `seathold`
--
ALTER TABLE `seathold`
  ADD CONSTRAINT `SeatHold_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trip` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
