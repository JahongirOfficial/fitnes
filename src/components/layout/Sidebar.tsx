"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  Wallet,
  Package,
  ScanLine,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "A'zolar", icon: Users },
  { href: "/cashier", label: "Kassa", icon: Wallet },
  { href: "/products", label: "Mahsulotlar", icon: Package },
  { href: "/visits", label: "Tashriflar", icon: ScanLine },
  { href: "/reports", label: "Hisobotlar", icon: BarChart3 },
  { href: "/debts", label: "Qarzdaftarcha", icon: BookOpen },
  { href: "/settings", label: "Sozlamalar", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = () => {
    if (!user?.fullName) return "AD";
    return user.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    cashier: "Kassir",
    manager: "Menejer",
  };

  const handleNavClick = () => {
    if (mobileOpen) onMobileClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-all duration-300",
          // Desktop
          collapsed ? "lg:w-20" : "lg:w-72",
          // Mobile - slide in/out
          mobileOpen ? "max-lg:translate-x-0 max-lg:w-72" : "max-lg:translate-x-[-100%]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shrink-0">
              <Dumbbell size={22} className="text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div>
                <h1 className="text-lg font-bold text-white">FitnessPro</h1>
                <p className="text-[11px] text-slate-400 -mt-0.5">CRM Tizimi</p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const showLabel = !collapsed || mobileOpen;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {showLabel && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="px-3 pb-4">
          <div
            className={cn(
              "bg-slate-800 rounded-xl p-3 mb-3",
              collapsed && !mobileOpen ? "flex justify-center" : "flex items-center gap-3"
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-sm font-bold">
              {getInitials()}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-slate-400">
                  {roleLabels[user?.role || "admin"] || "Administrator"}
                </p>
              </div>
            )}
            {(!collapsed || mobileOpen) && (
              <button
                onClick={handleLogout}
                title="Chiqish"
                className="text-slate-400 hover:text-red-400 transition shrink-0"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>

          {/* Collapse Toggle - only on desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-xs">Yig&apos;ish</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
