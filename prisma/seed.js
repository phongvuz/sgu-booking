const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Đang làm mới và tạo dữ liệu mẫu theo schema mới...");

  // Xóa sạch dữ liệu cũ để tránh trùng lặp unique key
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  // 1. Tạo User mẫu
  const user1 = await prisma.user.create({
    data: {
      fullName: "Nguyễn Văn An",
      phone: "0901234567",
      password: "password123",
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: "Trần Thị Bình",
      phone: "0987654321",
      password: "password123",
      role: "ADMIN",
    },
  });

  // 2. Tạo danh sách Chuyến xe (Trip) mẫu đa dạng tuyến
  const tripsData = [
    {
      code: "SG-DL-01",
      from: "Hồ Chí Minh",
      to: "Đà Lạt",
      time: new Date("2026-10-01T21:00:00Z"),
      price: 300000,
      availableSeats: 32,
    },
    {
      code: "SG-DL-02",
      from: "Hồ Chí Minh",
      to: "Đà Lạt",
      time: new Date("2026-10-01T23:00:00Z"),
      price: 350000,
      availableSeats: 22,
    },
    {
      code: "SG-NHA-01",
      from: "Hồ Chí Minh",
      to: "Nha Trang",
      time: new Date("2026-10-01T22:30:00Z"),
      price: 280000,
      availableSeats: 30,
    },
    {
      code: "SG-VT-01",
      from: "Hồ Chí Minh",
      to: "Vũng Tàu",
      time: new Date("2026-10-01T07:30:00Z"),
      price: 160000,
      availableSeats: 26,
    },
    {
      code: "SG-HAN-01",
      from: "Hồ Chí Minh",
      to: "Hà Nội",
      time: new Date("2026-10-01T08:00:00Z"),
      price: 900000,
      availableSeats: 34,
    },
    {
      code: "DL-SG-01",
      from: "Đà Lạt",
      to: "Hồ Chí Minh",
      time: new Date("2026-10-01T21:30:00Z"),
      price: 300000,
      availableSeats: 28,
    },
  ];

  const createdTrips = [];
  for (const t of tripsData) {
    const created = await prisma.trip.create({ data: t });
    createdTrips.push(created);
  }

  // 3. Tạo Đơn đặt vé (Booking) mẫu
  const booking1 = await prisma.booking.create({
    data: {
      seatNumber: "A01",
      status: "CONFIRMED",
      totalPrice: createdTrips[0].price,
      userId: user1.id,
      tripId: createdTrips[0].id,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      seatNumber: "B05",
      status: "PENDING",
      totalPrice: createdTrips[1].price,
      userId: user2.id,
      tripId: createdTrips[1].id,
    },
  });

  // 4. Tạo danh sách Nhân viên (Employee) thực tế vào MySQL
  await prisma.employee.deleteMany();
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

  console.log("✅ Đã tạo thành công dữ liệu mẫu cho database!");
  console.log(`Đã thêm ${createdTrips.length} chuyến xe, ${[user1, user2].length} người dùng và ${employeesData.length} nhân viên vào database.`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi tạo dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
