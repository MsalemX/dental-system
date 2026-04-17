import Image from "next/image";

const SERVICES = [
  {
    title: "تنظيف وتلميع الأسنان",
    desc: "نظام متطور لإزالة الرواسب والحصول على ابتسامة ناصعة.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-blue-500">
        <path d="M12 2v10" /><path d="M18.4 4.6a9 9 0 1 1-12.8 0" /><path d="m14 10-2 2-2-2" />
      </svg>
    )
  },
  {
    title: "تقويم الأسنان الحديث",
    desc: "حلول مبتكرة لتصحيح اصطفاف الأسنان بأعلى دقة.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-teal-500">
        <path d="M7 12h10" /><path d="M5 8v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" /><path d="M9 12v4" /><path d="M15 12v4" />
      </svg>
    )
  },
  {
    title: "تبييض الأسنان بالليزر",
    desc: "نتائج فورية ومبهرة باستخدام أحدث تقنيات الليزر العالمية.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-rose-500">
        <path d="m13 2-2 2.5h3L12 7" /><path d="M11 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" /><path d="M7 18h10" />
      </svg>
    )
  }
];

const TESTIMONIALS = [
  { name: "أحمد العتيبي", comment: "أفضل تجربة علاجية لأسنان عائلتي، طاقم محترف وتقنيات حديثة جداً.", rating: 5 },
  { name: "سارة محمود", comment: "النتائج كانت مذهلة فعلاً، خاصة في تبييض الأسنان. شكراً جُمان!", rating: 5 },
  { name: "فيصل القحطاني", comment: "نظام الحجز مرن جداً، والعيادة مريحة للغاية ونظيفة.", rating: 5 }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass h-20 px-6 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
            J
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">جُما<span className="text-primary italic">ن</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <a href="#" className="hover:text-primary transition-colors">الرئيسية</a>
          <a href="#services" className="hover:text-primary transition-colors">خدماتنا</a>
          <a href="#about" className="hover:text-primary transition-colors">عن المركز</a>
          <a href="/login" className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-primary hover:text-white transition-all font-bold">تسجيل الدخول</a>
        </div>
        <a href="/login" className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center justify-center">
          احجز موعدك
        </a>
      </nav>


      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 -z-10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-1000">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm">
              ✨ الابتسامة التي تستحقها، تبدأ من هنا
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
              ابتسامتك هي <span className="text-gradient">شغفنا الأول</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              عيادة جُمان المتكاملة تجمع بين خبرة أفضل الأطباء وأحدث ما توصلت إليه تكنولوجيا طب الأسنان، لضمان صحة وجمال ابتسامتك.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all">
                ابدأ رحلتك معنا
              </button>
              <button className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-primary transition-all">
                استشارة مجانية
              </button>
            </div>
          </div>
          <div className="relative group animate-in fade-in slide-in-from-left duration-1000">
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all"></div>
            <Image
              src="/dental_clinic_hero_1775230068067.png"
              alt="عيادة أسنان عصرية"
              width={800}
              height={600}
              className="rounded-[3rem] shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500"
              priority
            />
            <div className="absolute -bottom-6 -right-6 glass p-6 rounded-3xl z-20 shadow-xl border border-white/40 max-w-[200px]">
              <div className="flex -space-x-4 mb-3 rtl:space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white"></div>
              </div>
              <p className="text-xs font-bold text-slate-800">5000+ مريض سعيد يثقون بنا</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-1">15+</div>
            <div className="text-sm font-medium text-slate-500">سنة خبرة</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-secondary mb-1">20+</div>
            <div className="text-sm font-medium text-slate-500">طبيب مختص</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-800 mb-1">99%</div>
            <div className="text-sm font-medium text-slate-500">نسبة الرضا</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-1">100k+</div>
            <div className="text-sm font-medium text-slate-500">ابتسامة مرسومة</div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 md:px-16 bg-white shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">خدماتنا الرائدة</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              نقدم مجموعة متكاملة من الخدمات العلاجية والتجميلية تحت سقف واحد باستخدام أفضل التقنيات العالمية.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((s, idx) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all group duration-500">
                <div className="mb-8 w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-6">{s.desc}</p>
                <a href="#" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all">
                  اقرأ المزيد <span>←</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Gallery */}
      <section id="gallery" className="py-24 px-6 md:px-16 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">نتائجنا الواقعية</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              شاهد التحولات الرائعة التي حققناها لمرضانا في عيادة جُمان. كل حالة فريدة وكل ابتسامة تستحق الاهتمام.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: 'تبييض الأسنان',
                before: '/before-whitening.jpg',
                after: '/after-whitening.jpg',
                description: 'تحول مذهل في لون الأسنان خلال جلسة واحدة'
              },
              {
                category: 'تقويم الأسنان',
                before: '/before-orthodontics.jpg',
                after: '/after-orthodontics.jpg',
                description: 'اصطفاف مثالي للأسنان في 18 شهراً'
              },
              {
                category: 'زراعة الأسنان',
                before: '/before-implants.jpg',
                after: '/after-implants.jpg',
                description: 'استعادة الابتسامة الكاملة بتقنية الزراعة الحديثة'
              }
            ].map((case_, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-[3rem] bg-white shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500">
                <div className="relative h-80 bg-slate-100">
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 relative overflow-hidden">
                      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold z-10">قبل</div>
                      <Image
                        src={case_.before}
                        alt={`قبل ${case_.category}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                      <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold z-10">بعد</div>
                      <Image
                        src={case_.after}
                        alt={`بعد ${case_.category}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{case_.category}</h3>
                    <p className="text-sm opacity-90">{case_.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
              شاهد المزيد من الحالات
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 md:px-16 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              نحن نؤمن بأن كل مريض <span className="text-secondary">فريد من نوعه</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              عيادة جُمان ليست مجرد مكان لعلاج الأسنان، بل هي مركز متكامل يهدف إلى تحويل تجربتك العلاجية إلى رحلة مريحة ومميزة. نحن نستخدم التقنيات الرقمية المتقدمة لضمان أعلى مستويات الدقة.
            </p>
            <ul className="space-y-4">
              {['أطباء حاصلون على بورد عالمي', 'تقنيات الأشعة الرقمية الحديثة', 'بيئة معقمة ومريحة للمرضى'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 md:order-first">
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/20 rounded-[4rem] -rotate-3 blur-xl"></div>
              <Image
                src="/dental_tools_professional_1775230165043.png"
                alt="تقنياتنا الحديثة"
                width={700}
                height={500}
                className="rounded-[3rem] shadow-xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900">ماذا يقول مرضانا؟</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="glass p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-slate-600 italic mb-8 leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-sm text-slate-400">مريض المركز</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-primary to-secondary p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl shadow-primary/40">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">جاهز للحصول على ابتسامة أحلامك؟</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              تواصل معنا اليوم لحجز موعدك الأول واستمتع بخصم 20% على الجلسة الأولى لجميع العملاء الجدد.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <button className="bg-white text-primary px-10 py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-transform">
                احجز الآن
              </button>
              <button className="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-3xl font-bold text-xl hover:bg-white/10 transition-all">
                اتصل بنا: 92000000
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-16 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">J</div>
              <span className="text-xl font-bold text-slate-800">جُمان</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              نلتزم في عيادات جُمان بتقديم أفضل رعاية صحية للأسنان بأعلى المعايير العالمية في بيئة مريحة وآمنة.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">روابط سريعة</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">عن المركز</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">خدماتنا</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">آراء المرضى</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">المدونة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">ساعات العمل</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="flex justify-between"><span>السبت - الخميس:</span> <span>9 ص - 10 م</span></li>
              <li className="flex justify-between"><span>الجمعة:</span> <span>4 م - 10 م</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-6">تواصل معنا</h4>
            <div className="space-y-4">
              <div className="h-48 bg-slate-100 rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgaN2-2HqOw&q=24.7136,46.6753"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li className="flex items-center gap-2">📍 الرياض، المملكة العربية السعودية</li>
                <li className="flex items-center gap-2">📞 920000000</li>
                <li className="flex items-center gap-2">✉️ info@dentalpro.com</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
          <p>© 2026 جُمان - جميع الحقوق محفوظة.</p>
          <div className="flex gap-6">
            <a href="#">سياسة الخصوصية</a>
            <a href="#">الشروط والأحكام</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

