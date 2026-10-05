const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Đang làm mới và tạo dữ liệu mẫu theo schema mới...");

  // Xóa sạch dữ liệu cũ theo thứ tự foreign keys
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.bus.deleteMany();

  // 1. Tạo Users mẫu
  const usersData = [
    {
      fullName: "Nguyễn Văn An",
      phone: "0901234567",
      password: "password123",
      role: "USER",
    },
    {
      fullName: "Trần Thị Bình",
      phone: "0987654321",
      password: "password123",
      role: "ADMIN",
    },
    {
      fullName: "Lê Văn Cường",
      phone: "0912888999",
      password: "password123",
      role: "USER",
    },
    {
      fullName: "Phạm Thu Hương",
      phone: "0933777666",
      password: "password123",
      role: "USER",
    },
    {
      fullName: "Hoàng Minh Đức",
      phone: "0977112233",
      password: "password123",
      role: "USER",
    },
    {
      fullName: "Võ Ngọc Mai",
      phone: "0966445566",
      password: "password123",
      role: "USER",
    },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }

  // 2. Tạo danh sách Chuyến xe (Trip) mẫu
  const tripsData = [
    {
      code: "SG-DL-01",
      from: "Hồ Chí Minh",
      to: "Đà Lạt",
      time: new Date("2026-10-04T21:00:00Z"),
      price: 300000,
      availableSeats: 30,
    },
    {
      code: "SG-DL-02",
      from: "Hồ Chí Minh",
      to: "Đà Lạt",
      time: new Date("2026-10-04T23:00:00Z"),
      price: 350000,
      availableSeats: 20,
    },
    {
      code: "SG-NHA-01",
      from: "Hồ Chí Minh",
      to: "Nha Trang",
      time: new Date("2026-10-04T22:30:00Z"),
      price: 280000,
      availableSeats: 28,
    },
    {
      code: "SG-VT-01",
      from: "Hồ Chí Minh",
      to: "Vũng Tàu",
      time: new Date("2026-10-04T07:30:00Z"),
      price: 160000,
      availableSeats: 25,
    },
    {
      code: "SG-HAN-01",
      from: "Hồ Chí Minh",
      to: "Hà Nội",
      time: new Date("2026-10-05T08:00:00Z"),
      price: 900000,
      availableSeats: 34,
    },
    {
      code: "DL-SG-01",
      from: "Đà Lạt",
      to: "Hồ Chí Minh",
      time: new Date("2026-10-04T21:30:00Z"),
      price: 300000,
      availableSeats: 26,
    },
    {
      code: "SG-DAD-01",
      from: "Hồ Chí Minh",
      to: "Đà Nẵng",
      time: new Date("2026-10-05T14:00:00Z"),
      price: 450000,
      availableSeats: 32,
    },
    {
      code: "SG-CTH-01",
      from: "Hồ Chí Minh",
      to: "Cần Thơ",
      time: new Date("2026-10-04T09:00:00Z"),
      price: 180000,
      availableSeats: 28,
    },
  ];

  const createdTrips = [];
  for (const t of tripsData) {
    const created = await prisma.trip.create({ data: t });
    createdTrips.push(created);
  }

  // 3. Tạo Đơn đặt vé (Booking) mẫu
  const bookingsData = [
    {
      seatNumber: "A01",
      status: "CONFIRMED",
      totalPrice: createdTrips[0].price,
      userId: createdUsers[0].id,
      tripId: createdTrips[0].id,
    },
    {
      seatNumber: "A02",
      status: "CONFIRMED",
      totalPrice: createdTrips[0].price,
      userId: createdUsers[0].id,
      tripId: createdTrips[0].id,
    },
    {
      seatNumber: "B05",
      status: "PENDING",
      totalPrice: createdTrips[1].price,
      userId: createdUsers[1].id,
      tripId: createdTrips[1].id,
    },
    {
      seatNumber: "B06",
      status: "CONFIRMED",
      totalPrice: createdTrips[1].price,
      userId: createdUsers[2].id,
      tripId: createdTrips[1].id,
    },
    {
      seatNumber: "A03",
      status: "CONFIRMED",
      totalPrice: createdTrips[2].price,
      userId: createdUsers[3].id,
      tripId: createdTrips[2].id,
    },
    {
      seatNumber: "A04",
      status: "CONFIRMED",
      totalPrice: createdTrips[2].price,
      userId: createdUsers[3].id,
      tripId: createdTrips[2].id,
    },
    {
      seatNumber: "C01",
      status: "CONFIRMED",
      totalPrice: createdTrips[3].price,
      userId: createdUsers[4].id,
      tripId: createdTrips[3].id,
    },
    {
      seatNumber: "A05",
      status: "CANCELLED",
      totalPrice: createdTrips[5].price,
      userId: createdUsers[5].id,
      tripId: createdTrips[5].id,
    },
    {
      seatNumber: "A06",
      status: "CONFIRMED",
      totalPrice: createdTrips[5].price,
      userId: createdUsers[5].id,
      tripId: createdTrips[5].id,
    },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
  }

  // 4. Tạo danh sách Xe (Bus) mẫu
  const busesData = [
    {
      id: "BUS-001",
      plate: "51B-123.45",
      type: "Limousine 22 phòng",
      seats: 22,
      status: "Đang hoạt động",
      brand: "Thaco Mobihome",
      year: 2023,
      driverName: "Nguyễn Văn A",
      driverPhone: "0901234567",
      lastMaintenance: "2026-08-15",
      notes: "Xe VIP chuyên tuyến Sài Gòn - Đà Lạt",
    },
    {
      id: "BUS-002",
      plate: "51B-987.65",
      type: "Giường nằm 34 chỗ",
      seats: 34,
      status: "Đang hoạt động",
      brand: "Hyundai Tracomeco",
      year: 2022,
      driverName: "Phạm Văn D",
      driverPhone: "0934567890",
      lastMaintenance: "2026-07-20",
      notes: "Tuyến Sài Gòn - Nha Trang",
    },
    {
      id: "BUS-003",
      plate: "51B-456.78",
      type: "Giường nằm 34 chỗ",
      seats: 34,
      status: "Bảo dưỡng",
      brand: "Thaco King Long",
      year: 2021,
      driverName: "Vũ Minh Tuấn",
      driverPhone: "0967890123",
      lastMaintenance: "2026-09-25",
      notes: "Đang thay dầu máy và bảo dưỡng hệ thống phanh",
    },
    {
      id: "BUS-004",
      plate: "51B-333.33",
      type: "Limousine 22 phòng",
      seats: 22,
      status: "Đang hoạt động",
      brand: "Thaco Mobihome VIP",
      year: 2024,
      driverName: "Đinh Công Trình",
      driverPhone: "0932145678",
      lastMaintenance: "2026-09-01",
      notes: "Xe mới đưa vào khai thác tuyến TP.HCM - Vũng Tàu",
    },
    {
      id: "BUS-005",
      plate: "49B-111.11",
      type: "Giường nằm 34 chỗ",
      seats: 34,
      status: "Ngừng hoạt động",
      brand: "Samco Universe",
      year: 2019,
      driverName: "",
      driverPhone: "",
      lastMaintenance: "2026-05-10",
      notes: "Chờ đại tu tổng thể động cơ",
    },
    {
      id: "BUS-006",
      plate: "51B-777.89",
      type: "Ghế ngồi 28 chỗ",
      seats: 28,
      status: "Đang hoạt động",
      brand: "Hyundai County",
      year: 2023,
      driverName: "Nguyễn Văn A",
      driverPhone: "0901234567",
      lastMaintenance: "2026-08-30",
      notes: "Chạy tăng cường các dịp lễ và cuối tuần",
    },
    {
      id: "BUS-007",
      plate: "51B-888.66",
      type: "Limousine 22 phòng",
      seats: 22,
      status: "Đang hoạt động",
      brand: "Thaco Mobihome",
      year: 2023,
      driverName: "Phạm Văn D",
      driverPhone: "0934567890",
      lastMaintenance: "2026-08-10",
      notes: "Tuyến Sài Gòn - Đà Nẵng",
    },
    {
      id: "BUS-008",
      plate: "51B-555.22",
      type: "Giường nằm 34 chỗ",
      seats: 34,
      status: "Bảo dưỡng",
      brand: "Thaco TB120",
      year: 2022,
      driverName: "Vũ Minh Tuấn",
      driverPhone: "0967890123",
      lastMaintenance: "2026-09-22",
      notes: "Kiểm tra định kỳ 50,000km",
    },
  ];

  for (const bus of busesData) {
    await prisma.bus.create({ data: bus });
  }

  // 5. Tạo danh sách Nhân viên (Employee)
  const employeesData = [
    {
      id: "EMP-001",
      name: "Nguyễn Văn A",
      email: "nguyenvana@nhaxe.vn",
      phone: "0901234567",
      role: "Tài xế",
      department: "Đội xe",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      identityCard: "079201001234",
      address: "Quận 1, TP. Hồ Chí Minh",
      startDate: "2023-01-15",
    },
    {
      id: "EMP-002",
      name: "Trần Thị B",
      email: "tranthib@nhaxe.vn",
      phone: "0912345678",
      role: "Văn phòng",
      department: "Phòng vé",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      identityCard: "079202002345",
      address: "Quận 5, TP. Hồ Chí Minh",
      startDate: "2023-03-20",
    },
    {
      id: "EMP-003",
      name: "Lê Hoàng C",
      email: "lehoangc@nhaxe.vn",
      phone: "0923456789",
      role: "Phụ xe",
      department: "Đội xe",
      status: "Nghỉ phép",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
      identityCard: "079203003456",
      address: "TP. Thủ Đức, TP. Hồ Chí Minh",
      startDate: "2023-06-10",
    },
    {
      id: "EMP-004",
      name: "Phạm Văn D",
      email: "phamvand@nhaxe.vn",
      phone: "0934567890",
      role: "Tài xế",
      department: "Đội xe",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      identityCard: "079204004567",
      address: "Quận Bình Thạnh, TP. Hồ Chí Minh",
      startDate: "2023-09-01",
    },
    {
      id: "EMP-005",
      name: "Hoàng Thị E",
      email: "hoangthie@nhaxe.vn",
      phone: "0945678901",
      role: "Quản lý",
      department: "Ban điều hành",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      identityCard: "079205005678",
      address: "Quận 3, TP. Hồ Chí Minh",
      startDate: "2022-11-15",
    },
    {
      id: "EMP-006",
      name: "Vũ Minh Tuấn",
      email: "tuanvm@nhaxe.vn",
      phone: "0967890123",
      role: "Tài xế",
      department: "Đội xe",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      identityCard: "079206006789",
      address: "Quận 10, TP. Hồ Chí Minh",
      startDate: "2024-01-08",
    },
    {
      id: "EMP-007",
      name: "Đặng Thu Thảo",
      email: "thaodt@nhaxe.vn",
      phone: "0978901234",
      role: "Văn phòng",
      department: "Kế toán",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      identityCard: "079207007890",
      address: "Quận Phú Nhuận, TP. Hồ Chí Minh",
      startDate: "2024-02-14",
    },
    {
      id: "EMP-008",
      name: "Bùi Quốc Hưng",
      email: "hungbq@nhaxe.vn",
      phone: "0989012345",
      role: "Điều hành",
      department: "Ban điều hành",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      identityCard: "079208008901",
      address: "Quận Gò Vấp, TP. Hồ Chí Minh",
      startDate: "2024-03-01",
    },
    {
      id: "EMP-009",
      name: "Ngô Thanh Hằng",
      email: "hangnt@nhaxe.vn",
      phone: "0918765432",
      role: "Văn phòng",
      department: "Phòng vé",
      status: "Đã nghỉ việc",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      identityCard: "079209009012",
      address: "Quận Tân Bình, TP. Hồ Chí Minh",
      startDate: "2023-04-12",
    },
    {
      id: "EMP-010",
      name: "Đinh Công Trình",
      email: "trinhdc@nhaxe.vn",
      phone: "0932145678",
      role: "Tài xế",
      department: "Đội xe",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      identityCard: "079210001023",
      address: "Quận 12, TP. Hồ Chí Minh",
      startDate: "2024-05-20",
    },
    {
      id: "EMP-011",
      name: "Lý Hải Đăng",
      email: "danglh@nhaxe.vn",
      phone: "0943215678",
      role: "Phụ xe",
      department: "Đội xe",
      status: "Đang làm việc",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      identityCard: "079211002134",
      address: "Huyện Hóc Môn, TP. Hồ Chí Minh",
      startDate: "2024-06-01",
    },
    {
      id: "EMP-012",
      name: "Phan Kim Oanh",
      email: "oanhpk@nhaxe.vn",
      phone: "0954321678",
      role: "Văn phòng",
      department: "Kế toán",
      status: "Nghỉ phép",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      identityCard: "079212003245",
      address: "Quận 7, TP. Hồ Chí Minh",
      startDate: "2024-06-15",
    },
  ];

  for (const emp of employeesData) {
    await prisma.employee.create({ data: emp });
  }

  console.log("✅ Đã tạo thành công dữ liệu mẫu hoàn chỉnh cho tất cả các bảng!");
  console.log(`- Người dùng: ${createdUsers.length}`);
  console.log(`- Tuyến xe: ${createdTrips.length}`);
  console.log(`- Đơn vé: ${bookingsData.length}`);
  console.log(`- Xe: ${busesData.length}`);
  console.log(`- Nhân sự: ${employeesData.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi tạo dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
