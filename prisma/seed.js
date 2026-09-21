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

  console.log("✅ Đã tạo thành công dữ liệu mẫu cho database!");
  console.log(`Đã thêm ${createdTrips.length} chuyến xe và ${[user1, user2].length} người dùng.`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi tạo dữ liệu mẫu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
