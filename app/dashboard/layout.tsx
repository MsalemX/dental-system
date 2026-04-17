"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, logout, User } from "../lib/auth";
import { getClinicSettings, ClinicSettings } from "../lib/clinic";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount, Notification, NOTIFICATION_ICONS } from "../lib/notifications";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<ClinicSettings | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshNotifs = () => setNotifications(getNotifications());

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const session = await getSession();
      if (!active) return;

      setClinic(getClinicSettings());
      refreshNotifs();

      if (!session) {
        router.push("/login");
      } else {
        setUser(session);
        const roleInPath = pathname.split('/')[2];
        if (roleInPath && roleInPath !== session.role) {
          router.push(`/dashboard/${session.role}`);
        }
      }
    };

    checkSession();

    // Poll for new notifications every 10s
    const interval = setInterval(refreshNotifs, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [router, pathname]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">تحميل...</div>;

  const unreadCount = notifications.filter(n => !n.read).length;

  const NAV_LINKS = {
    admin: [
      { name: "نظرة عامة", href: "/dashboard/admin", icon: "📊" },
      { name: "المواعيد", href: "/dashboard/admin/appointments", icon: "📅" },
      { name: "الفواتير", href: "/dashboard/admin/billing", icon: "🧾" },
      { name: "الإدارة المالية", href: "/dashboard/admin/finance", icon: "💰" },
      { name: "إدارة المخزون", href: "/dashboard/admin/inventory", icon: "📦" },
      { name: "التقارير", href: "/dashboard/admin/reports", icon: "📋" },
      { name: "المرضى", href: "/dashboard/admin/patients", icon: "👥" },
      { name: "إدارة الخدمات", href: "/dashboard/admin/services", icon: "🦷" },
      { name: "إدارة العيادة", href: "/dashboard/admin/clinic", icon: "🏥" },
      { name: "الإعدادات", href: "/dashboard/admin/settings", icon: "⚙️" },
    ],
    doctor: [
      { name: "جدول المواعيد", href: "/dashboard/doctor", icon: "📅" },
      { name: "ملفات المرضى", href: "/dashboard/doctor/patients", icon: "📂" },
    ],
    employee: [
      { name: "الاستقبال", href: "/dashboard/employee", icon: "🏢" },
      { name: "المرضى", href: "/dashboard/employee/patients", icon: "👥" },
      { name: "حجز موعد", href: "/dashboard/employee/appointments", icon: "➕" },
      { name: "الفواتير", href: "/dashboard/employee/billing", icon: "🧾" },
      { name: "التقارير اليومية", href: "/dashboard/employee/reports", icon: "📈" },
    ],
    patient: [
      { name: "مواعيدي", href: "/dashboard/patient", icon: "📅" },
      { name: "نتائج الفحوصات", href: "/dashboard/patient/tests", icon: "🔬" },
      { name: "حجز موعد", href: "/dashboard/patient/appointments/new", icon: "✨" },
      { name: "الملف الطبي", href: "/dashboard/patient/medical-file", icon: "📁" },
      { name: "الملف الشخصي", href: "/dashboard/patient/profile", icon: "👤" },
    ],
  };

  const links = NAV_LINKS[user.role] || [];

  const timeAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة`;
    return `${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l border-slate-200 hidden md:flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            {clinic?.logo ? (
              <img src={clinic.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">J</span>
            )}
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
            {clinic?.name || 'جُمان'}
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold ${pathname === link.href ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                }`}
            >
              <span className="text-xl">{link.icon}</span>
              {link.name}
            </a>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-black text-slate-700 text-sm truncate">{user.name}</div>
              <div className="text-[10px] font-bold text-slate-400">
                {user.role === 'admin' ? 'مدير النظام' : user.role === 'doctor' ? 'طبيب' : 'موظف'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold"
          >
            <span className="text-xl">🚪</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-slate-800">أهلاً، {user.name} 👋</h2>
            <span className="text-slate-400 text-sm font-medium">
              {user.role === 'admin' ? 'مدير النظام' : user.role === 'doctor' ? 'طبيب ممارس' : user.role === 'employee' ? 'مسؤول استقبال' : 'مريض المركز'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotif(v => !v); if (!showNotif) refreshNotifs(); }}
                className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all relative"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 rounded-full text-[10px] font-black text-white flex items-center justify-center px-1 border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotif && (
                <div className="absolute left-0 top-14 w-96 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {/* Panel Header */}
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800">الإشعارات</h4>
                      {unreadCount > 0 && <p className="text-xs font-bold text-slate-400">{unreadCount} غير مقروء</p>}
                    </div>
                    {notifications.length > 0 && (
                      <button onClick={() => { markAllAsRead(); refreshNotifs(); }}
                        className="text-xs font-black text-primary hover:text-primary/70 transition-colors">
                        قراءة الكل
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="text-4xl mb-3">🔕</div>
                        <p className="text-slate-400 font-bold text-sm">لا توجد إشعارات</p>
                      </div>
                    ) : notifications.slice(0, 20).map(notif => (
                      <div key={notif.id}
                        className={`flex gap-3 p-4 hover:bg-slate-50 transition-all cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                        onClick={() => { markAsRead(notif.id); refreshNotifs(); }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${!notif.read ? 'bg-primary/10' : 'bg-slate-100'}`}>
                          {NOTIFICATION_ICONS[notif.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-black text-sm ${!notif.read ? 'text-slate-800' : 'text-slate-500'}`}>{notif.title}</p>
                            <button onClick={e => { e.stopPropagation(); deleteNotification(notif.id); refreshNotifs(); }}
                              className="text-slate-300 hover:text-rose-400 transition-colors text-xs shrink-0">✕</button>
                          </div>
                          <p className="text-xs text-slate-400 font-bold mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-300 font-bold mt-1">{timeAgo(notif.createdAt)}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
