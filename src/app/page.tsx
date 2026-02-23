"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
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
  Heart,
  Target,
  Flame,
  Menu,
  X,
  TrendingUp,
  Award,
  Sparkles,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Dumbbell,
    title: "Zamonaviy Jihozlar",
    description: "Eng so'nggi fitness jihozlari bilan to'liq jihozlangan, keng va qulay zal.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Award,
    title: "Professional Trenerlar",
    description: "Xalqaro sertifikatlangan, tajribali fitness trenerlari har qadamda yoningizda.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Clock,
    title: "Qulay Ish Vaqti",
    description: "Ertalab 06:00 dan kechqurun 23:00 gacha — sizning jadvalingizga mos.",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: Shield,
    title: "Xavfsiz Muhit",
    description: "24/7 xavfsizlik kamerasi, tozalik standarti va qulay locker xona.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const stats = [
  { value: "500+", label: "Faol A'zo", icon: Users },
  { value: "15+", label: "Trener", icon: Trophy },
  { value: "7", label: "Yil Tajriba", icon: TrendingUp },
  { value: "4.9", label: "Reyting", icon: Star },
];

const pricingPlans = [
  {
    name: "Kunlik",
    price: "30,000",
    period: "kun",
    desc: "Sinab ko'rish uchun",
    features: ["Barcha jihozlardan foydalanish", "Dush xonasi", "Shaxsiy shkafcha"],
    popular: false,
  },
  {
    name: "Oylik",
    price: "300,000",
    period: "oy",
    desc: "Eng mashhur tanlov",
    features: [
      "Barcha jihozlardan foydalanish",
      "Dush xonasi",
      "Shaxsiy shkafcha",
      "1 ta bepul trener mashg'uloti",
      "Fitnes dastur tuzish",
    ],
    popular: true,
  },
  {
    name: "Yillik",
    price: "2,500,000",
    period: "yil",
    desc: "Maksimal tejash",
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
  },
];

const testimonials = [
  {
    name: "Sardor Azimov",
    role: "6 oylik a'zo",
    text: "ALIFIT menga hayotimni o'zgartirdi. 3 oyda 15 kg tashladim va o'zimga bo'lgan ishonchim oshdi. Trenerlar juda professional!",
    avatar: "SA",
    rating: 5,
  },
  {
    name: "Dilnoza Karimova",
    role: "1 yillik a'zo",
    text: "Har bir mashg'ulot samarali va qiziqarli o'tadi. Jihozlar doim toza va tartibli. Eng yaxshi investitsiya — o'z salomatligigizga!",
    avatar: "DK",
    rating: 5,
  },
  {
    name: "Jasur Rahimov",
    role: "3 oylik a'zo",
    text: "Ishdan keyin stress chiqarish uchun eng yaxshi joy. Muhit juda qulay, odamlar do'stona. Katta tavsiya qilaman!",
    avatar: "JR",
    rating: 5,
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ═══ NAVBAR ═══ */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/5 shadow-xl"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            <a href="#hero" className="flex items-center gap-3 group">
              <Image
                src="/ALIFITSYB.png"
                alt="ALIFIT"
                width={44}
                height={44}
                className="object-contain drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              />
              <span className="text-xl font-black tracking-tight group-hover:text-emerald-400 transition-colors">
                ALI<span className="text-emerald-400">FIT</span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Bosh sahifa", href: "#hero" },
                { label: "Xizmatlar", href: "#features" },
                { label: "Narxlar", href: "#pricing" },
                { label: "Fikrlar", href: "#testimonials" },
                { label: "Aloqa", href: "#contact" },
              ].map((item) => (
                <a key={item.href} href={item.href}
                  className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors relative group">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Kirish
              </Link>
              <Link href="/login"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5">
                Boshqaruv Paneli
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/5 animate-fade-in">
            <div className="px-4 py-5 space-y-1">
              {[
                { label: "Bosh sahifa", href: "#hero" },
                { label: "Xizmatlar", href: "#features" },
                { label: "Narxlar", href: "#pricing" },
                { label: "Fikrlar", href: "#testimonials" },
                { label: "Aloqa", href: "#contact" },
              ].map((item) => (
                <a key={item.href} href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-emerald-400 font-medium transition-all">
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/5">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold">
                  Kirish
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0v60M0 60h60' stroke='white' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }} />

        {/* Glows */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-semibold">Toshkentdagi #1 fitnes zali</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
                <span className="text-white">KUCHLI.</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  SOG&apos;LOM.
                </span>
                <br />
                <span className="text-white">ERKIN.</span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
                Zamonaviy jihozlar, professional trenerlar va ilhomlantiruvchi muhit bilan
                fitnes maqsadlaringizga erishing. Bugun boshqacha hayotni boshlang!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-14">
                <a href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300">
                  <Zap className="w-5 h-5" />
                  Abonement Olish
                </a>
                <a href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white font-semibold text-base rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                  Ko&apos;proq Bilish
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 pt-6 border-t border-white/8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo showcase */}
            <div className="flex items-center justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-500/10 blur-3xl scale-150 pointer-events-none" />

                {/* Main circle */}
                <div className="relative w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full border border-emerald-500/15 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm flex items-center justify-center">

                  {/* Rotating dashed ring */}
                  <div className="absolute inset-6 rounded-full border border-dashed border-emerald-500/15 animate-spin" style={{ animationDuration: "25s" }} />

                  {/* Logo */}
                  <div className="relative z-10">
                    <Image
                      src="/ALIFITSYB.png"
                      alt="ALIFIT Logo"
                      width={310}
                      height={310}
                      className="object-contain drop-shadow-[0_0_60px_rgba(52,211,153,0.55)]"
                    />
                  </div>

                  {/* Dots on ring */}
                  {[0, 72, 144, 216, 288].map((deg, i) => (
                    <div key={i}
                      className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/50"
                      style={{
                        top: `${50 - 46 * Math.cos((deg * Math.PI) / 180)}%`,
                        left: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                </div>

                {/* Floating badge — top right */}
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-8 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-black px-3 py-2 rounded-2xl shadow-lg shadow-emerald-500/40 animate-bounce" style={{ animationDuration: "3.5s" }}>
                  <Star className="w-3.5 h-3.5 fill-white" />
                  4.9 Reyting
                </div>

                {/* Floating badge — bottom left */}
                <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-8 flex items-center gap-1.5 bg-slate-800 border border-white/10 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-xl">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  500+ A&apos;zo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5">
            <div className="w-1 h-3 bg-emerald-400/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-16 sm:py-28 bg-slate-900 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold mb-5">
              <Target className="w-4 h-4" />
              Nega Biz?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
              Nima Uchun <span className="text-emerald-400">ALIFIT?</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Biz sizga faqat sport zaliga kirishdan ko&apos;proq narsani taqdim etamiz
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title}
                  className="group p-7 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:bg-white/[0.06] hover:border-emerald-500/25 transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden">
                  <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300", feature.gradient)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-500 rounded-b-2xl" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 sm:py-28 bg-slate-950 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-sm font-semibold mb-5">
              <Star className="w-4 h-4" />
              Narxlar
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
              O&apos;zingizga Mos <span className="text-emerald-400">Rejani</span> Tanlang
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Har bir byudjetga mos, maksimal sifat</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={cn(
                "relative rounded-3xl p-7 sm:p-8 flex flex-col transition-all duration-300",
                plan.popular
                  ? "bg-gradient-to-b from-emerald-500/15 to-teal-500/5 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/15 scale-105"
                  : "bg-slate-800/40 border border-white/8 hover:border-white/15 hover:bg-slate-800/60"
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-black text-white shadow-lg shadow-emerald-500/30">
                      <Flame className="w-3.5 h-3.5" />
                      Eng mashhur
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                  <p className={cn("text-sm font-medium", plan.popular ? "text-emerald-400" : "text-slate-500")}>{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-7">
                  <span className={cn("text-4xl sm:text-5xl font-black", plan.popular ? "text-emerald-400" : "text-white")}>
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-sm ml-1">so&apos;m / {plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", plan.popular ? "bg-emerald-500/20" : "bg-white/8")}>
                        <Check className={cn("w-3 h-3", plan.popular ? "text-emerald-400" : "text-slate-400")} />
                      </div>
                      <span className="text-sm text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <a href="#contact" className={cn(
                  "flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200",
                  plan.popular
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
                    : "bg-white/8 text-white hover:bg-white/15 border border-white/10"
                )}>
                  Tanlash <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="py-16 sm:py-28 bg-slate-900 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-sm font-semibold mb-5">
              <Heart className="w-4 h-4" />
              Fikrlar
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
              A&apos;zolarimiz <span className="text-emerald-400">Nima Deydi?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name}
                className="relative p-7 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-5xl font-black text-emerald-500/20 leading-none mb-3 group-hover:text-emerald-500/30 transition-colors select-none">
                  &ldquo;
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-7 text-sm">{t.text}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                    <span className="text-sm font-black text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-14 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0v60M0 60h60' stroke='white' stroke-width='0.8' fill='none'/%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white mb-6 border border-white/25">
            <Zap className="w-4 h-4" />
            Maxsus taklif
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight">
            Birinchi Mashg&apos;ulot<br />
            Mutlaqo <span className="text-white/90 underline decoration-white/30">BEPUL!</span>
          </h2>
          <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto">
            Bugun bizga tashrif buyuring, professional trener bilan bepul mashg&apos;ulot o&apos;ting
            va o&apos;z salomatligigizga birinchi qadamni qo&apos;ying.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+998712001020"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-emerald-600 font-black rounded-2xl shadow-2xl hover:shadow-white/25 hover:-translate-y-1 transition-all duration-300 text-base w-full sm:w-auto justify-center">
              <Phone className="w-5 h-5" />
              Qo&apos;ng&apos;iroq Qilish
            </a>
            <Link href="/login"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/25 hover:bg-white/25 transition-all duration-300 text-base w-full sm:w-auto justify-center">
              <ArrowRight className="w-5 h-5" />
              Admin Paneli
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer id="contact" className="bg-black border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">

            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <Image src="/ALIFITSYB.png" alt="ALIFIT" width={46} height={46} className="object-contain" />
                <span className="text-xl font-black text-white">
                  ALI<span className="text-emerald-400">FIT</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm mb-6 text-sm">
                Toshkentdagi eng zamonaviy fitnes zali. Professional xizmat,
                sifatli jihozlar va ilhomlantiruvchi muhit bilan sizni kutmoqdamiz.
              </p>
              <div className="flex gap-3">
                {[Instagram, Facebook, Phone].map((Icon, i) => (
                  <a key={i} href="#"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-400 transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Bog&apos;lanish</h3>
              <ul className="space-y-4">
                {[
                  { icon: MapPin, text: "Toshkent sh., Chilonzor tumani, 7-mavze" },
                  { icon: Phone, text: "+998 71 200 10 20" },
                  { icon: Mail, text: "info@alifitness.uz" },
                  { icon: Clock, text: "06:00 – 23:00 (har kuni)" },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                    <Icon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Havolalar</h3>
              <ul className="space-y-3">
                {[
                  { label: "Bosh sahifa", href: "#hero" },
                  { label: "Xizmatlar", href: "#features" },
                  { label: "Narxlar", href: "#pricing" },
                  { label: "Fikrlar", href: "#testimonials" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/login"
                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-semibold group">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-sm">&copy; 2026 ALIFIT. Barcha huquqlar himoyalangan.</p>
            <p className="text-slate-700 text-xs">Powered by ALIFIT CRM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
