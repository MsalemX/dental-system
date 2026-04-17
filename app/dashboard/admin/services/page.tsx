"use client";

import { useEffect, useState } from "react";
import { getServices, addService, updateService, deleteService, DentalService } from "../../../lib/services";

export default function ServicesManagement() {
  const [services, setServices] = useState<DentalService[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<DentalService | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 30,
    description: ''
  });

  const refreshServices = () => {
    setServices(getServices());
  };

  useEffect(() => {
    refreshServices();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, formData);
    } else {
      addService(formData);
    }
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', price: 0, duration: 30, description: '' });
    refreshServices();
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({ name: '', price: 0, duration: 30, description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (service: DentalService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      deleteService(id);
      setDeletingId(null);
      refreshServices();
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة الخدمات</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">تحديد إجراءات العيادة، الأسعار، ومدد المواعيد</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="bg-primary text-white font-black px-8 py-4 rounded-[1.5rem] shadow-lg shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="text-xl">🦷</span>
          إضافة خدمة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl">
                🦷
              </div>
              <div className="text-left">
                <span className="text-2xl font-black text-primary">{service.price}</span>
                <span className="text-xs font-bold text-slate-400 mr-1">ر.ي</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800">{service.name}</h3>
              <p className="text-slate-400 font-bold text-sm mt-2 line-clamp-2">{service.description || 'لا يوجد وصف متاح'}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-black text-slate-500">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                <span>🕒</span>
                {service.duration} دقيقة
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-50">
              <button 
                onClick={() => openEditModal(service)}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
              >
                تعديل
              </button>
              <button 
                onClick={() => handleDelete(service.id)}
                className={`flex-1 font-black py-3 rounded-xl transition-all text-sm ${deletingId === service.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
              >
                {deletingId === service.id ? 'حذف؟' : 'حذف'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">{editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h3>
              <p className="text-slate-400 font-bold text-sm mt-1">يرجى ملء تفاصيل الخدمة بدقة ليراها المرضى عند الحجز</p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">اسم الخدمة</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                  placeholder="مثال: تنظيف وتلميع..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">السعر (ر.ي)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">المدة (بالدقائق)</label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none"
                  >
                    {[15, 30, 45, 60, 90, 120].map(m => (
                      <option key={m} value={m}>{m} دقيقة</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">وصف الخدمة</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border-0 rounded-2xl p-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                  placeholder="اشرح ما تشمله هذه الخدمة..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="submit"
                  className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all"
                >
                  {editingService ? 'تحديث الخدمة' : 'حفظ الخدمة'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
