import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";
import {
  Store,
  ShoppingBag,
  BarChart3,
  Globe,
  ChevronLeft,
  Zap,
  Shield,
  Smartphone,
  Rocket,
  MessageCircle
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function HomePage() {
  let platformName = "منصتك";
  let platformLogo: string | null = null;
  
  try {
    const settings = await prisma.platformSetting.findUnique({ where: { id: "1" } });
    if (settings?.name) platformName = settings.name;
    if (settings?.logo) platformLogo = settings.logo;
  } catch (e) {
    // Fallback if DB is not migrated
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary-200 selection:text-primary-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              {platformLogo ? (
                <div className="w-20 h-20 flex items-center justify-center">
                  <Image src={platformLogo} alt="Logo" width={80} height={80} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary-600" />
                </div>
              )}
              {/* تمت إزالة اسم المنصة بجوار اللوجو بناءً على طلبك */}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
              >
                دخول
              </Link>
              <Link
                href="/register"
                className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors duration-300"
              >
                جرب ببلاش
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <ParallaxBackground />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-bold mb-8">
              <Rocket className="w-4 h-4 text-primary-600" />
              أسرع طريقة تعمل بيها متجرك
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            اعمل متجرك الأونلاين
            <br />
            <span className="text-primary-600">
              واستقبل طلباتك بسهولة!
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة متكاملة للمطاعم والصيدليات والماركت. ارفع المنيو بتاعك، خلي الذكاء الاصطناعي يظبطلك الصور، وشارك رابطك الخاص مع عملائك في ثواني.
          </p>

          <div className="flex flex-row items-center justify-center gap-3 sm:gap-5">
            <Link
              href="/register"
              className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              جرب دلوقتي
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
            </Link>
            <Link
              href="#features"
              className="flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-700 bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              اكتشف المميزات
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 mt-16">
            {[
              { value: "7 أيام", label: "تجربة مجانية بالكامل" },
              { value: "∞", label: "أصناف بدون حدود" },
              { value: "رابط", label: "باسم متجرك الخاص" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              كل اللي هتحتاجه عشان{" "}
              <span className="text-primary-600">تدير أوردراتك</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              تطبيقك متكامل من الألف للياء، مصمم مخصوص عشان يريحك ويزود مبيعاتك
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Store,
                title: "متجرك في دقائق",
                desc: "أنشئ متجرك وابدأ استقبال الطلبات خلال دقائق.",
                bgColor: "bg-blue-100",
                textColor: "text-blue-900",
                iconColor: "text-blue-600",
              },
              {
                icon: Zap,
                title: "المنيو الذكي",
                desc: "صوّر المنيو وسيتم استخراج الأصناف تلقائياً.",
                bgColor: "bg-purple-100",
                textColor: "text-purple-900",
                iconColor: "text-purple-600",
              },
              {
                icon: MessageCircle,
                title: "استقبال الطلبات على واتساب",
                desc: "استقبل كل طلب مباشرة على واتساب بتفاصيله كاملة.",
                bgColor: "bg-green-100",
                textColor: "text-green-900",
                iconColor: "text-green-600",
              },
              {
                icon: Globe,
                title: "رابط خاص بمطعمك",
                desc: "شارك رابط المنيو وQR Code مع عملائك بسهولة.",
                bgColor: "bg-orange-100",
                textColor: "text-orange-900",
                iconColor: "text-orange-600",
              },
              {
                icon: BarChart3,
                title: "لوحة تحكم ذكية",
                desc: "أدر الأصناف والطلبات والأسعار من مكان واحد.",
                bgColor: "bg-rose-100",
                textColor: "text-rose-900",
                iconColor: "text-rose-600",
              },
              {
                icon: Smartphone,
                title: "يعمل على أي جهاز",
                desc: "استخدمه من الموبايل أو الكمبيوتر بدون تطبيق.",
                bgColor: "bg-teal-100",
                textColor: "text-teal-900",
                iconColor: "text-teal-600",
              },
            ].map((feature, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className={`p-6 sm:p-8 rounded-3xl ${feature.bgColor} transition-transform duration-200 hover:scale-[1.02]`}
                >
                  <div className="mb-5">
                    <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${feature.textColor} mb-3`}>
                    {feature.title}
                  </h3>
                  <p className={`${feature.textColor} opacity-80 text-sm sm:text-base leading-relaxed`}>
                    {feature.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              هتبدأ <span className="text-primary-600">إزاي؟</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              3 خطوات بسيطة جداً تفصلك عن أول أوردر
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 inset-x-20 h-1 bg-slate-100 rounded-full" />
            
            {[
              {
                step: "1",
                icon: Store,
                title: "سجّل حسابك",
                desc: "خطوة سريعة تختار فيها اسم متجرك وتفاصيله.",
              },
              {
                step: "2",
                icon: ShoppingBag,
                title: "ظبط المنيو",
                desc: "ضيف أصنافك وأسعارك وخلي شكلها يفتح النفس.",
              },
              {
                step: "3",
                icon: Globe,
                title: "شير اللينك",
                desc: "ابعت اللينك لزباينك واستقبل الأوردرات فوراً.",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.08} className="relative text-center">
                <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-slate-50 border-4 border-white flex flex-col items-center justify-center text-primary-600">
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-1" />
                  <span className="text-lg sm:text-xl font-extrabold">{item.step}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 overflow-hidden">
        <Reveal className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            مستني إيه؟ ابدأ دلوقتي!
          </h2>
          <p className="text-base sm:text-lg text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            انضم لينا وكبّر البيزنس بتاعك بطريقة عصرية. جرب المنصة بالكامل مجاناً لمدة 7 أيام وشوف الفرق بنفسك.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg font-bold text-primary-600 bg-white rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            جرب مجاناً
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="py-5 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <p className="text-sm font-medium">
              © {new Date().getFullYear()} {platformName}. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
