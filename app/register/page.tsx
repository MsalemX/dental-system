"use client";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-secondary/5 skew-x-12 -translate-x-1/2 -z-10 blur-3xl"></div>

      <div className="w-full max-w-md glass p-10 rounded-[3rem] shadow-2xl border border-white/40 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/20">
            J
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">إنشاء حساب جديد</h1>
          <p className="text-slate-500">انضم لعائلة جُمان واحصل على أفضل رعاية</p>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-5 rounded-2xl text-sm font-bold">
            التسجيل الذاتي موقوف حالياً. إنشاء الحسابات يتم عن طريق الأدمن فقط.
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all"
          >
            الرجوع إلى تسجيل الدخول
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-slate-500 text-sm">
            لديك حساب بالفعل؟{" "}
            <a href="/login" className="text-primary font-black hover:underline transition-all">
              تسجيل الدخول
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
