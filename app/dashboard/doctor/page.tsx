"use client";

import { useEffect, useState } from "react";
import { getAppointments, updateAppointmentStatus, getBills, addBill, getMedicalFiles, addMedicalFile, Appointment, Bill } from "../../lib/data";
import { getSession, updateUserProfile, getAllUsers, getUsersByRole, User } from "../../lib/auth";
import { addNotification } from "../../lib/notifications";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", specialty: "", phone: "", bio: "" });

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // File Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('xray');
  const [uploadVariant, setUploadVariant] = useState<'before' | 'after'>('before');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadPatient, setUploadPatient] = useState('');
  const [savedFiles, setSavedFiles] = useState<any[]>([]);

  const [patients, setPatients] = useState<any[]>([]);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ patientId: '', patientName: '', amount: 0, reason: '', notify: true });

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      setAppointments(getAppointments());
      setBills(getBills());
      setUser(session);
      if (session) {
        setEditData({
          name: session.name || "",
          specialty: session.specialty || "",
          phone: session.phone || "",
          bio: session.bio || ""
        });
      }

      const allPatients = await getUsersByRole('patient');
      setPatients(allPatients);
      setSavedFiles(getMedicalFiles());
    };
    init();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await updateUserProfile(user.id, editData);
      const updated = await getSession();
      setUser(updated);
      setIsEditing(false);
    }
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !debtForm.patientId) return;

    addBill({
      patientId: debtForm.patientId,
      patientName: debtForm.patientName,
      doctorName: user.name,
      serviceName: debtForm.reason || 'مديونية متأخرة',
      amount: debtForm.amount,
      discount: 0,
      total: debtForm.amount,
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0],
      notes: 'إضافة دين من قبل الطبيب'
    });

    if (debtForm.notify) {
      addNotification({
        type: 'system',
        title: '⚠️ مطالبة مالية',
        message: `المريض الكريم ${debtForm.patientName}، تم تسجيل دين بقيمة ${debtForm.amount} ر.ي مقابل (${debtForm.reason}). نرجو سدادها. - د. ${user.name}`
      });
    }

    setBills(getBills());
    setIsDebtModalOpen(false);
    setDebtForm({ patientId: '', patientName: '', amount: 0, reason: '', notify: true });
    alert("تم إضافة الدين وإرسال المطالبة للمريض بنجاح!");
  };

  const handleStatusChange = (id: string, status: any) => {
    updateAppointmentStatus(id, status);
    setAppointments(getAppointments());
    setBills(getBills());
  };

  // 1. Filter by Doctor Own Appointments Only
  const myAppointments = appointments.filter(a => a.doctor === user?.name);

  // 2. Filter by Date
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.slice(0, 7);

  const filteredAppointments = myAppointments.filter(app => {
    // Date filter
    let dateMatch = true;
    if (dateFilter === 'today') {
      dateMatch = app.date === todayStr;
    } else if (dateFilter === 'week') {
      const appDate = new Date(app.date).getTime();
      const now = new Date().getTime();
      const diffDays = (appDate - now) / (1000 * 3600 * 24);
      dateMatch = diffDays >= -7 && diffDays <= 7;
    } else if (dateFilter === 'month') {
      dateMatch = app.date.startsWith(thisMonthStr);
    }

    // Status filter
    let statusMatch = true;
    if (statusFilter !== 'all') {
      statusMatch = app.status === statusFilter;
    }

    return dateMatch && statusMatch;
  });

  const myBills = bills.filter(b => b.doctorName === user?.name);
  const myPaidBills = myBills.filter(b => b.status === 'paid');

  const STATUS_AR = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    arrived: 'بانتظار الدخول',
    consulting: 'جارٍ الكشف',
    completed: 'تمت المعالجة ✅',
    cancelled: 'ملغي ❌',
    'no-show': 'غائب'
  };

  const STATUS_COLORS = {
    pending: 'bg-slate-100 text-slate-500',
    confirmed: 'bg-blue-100 text-blue-600',
    arrived: 'bg-indigo-100 text-indigo-600',
    consulting: 'bg-emerald-100 text-emerald-600',
    completed: 'bg-emerald-500 text-white',
    cancelled: 'bg-rose-100 text-rose-600',
    'no-show': 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">

      <div className="lg:col-span-2 space-y-8">

        {/* Profile Card */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-4xl font-black">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">{user?.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">
                    {user?.specialty || "لم يتم تحديد التخصص"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {isEditing ? "إلغاء التعديل" : "تعديل الملف الشخصي"}
            </button>
          </div>

          {isEditing && (
            <form onSubmit={handleUpdateProfile} className="mt-8 grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300 bg-slate-50 p-6 rounded-[2rem]">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">الاسم الكامل</label>
                <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="w-full p-4 bg-white rounded-2xl border-none outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">التخصص الطبي</label>
                <input type="text" value={editData.specialty} onChange={e => setEditData({ ...editData, specialty: e.target.value })} className="w-full p-4 bg-white rounded-2xl border-none outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">رقم الجوال</label>
                <input type="text" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full p-4 bg-white rounded-2xl border-none outline-none font-bold" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase">نبذة مهنية</label>
                <textarea value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} className="w-full p-4 bg-white rounded-2xl border-none outline-none font-bold min-h-[100px]" />
              </div>
              <button type="submit" className="md:col-span-2 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">حفظ التغييرات</button>
            </form>
          )}

          {!isEditing && user?.bio && (
            <p className="mt-6 text-slate-500 font-medium leading-relaxed italic border-r-4 border-primary/20 pr-4">"{user.bio}"</p>
          )}
        </div>

        {/* Appointment Management */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h3 className="text-2xl font-extrabold text-slate-800">إدارة المواعيد</h3>
            <button onClick={() => { setAppointments(getAppointments()); setBills(getBills()); }} className="text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-xl hover:bg-primary/10 transition">
              تحديث القائمة
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl">
            <div className="flex-1 flex bg-white p-1 rounded-xl shadow-sm">
              {[
                { id: 'today', label: 'اليوم' },
                { id: 'week', label: 'هذا الأسبوع' },
                { id: 'month', label: 'هذا الشهر' },
              ].map(f => (
                <button key={f.id} onClick={() => setDateFilter(f.id as any)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${dateFilter === f.id ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white rounded-xl font-bold text-sm text-slate-600 shadow-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">تم التأكيد</option>
              <option value="arrived">متواجد بالعيادة</option>
              <option value="consulting">جارٍ الكشف</option>
              <option value="completed">تمت المعالجة</option>
              <option value="cancelled">ملغي</option>
              <option value="no-show">غائب (No Show)</option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? filteredAppointments.map((app) => (
              <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[2rem] border border-slate-50 hover:shadow-lg hover:shadow-slate-100 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary text-xl">
                    {app.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-lg">{app.patientName}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{app.type} • {app.date}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{app.time}</span>
                    <span className={`text-xs font-black px-3 py-1 rounded-lg ${STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] || 'bg-slate-100 text-slate-500'}`}>
                      {STATUS_AR[app.status as keyof typeof STATUS_AR] || app.status}
                    </span>
                  </div>

                  {/* Status Actions Dropdown replacement with buttons or select */}
                  <div className="flex items-center gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none hover:bg-slate-100 cursor-pointer"
                    >
                      <option disabled>تحديث الحالة...</option>
                      <option value="confirmed">✅ التأكيد</option>
                      <option value="arrived">🏥 وصل العيادة</option>
                      <option value="consulting">🩺 بدء الكشف</option>
                      <option value="completed">✨ إنهاء وعلاج</option>
                      <option value="no-show">🚷 لم يحضر (No Show)</option>
                      <option value="cancelled">❌ إلغاء</option>
                    </select>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 bg-slate-50 rounded-[2rem]">
                <div className="text-4xl mb-4">📭</div>
                <div className="text-slate-400 font-bold text-lg">لم نعثر على مواعيد مطابقة!</div>
                <p className="text-slate-300 text-sm mt-2">جرب اختيار أيام أخرى أو إزالة الفلاتر.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Stats & Tools */}
      <div className="space-y-8">
        <div className="bg-primary p-10 rounded-[3rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">كشوفاتك اليوم</h3>
            <div className="text-5xl font-black mb-6">
              {myAppointments.filter(a => a.date === todayStr && a.status === 'completed').length}
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm font-bold">
              <span>إجمالي المرضى المكتملين اليوم</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6">الاطلاع المالي ونتائجك</h3>
          <div className="space-y-4">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-emerald-600/70 mb-1">إجمالي الأرباح المستحقة</div>
                <div className="text-2xl font-black text-emerald-600">{(myPaidBills.reduce((acc, curr) => acc + curr.total, 0) * 0.4).toFixed(2)} ر.ي</div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">💰</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 mb-1">إجمالي الحالات المعالجة</div>
                <div className="text-xl font-black text-slate-700">{myAppointments.filter(a => a.status === 'completed').length} مريض</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 mb-1">نسبة العمولة</div>
                <div className="text-xl font-black text-primary">40%</div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsDebtModalOpen(true)}
                className="w-full bg-rose-50 text-rose-600 font-bold py-3 rounded-xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
              >
                💳 تسجيل مديونية على مريض
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Tools */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6">إدارة الملفات الطبية</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button onClick={() => { setUploadType('xray'); setIsUploadModalOpen(true); }} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary transition-all">
              <span className="text-2xl">📸</span>
              <span className="text-[10px] font-black uppercase text-center">أشعة (X-Ray)</span>
            </button>
            <button onClick={() => { setUploadType('photos'); setIsUploadModalOpen(true); }} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary transition-all">
              <span className="text-2xl">🖼️</span>
              <span className="text-[10px] font-black uppercase text-center">صور قبل/بعد</span>
            </button>
            <button onClick={() => { setUploadType('reports'); setIsUploadModalOpen(true); }} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary transition-all">
              <span className="text-2xl">📄</span>
              <span className="text-[10px] font-black uppercase text-center">تقارير طبية</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">صور قبل/بعد المريض</h3>
            <p className="text-sm text-slate-500">يمكنك الاطلاع على الصور التي حفظتها للمرضى والرجوع إليها في أي وقت.</p>
          </div>
          <span className="text-sm font-black text-slate-400">{savedFiles.filter((f: any) => f.type === 'photo' && f.doctorName === user?.name).length} ملف</span>
        </div>
        {savedFiles.filter((f: any) => f.type === 'photo' && f.doctorName === user?.name).length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {savedFiles.filter((f: any) => f.type === 'photo' && f.doctorName === user?.name).map((file: any) => (
              <div key={file.id} className="border border-slate-100 rounded-3xl overflow-hidden">
                <img src={file.url} alt={file.filename} className="w-full h-52 object-cover" />
                <div className="p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{file.photoVariant === 'before' ? 'قبل' : 'بعد'} • {file.patientName}</div>
                  <div className="font-black text-slate-800">{file.filename}</div>
                  <div className="text-xs text-slate-400 mt-2">{file.uploadedAt}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-16 text-slate-400 font-bold">لم تقم برفع صور قبل/بعد حتى الآن.</div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsUploadModalOpen(false); setUploadSuccess(false); setUploadFile(null); }} />
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                {uploadType === 'xray' ? '📸' : uploadType === 'photos' ? '🖼️' : '📄'}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                {uploadType === 'xray' ? 'رفع صور الأشعة (X-Ray)' : uploadType === 'photos' ? 'رفع صور قبل/بعد' : 'رفع تقارير وملفات'}
              </h3>
              <p className="text-slate-400 font-bold text-sm mt-2">قم بإرفاق الملفات لربطها بسجل المريض</p>
            </div>

            {uploadSuccess ? (
              <div className="bg-emerald-50 text-emerald-600 p-6 rounded-3xl text-center border-2 border-emerald-100">
                <div className="text-4xl mb-2">✅</div>
                <div className="font-extrabold">تم رفع الملف بنجاح!</div>
                <p className="text-sm font-bold opacity-70 mt-1">تمت إضافته إلى ملف المريض.</p>
                <button onClick={() => { setIsUploadModalOpen(false); setUploadSuccess(false); setUploadFile(null); }} className="mt-6 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all">إغلاق</button>
              </div>
            ) : (
              <form onSubmit={e => {
                e.preventDefault();
                if (!uploadFile || !uploadPatient) return;
                const selectedPatient = patients.find(p => p.id === uploadPatient);
                if (!selectedPatient) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const fileType = uploadType === 'reports' ? 'document' : uploadType;
                  addMedicalFile({
                    patientId: selectedPatient.id,
                    patientName: selectedPatient.name,
                    doctorName: user?.name || '',
                    type: fileType as 'xray' | 'document' | 'photo',
                    photoVariant: fileType === 'photo' ? uploadVariant : undefined,
                    filename: uploadFile.name,
                    url: ev.target?.result as string,
                    uploadedAt: new Date().toISOString().split('T')[0],
                    notes: uploadType === 'photos' ? `صورة ${uploadVariant}` : uploadType === 'xray' ? 'أشعة' : 'تقرير طبي'
                  });
                  setSavedFiles(getMedicalFiles());
                  setUploadSuccess(true);
                };
                reader.readAsDataURL(uploadFile);
              }} className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase">اختر المريض (لربط الملف)</label>
                  <select required value={uploadPatient} onChange={e => setUploadPatient(e.target.value)} className="w-full h-14 bg-slate-50 mt-2 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none">
                    <option value="">اختر من قائمة مرضاك</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                </div>

                {uploadType === 'photos' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase">المرحلة</label>
                    <select value={uploadVariant} onChange={e => setUploadVariant(e.target.value as 'before' | 'after')} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none">
                      <option value="before">قبل</option>
                      <option value="after">بعد</option>
                    </select>
                  </div>
                )}

                <div className="relative group cursor-pointer">
                  <input type="file" required onChange={e => setUploadFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${uploadFile ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 group-hover:border-primary/50 group-hover:bg-primary/5'}`}>
                    <div className="text-3xl mb-2">{uploadFile ? '✅' : '📥'}</div>
                    <div className={`font-black text-sm ${uploadFile ? 'text-primary' : 'text-slate-500'}`}>
                      {uploadFile ? uploadFile.name : 'انقر هنا لاختيار الملف'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">
                    تأكيد الرفع
                  </button>
                  <button type="button" onClick={() => { setIsUploadModalOpen(false); setUploadFile(null); setUploadPatient(''); setUploadVariant('before'); }} className="px-6 h-14 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Debt & Messaging Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDebtModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-rose-600 mb-2">تسجيل مطالبة مديونية</h3>
            <p className="text-slate-400 font-bold mb-8">تسجيل دين على مريض وإرسال تنبيه مالي له بشكل مباشر.</p>
            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المريض الداين</label>
                <select value={debtForm.patientId} onChange={e => {
                  const p = patients.find(x => x.id === e.target.value);
                  setDebtForm({ ...debtForm, patientId: e.target.value, patientName: p ? p.name : '' });
                }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 appearance-none" required>
                  <option value="">اختر المريض ...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">قيمة الدين (ر.ي)</label>
                <input type="number" required value={debtForm.amount || ''} onChange={e => setDebtForm({ ...debtForm, amount: Number(e.target.value) })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-black text-slate-700 focus:ring-2 focus:ring-rose-500 text-xl" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">السبب / الوصف</label>
                <input type="text" required value={debtForm.reason} onChange={e => setDebtForm({ ...debtForm, reason: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500" placeholder="مثال: رسوم فحص إضافية، متأخرات..." />
              </div>

              <label className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 cursor-pointer">
                <input type="checkbox" checked={debtForm.notify} onChange={e => setDebtForm({ ...debtForm, notify: e.target.checked })} className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500 border-rose-200" />
                <span className="font-bold text-rose-700 text-sm">إرسال تفاصيل المديونية والمطالبة كرسالة للمريض</span>
              </label>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-rose-500 text-white font-black h-16 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-rose-500/30">
                  إرسال وإضافة
                </button>
                <button type="button" onClick={() => setIsDebtModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
