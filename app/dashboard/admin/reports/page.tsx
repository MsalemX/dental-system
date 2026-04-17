"use client";

import { useEffect, useState, useMemo } from "react";
import { getBills, getAppointments, Bill, Appointment } from "../../../lib/data";
import { getExpenses, Expense } from "../../../lib/finance";
import { getAllUsers } from "../../../lib/auth";

type Period = 'daily' | 'monthly' | 'annual';
type ReportTab = 'financial' | 'patients' | 'doctors' | 'appointments';

const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function getDateKey(date: string, period: Period): string {
  if (period === 'daily') return date;
  if (period === 'monthly') return date.slice(0, 7);
  return date.slice(0, 4);
}

function formatPeriodLabel(key: string, period: Period): string {
  if (period === 'daily') return key;
  if (period === 'monthly') {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[parseInt(m)-1]} ${y}`;
  }
  return `سنة ${key}`;
}

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('financial');
  const [period, setPeriod] = useState<Period>('monthly');
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setBills(getBills());
      setExpenses(getExpenses());
      setAppointments(getAppointments());
      const users = await getAllUsers();
      setAllUsers(users);
    };
    fetchData();
  }, []);

  // ── Financial Report ─────────────────────────────────────
  const financialRows = useMemo(() => {
    const map: Record<string, { income: number; expenses: number }> = {};
    bills.filter(b => b.status === 'paid').forEach(b => {
      const k = getDateKey(b.date, period);
      if (!map[k]) map[k] = { income: 0, expenses: 0 };
      map[k].income += b.total;
    });
    expenses.forEach(e => {
      const k = getDateKey(e.date, period);
      if (!map[k]) map[k] = { income: 0, expenses: 0 };
      map[k].expenses += e.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, v]) => ({ key, label: formatPeriodLabel(key, period), ...v, net: v.income - v.expenses }));
  }, [bills, expenses, period]);

  const finTotals = useMemo(() => ({
    income: financialRows.reduce((s, r) => s + r.income, 0),
    expenses: financialRows.reduce((s, r) => s + r.expenses, 0),
    net: financialRows.reduce((s, r) => s + r.net, 0),
  }), [financialRows]);

  // ── Patient Report ────────────────────────────────────────
  const patients = useMemo(() => allUsers.filter(u => u.role === 'patient'), [allUsers]);
  const patientRows = useMemo(() => {
    const map: Record<string, { total: number; newPatients: Set<string> }> = {};
    appointments.forEach(a => {
      const k = getDateKey(a.date, period);
      if (!map[k]) map[k] = { total: 0, newPatients: new Set() };
      map[k].total++;
      map[k].newPatients.add(a.patientId);
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, v]) => ({ key, label: formatPeriodLabel(key, period), visits: v.total, uniquePatients: v.newPatients.size }));
  }, [appointments, period]);

  // ── Doctor Report ─────────────────────────────────────────
  const doctors = useMemo(() => allUsers.filter(u => u.role === 'doctor'), [allUsers]);
  const doctorRows = useMemo(() => {
    return doctors.map(doc => {
      const docApps = appointments.filter(a => a.doctor === doc.name);
      const docBills = bills.filter(b => b.doctorName === doc.name && b.status === 'paid');
      return {
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty || 'طبيب عام',
        cases: docApps.length,
        completed: docApps.filter(a => a.status === 'completed').length,
        cancelled: docApps.filter(a => a.status === 'cancelled').length,
        revenue: docBills.reduce((s, b) => s + b.total, 0),
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [doctors, appointments, bills]);

  // ── Appointment Report ────────────────────────────────────
  const apptRows = useMemo(() => {
    const map: Record<string, { total: number; completed: number; cancelled: number; pending: number; confirmed: number }> = {};
    appointments.forEach(a => {
      const k = getDateKey(a.date, period);
      if (!map[k]) map[k] = { total: 0, completed: 0, cancelled: 0, pending: 0, confirmed: 0 };
      map[k].total++;
      if (a.status === 'completed') map[k].completed++;
      if (a.status === 'cancelled') map[k].cancelled++;
      if (a.status === 'pending') map[k].pending++;
      if (a.status === 'confirmed') map[k].confirmed++;
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, v]) => ({ key, label: formatPeriodLabel(key, period), ...v }));
  }, [appointments, period]);

  const apptTotals = useMemo(() => ({
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    completionRate: appointments.length ? Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100) : 0,
  }), [appointments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">التقارير</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">تحليلات شاملة لأداء العيادة عبر الزمن</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm gap-1">
            {([['daily','يومي'],['monthly','شهري'],['annual','سنوي']] as const).map(([k,l]) => (
              <button key={k} onClick={() => setPeriod(k)}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${period === k ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                {l}
              </button>
            ))}
          </div>
          {/* Tab Selector */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm gap-1">
            {([['financial','💰 مالية'],['patients','👥 مرضى'],['doctors','👨‍⚕️ أطباء'],['appointments','📅 مواعيد']] as const).map(([k,l]) => (
              <button key={k} onClick={() => setActiveTab(k)}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${activeTab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Financial Report Tab ─── */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Totals */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-xl">
              <div className="text-2xl font-black text-emerald-600">{finTotals.income.toLocaleString()} ر.ي</div>
              <div className="text-xs font-black text-slate-400 mt-1">إجمالي الإيرادات</div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-rose-100 shadow-xl">
              <div className="text-2xl font-black text-rose-600">{finTotals.expenses.toLocaleString()} ر.ي</div>
              <div className="text-xs font-black text-slate-400 mt-1">إجمالي المصروفات</div>
            </div>
            <div className={`p-8 rounded-[3rem] shadow-xl text-white ${finTotals.net >= 0 ? 'bg-primary' : 'bg-rose-500'}`}>
              <div className="text-2xl font-black">{finTotals.net >= 0 ? '+' : ''}{finTotals.net.toLocaleString()} ر.ي</div>
              <div className="text-xs font-black text-white/70 mt-1">صافي الربح</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-800">التفاصيل {period === 'daily' ? 'اليومية' : period === 'monthly' ? 'الشهرية' : 'السنوية'}</h3>
            </div>
            {financialRows.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold">لا توجد بيانات مالية</div>
            ) : (
              <>
                <div className="grid grid-cols-4 px-8 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>الفترة</span><span className="text-center">الإيرادات</span><span className="text-center">المصروفات</span><span className="text-left">صافي الربح</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {financialRows.map(row => (
                    <div key={row.key} className="grid grid-cols-4 px-8 py-5 hover:bg-slate-50/80 transition-all items-center">
                      <span className="font-black text-slate-700">{row.label}</span>
                      <span className="text-center font-bold text-emerald-600">{row.income.toLocaleString()} ر.ي</span>
                      <span className="text-center font-bold text-rose-500">{row.expenses.toLocaleString()} ر.ي</span>
                      <span className={`text-left font-black text-lg ${row.net >= 0 ? 'text-primary' : 'text-rose-600'}`}>
                        {row.net >= 0 ? '+' : ''}{row.net.toLocaleString()} ر.ي
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Patients Report Tab ─── */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
              <div className="text-3xl font-black text-primary">{patients.length}</div>
              <div className="text-xs font-black text-slate-400 mt-1">إجمالي المرضى المسجلين</div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
              <div className="text-3xl font-black text-emerald-600">{new Set(appointments.map(a => a.patientId)).size}</div>
              <div className="text-xs font-black text-slate-400 mt-1">مرضى لديهم مواعيد</div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
              <div className="text-3xl font-black text-amber-500">{appointments.length > 0 ? (appointments.length / Math.max(patients.length,1)).toFixed(1) : 0}</div>
              <div className="text-xs font-black text-slate-400 mt-1">متوسط المواعيد لكل مريض</div>
            </div>
          </div>
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50"><h3 className="text-lg font-black text-slate-800">الزيارات {period === 'daily' ? 'اليومية' : period === 'monthly' ? 'الشهرية' : 'السنوية'}</h3></div>
            {patientRows.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold">لا توجد مواعيد مسجلة</div>
            ) : (
              <>
                <div className="grid grid-cols-3 px-8 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>الفترة</span><span className="text-center">إجمالي الزيارات</span><span className="text-center">مرضى مختلفون</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {patientRows.map(row => (
                    <div key={row.key} className="grid grid-cols-3 px-8 py-5 hover:bg-slate-50/80 transition-all items-center">
                      <span className="font-black text-slate-700">{row.label}</span>
                      <span className="text-center font-black text-primary text-lg">{row.visits}</span>
                      <span className="text-center font-bold text-slate-600">{row.uniquePatients}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Doctors Report Tab ─── */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {doctorRows.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-bold bg-white rounded-[3rem] border border-slate-100 shadow-xl">لا يوجد أطباء مسجلون</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctorRows.map((doc, rank) => (
                <div key={doc.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">{doc.name.charAt(0)}</div>
                    <div>
                      <div className="font-black text-slate-800 text-lg">{doc.name}</div>
                      <div className="text-xs font-bold text-slate-400">{doc.specialty}</div>
                    </div>
                    {rank === 0 && <span className="mr-auto text-2xl">🏆</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-50 rounded-2xl">
                      <div className="text-xl font-black text-slate-800">{doc.cases}</div>
                      <div className="text-[10px] font-bold text-slate-400">حالة</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                      <div className="text-xl font-black text-emerald-600">{doc.completed}</div>
                      <div className="text-[10px] font-bold text-emerald-400">مكتملة</div>
                    </div>
                    <div className="text-center p-3 bg-rose-50 rounded-2xl">
                      <div className="text-xl font-black text-rose-600">{doc.cancelled}</div>
                      <div className="text-[10px] font-bold text-rose-400">ملغية</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <div className="text-xs font-black text-slate-400 mb-1">الإيرادات المحققة</div>
                    <div className="text-2xl font-black text-primary">{doc.revenue.toLocaleString()} <span className="text-sm">ر.ي</span></div>
                    {/* Revenue bar relative to top doctor */}
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${doctorRows[0].revenue > 0 ? (doc.revenue / doctorRows[0].revenue) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Appointments Report Tab ─── */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'إجمالي المواعيد', value: apptTotals.total, color: 'text-primary', bg: 'bg-primary/10', icon: '📅' },
              { label: 'مكتملة', value: apptTotals.completed, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✅' },
              { label: 'ملغية', value: apptTotals.cancelled, color: 'text-rose-600', bg: 'bg-rose-50', icon: '❌' },
              { label: 'معدل الإتمام', value: `${apptTotals.completionRate}%`, color: 'text-amber-600', bg: 'bg-amber-50', icon: '📊' },
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

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50"><h3 className="text-lg font-black text-slate-800">توزيع المواعيد {period === 'daily' ? 'اليومي' : period === 'monthly' ? 'الشهري' : 'السنوي'}</h3></div>
            {apptRows.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold">لا توجد مواعيد مسجلة</div>
            ) : (
              <>
                <div className="grid grid-cols-5 px-8 py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>الفترة</span><span className="text-center">الإجمالي</span><span className="text-center text-emerald-600">مكتملة</span><span className="text-center text-rose-500">ملغية</span><span className="text-center">قيد الانتظار</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {apptRows.map(row => (
                    <div key={row.key} className="grid grid-cols-5 px-8 py-5 hover:bg-slate-50/80 transition-all items-center">
                      <span className="font-black text-slate-700">{row.label}</span>
                      <span className="text-center font-black text-primary text-lg">{row.total}</span>
                      <span className="text-center font-bold text-emerald-600">{row.completed}</span>
                      <span className="text-center font-bold text-rose-500">{row.cancelled}</span>
                      <span className="text-center font-bold text-amber-500">{row.pending}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
