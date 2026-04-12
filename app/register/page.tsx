"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../lib/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await register(email, password, name, phone);

      if (user) {
        router.push(`/dashboard/${user.role}`);
      } else {
        setError("فشل إنشاء الحساب - البريد الإلكتروني قد يكون مسجلاً مسبقاً أو كلمة المرور ضعيفة");
        setLoading(false);
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء التسجيل");
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 block pr-1 uppercase tracking-widest">الاسم الكامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-slate-800"
              placeholder="مثال: فهد القحطاني"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 block pr-1 uppercase tracking-widest">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-slate-800"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 block pr-1 uppercase tracking-widest">رقم الجوال</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-slate-800"
              placeholder="05xxxxxxx"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 block pr-1 uppercase tracking-widest">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-slate-800"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm font-bold border border-rose-100 italic capitalize">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "تأكيد وإنشاء الحساب"}
          </button>
        </form>

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
