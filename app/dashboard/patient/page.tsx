"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, getBills, Appointment, Bill, getMedicalRecords, MedicalRecord } from "../../lib/data";
import { getNotifications, Notification as NotificationType } from "../../lib/notifications";
import { getSession, getAllUsers, User } from "../../lib/auth";

export default function PatientDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingType, setBookingType] = useState("تقويم أسنان");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);

  useEffect(() => {
    const allUsers = getAllUsers();
    const drs = Object.entries(allUsers)
      .filter(([id, u]: [string, any]) => u.role === 'doctor')
      .map(([id, u]: [string, any]) => ({ id, ...u }));
    
    setDoctors(drs);
    if (drs.length > 0) setSelectedDoctor(drs[0].name);
    
    setAppointments(getAppointments());
    setBills(getBills());
    setRecords(getMedicalRecords());
    setNotifications(getNotifications());
    setUser(getSession());
  }, []);

  const openNewApp = () => {
    if (showBooking && !editingApp) {
      setShowBooking(false);
      return;
    }
    setEditingApp(null);
    setBookingType("تقويم أسنان");
    setBookingDate("");
    setBookingTime("");
    setShowBooking(true);
  };

  const openEdit = (app: Appointment) => {
    setEditingApp(app);
    setBookingType(app.type);
    setBookingDate(app.date);
    setBookingTime(app.time);
    setSelectedDoctor(app.doctor);
    setShowBooking(true);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingApp) {
      updateAppointment(editingApp.id, {
        ...editingApp,
        doctor: selectedDoctor,
        date: bookingDate,
        time: bookingTime,
        status: "pending",
        type: bookingType
      });
      setEditingApp(null);
    } else {
      addAppointment({
        patientId: user.id,
        patientName: user.name,
        doctor: selectedDoctor || "د. سارة محمود",
        date: bookingDate,
        time: bookingTime || "10:00 ص",
        status: "pending",
        type: bookingType
      });
    }

    setAppointments(getAppointments());
    setShowBooking(false);
  };

  const handleCancel = (id: string, currentStatus: string) => {
    if (currentStatus === 'completed') return;
    if (confirm("هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟")) {
      deleteAppointment(id);
      setAppointments(getAppointments());
    }
  };

  const myApps = appointments.filter(a => a.patientId === user?.id);
  const myBills = bills.filter(b => b.patientId === user?.id);
  const myRecords = records.filter(r => r.patientId === user?.id);
  const myNotifications = notifications.filter(n => user && n.message.includes(user.name));
  const totalPaid = myBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const totalUnpaid = myBills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + (Number(b.total) || 0), 0);

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Patient Greeting & Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-gradient-to-br from-primary to-secondary p-12 rounded-[4rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4">أهلاً بك في جُمان، {user?.name} ✨</h3>
            <p className="text-white/80 max-w-lg leading-relaxed font-medium">
              ابتسامتك في أيدٍ أمينة. يمكنك مراجعة مواعيدك القادمة بكل سهولة أو حجز موعد جديد في أقل من دقيقة.
            </p>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={openNewApp}
                className="bg-white text-primary px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform"
              >
                {showBooking && !editingApp ? "إغلاق الحجز" : "حجز موعد جديد"}
              </button>
              <button 
                onClick={() => router.push("/dashboard/patient/medical-file")}
                className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all font-bold"
              >
                ملفي الطبي
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 translate-x-1/2 -z-0"></div>
        </div>

        {/* Booking Form */}
        {showBooking && (
          <form onSubmit={handleBooking} className="bg-white p-10 rounded-[3rem] border-2 border-primary/20 shadow-xl animate-in zoom-in duration-300 space-y-6">
            <h4 className="text-xl font-bold text-slate-800">{editingApp ? 'إعادة جدولة الموعد' : 'تفاصيل الحجز الجديد'}</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">نوع الخدمة</label>
                <select 
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold"
                >
                  <option>تقويم أسنان</option>
                  <option>تنظيف وتلميع</option>
                  <option>تبييض ليزر</option>
                  <option>خلع سن</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">التاريخ المفضل</label>
                <input 
                  type="date" 
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">الوقت المفضل</label>
                <select 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold"
                >
                  <option value="">اختر الوقت...</option>
                  <option value="10:00 صباحاً">10:00 صباحاً</option>
                  <option value="11:30 صباحاً">11:30 صباحاً</option>
                  <option value="01:00 مساءً">01:00 مساءً</option>
                  <option value="04:00 مساءً">04:00 مساءً</option>
                  <option value="06:30 مساءً">06:30 مساءً</option>
                  <option value="08:00 مساءً">08:00 مساءً</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-500">اختيار الطبيب</label>
                <select 
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none font-bold"
                >
                  {doctors.map(dr => (
                    <option key={dr.id} value={dr.name}>
                      {dr.name} - {dr.specialty || 'عام'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
              {editingApp ? 'حفظ تعديلات الحجز' : 'تأكيد الحجز الفوري'}
            </button>
          </form>
        )}

        {/* Appointments Table */}
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold text-slate-800">تاريخ المواعيد</h3>
            <button className="text-slate-400 font-bold text-sm hover:text-primary transition-colors">عرض الكل</button>
          </div>
          
          <div className="space-y-4">
            {myApps.length > 0 ? myApps.map((app, i) => (
              <div key={app.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-50 hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-primary">
                    {app.doctor.charAt(3)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800">{app.doctor}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{app.type}</div>
                  </div>
                </div>
                
                <div className="text-center hidden md:block">
                  <div className="text-sm font-bold text-slate-700">{app.date}</div>
                  <div className="text-[10px] text-slate-400 font-black mt-1 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {app.time}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 shrink-0">
                  <div className={`text-center px-4 py-1.5 rounded-xl font-bold text-xs ${
                    app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    app.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    {app.status === 'confirmed' ? 'مؤكد' : app.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                  </div>
                  {(app.status === 'pending' || app.status === 'confirmed') && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(app)} className="flex-1 px-2 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-primary/10 hover:text-primary transition-colors">
                        تعديل
                      </button>
                      <button onClick={() => handleCancel(app.id, app.status)} className="flex-1 px-2 py-1.5 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition-colors">
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 font-bold">لا يوجد مواعيد مسجلة بعد.</div>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold text-slate-800">الملخص المالي والفواتير</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
              <span className="text-emerald-500 text-3xl mb-2">✅</span>
              <span className="text-sm font-bold text-slate-500 mb-1">إجمالي المدفوع</span>
              <span className="text-2xl font-black text-emerald-600">{totalPaid} ر.س</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
              <span className="text-rose-500 text-3xl mb-2">⏳</span>
              <span className="text-sm font-bold text-slate-500 mb-1">المتبقي (غير مدفوع)</span>
              <span className="text-2xl font-black text-rose-600">{totalUnpaid} ر.س</span>
            </div>
          </div>

          <div className="space-y-4">
            {myBills.length > 0 ? myBills.map((bill, i) => (
              <div key={bill.id} className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border transition-all ${bill.status === 'paid' ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50'}`}>
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl shrink-0">
                    🧾
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800">{bill.serviceName}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{bill.date} • {bill.doctorName}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                  <div className="text-xl font-black text-slate-700">{Number(bill.total) || Number(bill.amount) || 0} ر.س</div>
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    bill.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-200 text-rose-700'
                  }`}>
                    {bill.status === 'paid' ? 'مدفوع' : 'غير مدفوع مستحق'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 font-bold italic">لا توجد أي فواتير مسجلة في حسابك.</div>
            )}
          </div>
        </div>

        {/* Medical Records */}
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold text-slate-800">السجل الطبي</h3>
          </div>
          <div className="space-y-4">
            {myRecords.length > 0 ? myRecords.map((rec) => (
              <div key={rec.id} className="p-6 rounded-[2rem] border border-blue-100 bg-blue-50/30 transition-all hover:bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">🦷</div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">التشخيص: {rec.diagnosis}</div>
                    <div className="text-[10px] text-slate-500 font-bold tracking-widest">{rec.date} • {rec.doctorName}</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-black text-slate-400 block mb-1">الخطة العلاجية:</span>
                  <p className="text-sm font-bold text-slate-700">{rec.treatment}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 font-bold italic">لا يوجد سجلات طبية سابقة.</div>
            )}
          </div>
        </div>
      </div>


      {/* Sidebar Tools and Notifications */}
      <div className="space-y-8">
        <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
          <h4 className="text-amber-800 font-black mb-6 text-lg relative z-10">🔔 إشعارات وتنبيهات</h4>
          <div className="space-y-3 relative z-10">
            {/* Find confirmed app for dynamic reminder */}
            {myApps.find(a => a.status === 'confirmed') && (
              <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-start gap-3">
                <span className="text-amber-500 mt-0.5">📅</span>
                <div>
                  <div className="text-xs font-black text-slate-800">تذكير بموعدك القادم</div>
                  <div className="text-[10px] font-bold text-slate-500 leading-relaxed mt-1">
                    لديك موعد مؤكد مع {myApps.find(a => a.status === 'confirmed')?.doctor} بتاريخ {myApps.find(a => a.status === 'confirmed')?.date}. يرجى الحضور قبل الموعد بـ 15 دقيقة.
                  </div>
                </div>
              </div>
            )}
            
            {myNotifications.length > 0 ? myNotifications.slice(0, 3).map(n => (
              <div key={n.id} className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-start gap-3 opacity-80">
                <span className="text-amber-500 mt-0.5">✨</span>
                <div>
                  <div className="text-xs font-black text-slate-800">{n.title}</div>
                  <div className="text-[10px] font-bold text-slate-500 leading-relaxed mt-1">{n.message}</div>
                </div>
              </div>
            )) : (
              !myApps.find(a => a.status === 'confirmed') && (
                <div className="p-4 bg-white/50 rounded-2xl text-amber-600/60 font-bold text-xs italic text-center">لا توجد إشعارات حالياً.</div>
              )
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <h3 className="text-xl font-extrabold text-slate-800 mb-8">ملفاتك المرفقة</h3>
          <div className="space-y-4">
            {[
              { name: 'نتائج الأشعة الرقمية', date: '10 مارس', icon: '🦴' },
              { name: 'الخطة العلاجية المقترحة', date: '05 مارس', icon: '📝' },
              { name: 'فاتورة آخر زيارة', date: '02 مارس', icon: '🧾' },
            ].map((file, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {file.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-700">{file.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{file.date}</div>
                </div>
                <button className="text-slate-400 hover:text-primary transition-colors">⬇️</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10">
          <h4 className="text-primary font-black mb-4">🦷 توصية طبية</h4>
          <p className="text-primary/70 text-sm font-medium leading-relaxed italic">
            "يجب عليك الالتزام بتنظيف الأسنان مرتين يومياً واستخدام الخيط الطبي للحفاظ على نتائج التقويم."
            <br />
            - د. سارة محمود
          </p>
        </div>
      </div>
    </div>
  );
}
