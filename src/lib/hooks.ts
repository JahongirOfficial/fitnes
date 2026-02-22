"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ─── Products ────────────────────────────────────────────────────────────────

export function useProducts(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.getProducts(params),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.uploadProduct(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.uploadProductUpdate(id, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useSellProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; paymentMethod: string; memberId?: string; memberName?: string } }) =>
      api.sellProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-history"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useRestockProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; costPrice?: number } }) =>
      api.restockProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-history"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  });
}

export function useProductHistory(id: string) {
  return useQuery({
    queryKey: ["product-history", id],
    queryFn: () => api.getProductHistory(id),
    enabled: !!id,
  });
}

// ─── Members ─────────────────────────────────────────────────────────────────

export function useMembers(params?: {
  search?: string;
  status?: string;
  subscription?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => api.getMembers(params),
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateMember(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function usePayments(params?: {
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => api.getPayments(params),
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// ─── Visits ──────────────────────────────────────────────────────────────────

export function useVisits(params?: { date?: string; memberId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["visits", params],
    queryFn: () => api.getVisits(params),
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => api.getMember(id),
    enabled: !!id,
  });
}

export function useDeactivateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deactivateMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["member"] });
    },
  });
}

export function useActivateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { subscriptionType: string; startDate: string; endDate: string; price: number; paymentMethod?: string } }) =>
      api.activateMember(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
      qc.invalidateQueries({ queryKey: ["member"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useMemberPayments(memberId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["payments", { memberId, ...params }],
    queryFn: () => api.getPayments({ memberId, ...params }),
    enabled: !!memberId,
  });
}

export function useMemberVisits(memberId: string, params?: { limit?: number }) {
  return useQuery({
    queryKey: ["visits", { memberId, ...params }],
    queryFn: () => api.getVisits({ memberId, ...params }),
    enabled: !!memberId,
  });
}

export function useMemberDebts(memberId: string) {
  return useQuery({
    queryKey: ["debts", { memberId }],
    queryFn: () => api.getDebts({ memberId }),
    enabled: !!memberId,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => api.checkIn(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => api.checkOut(visitId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCheckOutByMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => api.checkOutByMember(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visits"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBulkGenerateQR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.bulkGenerateQR(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function useReports(params?: {
  period?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => api.getReports(params),
  });
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

// ─── Debts (Qarzdaftarcha) ──────────────────────────────────────────────────

export function useDebts(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["debts", params],
    queryFn: () => api.getDebts(params),
  });
}

export function useCreateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createDebt(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

export function useUpdateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateDebt(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

export function usePayDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; description?: string } }) =>
      api.payDebt(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

export function useDeleteDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDebt(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

// ─── Notifications ──────────────────────────────────────────────────────────

export function useNotifications(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => api.getNotifications(params),
    refetchInterval: 60000, // Har 1 daqiqada yangilash
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useGenerateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.generateNotifications(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
