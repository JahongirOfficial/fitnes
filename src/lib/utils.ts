import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " so'm";
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "expired":
      return "bg-red-100 text-red-700";
    case "inactive":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "active":
      return "Faol";
    case "expired":
      return "Muddati tugagan";
    case "inactive":
      return "Nofaol";
    default:
      return status;
  }
}

export function getSubscriptionText(type: string): string {
  switch (type) {
    case "daily":
      return "Kunlik";
    case "monthly":
      return "Oylik";
    case "yearly":
      return "Yillik";
    default:
      return type;
  }
}

export function getPaymentMethodText(method: string): string {
  switch (method) {
    case "cash":
      return "Naqd";
    case "card":
      return "Karta";
    case "transfer":
      return "O'tkazma";
    case "balance":
      return "Balans";
    default:
      return method;
  }
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}

export function unformatPhone(formatted: string): string {
  return "+" + formatted.replace(/\D/g, "");
}

export function formatAmountInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function unformatAmount(formatted: string): number {
  return Number(formatted.replace(/\s/g, "")) || 0;
}
