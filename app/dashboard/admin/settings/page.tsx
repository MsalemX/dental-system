"use client";

import { useEffect, useState } from "react";
import { getSession, updateUser, User, getAllUsers } from "../../../lib/auth";
import { clearAllNotifications } from "../../../lib/notifications";
import { getClinicSettings } from "../../../lib/clinic";

type SettingsTab = 'password' | 'permissions' | 'payment' | 'backup' | 'security';

interface SystemSettings {
  paymentMethods: { cash: boolean; card: boolean; insurance: boolean; bankTransfer: boolean };
  permissions: {
    doctor: { viewAllPatients: boolean; editAppointments: boolean };
    employee: { createBills: boolean; viewReports: boolean; manageAppointments: boolean };
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  paymentMethods: { cash: true, card: true, insurance: false, bankTransfer: false },
  permissions: {
    doctor: { viewAllPatients: false, editAppointments: true },
    employee: { createBills: true, viewReports: false, manageAppointments: true },
  },
};

const getSystemSettings = (): SystemSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem('juman_system_settings');
  return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
};

const saveSystemSettings = (s: SystemSettings) => {
  localStorage.setItem('juman_system_settings', JSON.stringify(s));
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('password');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      if (session) setUser(session);
      setSettings(getSystemSettings());
    };
    init();
  }, []);

  const handleSaveSettings = () => {
    saveSystemSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!user) return;
    
    if (newPw.length < 6) { setPwError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return; }
    if (newPw !== confirmPw) { setPwError('كلمة المرور الجديدة غير متطابقة'); return; }
    
    const result = await changePassword(newPw);
    if (!result.success) {
      setPwError(result.error || 'حدث خطأ أثناء تحديث كلمة المرور');
      return;
    }

    setPwSuccess(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleBackupDownload = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      clinic: getClinicSettings(),
      appointments: JSON.parse(localStorage.getItem('juman_appointments') || '[]'),
      bills: JSON.parse(localStorage.getItem('juman_bills') || '[]'),
      expenses: JSON.parse(localStorage.getItem('juman_expenses') || '[]'),
      services: JSON.parse(localStorage.getItem('juman_services') || '[]'),
      rooms: JSON.parse(localStorage.getItem('juman_rooms') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `juman-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.appointments) localStorage.setItem('juman_appointments', JSON.stringify(data.appointments));
        if (data.bills) localStorage.setItem('juman_bills', JSON.stringify(data.bills));
        if (data.expenses) localStorage.setItem('juman_expenses', JSON.stringify(data.expenses));
        if (data.services) localStorage.setItem('juman_services', JSON.stringify(data.services));
        if (data.rooms) localStorage.setItem('juman_rooms', JSON.stringify(data.rooms));
        if (data.clinic) localStorage.setItem('juman_clinic', JSON.stringify(data.clinic));
        alert('✅ تم استيراد النسخة بنجاح! سيتم إعادة تحميل الصفحة.');
        window.location.reload();
      } catch {
        alert('❌ خطأ في قراءة الملف. تأكد أنه ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearNotifications = () => {
    clearAllNotifications();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'password', label: 'كلمة المرور', icon: '🔑' },
    { key: 'permissions', label: 'الصلاحيات', icon: '🛡️' },
    { key: 'payment', label: 'طرق الدفع', icon: '💳' },
    { key: 'backup', label: 'النسخ الاحتياطي', icon: '💾' },
    { key: 'security', label: 'الأمان', icon: '🔐' },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-primary' : 'bg-slate-200'}`}>
      <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow-sm ${checked ? 'right-0.5' : 'left-0.5'}`}></span>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800">إعدادات النظام</h2>
        <p className="text-slate-400 font-bold text-sm mt-1">إدارة الأمان والصلاحيات وطرق الدفع</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="lg:w-56 flex lg:flex-col gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all text-right ${activeTab === t.key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10">

          {/* ── Password Tab ── */}
          {activeTab === 'password' && (
            <div className="max-w-md space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">تغيير كلمة المرور</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">اختر كلمة مرور قوية لحماية حسابك</p>
              </div>
              {pwSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-black p-4 rounded-2xl">✅ تم تغيير كلمة المرور بنجاح</div>
              )}
              {pwError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 font-black p-4 rounded-2xl">❌ {pwError}</div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: 'كلمة المرور الحالية', val: currentPw, set: setCurrentPw },
                  { label: 'كلمة المرور الجديدة', val: newPw, set: setNewPw },
                  { label: 'تأكيد كلمة المرور الجديدة', val: confirmPw, set: setConfirmPw },
                ].map(({ label, val, set }) => (
                  <div key={label} className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
                    <input required type="password" value={val} onChange={e => set(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                  </div>
                ))}
                <button type="submit" className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all mt-4">
                  تحديث كلمة المرور
                </button>
              </form>
            </div>
          )}

          {/* ── Permissions Tab ── */}
          {activeTab === 'permissions' && (
            <div className="space-y-8 max-w-lg">
              <div>
                <h3 className="text-2xl font-black text-slate-800">إعداد الصلاحيات</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">حدد ما يستطيع كل دور الوصول إليه</p>
              </div>

              {/* Doctor permissions */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-600 flex items-center gap-2"><span className="text-lg">👨‍⚕️</span> صلاحيات الأطباء</h4>
                {[
                  { key: 'viewAllPatients', label: 'عرض ملفات جميع المرضى', desc: 'السماح للطبيب برؤية مرضى غيره' },
                  { key: 'editAppointments', label: 'تعديل حالة الموعد', desc: 'تغيير حالة المواعيد من قائمته' },
                ].map(p => (
                  <div key={p.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <div className="font-black text-slate-700 text-sm">{p.label}</div>
                      <div className="text-xs font-bold text-slate-400">{p.desc}</div>
                    </div>
                    <Toggle
                      checked={settings.permissions.doctor[p.key as keyof typeof settings.permissions.doctor]}
                      onChange={v => setSettings(s => ({ ...s, permissions: { ...s.permissions, doctor: { ...s.permissions.doctor, [p.key]: v } } }))} />
                  </div>
                ))}
              </div>

              {/* Employee permissions */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-600 flex items-center gap-2"><span className="text-lg">🧑‍💼</span> صلاحيات موظفي الاستقبال</h4>
                {[
                  { key: 'createBills', label: 'إنشاء الفواتير', desc: 'إصدار فواتير للمرضى' },
                  { key: 'viewReports', label: 'عرض التقارير', desc: 'الوصول لصفحة التقارير' },
                  { key: 'manageAppointments', label: 'إدارة المواعيد', desc: 'إضافة وتعديل المواعيد' },
                ].map(p => (
                  <div key={p.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <div className="font-black text-slate-700 text-sm">{p.label}</div>
                      <div className="text-xs font-bold text-slate-400">{p.desc}</div>
                    </div>
                    <Toggle
                      checked={settings.permissions.employee[p.key as keyof typeof settings.permissions.employee]}
                      onChange={v => setSettings(s => ({ ...s, permissions: { ...s.permissions, employee: { ...s.permissions.employee, [p.key]: v } } }))} />
                  </div>
                ))}
              </div>

              <button onClick={handleSaveSettings} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all">
                {saved ? '✅ تم الحفظ!' : 'حفظ الصلاحيات'}
              </button>
            </div>
          )}

          {/* ── Payment Tab ── */}
          {activeTab === 'payment' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-2xl font-black text-slate-800">طرق الدفع المتاحة</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">فعّل أو أوقف طرق الدفع المقبولة في العيادة</p>
              </div>
              {[
                { key: 'cash', label: 'نقدي', desc: 'الدفع كاش في العيادة', icon: '💵' },
                { key: 'card', label: 'بطاقة بنكية', desc: 'Visa / Mastercard / Mada', icon: '💳' },
                { key: 'insurance', label: 'تأمين طبي', desc: 'قبول شركات التأمين التعاوني', icon: '🏥' },
                { key: 'bankTransfer', label: 'تحويل بنكي', desc: 'IBAN / Sadad', icon: '🏦' },
              ].map(m => (
                <div key={m.key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{m.icon}</div>
                    <div>
                      <div className="font-black text-slate-700">{m.label}</div>
                      <div className="text-xs font-bold text-slate-400">{m.desc}</div>
                    </div>
                  </div>
                  <Toggle
                    checked={settings.paymentMethods[m.key as keyof typeof settings.paymentMethods]}
                    onChange={v => setSettings(s => ({ ...s, paymentMethods: { ...s.paymentMethods, [m.key]: v } }))} />
                </div>
              ))}
              <button onClick={handleSaveSettings} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all">
                {saved ? '✅ تم الحفظ!' : 'حفظ الإعدادات'}
              </button>
            </div>
          )}

          {/* ── Backup Tab ── */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-2xl font-black text-slate-800">النسخ الاحتياطي</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">تصدير واستيراد بيانات النظام</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] space-y-4 border border-slate-100">
                <div className="text-4xl">💾</div>
                <h4 className="font-black text-slate-800">تصدير نسخة احتياطية</h4>
                <p className="text-sm font-bold text-slate-400">يقوم بتنزيل ملف JSON يحتوي على كافة بيانات العيادة: المواعيد، الفواتير، الخدمات، الغرف، والمصروفات.</p>
                <button onClick={handleBackupDownload}
                  className="w-full h-14 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all flex items-center justify-center gap-3">
                  <span>⬇️</span> تنزيل نسخة احتياطية
                </button>
              </div>
              <div className="p-8 bg-emerald-50 rounded-[2rem] space-y-4 border border-emerald-100">
                <div className="text-4xl">⬆️</div>
                <h4 className="font-black text-emerald-800">استيراد نسخة احتياطية (Restore)</h4>
                <p className="text-sm font-bold text-emerald-600">اختر ملف JSON سبق تصديره من النظام. سيتم استبدال البيانات الحالية بالبيانات المستوردة.</p>
                <label className="block w-full cursor-pointer">
                  <div className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all">
                    <span>📂</span> اختر ملف النسخة (JSON)
                  </div>
                  <input type="file" accept=".json,application/json" className="hidden" onChange={handleBackupRestore} />
                </label>
              </div>
              <div className="p-8 bg-rose-50 rounded-[2rem] space-y-4 border border-rose-100">
                <div className="text-4xl">🗑️</div>
                <h4 className="font-black text-rose-700">مسح الإشعارات</h4>
                <p className="text-sm font-bold text-rose-400">حذف جميع الإشعارات المخزنة في النظام.</p>
                <button onClick={handleClearNotifications}
                  className="w-full h-14 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all">
                  {saved ? '✅ تم المسح!' : 'مسح كل الإشعارات'}
                </button>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="text-2xl font-black text-slate-800">معلومات الأمان</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">بيانات جلستك الحالية وإعدادات الحماية</p>
              </div>

              <div className="space-y-3">
                {/* Current Session */}
                <div className="p-6 bg-emerald-50 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl">🟢</div>
                  <div>
                    <div className="font-black text-emerald-700">جلسة نشطة</div>
                    <div className="text-xs font-bold text-emerald-500">أنت مسجل الدخول كـ {user?.name}</div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                  <h4 className="font-black text-slate-700">معلومات الحساب</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'الاسم', value: user?.name },
                      { label: 'البريد الإلكتروني', value: user?.email },
                      { label: 'الدور', value: 'مدير النظام' },
                      { label: 'رقم المعرف', value: user?.id },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="font-black text-slate-400">{item.label}</span>
                        <span className="font-bold text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                  <h4 className="font-black text-slate-700">نصائح الأمان</h4>
                  {[
                    'استخدم كلمة مرور قوية لا تقل عن 8 أحرف',
                    'لا تشارك بيانات تسجيل الدخول مع أحد',
                    'سجّل الخروج دائماً بعد انتهاء عملك',
                    'قم بتصدير نسخة احتياطية دورياً',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-primary font-black">✓</span>
                      <span className="font-bold text-slate-500">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
