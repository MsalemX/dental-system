"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getBills, addBill, updateBill, payBill, Bill } from "../../../lib/data";
import { getAllUsers } from "../../../lib/auth";
import { getServices } from "../../../lib/services";
import { getClinicSettings } from "../../../lib/clinic";

export default function EmployeeBilling() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState('جُمان لطب الأسنان');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [printingBill, setPrintingBill] = useState<Bill | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    doctorName: '',
    serviceName: '',
    amount: 0,
    discount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'unpaid' as 'unpaid' | 'paid',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find(p => p.id === form.patientId);
    const payload = { ...form, patientName: p ? p.name : form.patientName, total };
    
    if (editingBill) {
      updateBill(editingBill.id, payload);
    } else {
      addBill(payload);
    }
    
    setIsAddModalOpen(false);
    setEditingBill(null);
    refresh();
  };

  const openEdit = (b: Bill) => {
    setEditingBill(b);
    setForm({ 
      patientId: b.patientId, 
      patientName: b.patientName, 
      doctorName: b.doctorName, 
      serviceName: b.serviceName, 
      amount: b.amount, 
      discount: b.discount, 
      date: b.date, 
      notes: b.notes || '', 
      status: b.status 
    });
    setIsAddModalOpen(true);
  };

  const handlePay = (id: string) => {
    payBill(id);
    refresh();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">الفواتير والمدفوعات</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">تحصيل الرسوم وإصدار فواتير المرضى</p>
        </div>
        <button 
          onClick={() => {
            setEditingBill(null);
            setForm({ patientId: '', patientName: '', doctorName: '', serviceName: '', amount: 0, discount: 0, date: new Date().toISOString().split('T')[0], notes: '', status: 'unpaid' });
            setIsAddModalOpen(true);
          }}
          className="bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-sm"
        >
          🧾 إصدار فاتورة جديدة
        </button>
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between">
            <div>
                <div className="text-[10px] font-black text-slate-400 mb-1">فواتير بانتظار التحصيل</div>
                <div className="text-3xl font-black text-rose-500">{bills.filter(b => b.status === 'unpaid').length}</div>
            </div>
            <div className="text-3xl">⏳</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between">
            <div>
                <div className="text-[10px] font-black text-slate-400 mb-1">إيرادات المحصلة اليوم</div>
                <div className="text-3xl font-black text-emerald-500">
                    {bills.filter(b => b.status === 'paid' && b.date === new Date().toISOString().split('T')[0]).reduce((s, b) => s + b.total, 0)} <span className="text-sm font-black">ر.س</span>
                </div>
            </div>
            <div className="text-3xl">💰</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'unpaid', label: 'غير مدفوعة ⏳' },
          { id: 'paid', label: 'مدفوعة ✅' },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setFilterStatus(t.id as any)}
            className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${filterStatus === t.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800">سجل الفواتير</h3>
            <span className="text-xs font-black text-slate-300 uppercase italic">{filtered.length} فاتورة</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-20 text-center text-slate-300 font-bold italic">لا توجد فواتير مطابقة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="p-6">المريض</th>
                  <th className="p-6">الخدمة</th>
                  <th className="p-6 text-center">المبلغ</th>
                  <th className="p-6 text-center">الحالة</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6">
                      <div className="font-black text-slate-700">{bill.patientName}</div>
                      <div className="text-[10px] font-bold text-slate-400">{bill.date} | {bill.doctorName}</div>
                    </td>
                    <td className="p-6 font-bold text-slate-500 text-sm">{bill.serviceName}</td>
                    <td className="p-6 text-center">
                      <div className="text-lg font-black text-slate-800">{bill.total.toLocaleString()} ر.س</div>
                      {bill.discount > 0 && <div className="text-[10px] font-bold text-rose-400 line-through">{bill.amount.toLocaleString()}</div>}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg ${bill.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {bill.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                      </span>
                    </td>
                    <td className="p-6 text-left">
                       <div className="flex gap-2 justify-end">
                         {bill.status === 'unpaid' && (
                           <button onClick={() => handlePay(bill.id)} className="bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs hover:scale-105 transition-all">تحصيل</button>
                         )}
                         <button onClick={() => openEdit(bill)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">✏️</button>
                         <button onClick={() => setPrintingBill(bill)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">🖨️</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 p-10">
            <h3 className="text-2xl font-black text-slate-800 mb-8">{editingBill ? 'تعديل فاتورة' : 'إصدار فاتورة جديدة'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">المريض</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700">
                    <option value="">اختر مريض...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">الطبيب</label>
                  <select required value={form.doctorName} onChange={e => setForm({...form, doctorName: e.target.value})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700">
                    <option value="">اختر طبيب...</option>
                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase mr-2">الخدمة/الإجراء</label>
                <select required value={form.serviceName} onChange={e => {
                  const s = services.find(x => x.name === e.target.value);
                  setForm({...form, serviceName: e.target.value, amount: s ? s.price : 0});
                }} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700">
                  <option value="">اختر خدمة...</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name} ({s.price} ر.س)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">المبلغ</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">الخصم</label>
                  <input type="number" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700" />
                </div>
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl text-center space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-black text-primary uppercase">صافي الفاتورة</div>
                  <div className="text-4xl font-black text-primary">{total.toLocaleString()} <span className="text-lg">ر.س</span></div>
                </div>
                
                <div className="pt-4 border-t border-primary/10">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-3 text-right mr-2">حالة الفاتورة</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setForm({...form, status: 'paid'})}
                      className={`h-12 rounded-xl font-black text-xs transition-all border-2 ${form.status === 'paid' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                      محصل ✅
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setForm({...form, status: 'unpaid'})}
                      className={`h-12 rounded-xl font-black text-xs transition-all border-2 ${form.status === 'unpaid' ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                      دين ⏳
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">
                  {editingBill ? 'حفظ التعديلات' : 'تأكيد وحفظ'}
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 h-16 bg-slate-100 text-slate-400 font-black rounded-2xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Basic Print Modal Overlay */}
      {printingBill && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setPrintingBill(null)} />
           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
             <div className="p-12 border-b-4 border-slate-50">
               <div className="flex justify-between items-start mb-12">
                 <div>
                   <h1 className="text-3xl font-black text-slate-800">{clinicName}</h1>
                   <p className="text-slate-400 font-bold">فاتورة علاج إلكترونية</p>
                 </div>
                 <div className="text-left">
                   <div className="text-sm font-black text-slate-400 uppercase">رقم الفاتورة</div>
                   <div className="font-black text-slate-800 text-xl">#{printingBill.id.slice(-6)}</div>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-12 mb-12">
                 <div>
                   <div className="text-[10px] font-black text-slate-300 uppercase mb-2">المريض</div>
                   <div className="font-black text-slate-700 text-lg">{printingBill.patientName}</div>
                 </div>
                 <div className="text-left">
                   <div className="text-[10px] font-black text-slate-300 uppercase mb-2">التاريخ</div>
                   <div className="font-black text-slate-700 text-lg">{printingBill.date}</div>
                 </div>
               </div>

               <div className="bg-slate-50 rounded-3xl p-8 space-y-4 mb-12">
                 <div className="flex justify-between items-center font-black text-slate-400 text-xs uppercase border-b border-slate-200 pb-4">
                   <span>الوصف</span>
                   <span>المبلغ</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                   <span className="font-black text-slate-700">{printingBill.serviceName}</span>
                   <span className="font-bold text-slate-700">{printingBill.amount.toLocaleString()} ر.س</span>
                 </div>
                 {printingBill.discount > 0 && (
                   <div className="flex justify-between items-center text-rose-500 font-bold">
                     <span>خصم</span>
                     <span>-{printingBill.discount.toLocaleString()} ر.س</span>
                   </div>
                 )}
                 <div className="pt-6 border-t-2 border-slate-200 flex justify-between items-center">
                   <span className="text-2xl font-black text-slate-800">الإجمالي</span>
                   <span className="text-3xl font-black text-primary">{printingBill.total.toLocaleString()} ر.س</span>
                 </div>
               </div>

               <div className="flex gap-4 no-print">
                 <button onClick={() => window.print()} className="flex-1 h-16 bg-slate-800 text-white font-black rounded-2xl hover:bg-black transition-all">طباعة الفاتورة 🖨️</button>
                 <button onClick={() => setPrintingBill(null)} className="px-12 h-16 bg-slate-100 text-slate-500 font-black rounded-2xl">إغلاق</button>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
