"use client";

import { useEffect, useState, useMemo } from "react";
import { getBills, getExpenses, addExpense, updateExpense, deleteExpense, getInstallments, addInstallment, payInstallment, Bill, Expense, Installment } from "../../../lib/data";

const CATEGORY_ICONS: Record<string, string> = {
  'materials': '🔧',
  'lab': '🧪',
  'salary': '👥',
  'utilities': '💡',
  'other': '📦',
};

const CATEGORY_NAMES: Record<string, string> = {
  'materials': 'مواد ومستلزمات',
  'lab': 'مختبرات خارجية',
  'salary': 'رواتب',
  'utilities': 'مرافق وخدمات',
  'other': 'أخرى',
};

const EXPENSE_CATEGORIES = ['materials', 'lab', 'salary', 'utilities', 'other'] as const;

type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'installments'>('overview');
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const [form, setForm] = useState<{ category: ExpenseCategory; description: string; amount: number; date: string; notes: string }>({
    category: 'materials',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [installmentForm, setInstallmentForm] = useState<Omit<Installment, 'id'>>({
    billId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
  });

  const refresh = () => {
    setBills(getBills());
    setExpenses(getExpenses());
    setInstallments(getInstallments());
  };

  useEffect(() => { refresh(); }, []);

  // Income = paid bills
  const income = useMemo(() => bills.filter(b => b.status === 'paid'), [bills]);

  // Apply month filter
  const filterByMonth = <T extends { date: string }>(items: T[]) =>
    selectedMonth ? items.filter(i => i.date.startsWith(selectedMonth)) : items;

  const filteredIncome = useMemo(() => filterByMonth(income), [income, selectedMonth]);
  const filteredExpenses = useMemo(() => filterByMonth(expenses), [expenses, selectedMonth]);

  const totalIncome = useMemo(() => filteredIncome.reduce((sum, bill) => sum + bill.total, 0), [filteredIncome]);
  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0), [filteredExpenses]);
  const netProfit = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const overdueInstallments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return installments.filter(i => i.status === 'pending' && i.dueDate < today);
  }, [installments]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  // Monthly chart data (last 6 months)
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthIncome = bills.filter(b => b.status === 'paid' && b.date.startsWith(key)).reduce((s, b) => s + b.total, 0);
      const monthExpenses = expenses.filter(e => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
      return { label: MONTH_NAMES[d.getMonth()], income: monthIncome, expenses: monthExpenses, key };
    });
  }, [bills, expenses]);

  const chartMax = useMemo(() => Math.max(...chartData.flatMap(d => [d.income, d.expenses]), 1), [chartData]);

  // Unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set([...bills.map(b => b.date.slice(0, 7)), ...expenses.map(e => e.date.slice(0, 7))]);
    return [...months].sort().reverse();
  }, [bills, expenses]);

  const openAdd = () => {
    setEditingExp(null);
    setForm({ category: 'materials', description: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
    setIsModalOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditingExp(exp);
    setForm({ category: exp.category, description: exp.description, amount: exp.amount, date: exp.date, notes: exp.notes || '' });
    setIsModalOpen(true);
  };

  const openAddInstallment = () => {
    setInstallmentForm({
      billId: bills[0]?.id || '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    });
    setIsInstallmentModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExp) { updateExpense(editingExp.id, form); }
    else { addExpense(form); }
    setIsModalOpen(false);
    setEditingExp(null);
    refresh();
  };

  const handleInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!installmentForm.billId) return;
    addInstallment(installmentForm);
    setIsInstallmentModalOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) { deleteExpense(id); setDeletingId(null); refresh(); }
    else { setDeletingId(id); setTimeout(() => setDeletingId(null), 3000); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">الإدارة المالية</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">تتبع الإيرادات والمصروفات وصافي الأرباح</p>
        </div>
        <div className="flex gap-3">
          {availableMonths.length > 0 && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="h-12 bg-white border border-slate-200 rounded-2xl px-4 font-bold text-slate-600 focus:ring-2 focus:ring-primary appearance-none">
              <option value="">كل الأشهر</option>
              {availableMonths.map(m => {
                const [y, mon] = m.split('-');
                return <option key={m} value={m}>{MONTH_NAMES[parseInt(mon) - 1]} {y}</option>;
              })}
            </select>
          )}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm gap-1">
            {([['overview', '📊 نظرة عامة'], ['income', '📈 الإيرادات'], ['expenses', '📉 المصروفات'], ['installments', '💳 الأقساط']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setActiveTab(k)}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${activeTab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-xl shadow-emerald-50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 text-xl">📈</div>
            <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{filteredIncome.length} فاتورة</span>
          </div>
          <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest">إجمالي الإيرادات</h4>
          <div className="text-3xl font-black text-emerald-600 mt-2">{totalIncome.toLocaleString()} <span className="text-sm">ر.ي</span></div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 text-xl">📉</div>
            <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full">{filteredExpenses.length} قيد</span>
          </div>
          <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest">إجمالي المصروفات</h4>
          <div className="text-3xl font-black text-rose-600 mt-2">{totalExpenses.toLocaleString()} <span className="text-sm">ر.ي</span></div>
        </div>

        <div className={`p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden ${netProfit >= 0 ? 'bg-primary shadow-primary/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
          <div className="relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl text-white text-xl w-fit mb-4">💎</div>
            <h4 className="text-white/70 font-black text-xs uppercase tracking-widest">صافي الربح</h4>
            <div className="text-3xl font-black mt-2">{netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()} <span className="text-sm">ر.ي</span></div>
          </div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Monthly Chart */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
            <h3 className="text-xl font-black text-slate-800">المقارنة الشهرية</h3>
            <div className="flex items-end gap-3 h-52">
              {chartData.map((d) => (
                <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1 w-full h-40">
                    <div title={`إيرادات: ${d.income} ر.ي`}
                      className="flex-1 bg-emerald-400 rounded-t-xl transition-all hover:bg-emerald-500 cursor-pointer"
                      style={{ height: `${d.income > 0 ? Math.max((d.income / chartMax) * 100, 4) : 0}%` }} />
                    <div title={`مصروفات: ${d.expenses} ر.ي`}
                      className="flex-1 bg-rose-300 rounded-t-xl transition-all hover:bg-rose-400 cursor-pointer"
                      style={{ height: `${d.expenses > 0 ? Math.max((d.expenses / chartMax) * 100, 4) : 0}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-6 text-xs font-black text-slate-400">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>إيرادات</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-300 inline-block"></span>مصروفات</span>
            </div>
          </div>

          {/* Expense by Category */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
            <h3 className="text-xl font-black text-slate-800">المصروفات حسب النوع</h3>
            {expenseByCategory.length === 0 ? (
              <p className="text-slate-400 font-bold text-center py-10">لا توجد مصروفات</p>
            ) : expenseByCategory.map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-black">
                    <span className="text-slate-600">{CATEGORY_ICONS[cat as ExpenseCategory]} {cat}</span>
                    <span className="text-slate-800">{amt.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Income Tab ─── */}
      {activeTab === 'income' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800">سجل الإيرادات</h3>
            <span className="text-sm font-bold text-slate-400">{filteredIncome.length} إيراد — الإجمالي: {totalIncome.toLocaleString()} ر.ي</span>
          </div>
          {filteredIncome.length === 0 ? (
            <div className="p-20 text-center"><div className="text-6xl mb-4">📭</div><p className="text-slate-400 font-bold">لا توجد فواتير مدفوعة في هذه الفترة</p></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredIncome.map(bill => (
                <div key={bill.id} className="flex items-center gap-4 px-8 py-5 hover:bg-slate-50/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black shrink-0">
                    {bill.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-700">{bill.patientName}</div>
                    <div className="text-xs font-bold text-slate-400">{bill.serviceName} • {bill.doctorName}</div>
                  </div>
                  <div className="text-center shrink-0 w-24">
                    <div className="text-xs font-black text-slate-400">التاريخ</div>
                    <div className="font-bold text-slate-600 text-sm">{bill.date}</div>
                  </div>
                  {bill.discount > 0 && (
                    <div className="text-center shrink-0 w-24">
                      <div className="text-xs font-black text-slate-400">خصم</div>
                      <div className="font-bold text-rose-500 text-sm">- {bill.discount} ر.ي</div>
                    </div>
                  )}
                  <div className="text-left shrink-0">
                    <div className="text-xl font-black text-emerald-600">{bill.total.toLocaleString()} <span className="text-xs font-bold text-slate-400">ر.ي</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Expenses Tab ─── */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-slate-400">{filteredExpenses.length} قيد — الإجمالي: {totalExpenses.toLocaleString()} ر.ي</p>
            <button onClick={openAdd} className="bg-primary text-white font-black px-6 py-3 rounded-[1.2rem] shadow-lg shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2">
              <span>➕</span> إضافة مصروف
            </button>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="p-20 text-center"><div className="text-6xl mb-4">📭</div><p className="text-slate-400 font-bold">لا توجد مصروفات مسجلة</p></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center gap-4 px-8 py-5 hover:bg-slate-50/80 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 text-lg shrink-0">
                      {CATEGORY_ICONS[exp.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-700">{CATEGORY_NAMES[exp.category] || exp.category}</div>
                      <div className="text-xs font-bold text-slate-400 truncate">{exp.description}</div>
                      {exp.notes && <div className="text-xs font-bold text-slate-400 truncate">{exp.notes}</div>}
                    </div>
                    <div className="text-center shrink-0 w-24">
                      <div className="text-xs font-black text-slate-400">التاريخ</div>
                      <div className="font-bold text-slate-600 text-sm">{exp.date}</div>
                    </div>
                    <div className="text-xl font-black text-rose-600 shrink-0">
                      {exp.amount.toLocaleString()} <span className="text-xs font-bold text-slate-400">ر.ي</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => openEdit(exp)} className="h-9 px-3 bg-slate-100 text-slate-600 font-black text-xs rounded-xl hover:bg-primary hover:text-white transition-all">تعديل</button>
                      <button onClick={() => handleDelete(exp.id)}
                        className={`h-9 px-3 font-black text-xs rounded-xl transition-all ${deletingId === exp.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}>
                        {deletingId === exp.id ? 'حذف؟' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">{editingExp ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}</h3>
              <p className="text-slate-400 font-bold text-sm mt-1">أدخل تفاصيل المصروف لتسجيله في الأرشيف المالي</p>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">نوع المصروف</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all border-2 flex items-center gap-2 ${form.category === cat ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}>
                      <span>{CATEGORY_ICONS[cat]}</span> {CATEGORY_NAMES[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الوصف</label>
                <input type="text" required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                  placeholder="مثال: شراء مواد تعبئة" />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المبلغ (ر.ي)</label>
                  <input type="number" required min={1} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ</label>
                  <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">ملاحظات</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-5 font-bold text-slate-700 focus:ring-2 focus:ring-primary resize-none"
                  placeholder="مثال: شراء معدات تعقيم جديدة..." />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">
                  {editingExp ? 'تحديث المصروف' : 'تسجيل المصروف'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="h-16 px-8 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInstallmentModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">إضافة قسط جديد</h3>
              <p className="text-slate-400 font-bold text-sm mt-1">سجل الدفعة القادمة لخطط التقسيط والعروض المتبقية</p>
            </div>
            <form onSubmit={handleInstallmentSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">مريض / فاتورة</label>
                <select required value={installmentForm.billId} onChange={e => setInstallmentForm(f => ({ ...f, billId: e.target.value }))}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary">
                  <option value="">اختر فاتورة</option>
                  {bills.map(bill => (
                    <option key={bill.id} value={bill.id}>{bill.patientName} — {bill.serviceName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">المبلغ (ر.ي)</label>
                  <input type="number" min={1} required value={installmentForm.amount} onChange={e => setInstallmentForm(f => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">تاريخ الاستحقاق</label>
                  <input type="date" required value={installmentForm.dueDate} onChange={e => setInstallmentForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all">حفظ القسط</button>
                <button type="button" onClick={() => setIsInstallmentModalOpen(false)} className="h-16 px-8 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Installments Tab ─── */}
      {activeTab === 'installments' && (
        <div className="space-y-6">
          {/* Overdue Alert */}
          {overdueInstallments.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">⚠️</div>
                <h3 className="text-xl font-black text-rose-800">أقساط متأخرة</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueInstallments.map((inst) => {
                  const bill = bills.find(b => b.id === inst.billId);
                  return (
                    <div key={inst.id} className="bg-white p-4 rounded-2xl border border-rose-200">
                      <div className="font-black text-rose-800">{bill?.patientName}</div>
                      <div className="text-sm text-rose-600">
                        {inst.amount} ر.ي • تاريخ الاستحقاق: {inst.dueDate}
                      </div>
                      <button
                        onClick={() => {
                          payInstallment(inst.id);
                          refresh();
                        }}
                        className="mt-2 bg-rose-500 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-rose-600"
                      >
                        تسديد الآن
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Installments Table */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">جدول الأقساط</h3>
              <button
                onClick={openAddInstallment}
                className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                إضافة قسط
              </button>
            </div>
            {installments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-right font-black text-slate-600">المريض</th>
                      <th className="px-6 py-4 text-right font-black text-slate-600">المبلغ</th>
                      <th className="px-6 py-4 text-right font-black text-slate-600">تاريخ الاستحقاق</th>
                      <th className="px-6 py-4 text-right font-black text-slate-600">الحالة</th>
                      <th className="px-6 py-4 text-right font-black text-slate-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {installments.map((inst) => {
                      const bill = bills.find(b => b.id === inst.billId);
                      return (
                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-black text-slate-800">{bill?.patientName || 'غير معروف'}</td>
                          <td className="px-6 py-4 font-bold text-slate-600">{inst.amount} ر.ي</td>
                          <td className="px-6 py-4 font-bold text-slate-600">{inst.dueDate}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${inst.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                inst.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                                  'bg-amber-100 text-amber-700'
                              }`}>
                              {inst.status === 'paid' ? 'مدفوع' : inst.status === 'overdue' ? 'متأخر' : 'معلق'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {inst.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  payInstallment(inst.id);
                                  refresh();
                                }}
                                className="bg-primary text-white font-black px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition-colors"
                              >
                                تسديد
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center text-slate-400 font-bold">لا توجد أقساط مسجلة</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
