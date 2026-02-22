"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  Clock,
  UserPlus,
  AlertTriangle,
  CreditCard,
  Menu,
  Package,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useGenerateNotifications,
} from "@/lib/hooks";

interface HeaderProps {
  collapsed: boolean;
  onMobileMenuToggle: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Umumiy ko'rsatkichlar" },
  "/members": { title: "A'zolar", subtitle: "A'zolar ro'yxati va boshqaruvi" },
  "/cashier": { title: "Kassa", subtitle: "Moliyaviy operatsiyalar" },
  "/products": { title: "Mahsulotlar", subtitle: "Ombor va sotuvlar" },
  "/visits": { title: "Tashriflar", subtitle: "Kirish va chiqish qaydlari" },
  "/reports": {
    title: "Hisobotlar",
    subtitle: "Moliyaviy va statistik hisobotlar",
  },
  "/settings": {
    title: "Sozlamalar",
    subtitle: "Tizim sozlamalarini boshqarish",
  },
};

// Notification turiga qarab ikon va rang
function getNotifStyle(type: string) {
  switch (type) {
    case "subscription_expiry":
      return { icon: Clock, iconBg: "bg-amber-100", iconColor: "text-amber-600" };
    case "low_stock":
      return { icon: AlertTriangle, iconBg: "bg-red-100", iconColor: "text-red-600" };
    case "new_member":
      return { icon: UserPlus, iconBg: "bg-blue-100", iconColor: "text-blue-600" };
    case "payment":
      return { icon: CreditCard, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" };
    case "debt":
      return { icon: Package, iconBg: "bg-purple-100", iconColor: "text-purple-600" };
    default:
      return { icon: Bell, iconBg: "bg-gray-100", iconColor: "text-gray-600" };
  }
}

// Vaqt formatlash (necha daqiqa/soat/kun oldin)
function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Hozirgina";
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} soat oldin`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} kun oldin`;
  return d.toLocaleDateString("uz-UZ");
}

export default function Header({ collapsed, onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  // Real notification hooks
  const { data: notifData, isLoading: notifLoading } = useNotifications({ limit: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();
  const generateNotifs = useGenerateNotifications();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  // Dropdown ochilganda avtomatik generate qilish (har safar emas, faqat birinchi marta)
  const hasGenerated = useRef(false);
  useEffect(() => {
    if (showNotifications && !hasGenerated.current) {
      hasGenerated.current = true;
      generateNotifs.mutate();
    }
  }, [showNotifications]);

  const userInitials = user?.fullName
    ? user.fullName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    cashier: "Kassir",
    manager: "Menejer",
  };

  const currentPage = pageTitles[pathname] || {
    title: "FitnessPro",
    subtitle: "",
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotif.mutate(id);
  };

  return (
    <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      {/* Left - Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
            {currentPage.title}
          </h1>
          {currentPage.subtitle && (
            <p className="text-[11px] sm:text-xs text-gray-400 leading-tight hidden sm:block">
              {currentPage.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right - Search, Notifications, User */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Desktop Search */}
        <div className="relative hidden lg:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Qidirish..."
            className="w-56 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all focus:w-72"
          />
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition"
        >
          {showMobileSearch ? (
            <X size={18} className="text-gray-600" />
          ) : (
            <Search size={18} className="text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition"
          >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Bildirishnomalar
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markAllRead.isPending}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
                    >
                      {markAllRead.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5" />
                      )}
                      Barchasini o&apos;qish
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-gray-500">Yuklanmoqda...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Bell className="w-8 h-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">Bildirishnomalar yo&apos;q</p>
                    <p className="text-xs text-gray-300 mt-0.5">Yangi xabarlar shu yerda ko&apos;rinadi</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => {
                    const style = getNotifStyle(notif.type);
                    const Icon = style.icon;
                    return (
                      <div
                        key={notif._id}
                        onClick={() => !notif.read && handleMarkRead(notif._id)}
                        className={cn(
                          "group flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0",
                          !notif.read && "bg-blue-50/30"
                        )}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            style.iconBg
                          )}
                        >
                          <Icon className={cn("w-4 h-4", style.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {notif.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(notif.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                          )}
                          <button
                            onClick={(e) => handleDelete(e, notif._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Jami: {notifications.length} ta
                  </span>
                  {notifications.some((n: any) => n.read) && (
                    <button
                      onClick={() => {
                        api.clearReadNotifications().then(() => {
                          queryClient.invalidateQueries({ queryKey: ["notifications"] });
                        });
                      }}
                      className="text-[10px] font-medium text-red-500 hover:text-red-600 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      O&apos;qilganlarni tozalash
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-0.5 hidden sm:block" />

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 py-1.5 px-1.5 sm:px-2 rounded-xl hover:bg-gray-50 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                {roleLabels[user?.role || "admin"] || "Administrator"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "text-gray-400 transition-transform hidden sm:block",
                showUserMenu && "rotate-180"
              )}
            />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500">{user?.email || "admin@fitnesspro.uz"}</p>
              </div>
              <div className="py-1.5">
                <button
                  onClick={() => {
                    router.push("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <User size={16} className="text-gray-400" />
                  Profilim
                </button>
                <button
                  onClick={() => {
                    router.push("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings size={16} className="text-gray-400" />
                  Sozlamalar
                </button>
              </div>
              <div className="border-t border-gray-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Chiqish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-100 p-3 sm:p-4 lg:hidden animate-fade-in z-30">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Qidirish..."
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      )}
    </header>
  );
}
