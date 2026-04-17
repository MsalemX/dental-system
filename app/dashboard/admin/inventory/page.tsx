"use client";

import { useEffect, useState, useMemo } from "react";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, InventoryItem } from "../../../lib/data";

export default function InventoryManagement() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        name: "",
        category: "",
        currentStock: 0,
        minStock: 0,
        unit: "",
        supplier: "",
        notes: "",
    });

    const refresh = () => {
        setInventory(getInventory());
    };

    useEffect(() => {
        refresh();
    }, []);

    const filteredInventory = useMemo(() => {
        return inventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm)
        );
    }, [inventory, searchTerm]);

    const lowStockItems = useMemo(() => {
        return inventory.filter(item => item.currentStock <= item.minStock);
    }, [inventory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            updateInventoryItem(editingItem.id, form);
        } else {
            addInventoryItem(form);
        }

        refresh();
        setIsModalOpen(false);
        setEditingItem(null);
        setForm({
            name: "",
            category: "",
            currentStock: 0,
            minStock: 0,
            unit: "",
            supplier: "",
            notes: "",
        });
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            category: item.category,
            currentStock: item.currentStock,
            minStock: item.minStock,
            unit: item.unit,
            supplier: item.supplier || "",
            notes: item.notes || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
            deleteInventoryItem(id);
            refresh();
        }
    };

    const updateStock = (id: string, newStock: number) => {
        updateInventoryItem(id, { currentStock: newStock });
        refresh();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">إدارة المخزون</h2>
                    <p className="text-slate-400 font-bold text-sm mt-1">تتبع المواد والأدوات الطبية</p>
                </div>
                <div className="flex gap-4">
                    <div className="w-full md:w-64 relative">
                        <input
                            type="text"
                            placeholder="بحث في المخزون..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-2xl px-12 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    </div>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setForm({
                                name: "",
                                category: "",
                                currentStock: 0,
                                minStock: 0,
                                unit: "",
                                supplier: "",
                                notes: "",
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        إضافة صنف جديد
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'إجمالي الأصناف', value: inventory.length, icon: '📦', color: 'text-primary' },
                    { label: 'أصناف منخفضة', value: lowStockItems.length, icon: '⚠️', color: 'text-amber-600' },
                    { label: 'قيمة المخزون', value: 'حساب قيد التطوير', icon: '💰', color: 'text-emerald-600' },
                    { label: 'موردين مختلفين', value: new Set(inventory.map(i => i.supplier).filter(Boolean)).size, icon: '🏪', color: 'text-blue-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">{s.icon}</div>
                        <div>
                            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                            <div className="text-xs font-bold text-slate-400">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-2xl">⚠️</div>
                        <h3 className="text-xl font-black text-amber-800">تنبيه: أصناف منخفضة المخزون</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockItems.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-amber-200">
                                <div className="font-black text-amber-800">{item.name}</div>
                                <div className="text-sm text-amber-600">
                                    متوفر: {item.currentStock} {item.unit} • الحد الأدنى: {item.minStock} {item.unit}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-800">قائمة المخزون</h3>
                </div>
                {filteredInventory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-right font-black text-slate-600">الصنف</th>
                                    <th className="px-6 py-4 text-right font-black text-slate-600">الفئة</th>
                                    <th className="px-6 py-4 text-right font-black text-slate-600">الكمية الحالية</th>
                                    <th className="px-6 py-4 text-right font-black text-slate-600">الحد الأدنى</th>
                                    <th className="px-6 py-4 text-right font-black text-slate-600">المورد</th>
                                    <th className="px-6 py-4 text-right font-black text-slate-600">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-800">{item.name}</div>
                                            {item.notes && <div className="text-xs text-slate-400 mt-1">{item.notes}</div>}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-600">{item.category}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.currentStock}
                                                    onChange={(e) => updateStock(item.id, parseInt(e.target.value) || 0)}
                                                    className={`w-20 h-8 text-center border rounded-lg font-bold ${item.currentStock <= item.minStock
                                                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                                                            : 'border-slate-200 bg-white text-slate-700'
                                                        }`}
                                                />
                                                <span className="text-slate-400">{item.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-600">{item.minStock} {item.unit}</td>
                                        <td className="px-6 py-4 font-bold text-slate-600">{item.supplier || '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl text-sm hover:bg-slate-200 transition-colors"
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="bg-rose-100 text-rose-600 font-black px-4 py-2 rounded-xl text-sm hover:bg-rose-200 transition-colors"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center text-slate-400 font-bold">لا توجد أصناف في المخزون</div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black text-slate-800 mb-6">
                            {editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم الصنف</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الفئة</label>
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الكمية الحالية</label>
                                    <input
                                        type="number"
                                        value={form.currentStock}
                                        onChange={(e) => setForm({ ...form, currentStock: parseInt(e.target.value) || 0 })}
                                        className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الحد الأدنى</label>
                                    <input
                                        type="number"
                                        value={form.minStock}
                                        onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })}
                                        className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الوحدة</label>
                                    <input
                                        type="text"
                                        value={form.unit}
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                                        placeholder="علبة، قارورة..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">المورد</label>
                                <input
                                    type="text"
                                    value={form.supplier}
                                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                                    className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ملاحظات</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full h-24 bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-700 resize-none"
                                    placeholder="أضف ملاحظات حول الصنف..."
                                />
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button type="submit" className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all">
                                    {editingItem ? 'حفظ التغييرات' : 'إضافة الصنف'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-black h-14 rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}