const API_BASE = "/api";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Xatolik yuz berdi" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  private async requestFormData<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Xatolik yuz berdi" }));
      throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, password: string, fullName: string, email?: string, phone?: string) {
    return this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, fullName, email, phone }),
    });
  }

  async getMe() {
    return this.request<any>("/auth/me");
  }

  async updateProfile(data: { fullName?: string; email?: string; phone?: string }) {
    return this.request<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<any>("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Dashboard
  async getDashboard() {
    return this.request<any>("/dashboard");
  }

  // Members
  async getMembers(params?: {
    search?: string;
    status?: string;
    subscription?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.subscription) query.set("subscription", params.subscription);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request<any>(`/members?${query}`);
  }

  async getMember(id: string) {
    return this.request<any>(`/members/${id}`);
  }

  async createMember(data: any) {
    return this.request<any>("/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: string, data: any) {
    return this.request<any>(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string) {
    return this.request<any>(`/members/${id}`, { method: "DELETE" });
  }

  async searchMembers(params?: {
    search?: string;
    status?: string;
    subscription?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.subscription) query.set("subscription", params.subscription);
    if (params?.limit) query.set("limit", String(params.limit));
    query.set("page", "1");
    return this.request<any>(`/members?${query}`);
  }

  async regenerateQR(id: string) {
    return this.request<any>(`/members/${id}/qr`, { method: "POST" });
  }

  async deactivateMember(id: string) {
    return this.request<any>(`/members/${id}/deactivate`, { method: "PUT" });
  }

  async activateMember(id: string, data: { subscriptionType: string; startDate: string; endDate: string; price: number; paymentMethod?: string }) {
    return this.request<any>(`/members/${id}/activate`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async bulkGenerateQR() {
    return this.request<any>("/members/bulk-qr", { method: "POST" });
  }

  async dailyPay(id: string, data: { amount: number; requiredAmount?: number; paymentMethod: string }) {
    return this.request<any>(`/members/${id}/daily-pay`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Payments
  async getPayments(params?: {
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    memberId?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.type) query.set("type", params.type);
    if (params?.search) query.set("search", params.search);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.page) query.set("page", String(params.page));
    if (params?.memberId) query.set("memberId", params.memberId);
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request<any>(`/payments?${query}`);
  }

  async createPayment(data: any) {
    return this.request<any>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts(params?: { search?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    return this.request<any>(`/products?${query}`);
  }

  async createProduct(data: any) {
    return this.request<any>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async getProductHistory(id: string) {
    return this.request<any>(`/products/${id}/history`);
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/products/${id}`, { method: "DELETE" });
  }

  async sellProduct(id: string, data: { quantity: number; paymentMethod: string; memberId?: string; memberName?: string }) {
    return this.request<any>(`/products/${id}/sell`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async restockProduct(id: string, data: { quantity: number; costPrice?: number }) {
    return this.request<any>(`/products/${id}/restock`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Product with image upload (FormData)
  async uploadProduct(formData: FormData) {
    return this.requestFormData<any>("/products", {
      method: "POST",
      body: formData,
    });
  }

  async uploadProductUpdate(id: string, formData: FormData) {
    return this.requestFormData<any>(`/products/${id}`, {
      method: "PUT",
      body: formData,
    });
  }

  // Visits
  async getVisits(params?: { date?: string; memberId?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.memberId) query.set("memberId", params.memberId);
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return this.request<any>(`/visits${qs ? `?${qs}` : ""}`);
  }

  async checkIn(memberId: string) {
    return this.request<any>("/visits/checkin", {
      method: "POST",
      body: JSON.stringify({ memberId }),
    });
  }

  async checkOut(visitId: string) {
    return this.request<any>(`/visits/${visitId}/checkout`, {
      method: "PUT",
    });
  }

  async checkOutByMember(memberId: string) {
    return this.request<any>("/visits/checkout-by-member", {
      method: "POST",
      body: JSON.stringify({ memberId }),
    });
  }

  // Reports
  async getReports(params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.period) query.set("period", params.period);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    return this.request<any>(`/reports?${query}`);
  }

  // Settings
  async getSettings() {
    return this.request<any>("/settings");
  }

  async updateSettings(data: any) {
    return this.request<any>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  // Debts
  async getDebts(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    memberId?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.memberId) query.set("memberId", params.memberId);
    return this.request<any>(`/debts?${query}`);
  }

  async getDebt(id: string) {
    return this.request<any>(`/debts/${id}`);
  }

  async createDebt(data: any) {
    return this.request<any>("/debts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDebt(id: string, data: any) {
    return this.request<any>(`/debts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async payDebt(id: string, data: { amount: number; description?: string }) {
    return this.request<any>(`/debts/${id}/pay`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteDebt(id: string) {
    return this.request<any>(`/debts/${id}`, { method: "DELETE" });
  }

  // Notifications
  async getNotifications(params?: { limit?: number; unreadOnly?: boolean }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.unreadOnly) query.set("unreadOnly", "true");
    return this.request<any>(`/notifications?${query}`);
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: "PUT" });
  }

  async markAllNotificationsRead() {
    return this.request<any>("/notifications/read-all", { method: "PUT" });
  }

  async deleteNotification(id: string) {
    return this.request<any>(`/notifications/${id}`, { method: "DELETE" });
  }

  async clearReadNotifications() {
    return this.request<any>("/notifications", { method: "DELETE" });
  }

  async generateNotifications() {
    return this.request<any>("/notifications/generate", { method: "POST" });
  }
}

export const api = new ApiClient();
