"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, DEMO_ACCOUNTS } from "../lib/auth";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = async (role: string) => {
    const account = DEMO_ACCOUNTS.find(a => a.role === role);
    if (account) {
      performLogin(account.email, account.password);
    }
  };

  const performLogin = async (email: string, pass: string) => {
    setLoading(true);
    setError("");
    try {
      const user = await login(email, pass);
      if (user) {
        router.push(`/dashboard/${user.role}`);
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  };

  const ROLES = [
    { id: 'admin', label: 'مدير', icon: '🛡️', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { id: 'doctor', label: 'طبيب', icon: '👨‍⚕️', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'employee', label: 'موظف', icon: '👥', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'patient', label: 'مريض', icon: '👤', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 -z-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-secondary/5 skew-x-12 -translate-x-1/2 -z-10 blur-3xl"></div>

      <div className="w-full max-w-md space-y-6">


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

          {/* Quick Login Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">الدخول السريع (للتجربة)</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleQuickLogin(role.id)}
                  disabled={loading}
                  className={`group p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all hover:scale-[1.03] active:scale-95 ${role.color}`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{role.icon}</span>
                  <span className="text-xs font-black">{role.label}</span>
                </button>
              ))}
            </div>
          </div>

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
