"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointments, updateAppointmentStatus, getBills, payBill, updateBill, Appointment, Bill, addAppointment, updateAppointment, deleteAppointment, addBill } from "../../lib/data";
import { getAllUsers, adminAddUser, adminUpdateUser, deleteUser, User } from "../../lib/auth";
import { getServices } from "../../lib/services";

export default function EmployeeDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({ patientId: '', patientName: '', doctor: '', date: '', time: '', type: '' });

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<User | null>(null);
  const [patientForm, setPatientForm] = useState({ name: '', email: '', phone: '', age: '', gender: 'ذكر' });

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({ patientId: '', patientName: '', doctorName: '', serviceName: '', amount: 0, discount: 0, total: 0, status: 'unpaid' as 'unpaid' | 'paid', date: new Date().toISOString().split('T')[0] });

  const refresh = async () => {
    setAppointments(getAppointments());
    setBills(getBills());
    const allUsers = await getAllUsers();
    setPatients(allUsers.filter((u: any) => u.role === 'patient'));
    setDoctors(allUsers.filter((u: any) => u.role === 'doctor'));
    setServices(getServices());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCheckIn = (id: string) => {
    updateAppointmentStatus(id, 'arrived');
    refresh();
  };

  const handlePayment = (id: string, method: string) => {
    const bill = bills.find(b => b.id === id);
    if (bill) {
      updateBill(id, { ...bill, status: 'paid', notes: `طريقة الدفع: ${method} ${bill.notes ? '- ' + bill.notes : ''}` });
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من إلغاء الموعد؟")) {
      deleteAppointment(id);
      refresh();
    }
  };

  const openAdd = () => {
    setEditingApp(null);
    setFormData({ patientId: '', patientName: '', doctor: '', date: new Date().toISOString().split('T')[0], time: '', type: '' });
    setIsModalOpen(true);
  };

  const openEdit = (app: Appointment) => {
    setEditingApp(app);
    setFormData({ patientId: app.patientId, patientName: app.patientName, doctor: app.doctor, date: app.date, time: app.time, type: app.type });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      updateAppointment(editingApp.id, { ...formData, status: editingApp.status });
    } else {
      addAppointment({ ...formData, status: 'confirmed' });
    }
    setIsModalOpen(false);
    refresh();
  };

  const openAddPatient = () => {
    setEditingPatient(null);
    setPatientForm({ name: '', email: `patient${Date.now()}@juman.com`, phone: '', age: '', gender: 'ذكر' });
    setIsPatientModalOpen(true);
  };

  const openEditPatient = (p: User) => {
    setEditingPatient(p);
    setPatientForm({ name: p.name, email: p.email, phone: p.phone || '', age: p.age || '', gender: p.gender || 'ذكر' });
    setIsPatientModalOpen(true);
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      adminUpdateUser(editingPatient.id, { ...patientForm });
    } else {
      adminAddUser({ ...patientForm, role: 'patient' });
    }
    setIsPatientModalOpen(false);
    refresh();
  };

  const openAddBill = () => {
    setBillForm({ patientId: '', patientName: '', doctorName: '', serviceName: '', amount: 0, discount: 0, total: 0, status: 'unpaid', date: new Date().toISOString().split('T')[0] });
    setIsBillModalOpen(true);
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBill(billForm);
    setIsBillModalOpen(false);
    refresh();
  };

  const pendingApps = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const arrivedApps = appointments.filter(a => a.status === 'arrived');
  const consultingApps = appointments.filter(a => a.status === 'consulting');
  const unpaidBills = bills.filter(b => b.status === 'unpaid');

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Reception Stats */}
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h4 className="text-slate-400 font-bold text-sm mb-4">وصول المرضى</h4>
            <div className="text-3xl font-extrabold text-slate-800">
              {appointments.filter(a => a.status === 'arrived' || a.status === 'completed').length}/{appointments.length}
            </div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000" 
                style={{ width: `${(appointments.filter(a => a.status === 'arrived' || a.status === 'completed').length / appointments.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h4 className="text-slate-400 font-bold text-sm mb-4">فواتير مفتوحة</h4>
            <div className="text-3xl font-extrabold text-rose-500">{unpaidBills.length}</div>
            <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">تحتاج للمتابعة</p>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h4 className="text-slate-400 font-bold text-sm mb-4">إجمالي التحصيل</h4>
            <div className="text-3xl font-extrabold text-emerald-500">
              ${bills.filter(b => b.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0)}
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">اليوم</p>
          </div>
        </div>

        {/* Reception Hub */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold text-slate-800">إدارة المواعيد والتواصل</h3>
            <button onClick={refresh} className="text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-xl">تحديث</button>
          </div>
          
          <div className="space-y-4">
            {pendingApps.length > 0 ? pendingApps.map((app, i) => {
              const pPhone = patients.find(p => p.name === app.patientName)?.phone || 'لا يوجد رقم';
              return (
              <div key={app.id} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-50 hover:border-primary/20 hover:bg-slate-50/50 transition-all group overflow-x-auto">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-primary shrink-0">
                    {app.patientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800">{app.patientName}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{app.time} - {app.type}</div>
                  </div>
                </div>
                
                {/* Communication */}
                <div className="flex flex-col gap-1.5 shrink-0 px-6 border-r border-slate-100">
                  <a href={`tel:${pPhone}`} className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-primary/20">
                    📞 اتصال
                  </a>
                  <button onClick={() => alert(`تم إرسال تذكير بالموعد للمريض ${app.patientName} على الرقم ${pPhone}`)} className="px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-emerald-200">
                    🔔 تذكير
                  </button>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 shrink-0 pr-4">
                  <button onClick={() => openEdit(app)} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors">
                    تعديل
                  </button>
                  <button 
                    onClick={() => handleCheckIn(app.id)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                  >
                    تسجيل وصول
                  </button>
                  <button onClick={() => handleDelete(app.id)} className="px-3 py-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors font-bold text-xs flex items-center justify-center">
                    إلغاء ❌
                  </button>
                </div>
              </div>
            )}) : (
              <div className="text-center py-10 text-slate-400 font-bold italic">لا توجد مواعيد معلقة حالياً.</div>
            )}
          </div>
        </div>

        {/* Billing Hub */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold text-slate-800">الفواتير المستحقة</h3>
            <button onClick={openAddBill} className="text-emerald-600 font-bold text-sm bg-emerald-50 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-all">
              🧾 إصدار فاتورة يدوية
            </button>
          </div>
          <div className="space-y-4">
            {unpaidBills.length > 0 ? unpaidBills.map((bill) => (
              <div key={bill.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] border border-rose-100 bg-rose-50 transition-all hover:bg-rose-100/50 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl shrink-0">💰</div>
                  <div>
                    <div className="font-extrabold text-slate-800">{bill.patientName}</div>
                    <div className="text-xs text-rose-500 font-bold mb-1">المبلغ المطلوب: {bill.total} ر.س</div>
                    <div className="text-[10px] text-slate-500 font-bold">{bill.serviceName} • الطبيب: {bill.doctorName}</div>
                  </div>
                </div>
                {/* Payment Actions */}
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handlePayment(bill.id, 'كاش')}
                    className="flex-1 md:flex-none bg-white text-slate-600 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    💵 دفع كاش
                  </button>
                  <button 
                    onClick={() => handlePayment(bill.id, 'تحويل بنكي')}
                    className="flex-1 md:flex-none bg-white text-slate-600 px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    💳 تحويل بنكي
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 font-bold italic">لا توجد فواتير مفتوحة حالياً.</div>
            )}
          </div>
        </div>

        {/* Patient Directory Hub */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-extrabold text-slate-800">إدارة المرضى ({patients.length})</h3>
            <button onClick={openAddPatient} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center gap-2">
              ➕ مريض جديد
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {patients.map(p => (
              <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center font-bold text-primary shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-0.5">{p.phone || 'لا يوجد رقم'} • {p.gender || 'غير محدد'} • {p.age ? p.age + ' سنة' : 'العمر غير مسجل'}</div>
                  </div>
                </div>
                <button onClick={() => openEditPatient(p)} className="p-2 bg-white text-slate-400 hover:text-primary rounded-xl transition-colors shadow-sm shrink-0">
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Quick Tools & Queue */}
      <div className="space-y-8">
        {/* Waiting Queue Hub */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h3 className="text-xl font-extrabold text-slate-800 mb-8 relative z-10">شاشة الانتظار (العيادة)</h3>
          
          <div className="space-y-6 relative z-10">
            {/* Current */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> المريض الحالي بالداخل
              </h4>
              <div className="space-y-2">
                {consultingApps.length > 0 ? consultingApps.map(app => (
                  <div key={app.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">🩺</div>
                      <div>
                        <div className="font-extrabold text-slate-800 text-sm">{app.patientName}</div>
                        <div className="text-[10px] font-bold text-emerald-600">طبيب: {app.doctor}</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 font-bold text-xs italic border border-slate-100">العيادات متاحة الآن.</div>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-slate-100"></div>

            {/* Next */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">⏳ قائمة الانتظار بصالة الاستقبال</h4>
              <div className="space-y-3">
                {arrivedApps.length > 0 ? arrivedApps.map((app, index) => (
                  <div key={app.id} className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black text-sm">{index + 1}</div>
                      <div>
                        <div className="font-extrabold text-slate-800 text-sm">{app.patientName}</div>
                        <div className="text-[10px] font-bold text-slate-500">ينتظر: {app.doctor}</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 font-bold text-xs italic border border-slate-100">لا يوجد مرضى في صالة الانتظار.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <h3 className="text-xl font-extrabold text-slate-800 mb-8">عمليات سريعة</h3>
          <div className="space-y-4">
            <button onClick={openAdd} className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-white font-extrabold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all border-none">
              <span className="text-2xl">📅</span> حجز موعد جديد
            </button>
            <button onClick={openAddPatient} className="w-full py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 font-extrabold text-sm hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20 transition-all">
              تسجيل مريض جديد
            </button>
            {['إصدار فاتورة', 'تأكيد موعد هاتفي', 'طباعة تقرير يومي'].map((tool, i) => (
              <button key={i} className="w-full py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 font-extrabold text-sm hover:bg-primary hover:text-white hover:shadow-xl hover:shadow-primary/20 transition-all">
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 p-10 rounded-[3rem] border border-amber-100">
          <h4 className="text-amber-700 font-black mb-4">🔔 تنبيهات الاستقبال</h4>
          <p className="text-amber-600 text-sm font-medium leading-relaxed">
            يوجد 3 مواعيد لم يؤكدوا حضورهم بعد الساعة 12 ظهراً. يرجى الاتصال بهم للتأكيد.
          </p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{editingApp ? 'تعديل موعد' : 'حجز موعد جديد'}</h3>
            <p className="text-slate-400 font-bold mb-8">إدارة المواعيد في العيادة بسهولة</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المريض</label>
                <select value={formData.patientName} onChange={e => {
                    const pName = e.target.value;
                    const p = patients.find(x => x.name === pName);
                    setFormData({...formData, patientName: pName, patientId: p ? p.id : 'patient'});
                  }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الطبيب</label>
                <select value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                  <option value="">اختر الطبيب</option>
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الوقت</label>
                  <input type="text" placeholder="مثال: 10:30 صباحاً" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">نوع الخدمة / سبب الزيارة</label>
                <input type="text" placeholder="كشف، تنظيف، التقويم..." value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-white font-black h-16 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/30">
                  {editingApp ? 'حفظ التعديلات' : 'تأكيد الحجز'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Data Modal */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPatientModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{editingPatient ? 'تعديل بيانات مريض' : 'تسجيل مريض جديد'}</h3>
            <p className="text-slate-400 font-bold mb-8">أدخل تفاصيل وبيانات المريض الشخصية</p>
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الرباعي</label>
                <input type="text" value={patientForm.name} onChange={e => setPatientForm({...patientForm, name: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required placeholder="مثال: فهد عبدالرحمن العتيبي" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                <input type="text" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required placeholder="05XXXXXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">العمر</label>
                  <input type="number" value={patientForm.age} onChange={e => setPatientForm({...patientForm, age: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required placeholder="مثال: 32" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الجنس</label>
                  <select value={patientForm.gender} onChange={e => setPatientForm({...patientForm, gender: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none">
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-white font-black h-16 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/30">
                  {editingPatient ? 'تحديث البيانات' : 'حفظ واضافة'}
                </button>
                <button type="button" onClick={() => setIsPatientModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill creation Modal */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsBillModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-2">إصدار فاتورة جديدة</h3>
            <p className="text-slate-400 font-bold mb-8">إدخال تكاليف إضافية أو إنشاء فاتورة للحالات المباشرة.</p>
            <form onSubmit={handleBillSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المريض</label>
                <select value={billForm.patientId} onChange={e => {
                  const p = patients.find(x => x.id === e.target.value);
                  setBillForm({ ...billForm, patientId: e.target.value, patientName: p ? p.name : '' });
                }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الخدمة المُقدمة</label>
                <select value={billForm.serviceName} onChange={e => {
                  const s = services.find(x => x.name === e.target.value);
                  const price = s ? s.price : 0;
                  setBillForm({ ...billForm, serviceName: e.target.value, amount: price, total: price - billForm.discount });
                }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                  <option value="">اختر الخدمة (لجلب السعر التلقائي)</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} - {s.price} ر.س</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الطبيب</label>
                <select value={billForm.doctorName} onChange={e => setBillForm({ ...billForm, doctorName: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                  <option value="">اختر الطبيب (إن وجد)</option>
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">السعر الأساسي</label>
                  <input type="number" readOnly value={billForm.amount} className="w-full h-14 bg-slate-100 border-0 rounded-2xl px-6 font-black text-slate-700 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الخصم (إن وجد)</label>
                  <input type="number" value={billForm.discount} onChange={e => {
                    const discount = Number(e.target.value) || 0;
                    setBillForm({ ...billForm, discount, total: billForm.amount - discount });
                  }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className={`flex items-center justify-between p-5 rounded-2xl ${billForm.total >= 0 ? 'bg-primary/5 border border-primary/10' : 'bg-rose-50 border border-rose-100'}`}>
                <span className="font-black text-slate-600">القيمة الإجمالية</span>
                <span className={`text-2xl font-black ${billForm.total >= 0 ? 'text-primary' : 'text-rose-500'}`}>{billForm.total} ر.س</span>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-white font-black h-16 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/30">
                  إصدار وحفظ الفاتورة
                </button>
                <button type="button" onClick={() => setIsBillModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
