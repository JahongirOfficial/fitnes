"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/auth";
import { useSettings } from "@/lib/hooks";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "gym", label: "Fitnes zal", icon: Building2 },
  { id: "notifications", label: "Bildirishnomalar", icon: Bell },
  { id: "security", label: "Xavfsizlik", icon: Shield },
  { id: "appearance", label: "Ko'rinish", icon: Palette },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const { data: settingsData } = useSettings();

  const [profile, setProfile] = useState({
    fullName: "", username: "", email: "", phone: "",
  });

  const [gymSettings, setGymSettings] = useState({
    gymName: "ALIFIT Gym", address: "Toshkent sh., Chilonzor tumani",
    phone: "+998712345678", workingHours: "06:00 - 23:00",
    dailyPrice: "30000", monthlyPrice: "300000", yearlyPrice: "2500000",
  });

  const [notifications, setNotifications] = useState({
    subscriptionExpiry: true, lowStock: true, newMember: false, dailyReport: true, paymentConfirm: false,
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (settingsData) {
      setGymSettings({
        gymName: settingsData.gymName || "ALIFIT Gym",
        address: settingsData.address || "",
        phone: settingsData.phone || "",
        workingHours: settingsData.workingHours || "06:00 - 23:00",
        dailyPrice: String(settingsData.pricing?.daily || 30000),
        monthlyPrice: String(settingsData.pricing?.monthly || 300000),
        yearlyPrice: String(settingsData.pricing?.yearly || 2500000),
      });
      if (settingsData.notifications) {
        setNotifications(settingsData.notifications);
      }
    }
  }, [settingsData]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.updateProfile({ fullName: profile.fullName, email: profile.email, phone: profile.phone });
      toast("success", "Profil yangilandi");
    } catch (err: any) {
      toast("error", err.message || "Profilni saqlashda xatolik");
    } finally { setIsSaving(false); }
  };

  const handleSaveGym = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings({
        gymName: gymSettings.gymName, address: gymSettings.address, phone: gymSettings.phone, workingHours: gymSettings.workingHours,
        pricing: { daily: Number(gymSettings.dailyPrice), monthly: Number(gymSettings.monthlyPrice), yearly: Number(gymSettings.yearlyPrice) },
      });
      toast("success", "Zal sozlamalari saqlandi");
    } catch (err: any) {
      toast("error", err.message || "Saqlashda xatolik");
    } finally { setIsSaving(false); }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings({ notifications });
      toast("success", "Bildirishnoma sozlamalari saqlandi");
    } catch (err: any) {
      toast("error", err.message || "Saqlashda xatolik");
    } finally { setIsSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { toast("error", "Parollar mos kelmadi"); return; }
    if (passwords.newPass.length < 6) { toast("error", "Parol kamida 6 belgidan iborat bo'lishi kerak"); return; }
    setIsSaving(true);
    try {
      await api.changePassword(passwords.current, passwords.newPass);
      toast("success", "Parol o'zgartirildi");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      toast("error", err.message || "Parolni o'zgartirishda xatolik");
    } finally { setIsSaving(false); }
  };

  const getInitials = () => {
    return (profile.fullName || "A").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Tab Selector */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200"
                }`}>
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar Tabs */}
        <div className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl p-3 shadow-sm sticky top-24">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all mb-1 ${
                    activeTab === tab.id ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shaxsiy Ma&apos;lumotlar</h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl sm:text-2xl font-bold">
                    {getInitials()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-gray-900">{profile.fullName || "Admin"}</h3>
                  <p className="text-gray-500 text-sm">Administrator</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To&apos;liq ism</label>
                  <input type="text" value={profile.fullName}
                    onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input type="text" value={profile.username} disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input type="tel" value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button onClick={handleSaveProfile} disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === "gym" && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Fitnes Zal Ma&apos;lumotlari</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zal nomi</label>
                  <input type="text" value={gymSettings.gymName}
                    onChange={(e) => setGymSettings((p) => ({ ...p, gymName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manzil</label>
                  <input type="text" value={gymSettings.address}
                    onChange={(e) => setGymSettings((p) => ({ ...p, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input type="tel" value={gymSettings.phone}
                    onChange={(e) => setGymSettings((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ish vaqti</label>
                  <input type="text" value={gymSettings.workingHours}
                    onChange={(e) => setGymSettings((p) => ({ ...p, workingHours: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>
              </div>
              <h3 className="text-md font-semibold text-gray-900 mt-8 mb-4">Abonement Narxlari</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-2">Kunlik</p>
                  <input type="number" value={gymSettings.dailyPrice}
                    onChange={(e) => setGymSettings((p) => ({ ...p, dailyPrice: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-lg font-semibold" />
                  <p className="text-xs text-gray-500 mt-1">so&apos;m</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-100">
                  <p className="text-sm text-emerald-600 font-medium mb-2">Oylik</p>
                  <input type="number" value={gymSettings.monthlyPrice}
                    onChange={(e) => setGymSettings((p) => ({ ...p, monthlyPrice: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-lg font-semibold" />
                  <p className="text-xs text-gray-500 mt-1">so&apos;m</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 sm:p-5 border border-purple-100">
                  <p className="text-sm text-purple-600 font-medium mb-2">Yillik</p>
                  <input type="number" value={gymSettings.yearlyPrice}
                    onChange={(e) => setGymSettings((p) => ({ ...p, yearlyPrice: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-lg font-semibold" />
                  <p className="text-xs text-gray-500 mt-1">so&apos;m</p>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button onClick={handleSaveGym} disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Bildirishnoma Sozlamalari</h2>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { key: "subscriptionExpiry", title: "Abonement muddati tugashi", desc: "A'zo abonement muddati tugashidan 3 kun oldin xabar yuborish" },
                  { key: "lowStock", title: "Kam qoldiq ogohlantirishi", desc: "Mahsulot qoldig'i minimal darajaga tushganda xabar berish" },
                  { key: "newMember", title: "Yangi a'zo ro'yxatdan o'tishi", desc: "Yangi a'zo qo'shilganda bildirishnoma yuborish" },
                  { key: "dailyReport", title: "Kunlik hisobot", desc: "Har kuni kechqurun kunlik hisobotni yuborish" },
                  { key: "paymentConfirm", title: "To'lov tasdig'i", desc: "To'lov qabul qilinganda a'zoga SMS yuborish" },
                ].map((item) => (
                  <div key={item.key} className="flex items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox"
                        checked={(notifications as any)[item.key]}
                        onChange={(e) => setNotifications((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button onClick={handleSaveNotifications} disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Xavfsizlik Sozlamalari</h2>
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Parolni o&apos;zgartirish</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joriy parol</label>
                    <input type="password" value={passwords.current}
                      onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yangi parol</label>
                    <input type="password" value={passwords.newPass}
                      onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parolni tasdiqlash</label>
                    <input type="password" value={passwords.confirm}
                      onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                  </div>
                </div>
              </div>
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button onClick={handleChangePassword} disabled={isSaving || !passwords.current || !passwords.newPass}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50">
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Ko&apos;rinish Sozlamalari</h2>
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Rang Sxemasi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: "Ko'k", color: "bg-blue-600", active: true },
                    { name: "Yashil", color: "bg-emerald-600", active: false },
                    { name: "Binafsha", color: "bg-purple-600", active: false },
                  ].map((theme) => (
                    <button key={theme.name}
                      className={`p-4 rounded-xl border-2 transition flex items-center gap-3 ${
                        theme.active ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className={`w-10 h-10 rounded-xl ${theme.color}`}></div>
                      <span className="font-medium">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Sidebar holati</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50 transition text-center">
                    <Settings size={24} className="mx-auto mb-2 text-blue-600" />
                    <span className="font-medium text-sm">Kengaytirilgan</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition text-center">
                    <Settings size={24} className="mx-auto mb-2 text-gray-400" />
                    <span className="font-medium text-sm text-gray-600">Yig&apos;ilgan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
