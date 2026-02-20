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
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
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
    default:
      return method;
  }
}
