"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getBills, addBill, updateBill, deleteBill, payBill, Bill } from "../../../lib/data";
import { addNotification } from "../../../lib/notifications";
import { getAllUsers } from "../../../lib/auth";
import { getServices } from "../../../lib/services";
import { getClinicSettings } from "../../../lib/clinic";

export default function AdminBilling() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState('جُمان لطب الأسنان');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [printingBill, setPrintingBill] = useState<Bill | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ patientId: '', patientName: '', doctorName: '', amount: 0, reason: '', notify: true });

  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    doctorName: '',
    serviceName: '',
    amount: 0,
    discount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'unpaid' as 'unpaid' | 'paid' | 'installment',
  });

  const total = form.amount - form.discount;

  const refresh = () => setBills(getBills());

  useEffect(() => {
    const fetchData = async () => {
      refresh();
      const allUsers = await getAllUsers();
      setPatients(allUsers.filter((u: any) => u.role === 'patient'));
      setDoctors(allUsers.filter((u: any) => u.role === 'doctor'));
      setServices(getServices());
      setClinicName(getClinicSettings().name);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() =>
    filterStatus === 'all' ? bills : bills.filter(b => b.status === filterStatus)
    , [bills, filterStatus]);

  const stats = useMemo(() => ({
    total: bills.length,
    paid: bills.filter(b => b.status === 'paid').length,
    unpaid: bills.filter(b => b.status === 'unpaid').length,
    revenue: bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0),
    pending: bills.filter(b => b.status === 'unpaid').reduce((s, b) => s + b.total, 0),
  }), [bills]);

  const openAdd = () => {
    setEditingBill(null);
    setForm({ patientId: '', patientName: '', doctorName: '', serviceName: '', amount: 0, discount: 0, date: new Date().toISOString().split('T')[0], notes: '', status: 'unpaid' });
    setIsAddModalOpen(true);
  };

  const openEdit = (b: Bill) => {
    setEditingBill(b);
    setForm({ patientId: b.patientId, patientName: b.patientName, doctorName: b.doctorName, serviceName: b.serviceName, amount: b.amount, discount: b.discount, date: b.date, notes: b.notes || '', status: b.status });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, total };
    if (editingBill) {
      updateBill(editingBill.id, payload);
    } else {
      addBill(payload);
    }
    setIsAddModalOpen(false);
    setEditingBill(null);
    refresh();
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtForm.patientId) return;
    addBill({
      patientId: debtForm.patientId,
      patientName: debtForm.patientName,
      doctorName: debtForm.doctorName || 'الإدارة',
      serviceName: debtForm.reason || 'مديونية',
      amount: debtForm.amount,
      discount: 0,
      total: debtForm.amount,
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0],
      notes: 'دين مضاف من الإدارة'
    });
    if (debtForm.notify) {
      addNotification({
        type: 'system',
        title: '⚠️ مطالبة مالية',
        message: `المريض الكريم ${debtForm.patientName}، تم تسجيل دين بقيمة ${debtForm.amount} ر.ي مقابل (${debtForm.reason}). نرجو سدادها في أقرب وقت. - عيادة جُمان`
      });
    }
    refresh();
    setIsDebtModalOpen(false);
    setDebtForm({ patientId: '', patientName: '', doctorName: '', amount: 0, reason: '', notify: true });
    alert('تم تسجيل الدين وإرسال المطالبة بنجاح!');
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      deleteBill(id);
      setDeletingId(null);
      refresh();
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  const handlePrint = (bill: Bill) => {
    setPrintingBill(bill);
    setTimeout(() => window.print(), 300);
  };

  const handlePatientSelect = (id: string) => {
    const p = patients.find(p => p.id === id);
    setForm(f => ({ ...f, patientId: id, patientName: p?.name || '' }));
  };

  const handleServiceSelect = (name: string) => {
    const svc = services.find(s => s.name === name);
    setForm(f => ({ ...f, serviceName: name, amount: svc?.price || f.amount }));
  };

  return (
    <>
      {/* Print Receipt — hidden normally, visible on print */}
      {printingBill && (
        <div id="print-area" ref={printRef} className="hidden print:block p-12 font-sans" dir="rtl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black">{clinicName}</h1>
            <p className="text-slate-500 font-bold mt-1">فاتورة ضريبية</p>
            <div className="w-24 h-1 bg-black mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div><span className="font-black">رقم الفاتورة: </span>{printingBill.id}</div>
            <div><span className="font-black">التاريخ: </span>{printingBill.date}</div>
            <div><span className="font-black">المريض: </span>{printingBill.patientName}</div>
            <div><span className="font-black">الطبيب: </span>{printingBill.doctorName}</div>
          </div>
          <table className="w-full border-collapse text-sm mb-8">
            <thead><tr className="border-b-2 border-black"><th className="py-2 text-right font-black">الخدمة</th><th className="py-2 text-left font-black">المبلغ</th></tr></thead>
            <tbody>
              <tr className="border-b border-slate-200"><td className="py-3">{printingBill.serviceName}</td><td className="py-3 text-left">{printingBill.amount} ر.ي</td></tr>
              {printingBill.discount > 0 && <tr className="border-b border-slate-200"><td className="py-3 text-emerald-700">خصم</td><td className="py-3 text-left text-emerald-700">- {printingBill.discount} ر.ي</td></tr>}
            </tbody>
            <tfoot><tr className="font-black text-lg"><td className="pt-4">الإجمالي</td><td className="pt-4 text-left">{printingBill.total} ر.ي</td></tr></tfoot>
          </table>
          <div className={`text-center font-black text-lg py-3 rounded-xl ${printingBill.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {printingBill.status === 'paid' ? '✅ مدفوعة' : '⏳ غير مدفوعة'}
          </div>
          {printingBill.notes && <p className="mt-6 text-slate-500 text-sm"><span className="font-black">ملاحظات: </span>{printingBill.notes}</p>}
          <p className="mt-16 text-center text-xs text-slate-400">شكراً لثقتكم بعيادة {clinicName}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 print:hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800">إدارة الفواتير</h2>
            <p className="text-slate-400 font-bold text-sm mt-1">إنشاء، تتبع، وطباعة الفواتير الطبية</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsDebtModalOpen(true)} className="bg-rose-500 text-white font-black px-6 py-4 rounded-[1.5rem] shadow-lg shadow-rose-500/30 hover:scale-105 transition-all flex items-center gap-2">
              <span>💳</span>
              تسجيل دين
            </button>
            <button onClick={openAdd} className="bg-primary text-white font-black px-8 py-4 rounded-[1.5rem] shadow-lg shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2">
              <span>🧾</span>
              إنشاء فاتورة
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الفواتير', value: stats.total, sub: 'فاتورة', icon: '🧾', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'مدفوعة', value: stats.paid, sub: 'فاتورة', icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'غير مدفوعة', value: stats.unpaid, sub: 'فاتورة', icon: '⏳', color: 'text-rose-600', bg: 'bg-rose-50' },
            { label: 'الإيرادات المحصلة', value: `${stats.revenue}`, sub: 'ر.ي', icon: '💰', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex items-center gap-4">
              <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-xl shrink-0`}>{s.icon}</div>
              <div>
                <div className={`text-2xl font-black ${s.color}`}>{s.value} <span className="text-xs">{s.sub}</span></div>
                <div className="text-xs font-bold text-slate-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          {([['all', 'الكل'], ['unpaid', 'غير مدفوعة'], ['paid', 'مدفوعة']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilterStatus(key)}
              className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all ${filterStatus === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-primary/30'}`}>
              {label}
            </button>
          ))}
          <span className="mr-auto text-sm font-bold text-slate-400 flex items-center">{filtered.length} فاتورة</span>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-6xl mb-4">🧾</div>
              <p className="text-slate-400 font-bold">لا توجد فواتير في هذا التصنيف</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(bill => (
                <div key={bill.id} className="flex items-center gap-3 px-8 py-5 hover:bg-slate-50/80 transition-all group">
                  {/* Patient */}
                  <div className="flex items-center gap-3 w-44 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">
                      {bill.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-700 text-sm leading-tight">{bill.patientName}</div>
                      <div className="text-[10px] font-bold text-slate-400">{bill.doctorName}</div>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-400">الخدمة</div>
                    <div className="font-bold text-slate-700 text-sm truncate">{bill.serviceName}</div>
                  </div>

                  {/* Date */}
                  <div className="text-center w-24 shrink-0">
                    <div className="text-xs font-black text-slate-400">التاريخ</div>
                    <div className="font-bold text-slate-700 text-sm">{bill.date}</div>
                  </div>

                  {/* Pricing */}
                  <div className="text-left w-32 shrink-0">
                    <div className="text-lg font-black text-slate-800">{bill.total} <span className="text-xs font-bold text-slate-400">ر.ي</span></div>
                    {bill.discount > 0 && <div className="text-xs font-bold text-emerald-500">خصم {bill.discount} ر.ي</div>}
                  </div>

                  {/* Status */}
                  <div className="w-28 shrink-0">
                    <button
                      onClick={() => { payBill(bill.id); refresh(); }}
                      disabled={bill.status === 'paid'}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-xl w-full transition-all ${bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600 cursor-default' : 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white'}`}
                    >
                      {bill.status === 'paid' ? '✅ مدفوعة' : '⏳ غير مدفوعة'}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handlePrint(bill)} className="h-9 px-3 bg-slate-100 text-slate-600 font-black text-xs rounded-xl hover:bg-slate-200 transition-all" title="طباعة">🖨️</button>
                    <button onClick={() => openEdit(bill)} className="h-9 px-3 bg-slate-100 text-slate-600 font-black text-xs rounded-xl hover:bg-primary hover:text-white transition-all">تعديل</button>
                    <button onClick={() => handleDelete(bill.id)}
                      className={`h-9 px-3 font-black text-xs rounded-xl transition-all ${deletingId === bill.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}>
                      {deletingId === bill.id ? 'حذف؟' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-50">
                <h3 className="text-2xl font-black text-slate-800">{editingBill ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة'}</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">أدخل تفاصيل الخدمة والمريض لإصدار الفاتورة</p>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-5">
                {/* Patient */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المريض</label>
                  <select value={form.patientId} onChange={e => handlePatientSelect(e.target.value)}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                    <option value="">اختر المريض</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {/* Doctor */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الطبيب المعالج</label>
                  <select value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                    <option value="">اختر الطبيب</option>
                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                {/* Service */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الخدمة</label>
                  <select value={form.serviceName} onChange={e => handleServiceSelect(e.target.value)}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none" required>
                    <option value="">اختر الخدمة</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name} — {s.price} ر.ي</option>)}
                  </select>
                </div>

                {/* Price & Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">السعر (ر.ي)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الخصم (ر.ي)</label>
                    <input type="number" value={form.discount} min={0} max={form.amount} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Total Preview */}
                <div className={`flex items-center justify-between p-5 rounded-2xl ${total >= 0 ? 'bg-primary/5 border border-primary/10' : 'bg-rose-50 border border-rose-100'}`}>
                  <span className="font-black text-slate-600">الإجمالي بعد الخصم</span>
                  <span className={`text-2xl font-black ${total >= 0 ? 'text-primary' : 'text-rose-500'}`}>{total} ر.ي</span>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الفاتورة</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" required />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">حالة الدفع</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([['unpaid', '⏳ غير مدفوعة'], ['paid', '✅ مدفوعة']] as const).map(([k, lbl]) => (
                      <button type="button" key={k} onClick={() => setForm(f => ({ ...f, status: k }))}
                        className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${form.status === k ? (k === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200') : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">ملاحظات (اختياري)</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full bg-slate-50 border-0 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-primary resize-none"
                    placeholder="أي ملاحظات إضافية..." />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">
                    {editingBill ? 'تحديث الفاتورة' : 'إصدار الفاتورة'}
                  </button>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="h-16 px-8 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDebtModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-rose-600 mb-2">تسجيل مديونية على مريض</h3>
            <p className="text-slate-400 font-bold mb-8">تسجيل دين غير مدفوع وإرسال تنبيه مالي للمريض فوراً.</p>
            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">المريض</label>
                <select value={debtForm.patientId} onChange={e => {
                  const p = patients.find(x => x.id === e.target.value);
                  setDebtForm({ ...debtForm, patientId: e.target.value, patientName: p ? p.name : '' });
                }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 appearance-none" required>
                  <option value="">اختر المريض...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الطبيب (اختياري)</label>
                <select value={debtForm.doctorName} onChange={e => setDebtForm({ ...debtForm, doctorName: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 appearance-none">
                  <option value="">الإدارة / بدون طبيب</option>
                  {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">قيمة الدين (ر.ي)</label>
                <input type="number" required min={1} value={debtForm.amount || ''} onChange={e => setDebtForm({ ...debtForm, amount: Number(e.target.value) })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-black text-slate-700 focus:ring-2 focus:ring-rose-500 text-xl" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">السبب / الوصف</label>
                <input type="text" required value={debtForm.reason} onChange={e => setDebtForm({ ...debtForm, reason: e.target.value })} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500" placeholder="مثال: رسوم متأخرة، اشتراك دوري..." />
              </div>

              <label className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 cursor-pointer">
                <input type="checkbox" checked={debtForm.notify} onChange={e => setDebtForm({ ...debtForm, notify: e.target.checked })} className="w-5 h-5 text-rose-500 rounded" />
                <span className="font-bold text-rose-700 text-sm">إرسال إشعار مالي للمريض (مطالبة بالسداد)</span>
              </label>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-rose-500 text-white font-black h-16 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-rose-500/30">حفظ وإرسال</button>
                <button type="button" onClick={() => setIsDebtModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-16 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
