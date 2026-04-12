"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../lib/auth";

const DEMO_ACCOUNTS = [
  { role: 'admin', label: 'مدير النظام', email: 'admin@juman.com', password: 'admin123', icon: '👨‍💼', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { role: 'doctor', label: 'طبيب', email: 'doctor@juman.com', password: 'doctor123', icon: '👨‍⚕️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { role: 'employee', label: 'موظف استقبال', email: 'emp@juman.com', password: 'emp123', icon: '🧑‍💻', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { role: 'patient', label: 'مريض', email: 'user@juman.com', password: 'user123', icon: '🧑', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const user = login(email, password);
    if (user) {
      router.push(`/dashboard/${user.role}`);
    } else {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    }
  };

  const quickLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
    setLoading(true);
    const user = login(acc.email, acc.password);
    if (user) router.push(`/dashboard/${user.role}`);
    else { setError("خطأ في الدخول السريع"); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-secondary/5 skew-x-12 -translate-x-1/2 -z-10 blur-3xl"></div>

      <div className="w-full max-w-md space-y-6">

        {/* Quick Login Cards */}
        <div className="bg-white/80 backdrop-blur p-5 rounded-[2rem] border border-slate-100 shadow-lg">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">⚡ دخول سريع — اختر دورك</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.role} onClick={() => quickLogin(acc)}
                className={`p-3 rounded-2xl border-2 text-right transition-all hover:scale-[1.02] active:scale-95 ${acc.color}`}>
                <div className="text-xl mb-1">{acc.icon}</div>
                <div className="font-black text-xs leading-tight">{acc.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5 font-bold truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="glass p-10 rounded-[3rem] shadow-2xl border border-white/40 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/20">
              J
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">مرحباً بك في جُمان</h1>
            <p className="text-slate-500">سجل دخولك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block pr-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none transition-all text-slate-800"
                placeholder="admin@juman.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block pr-1">كلمة المرور</label>
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
              <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-sm font-bold border border-rose-100">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <div className="text-center pt-4 space-y-4">
            <p className="text-slate-500 text-sm font-medium">
              ليس لديك حساب?{" "}
              <a href="/register" className="text-primary font-black hover:underline transition-all">
                إنشاء حساب جديد
              </a>
            </p>
            <a href="/" className="text-slate-400 hover:text-primary transition-colors text-sm font-medium block">
              ← العودة للرئيسية
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
