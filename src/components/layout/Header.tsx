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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

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

const notifications = [
  {
    id: 1,
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Protein Bar kam qoldiq!",
    desc: "Faqat 2 ta qoldi (min: 5)",
    time: "5 daqiqa oldin",
    unread: true,
  },
  {
    id: 2,
    icon: UserPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Yangi a'zo qo'shildi",
    desc: "Umarova Madina ro'yxatdan o'tdi",
    time: "30 daqiqa oldin",
    unread: true,
  },
  {
    id: 3,
    icon: CreditCard,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "To'lov qabul qilindi",
    desc: "Azimov Sardor - 300,000 so'm",
    time: "1 soat oldin",
    unread: false,
  },
  {
    id: 4,
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Abonement muddati tugayapti",
    desc: "Toshmatov Bekzod - 3 kun qoldi",
    time: "2 soat oldin",
    unread: false,
  },
];

export default function Header({ collapsed, onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const userInitials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
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
  const unreadCount = notifications.filter((n) => n.unread).length;

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
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Bildirishnomalar
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {unreadCount} ta yangi
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0",
                      notif.unread && "bg-blue-50/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        notif.iconBg
                      )}
                    >
                      <notif.icon className={cn("w-4 h-4", notif.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {notif.desc}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.time}
                      </p>
                    </div>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100">
                <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition">
                  Barchasini ko&#39;rish
                </button>
              </div>
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
