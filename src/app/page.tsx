"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Users,
  Trophy,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  ArrowRight,
  Check,
  Play,
  Heart,
  Target,
  Flame,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Dumbbell,
    title: "Zamonaviy Jihozlar",
    description: "Eng so'nggi fitness jihozlari bilan to'liq jihozlangan zal",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Professional Trenerlar",
    description: "Tajribali va sertifikatlangan fitness trenerlari",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Clock,
    title: "Qulay Ish Vaqti",
    description: "Ertalab 06:00 dan kechqurun 23:00 gacha ochiq",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Xavfsiz Muhit",
    description: "Tozalik va xavfsizlik standartlariga mos zal",
    color: "from-amber-500 to-amber-600",
  },
];

const stats = [
  { value: "500+", label: "A'zolar", icon: Users },
  { value: "15+", label: "Trenerlar", icon: Trophy },
  { value: "24/7", label: "Qo'llab-quvvatlash", icon: Zap },
  { value: "4.9", label: "Reyting", icon: Star },
];

const pricingPlans = [
  {
    name: "Kunlik",
    price: "30,000",
    period: "kun",
    features: ["Barcha jihozlardan foydalanish", "Dush xonasi", "Shaxsiy shkafcha"],
    popular: false,
    gradient: "from-gray-600 to-gray-700",
  },
  {
    name: "Oylik",
    price: "300,000",
    period: "oy",
    features: [
      "Barcha jihozlardan foydalanish",
      "Dush xonasi",
      "Shaxsiy shkafcha",
      "1 ta bepul trener mashg'uloti",
      "Fitnes dastur tuzish",
    ],
    popular: true,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    name: "Yillik",
    price: "2,500,000",
    period: "yil",
    features: [
      "Barcha jihozlardan foydalanish",
      "Dush xonasi",
      "Shaxsiy shkafcha",
      "6 ta bepul trener mashg'uloti",
      "Fitnes dastur tuzish",
      "Ovqatlanish rejasi",
      "VIP zona kirish",
    ],
    popular: false,
    gradient: "from-purple-600 to-indigo-600",
  },
];

const testimonials = [
  {
    name: "Sardor Azimov",
    role: "6 oylik a'zo",
    text: "FitnessPro menga hayotimni o'zgartirdi. 3 oyda 15 kg tashladim va o'zimga bo'lgan ishonchim oshdi.",
    avatar: "SA",
    rating: 5,
  },
  {
    name: "Dilnoza Karimova",
    role: "1 yillik a'zo",
    text: "Trenerlar juda professional. Har bir mashg'ulot samarali va qiziqarli o'tadi.",
    avatar: "DK",
    rating: 5,
  },
  {
    name: "Jasur Rahimov",
    role: "3 oylik a'zo",
    text: "Jihozlar zamonaviy, muhit juda qulay. Ishdan keyin stress chiqarish uchun eng yaxshi joy.",
    avatar: "JR",
    rating: 5,
  },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Dumbbell className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className={cn("text-xl font-bold transition-colors", scrolled ? "text-gray-900" : "text-white")}>
                FitnessPro
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Bosh sahifa", href: "#hero" },
                { label: "Xizmatlar", href: "#features" },
                { label: "Narxlar", href: "#pricing" },
                { label: "Fikrlar", href: "#testimonials" },
                { label: "Aloqa", href: "#contact" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    scrolled ? "text-gray-600" : "text-white/80 hover:text-white"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium transition-colors",
                  scrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90 hover:text-white"
                )}
              >
                Kirish
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                Boshqaruv Paneli
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn("md:hidden p-2 rounded-lg", scrolled ? "text-gray-700" : "text-white")}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
            <div className="px-4 py-6 space-y-3">
              {["Bosh sahifa", "Xizmatlar", "Narxlar", "Fikrlar", "Aloqa"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  {item}
                </a>
              ))}
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Kirish
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNncmlkKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30" />

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/10">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white/80 font-medium">Toshkentdagi eng yaxshi fitnes zali</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
                Kuchli Bo&apos;l.
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Sog&apos;lom Bo&apos;l.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-xl">
                Zamonaviy jihozlar, professional trenerlar va qulay muhit bilan
                fitnes maqsadlaringizga erishing. Bugun boshqacha hayotni boshlang!
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <Zap className="w-5 h-5" />
                  Hozir Boshlang
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Ko&apos;proq Bilish
                </a>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={cn(
                      "bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 text-center",
                      "hover:bg-white/15 transition-all duration-300",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="w-10 h-10 lg:w-14 lg:h-14 mx-auto mb-2 lg:mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 lg:w-7 lg:h-7 text-blue-400" />
                    </div>
                    <p className="text-2xl lg:text-4xl font-black text-white mb-1">{stat.value}</p>
                    <p className="text-xs lg:text-base text-white/60 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="py-12 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Nega Biz?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Nima Uchun FitnessPro?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Biz sizga eng yaxshi fitness tajribasini taqdim etamiz
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300",
                      feature.color
                    )}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              Narxlar
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              O&apos;zingizga Mos Rejani Tanlang
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Har bir byudjetga mos, sifatli xizmat
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-3xl p-6 sm:p-8 transition-all duration-300",
                  plan.popular
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30 scale-105 border-0"
                    : "bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-xs font-bold text-white shadow-lg">
                    Eng mashhur
                  </div>
                )}
                <h3 className={cn("text-xl font-bold mb-2", plan.popular ? "text-white" : "text-gray-900")}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={cn("text-4xl font-black", plan.popular ? "text-white" : "text-gray-900")}>
                    {plan.price}
                  </span>
                  <span className={cn("text-sm", plan.popular ? "text-white/70" : "text-gray-500")}>
                    so&apos;m / {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <Check
                        className={cn("w-5 h-5 shrink-0", plan.popular ? "text-emerald-300" : "text-emerald-500")}
                      />
                      <span className={cn("text-sm", plan.popular ? "text-white/90" : "text-gray-600")}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={cn(
                    "block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-300",
                    plan.popular
                      ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  Tanlash
                  <ArrowRight className="inline w-4 h-4 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section id="testimonials" className="py-12 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Fikrlar
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              A&apos;zolarimiz Nima Deydi?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNncmlkKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            O&apos;zgarishni Bugun Boshlang!
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Birinchi mashg&apos;ulotingiz bepul! Bizga tashrif buyuring va fitnes
            yo&apos;lingizni boshlang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+998712001020"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Qo&apos;ng&apos;iroq Qilish
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5" />
              Admin Paneli
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ CONTACT / FOOTER ═══════════════ */}
      <footer id="contact" className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold">FitnessPro</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                Toshkentdagi eng zamonaviy fitnes zali. Professional xizmat,
                sifatli jihozlar va qulay muhit bilan sizni kutmoqdamiz.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-lg mb-4">Bog&apos;lanish</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>Toshkent sh., Chilonzor tumani, 7-mavze</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>+998 71 200 10 20</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>info@fitnesspro.uz</span>
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>06:00 - 23:00 (har kuni)</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Tezkor Havolalar</h3>
              <ul className="space-y-3">
                {["Bosh sahifa", "Xizmatlar", "Narxlar", "Fikrlar"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      {link}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              &copy; 2026 FitnessPro. Barcha huquqlar himoyalangan.
            </p>
            <p className="text-slate-600 text-xs">
              Powered by FitnessPro CRM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
