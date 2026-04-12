"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllUsers, User } from "../../../../lib/auth";
import { getAppointments, getBills, payBill, Appointment, Bill } from "../../../../lib/data";

export default function EmployeePatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'finances'>('appointments');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", age: "", gender: "male" });

  useEffect(() => {
    const allUsers = getAllUsers();
    const foundPatient = allUsers[patientId] || Object.values(allUsers).find((u: any) => u.id === patientId);
    
    if (foundPatient) {
      setPatient({ id: patientId, ...foundPatient } as User);
      setEditForm({ 
        name: foundPatient.name || "", 
        phone: foundPatient.phone || "", 
        age: foundPatient.age || "", 
        gender: foundPatient.gender || "male" as any
      });
      setAppointments(getAppointments().filter(a => a.patientId === patientId || a.patientName === foundPatient?.name));
      setBills(getBills().filter(b => b.patientId === patientId || b.patientName === foundPatient?.name));
    }
  }, [patientId]);

  const handleUpdatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const { updateUser } = require("../../../../lib/auth");
    updateUser(patientId, editForm);
    setPatient(prev => prev ? { ...prev, ...editForm } : null);
    setIsEditModalOpen(false);
    alert("تم تحديث بيانات المريض بنجاح");
  };

  const stats = useMemo(() => {
    const totalDebt = bills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + b.total, 0);
    const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
    return {
      appointmentsCount: appointments.length,
      totalDebt,
      totalPaid,
    };
  }, [appointments, bills]);

  const handlePay = (billId: string) => {
    payBill(billId);
    setBills(getBills().filter(b => b.patientId === patientId || b.patientName === patient?.name));
  };

  if (!patient) return <div className="p-10 text-center font-black text-slate-400">تحميل بيانات المريض...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">تعديل بيانات المريض</h3>
            <form onSubmit={handleUpdatePatient} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">اسم المريض</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">العمر</label>
                  <input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الجنس</label>
                  <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none">
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">حفظ التغييرات</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 font-bold hover:text-primary transition-colors"
        >
          <span>🔙</span> الرجوع للقائمة
        </button>
        <div className="flex gap-2">
            <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black italic">ملف مريض - قسم الاستقبال</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary font-black text-5xl border-4 border-white shadow-xl shadow-slate-100">
            {patient.name.charAt(0)}
          </div>
          <div className="text-center md:text-right flex-1">
            <h1 className="text-4xl font-black text-slate-800 mb-2">{patient.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bold">
              <span className="flex items-center gap-1">📱 {patient.phone || '—'}</span>
              <span className="flex items-center gap-1">👤 {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
             <button className="bg-emerald-500 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all text-sm">
                حجز موعد جديد
            </button>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="bg-slate-100 text-slate-500 font-black px-6 py-3 rounded-xl hover:bg-slate-200 transition-all text-sm"
            >
                تحديث البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-xl bg-emerald-50 flex items-center justify-between`}>
          <div>
            <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">المدفوعات الكلية</div>
            <div className={`text-4xl font-black text-emerald-600`}>{stats.totalPaid} <span className="text-lg font-bold">ر.س</span></div>
          </div>
          <div className="text-4xl opacity-40">💰</div>
        </div>
        <div className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-xl bg-rose-50 flex items-center justify-between`}>
          <div>
            <div className="text-[10px] font-black text-rose-400 uppercase mb-1">الديون المستحقة</div>
            <div className={`text-4xl font-black text-rose-600`}>{stats.totalDebt} <span className="text-lg font-bold">ر.س</span></div>
          </div>
          <div className="text-4xl opacity-40">💳</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 px-2 font-black text-sm transition-all border-b-2 ${activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            المواعيد ({appointments.length})
          </button>
          <button 
            onClick={() => setActiveTab('finances')}
            className={`pb-4 px-2 font-black text-sm transition-all border-b-2 ${activeTab === 'finances' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
          >
            الفواتير ({bills.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.length > 0 ? appointments.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${app.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    📅
                  </div>
                  <div>
                    <div className="font-black text-slate-700">{app.type}</div>
                    <div className="text-xs font-bold text-slate-500">{app.date} | {app.time}</div>
                  </div>
                </div>
                <div className="text-xs font-black text-slate-400 italic">مع {app.doctor}</div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-slate-400 font-bold">لا توجد مواعيد</div>
            )}
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                  <th className="p-6">الخدمة</th>
                  <th className="p-6">التاريخ</th>
                  <th className="p-6">المبلغ</th>
                  <th className="p-6">الحالة</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6 font-black text-slate-700">{bill.serviceName}</td>
                    <td className="p-6 font-bold text-slate-500">{bill.date}</td>
                    <td className="p-6 font-black text-slate-800">{bill.total} ر.س</td>
                    <td className="p-6">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${bill.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {bill.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                        </span>
                    </td>
                    <td className="p-6 text-left">
                        {bill.status === 'unpaid' && (
                            <button 
                                onClick={() => handlePay(bill.id)}
                                className="bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                            >
                                تحصيل
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bills.length === 0 && <div className="p-10 text-center text-slate-400 font-bold">لا توجد فواتير</div>}
          </div>
        )}
      </div>
    </div>
  );
}
