"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointments, updateAppointment, deleteAppointment, Appointment } from "../../../lib/data";
import { getAllUsers } from "../../../lib/auth";

const STATUS_MAP: Record<Appointment['status'], { label: string; color: string; bg: string }> = {
  pending:    { label: 'قيد الانتظار', color: 'text-amber-600',  bg: 'bg-amber-50' },
  confirmed:  { label: 'مؤكد',         color: 'text-blue-600',   bg: 'bg-blue-50' },
  arrived:    { label: 'وصل',           color: 'text-indigo-600', bg: 'bg-indigo-50' },
  consulting: { label: 'جاري الكشف',   color: 'text-purple-600', bg: 'bg-purple-50' },
  completed:  { label: 'مكتمل',         color: 'text-emerald-600',bg: 'bg-emerald-50' },
  cancelled:  { label: 'ملغي',          color: 'text-rose-600',   bg: 'bg-rose-50' },
  'no-show':  { label: 'غائب',         color: 'text-orange-600', bg: 'bg-orange-50' },
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Edit form state
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    time: '',
    status: 'pending' as Appointment['status'],
    type: '',
  });

  const refresh = () => setAppointments(getAppointments());

  useEffect(() => {
    refresh();
    const allUsers = getAllUsers();
    const docs = Object.entries(allUsers)
      .filter(([_, d]: any) => d.role === 'doctor')
      .map(([id, d]: any) => ({ id, ...d }));
    setDoctors(docs);
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      if (filterDoctor !== 'all' && a.doctor !== filterDoctor) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterDate && a.date !== filterDate) return false;
      return true;
    });
  }, [appointments, filterDoctor, filterStatus, filterDate]);

  const openEdit = (app: Appointment) => {
    setEditingApp(app);
    setFormData({ doctor: app.doctor, date: app.date, time: app.time, status: app.status, type: app.type });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      updateAppointment(editingApp.id, formData);
      setEditingApp(null);
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      deleteAppointment(id);
      setDeletingId(null);
      refresh();
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  const uniqueDoctors = useMemo(() => [...new Set(appointments.map(a => a.doctor))], [appointments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-800">إدارة المواعيد</h2>
        <p className="text-slate-400 font-bold text-sm mt-1">عرض، تعديل، وحذف جميع مواعيد العيادة</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المواعيد', value: appointments.length, icon: '📅', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'قيد الانتظار', value: appointments.filter(a => a.status === 'pending').length, icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'مؤكدة', value: appointments.filter(a => a.status === 'confirmed').length, icon: '✅', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'مكتملة', value: appointments.filter(a => a.status === 'completed').length, icon: '🏆', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100/50 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center text-xl shrink-0`}>{stat.icon}</div>
            <div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-bold text-slate-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تصفية حسب الدكتور</label>
            <select
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
              className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-600 focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="all">جميع الأطباء</option>
              {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تصفية حسب الحالة</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-600 focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="all">جميع الحالات</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تصفية حسب التاريخ</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-600 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        {(filterDoctor !== 'all' || filterStatus !== 'all' || filterDate) && (
          <button
            onClick={() => { setFilterDoctor('all'); setFilterStatus('all'); setFilterDate(''); }}
            className="mt-3 text-xs font-black text-rose-500 hover:text-rose-700 transition-colors"
          >
            ✕ إزالة كل الفلاتر ({filtered.length} نتيجة)
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">قائمة المواعيد</h3>
          <span className="text-sm font-bold text-slate-400">{filtered.length} موعد</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-slate-400 font-bold">لا توجد مواعيد تطابق الفلتر المحدد</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(app => {
              const st = STATUS_MAP[app.status];
              return (
                <div key={app.id} className="flex items-center gap-4 px-8 py-5 hover:bg-slate-50/80 transition-all group">
                  {/* Patient */}
                  <div className="flex items-center gap-3 w-44 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary shrink-0">
                      {app.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-700 text-sm leading-tight">{app.patientName}</div>
                      <div className="text-[10px] font-bold text-slate-400">{app.type}</div>
                    </div>
                  </div>

                  {/* Doctor */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-400">الطبيب</div>
                    <div className="font-bold text-slate-700 text-sm truncate">{app.doctor}</div>
                  </div>

                  {/* Date & Time */}
                  <div className="text-center w-32 shrink-0">
                    <div className="text-xs font-black text-slate-400">التاريخ</div>
                    <div className="font-bold text-slate-700 text-sm">{app.date}</div>
                    <div className="text-xs font-bold text-slate-400">{app.time}</div>
                  </div>

                  {/* Status Badge */}
                  <div className="w-28 shrink-0">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(app)}
                      className="h-9 px-4 bg-slate-100 text-slate-600 font-black text-xs rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className={`h-9 px-4 font-black text-xs rounded-xl transition-all ${deletingId === app.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
                    >
                      {deletingId === app.id ? 'حذف؟' : '🗑️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingApp(null)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">تعديل الموعد</h3>
              <p className="text-slate-400 font-bold text-sm mt-1">
                موعد <span className="text-primary">{editingApp.patientName}</span>
              </p>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-6">
              {/* Doctor */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الطبيب المعالج</label>
                <select
                  value={formData.doctor}
                  onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none"
                >
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  {/* Keep current doctor if not in users list */}
                  {!doctors.find(d => d.name === formData.doctor) && (
                    <option value={formData.doctor}>{formData.doctor}</option>
                  )}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الوقت</label>
                  <input
                    required
                    type="text"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    placeholder="10:30 ص"
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">نوع الخدمة</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">حالة الموعد</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(STATUS_MAP) as [Appointment['status'], typeof STATUS_MAP[Appointment['status']]][]).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: key })}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                        formData.status === key
                          ? `${val.bg} ${val.color} border-current`
                          : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="h-16 px-8 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
