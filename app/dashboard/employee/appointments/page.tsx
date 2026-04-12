"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, Appointment } from "../../../lib/data";
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

export default function EmployeeAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    status: 'pending' as Appointment['status'],
    type: 'كشفية',
  });

  const refresh = () => setAppointments(getAppointments());

  useEffect(() => {
    const fetchData = async () => {
      refresh();
      const allUsers = await getAllUsers();
      setDoctors(allUsers.filter((u: any) => u.role === 'doctor'));
      setPatients(allUsers.filter((u: any) => u.role === 'patient'));
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterDate && a.date !== filterDate) return false;
      return true;
    });
  }, [appointments, filterStatus, filterDate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      updateAppointment(editingApp.id, formData);
    } else {
      // Find patient name if only ID selected
      const p = patients.find(p => p.id === formData.patientId);
      addAppointment({ 
        ...formData, 
        patientName: p ? p.name : formData.patientName 
      });
    }
    setIsAddModalOpen(false);
    setEditingApp(null);
    refresh();
  };

  const openEdit = (app: Appointment) => {
    setEditingApp(app);
    setFormData({ 
      patientId: app.patientId, 
      patientName: app.patientName, 
      doctor: app.doctor, 
      date: app.date, 
      time: app.time, 
      status: app.status, 
      type: app.type 
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">حجز المواعيد</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">إضافة وإدارة مواعيد المرضى لليوم</p>
        </div>
        <button 
          onClick={() => {
            setEditingApp(null);
            setFormData({ patientId: '', patientName: '', doctor: doctors[0]?.name || '', date: new Date().toISOString().split('T')[0], time: '', status: 'pending', type: 'كشفية' });
            setIsAddModalOpen(true);
          }}
          className="bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-sm"
        >
          ➕ حجز موعد جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-wrap gap-4 items-center">
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setFilterDate(new Date().toISOString().split('T')[0])} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filterDate === new Date().toISOString().split('T')[0] ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>اليوم</button>
           <button onClick={() => setFilterDate('')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filterDate === '' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>الكل</button>
        </div>
        <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="h-10 bg-slate-50 border-0 rounded-xl px-4 font-bold text-sm text-slate-600 focus:ring-1 focus:ring-primary"
        />
        <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="h-10 bg-slate-50 border-0 rounded-xl px-4 font-bold text-sm text-slate-600 focus:ring-1 focus:ring-primary appearance-none"
        >
            <option value="all">جميع الحالات</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div className="mr-auto text-xs font-black text-slate-300 italic">{filtered.length} موعد</div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-20 text-center text-slate-300 font-bold italic">لا توجد مواعيد لهذا التاريخ</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(app => {
              const st = STATUS_MAP[app.status];
              return (
                <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                      {app.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-700">{app.patientName}</div>
                      <div className="text-xs font-bold text-slate-400">{app.type} - {app.doctor}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-slate-700">{app.time}</div>
                    <div className="text-[10px] font-bold text-slate-400">{app.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <button 
                      onClick={() => openEdit(app)}
                      className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 p-10">
            <h3 className="text-2xl font-black text-slate-800 mb-8">{editingApp ? 'تعديل موعد' : 'حجز موعد جديد'}</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">المريض</label>
                <select 
                  required
                  value={formData.patientId}
                  onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="">اختر المريض...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الطبيب</label>
                <select 
                  required
                  value={formData.doctor}
                  onChange={e => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none"
                >
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الوقت</label>
                  <input type="text" placeholder="10:00 ص" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">حالة الموعد</label>
                <div className="grid grid-cols-3 gap-2">
                  {['pending', 'confirmed', 'cancelled'].map((s: any) => (
                    <button 
                      key={s}
                      type="button" 
                      onClick={() => setFormData({...formData, status: s})}
                      className={`py-2.5 rounded-xl font-black text-[10px] transition-all border-2 ${formData.status === s ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-slate-50 text-slate-400'}`}
                    >
                      {STATUS_MAP[s as Appointment['status']].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">
                  {editingApp ? 'حفظ التعديلات' : 'تأكيد الحجز'}
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 h-16 bg-slate-100 text-slate-400 font-black rounded-2xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
