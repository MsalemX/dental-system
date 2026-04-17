"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import DentalChartComponent from "../../../../components/DentalChart";
import { getAllUsers, User } from "../../../../lib/auth";
import { getAppointments, getBills, payBill, getMedicalFiles, addMedicalFile, deleteMedicalFile, Appointment, Bill, MedicalFile } from "../../../../lib/data";

export default function PatientProfile() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'finances' | 'chart' | 'files'>('appointments');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", age: "", gender: "male" });

  useEffect(() => {
    const fetchPatient = async () => {
      const allUsers = await getAllUsers();
      const foundPatient = allUsers.find((u: User) => u.id === patientId);

      if (foundPatient) {
        setPatient(foundPatient);
        setEditForm({
          name: foundPatient.name || "",
          phone: foundPatient.phone || "",
          age: foundPatient.age || "",
          gender: (foundPatient.gender || "male") as any
        });
        setAppointments(getAppointments().filter(a => a.patientId === patientId || a.patientName === foundPatient.name));
        setBills(getBills().filter(b => b.patientId === patientId || b.patientName === foundPatient.name));
        setMedicalFiles(getMedicalFiles(patientId));
      }
    };
    fetchPatient();
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
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">العمر</label>
                  <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الجنس</label>
                  <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none">
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
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black">ملف المريض الإلكتروني</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-xl shadow-primary/30">
            {patient.name.charAt(0)}
          </div>
          <div className="text-center md:text-right flex-1">
            <h1 className="text-4xl font-black text-slate-800 mb-2">{patient.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bold">
              <span className="flex items-center gap-1">📱 {patient.phone || '—'}</span>
              <span className="flex items-center gap-1">📧 {patient.email || '—'}</span>
              <span className="flex items-center gap-1">🎂 {patient.age || '—'} سنة</span>
              <span className="flex items-center gap-1">👤 {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              تعديل البيانات
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي الحجوزات', value: stats.appointmentsCount, sub: 'موعد', icon: '📅', color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'إجمالي المدفوعات', value: stats.totalPaid, sub: 'ر.س', icon: '💰', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'الديون المتبقية', value: stats.totalDebt, sub: 'ر.س', icon: '💳', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s, i) => (
          <div key={i} className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-xl ${s.bg} flex items-center justify-between`}>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
              <div className={`text-4xl font-black ${s.color}`}>{s.value} <span className="text-lg">{s.sub}</span></div>
            </div>
            <div className="text-4xl opacity-40">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Tabs Layout */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-2xl mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'appointments' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            سجل المواعيد
          </button>
          <button
            onClick={() => setActiveTab('finances')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'finances' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            السجل المالي
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'chart' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            خريطة الأسنان
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'files' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            الملفات الطبية
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-xl font-black text-slate-800">قائمة الحجوزات</h3>
            </div>
            {appointments.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {appointments.map((app) => (
                  <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                        {app.status === 'completed' ? '✅' : '⏳'}
                      </div>
                      <div>
                        <div className="font-black text-slate-700">{app.type}</div>
                        <div className="text-xs font-bold text-slate-400">مع {app.doctor}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-700">{app.date}</div>
                      <div className="text-xs font-bold text-slate-400">{app.time}</div>
                    </div>
                    <div className="w-24 text-center">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${app.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          app.status === 'cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                        {app.status === 'completed' ? 'تم' : app.status === 'cancelled' ? 'ملغي' : 'مؤكد'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400 font-bold">لا توجد مواعيد مسجلة</div>
            )}
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-xl font-black text-slate-800">الفواتير والمدفوعات</h3>
            </div>
            {bills.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {bills.map((bill) => (
                  <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        🧾
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-slate-700 truncate">{bill.serviceName}</div>
                        <div className="text-xs font-bold text-slate-400">{bill.date}</div>
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <div className="text-lg font-black text-slate-800">{bill.total} <span className="text-xs font-bold text-slate-400">ر.س</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${bill.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                        {bill.status === 'paid' ? 'مدفوعة ✅' : 'غير مدفوعة ⏳'}
                      </span>
                      {bill.status === 'unpaid' && (
                        <button
                          onClick={() => handlePay(bill.id)}
                          className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl text-xs hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          تسديد الفاتورة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400 font-bold">لا توجد فواتير مسجلة</div>
            )}
          </div>
        )}

        {activeTab === 'chart' && (
          <DentalChartComponent patientId={patientId} patientName={patient?.name || ''} />
        )}

        {activeTab === 'files' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">الملفات الطبية</h3>
              <button
                onClick={() => setIsFileModalOpen(true)}
                className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                رفع ملف جديد
              </button>
            </div>
            {medicalFiles.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {medicalFiles.map((file) => (
                  <div key={file.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                        {file.type === 'xray' ? '🦷' : file.type === 'document' ? '📄' : '📷'}
                      </div>
                      <div>
                        <div className="font-black text-slate-700">{file.filename}</div>
                        <div className="text-xs font-bold text-slate-400">
                          {file.type === 'xray' ? 'أشعة' : file.type === 'document' ? 'وثيقة' : 'صورة'} • {file.uploadedAt}
                        </div>
                        {file.notes && <div className="text-xs text-slate-500 mt-1">{file.notes}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl text-sm hover:bg-slate-200 transition-colors">
                        عرض
                      </button>
                      <button
                        onClick={() => {
                          deleteMedicalFile(file.id);
                          setMedicalFiles(getMedicalFiles(patientId));
                        }}
                        className="bg-rose-100 text-rose-600 font-black px-4 py-2 rounded-xl text-sm hover:bg-rose-200 transition-colors"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400 font-bold">لا توجد ملفات طبية</div>
            )}
          </div>
        )}
      </div>

      {/* File Upload Modal */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFileModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">رفع ملف طبي جديد</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle file upload here
              alert('تم رفع الملف بنجاح (محاكاة)');
              setIsFileModalOpen(false);
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">نوع الملف</label>
                <select className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required>
                  <option value="xray">أشعة (X-ray)</option>
                  <option value="document">وثيقة طبية</option>
                  <option value="photo">صورة</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اختيار الملف</label>
                <input type="file" accept="image/*,.pdf,.doc,.docx" className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ملاحظات</label>
                <textarea className="w-full h-24 bg-slate-50 border-0 rounded-2xl p-6 font-bold text-slate-700 resize-none" placeholder="أضف وصفاً للملف..." />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">رفع الملف</button>
                <button type="button" onClick={() => setIsFileModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
