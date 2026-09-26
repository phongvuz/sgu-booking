import { Employee, EmployeeQueryParams, PaginationMeta } from "@/types";

const INITIAL_EMPLOYEES: Employee[] = [
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
    createdAt: "2023-01-15T08:00:00.000Z",
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
    createdAt: "2023-03-20T09:30:00.000Z",
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
    createdAt: "2023-06-10T10:15:00.000Z",
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
    createdAt: "2023-09-01T07:45:00.000Z",
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
    createdAt: "2022-11-15T08:30:00.000Z",
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
    createdAt: "2024-01-08T09:00:00.000Z",
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
    createdAt: "2024-02-14T08:15:00.000Z",
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
    createdAt: "2024-03-01T10:00:00.000Z",
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
    createdAt: "2023-04-12T11:20:00.000Z",
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
    createdAt: "2024-05-20T08:40:00.000Z",
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
    createdAt: "2024-06-01T07:30:00.000Z",
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
    createdAt: "2024-06-15T09:10:00.000Z",
  },
];

// Persistent global storage across Next.js dev server hot-reloads and route evaluations
const globalForEmployees = globalThis as unknown as {
  employeesStore?: Employee[];
};

if (!globalForEmployees.employeesStore) {
  globalForEmployees.employeesStore = [...INITIAL_EMPLOYEES];
}

const getStore = (): Employee[] => globalForEmployees.employeesStore!;
const setStore = (store: Employee[]) => {
  globalForEmployees.employeesStore = store;
};

// Helper to remove Vietnamese accents for fuzzy searching
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function queryEmployees(params: EmployeeQueryParams): {
  data: Employee[];
  pagination: PaginationMeta;
} {
  const {
    search = "",
    role = "",
    department = "",
    status = "",
    page = 1,
    limit = 8,
    sortBy = "id",
    sortOrder = "desc",
  } = params;

  let filtered = [...getStore()];

  // 1. Search filter (Name, Email, Phone, ID)
  if (search.trim()) {
    const rawSearch = search.trim().toLowerCase();
    const cleanSearch = removeVietnameseTones(search.trim());

    filtered = filtered.filter((emp) => {
      const matchId = emp.id.toLowerCase().includes(rawSearch);
      const matchPhone = emp.phone.includes(rawSearch);
      const matchEmail = emp.email.toLowerCase().includes(rawSearch);
      const matchName = removeVietnameseTones(emp.name).includes(cleanSearch);
      return matchId || matchPhone || matchEmail || matchName;
    });
  }

  // 2. Role filter
  if (role) {
    filtered = filtered.filter((emp) => emp.role.toLowerCase() === role.toLowerCase());
  }

  // 3. Department filter
  if (department) {
    filtered = filtered.filter(
      (emp) => emp.department.toLowerCase() === department.toLowerCase()
    );
  }

  // 4. Status filter
  if (status) {
    filtered = filtered.filter((emp) => emp.status.toLowerCase() === status.toLowerCase());
  }

  // 5. Sorting
  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name, "vi");
    } else if (sortBy === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // Numerical sort by ID e.g. EMP-001 vs EMP-010
      const numA = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
      comparison = numA - numB;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // 6. Pagination
  const total = filtered.length;
  const numLimit = Math.max(1, Number(limit) || 8);
  const totalPages = Math.ceil(total / numLimit) || 1;
  const validPage = Math.min(Math.max(1, Number(page) || 1), totalPages);

  const startIndex = (validPage - 1) * numLimit;
  const paginatedData = filtered.slice(startIndex, startIndex + numLimit);

  return {
    data: paginatedData,
    pagination: {
      page: validPage,
      limit: numLimit,
      total,
      totalPages,
    },
  };
}

export function getEmployeeById(id: string): Employee | null {
  return getStore().find((emp) => emp.id.toLowerCase() === id.toLowerCase()) || null;
}

export function createEmployee(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status?: string;
  avatar?: string;
  identityCard?: string;
  address?: string;
  startDate?: string;
}): Employee {
  const store = getStore();

  // Generate next EMP-XXX id
  const existingNums = store
    .map((e) => {
      const match = e.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  
  const nextNum = Math.max(0, ...existingNums) + 1;
  const nextId = `EMP-${String(nextNum).padStart(3, "0")}`;

  const now = new Date().toISOString();

  const newEmployee: Employee = {
    id: nextId,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    role: data.role.trim(),
    department: data.department.trim(),
    status: data.status || "Đang làm việc",
    avatar:
      data.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name
      )}&background=ef5222&color=fff&size=150`,
    identityCard: data.identityCard?.trim(),
    address: data.address?.trim(),
    startDate: data.startDate || now.slice(0, 10),
    createdAt: now,
  };

  // Prepend new employee to global store
  setStore([newEmployee, ...store]);
  return newEmployee;
}

export function updateEmployee(
  id: string,
  data: Partial<Omit<Employee, "id" | "createdAt">>
): Employee | null {
  const store = [...getStore()];
  const index = store.findIndex(
    (emp) => emp.id.toLowerCase() === id.toLowerCase()
  );

  if (index === -1) return null;

  const current = store[index];
  const updated: Employee = {
    ...current,
    ...data,
    name: data.name !== undefined ? data.name.trim() : current.name,
    email: data.email !== undefined ? data.email.trim().toLowerCase() : current.email,
    phone: data.phone !== undefined ? data.phone.trim() : current.phone,
    role: data.role !== undefined ? data.role.trim() : current.role,
    department: data.department !== undefined ? data.department.trim() : current.department,
    status: data.status !== undefined ? data.status : current.status,
    identityCard:
      data.identityCard !== undefined ? data.identityCard.trim() : current.identityCard,
    address: data.address !== undefined ? data.address.trim() : current.address,
    startDate: data.startDate !== undefined ? data.startDate : current.startDate,
  };

  store[index] = updated;
  setStore(store);
  return updated;
}

export function deleteEmployee(id: string): boolean {
  const store = [...getStore()];
  const index = store.findIndex(
    (emp) => emp.id.toLowerCase() === id.toLowerCase()
  );

  if (index === -1) return false;

  store.splice(index, 1);
  setStore(store);
  return true;
}

export function updateEmployeeStatus(id: string, newStatus: string): Employee | null {
  const store = [...getStore()];
  const employee = store.find(
    (emp) => emp.id.toLowerCase() === id.toLowerCase()
  );

  if (!employee) return null;

  employee.status = newStatus;
  setStore(store);
  return employee;
}
