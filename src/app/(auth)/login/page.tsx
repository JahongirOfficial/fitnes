"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  LogIn,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

type AuthTab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Switch tab ─────────────────────────────────────────────────────────
  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  // ── Login handler ──────────────────────────────────────────────────────
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Kirish xatosi yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register handler ───────────────────────────────────────────────────
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regFullName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    if (regPassword.length < 4) {
      setError("Parol kamida 4 belgidan iborat bo'lishi kerak");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setError("Parollar mos kelmadi");
      return;
    }

    setIsLoading(true);
    try {
      await register(regUsername, regPassword, regFullName, regEmail || undefined, regPhone || undefined);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared input classes ───────────────────────────────────────────────
  const inputCls = cn(
    "w-full pl-11 pr-4 py-3 rounded-xl",
    "bg-gray-50 border border-gray-200",
    "text-gray-900 placeholder:text-gray-400",
    "text-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    "focus:bg-white",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  const passwordInputCls = cn(
    "w-full pl-11 pr-12 py-3 rounded-xl",
    "bg-gray-50 border border-gray-200",
    "text-gray-900 placeholder:text-gray-400",
    "text-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    "focus:bg-white",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl" />
      </div>

      {/* Card */}
      <div className={cn("w-full max-w-md relative z-10", "animate-[fadeIn_0.6s_ease-out]")}>
        <div className={cn("bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl", "border border-white/20", "p-8 sm:p-10")}>
          {/* Logo & Brand */}
          <div className="text-center mb-6">
            <div className={cn("inline-flex items-center justify-center", "w-16 h-16 rounded-2xl mb-4", "bg-gradient-to-br from-blue-500 to-indigo-600", "shadow-lg shadow-blue-500/30")}>
              <Dumbbell className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">FitnessPro</h1>
            <p className="text-sm text-gray-500 mt-1">Boshqaruv Tizimi</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LogIn className="w-4 h-4" />
              Kirish
            </button>
            <button
              type="button"
              onClick={() => switchTab("register")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <UserPlus className="w-4 h-4" />
              Ro&apos;yxatdan o&apos;tish
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={cn("mb-5 p-3 rounded-lg text-sm text-center", "bg-red-50 text-red-600 border border-red-200", "animate-[fadeIn_0.3s_ease-out]")}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={cn("mb-5 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2", "bg-emerald-50 text-emerald-600 border border-emerald-200", "animate-[fadeIn_0.3s_ease-out]")}>
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* ═══════ LOGIN FORM ═══════ */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Foydalanuvchi nomi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Foydalanuvchi nomingiz"
                    autoComplete="username"
                    disabled={isLoading}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolingiz"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={passwordInputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-colors cursor-pointer disabled:opacity-50"
                />
                <label htmlFor="remember" className="ml-2.5 text-sm text-gray-600 cursor-pointer select-none">
                  Meni eslab qol
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3 px-4 rounded-xl",
                  "bg-gradient-to-r from-blue-600 to-indigo-600",
                  "hover:from-blue-700 hover:to-indigo-700",
                  "text-white font-semibold text-sm",
                  "shadow-lg shadow-blue-500/25",
                  "hover:shadow-xl hover:shadow-blue-500/30",
                  "transform hover:-translate-y-0.5",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  "disabled:hover:translate-y-0 disabled:hover:shadow-lg",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Kirish...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Kirish</span>
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-2">
                Hisobingiz yo&apos;qmi?{" "}
                <button type="button" onClick={() => switchTab("register")} className="text-blue-600 font-semibold hover:text-blue-700 transition">
                  Ro&apos;yxatdan o&apos;ting
                </button>
              </p>
            </form>
          )}

          {/* ═══════ REGISTER FORM ═══════ */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <label htmlFor="reg-fullname" className="block text-sm font-medium text-gray-700 mb-1.5">
                  To&apos;liq ism *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ism Familiya"
                    disabled={isLoading}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Foydalanuvchi nomi *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="username"
                    autoComplete="username"
                    disabled={isLoading}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="email@mail.com"
                      disabled={isLoading}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+998..."
                      disabled={isLoading}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Parol *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-password"
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Kamida 4 belgi"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={passwordInputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-password-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Parolni tasdiqlash *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="reg-password-confirm"
                    type={showRegPassword ? "text" : "password"}
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="Parolni qaytadan kiriting"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={inputCls}
                  />
                </div>
                {regPasswordConfirm && regPassword === regPasswordConfirm && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Parollar mos keladi
                  </p>
                )}
                {regPasswordConfirm && regPassword !== regPasswordConfirm && (
                  <p className="text-xs text-red-500 mt-1">Parollar mos kelmadi</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3 px-4 rounded-xl",
                  "bg-gradient-to-r from-emerald-600 to-teal-600",
                  "hover:from-emerald-700 hover:to-teal-700",
                  "text-white font-semibold text-sm",
                  "shadow-lg shadow-emerald-500/25",
                  "hover:shadow-xl hover:shadow-emerald-500/30",
                  "transform hover:-translate-y-0.5",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  "disabled:hover:translate-y-0 disabled:hover:shadow-lg",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Ro&apos;yxatdan o&apos;tilmoqda...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Ro&apos;yxatdan o&apos;tish</span>
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Hisobingiz bormi?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-blue-600 font-semibold hover:text-blue-700 transition">
                  Kirish
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-blue-200/70 hover:text-white/90 transition">
            &larr; Bosh sahifaga qaytish
          </Link>
          <p className="text-blue-200/50 text-xs mt-2">&copy; 2026 FitnessPro CRM</p>
        </div>
      </div>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
