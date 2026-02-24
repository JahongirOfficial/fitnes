// ============ ASOSIY TIPLAR ============

export type UserRole = "admin" | "cashier" | "manager";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  avatar?: string;
}

export type MemberStatus = "active" | "inactive" | "expired";
export type SubscriptionType = "daily" | "monthly" | "quarterly" | "yearly";
export type PaymentMethod = "cash" | "card" | "transfer" | "balance";
export type PaymentType = "income" | "expense";
export type ProductCategory = "drink" | "chocolate" | "cocktail" | "yogurt" | "other";

export interface Member {
  id: string;
  memberId?: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  photoUrl?: string;
  qrCode?: string;
  status: MemberStatus;
  subscription?: Subscription;
  balance?: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  memberId: string;
  type: SubscriptionType;
  startDate: string;
  endDate: string;
  price: number;
  status: "active" | "expired";
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  image?: string | null;
  recipe?: RecipeItem[];
}

export interface Visit {
  id: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
}

export interface Payment {
  id: string;
  memberId?: string;
  memberName?: string;
  type: PaymentType;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  memberId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface DailyReport {
  date: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  visitCount: number;
  newMembers: number;
  productSales: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

// ============ QARZ (DEBT) TIPLARI ============

export type DebtStatus = "unpaid" | "partial" | "paid";

export interface DebtPayment {
  _id: string;
  amount: number;
  date: string;
  description?: string;
}

export interface Debt {
  _id: string;
  memberId?: string;
  personName: string;
  phone?: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  description?: string;
  status: DebtStatus;
  payments: DebtPayment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
