import { Member, Product, Payment, Visit, DailyReport } from "@/types";

export const mockMembers: Member[] = [
  {
    id: "1",
    fullName: "Azimov Sardor",
    phone: "+998901234567",
    email: "sardor@mail.uz",
    dateOfBirth: "1995-03-15",
    status: "active",
    photoUrl: "",
    subscription: {
      id: "s1",
      memberId: "1",
      type: "monthly",
      startDate: "2026-02-01",
      endDate: "2026-03-01",
      price: 300000,
      status: "active",
    },
    createdAt: "2025-01-10",
  },
  {
    id: "2",
    fullName: "Karimova Dilnoza",
    phone: "+998911234567",
    status: "active",
    subscription: {
      id: "s2",
      memberId: "2",
      type: "yearly",
      startDate: "2026-01-01",
      endDate: "2027-01-01",
      price: 2500000,
      status: "active",
    },
    createdAt: "2025-06-20",
  },
  {
    id: "3",
    fullName: "Toshmatov Bekzod",
    phone: "+998931234567",
    status: "expired",
    subscription: {
      id: "s3",
      memberId: "3",
      type: "monthly",
      startDate: "2026-01-01",
      endDate: "2026-02-01",
      price: 300000,
      status: "expired",
    },
    createdAt: "2025-09-05",
  },
  {
    id: "4",
    fullName: "Rahimov Jasur",
    phone: "+998941234567",
    status: "active",
    subscription: {
      id: "s4",
      memberId: "4",
      type: "monthly",
      startDate: "2026-02-10",
      endDate: "2026-03-10",
      price: 300000,
      status: "active",
    },
    createdAt: "2025-11-12",
  },
  {
    id: "5",
    fullName: "Umarova Madina",
    phone: "+998951234567",
    status: "active",
    subscription: {
      id: "s5",
      memberId: "5",
      type: "daily",
      startDate: "2026-02-18",
      endDate: "2026-02-18",
      price: 30000,
      status: "active",
    },
    createdAt: "2026-02-18",
  },
  {
    id: "6",
    fullName: "Xolmatov Otabek",
    phone: "+998961234567",
    status: "inactive",
    createdAt: "2025-04-01",
  },
];

export const mockProducts: Product[] = [
  { id: "p1", name: "Coca-Cola 0.5L", category: "drink", price: 12000, costPrice: 8000, stockQuantity: 24, minStockAlert: 5 },
  { id: "p2", name: "Oqsil Kokteyli (Shokolad)", category: "cocktail", price: 35000, costPrice: 20000, stockQuantity: 15, minStockAlert: 3 },
  { id: "p3", name: "Snickers", category: "chocolate", price: 10000, costPrice: 7000, stockQuantity: 30, minStockAlert: 10 },
  { id: "p4", name: "Suv 1L", category: "drink", price: 5000, costPrice: 2000, stockQuantity: 48, minStockAlert: 10 },
  { id: "p5", name: "Yogurt (Tabiiy)", category: "yogurt", price: 15000, costPrice: 9000, stockQuantity: 8, minStockAlert: 5 },
  { id: "p6", name: "Protein Bar", category: "chocolate", price: 25000, costPrice: 15000, stockQuantity: 2, minStockAlert: 5 },
  { id: "p7", name: "Energetik ichimlik", category: "drink", price: 18000, costPrice: 12000, stockQuantity: 12, minStockAlert: 5 },
  { id: "p8", name: "Oqsil Kokteyli (Vanil)", category: "cocktail", price: 35000, costPrice: 20000, stockQuantity: 10, minStockAlert: 3 },
];

export const mockPayments: Payment[] = [
  { id: "pay1", memberId: "1", memberName: "Azimov Sardor", type: "income", category: "subscription", amount: 300000, paymentMethod: "cash", description: "Oylik abonement", createdBy: "Kassir1", createdAt: "2026-02-18T09:00:00" },
  { id: "pay2", memberId: "5", memberName: "Umarova Madina", type: "income", category: "subscription", amount: 30000, paymentMethod: "card", description: "Kunlik abonement", createdBy: "Kassir1", createdAt: "2026-02-18T10:30:00" },
  { id: "pay3", type: "income", category: "product", amount: 35000, paymentMethod: "cash", description: "Oqsil kokteyli sotildi", createdBy: "Kassir1", createdAt: "2026-02-18T11:00:00" },
  { id: "pay4", type: "expense", category: "salary", amount: 3000000, paymentMethod: "transfer", description: "Trener oyligi - Fevral", createdBy: "Admin", createdAt: "2026-02-18T08:00:00" },
  { id: "pay5", type: "expense", category: "utility", amount: 500000, paymentMethod: "transfer", description: "Elektr energiya - Fevral", createdBy: "Admin", createdAt: "2026-02-17T14:00:00" },
  { id: "pay6", memberId: "4", memberName: "Rahimov Jasur", type: "income", category: "subscription", amount: 300000, paymentMethod: "card", description: "Oylik abonement", createdBy: "Kassir1", createdAt: "2026-02-17T09:30:00" },
];

export const mockVisits: Visit[] = [
  { id: "v1", memberId: "1", memberName: "Azimov Sardor", checkInTime: "2026-02-18T08:00:00", checkOutTime: "2026-02-18T09:30:00", duration: 90 },
  { id: "v2", memberId: "2", memberName: "Karimova Dilnoza", checkInTime: "2026-02-18T09:00:00", checkOutTime: "2026-02-18T10:15:00", duration: 75 },
  { id: "v3", memberId: "4", memberName: "Rahimov Jasur", checkInTime: "2026-02-18T10:00:00" },
  { id: "v4", memberId: "5", memberName: "Umarova Madina", checkInTime: "2026-02-18T10:30:00" },
];

export const mockDailyReport: DailyReport = {
  date: "2026-02-18",
  totalIncome: 665000,
  totalExpense: 3500000,
  netProfit: -2835000,
  visitCount: 4,
  newMembers: 1,
  productSales: 35000,
};

export const weeklyIncomeData = [
  { day: "Dush", income: 850000, expense: 200000 },
  { day: "Sesh", income: 620000, expense: 150000 },
  { day: "Chor", income: 930000, expense: 300000 },
  { day: "Pay", income: 1100000, expense: 180000 },
  { day: "Jum", income: 1450000, expense: 250000 },
  { day: "Shan", income: 1800000, expense: 400000 },
  { day: "Yak", income: 750000, expense: 100000 },
];

export const monthlyMembersData = [
  { month: "Sen", active: 45, new: 12 },
  { month: "Okt", active: 52, new: 15 },
  { month: "Noy", active: 58, new: 10 },
  { month: "Dek", active: 48, new: 8 },
  { month: "Yan", active: 62, new: 18 },
  { month: "Fev", active: 67, new: 14 },
];
