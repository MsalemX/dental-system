"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllUsers, User } from "../../../lib/auth";
import { getAppointments, getBills, Appointment, Bill } from "../../../lib/data";
import { useRouter } from "next/navigation";

export default function AdminPatients() {
  const [patients, setPatients] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await getAllUsers();
      const patientUsers = allUsers.filter((u: User) => u.role === 'patient');
      
      setPatients(patientUsers);
      setAppointments(getAppointments());
      setBills(getBills());
    };
    fetchData();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  const getPatientStats = (patientId: string) => {
    const pApps = appointments.filter(a => a.patientId === patientId || a.patientName === patients.find(p => p.id === patientId)?.name);
    const pBills = bills.filter(b => b.patientId === patientId || b.patientName === patients.find(p => p.id === patientId)?.name);
    
    const totalDebt = pBills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + b.total, 0);
    const totalPaid = pBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
    const lastVisit = pApps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || '—';

    return {
      appointmentsCount: pApps.length,
      totalDebt,
      totalPaid,
      lastVisit
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">قاعدة بيانات المرضى</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">إدارة ملفات المرضى، المواعيد، والمدفوعات</p>
        </div>
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الجوال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl px-12 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-sm transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المرضى', value: patients.length, icon: '👥', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'زيارات اليوم', value: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: '📅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'مبالغ تحت التحصيل', value: bills.filter(b => b.status === 'unpaid').reduce((s, b) => s + b.total, 0), icon: '⏳', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'نشطين هذا الشهر', value: new Set(appointments.filter(a => a.date.startsWith(new Date().toISOString().slice(0, 7))).map(a => a.patientId)).size, icon: '✨', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-xl shrink-0`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs font-bold text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? filteredPatients.map((p) => {
          const stats = getPatientStats(p.id);
          return (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/admin/patients/${p.id}`)}
              className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{p.phone || 'بدون رقم جوال'}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                    ⬅️
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">المواعيد</span>
                    <span className="font-black text-slate-700">{stats.appointmentsCount} زيارة</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">آخر زيارة</span>
                    <span className="font-black text-slate-700">{stats.lastVisit}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-black text-emerald-400 block mb-1">المدفوعات</span>
                    <span className="font-black text-emerald-600">{stats.totalPaid} ر.س</span>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-black text-rose-400 block mb-1">الديون</span>
                    <span className="font-black text-rose-600">{stats.totalDebt} ر.س</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-slate-400 font-black">لم يتم العثور على مرضى بهذا الاسم</p>
          </div>
        )}
      </div>
    </div>
  );
}
