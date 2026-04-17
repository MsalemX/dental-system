"use client";

import { useEffect, useState } from "react";
import { getAllUsers, adminAddUser, adminUpdateUser, deleteUser, toggleUserStatus, UserRole, User } from "../../lib/auth";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor' as UserRole,
    specialty: '',
    password: ''
  });

  const refreshUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdUser = await adminAddUser(formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', role: 'doctor', specialty: '', password: '' });
      await refreshUsers();
      if ((createdUser as any).temporaryPassword) {
        alert(`تم إنشاء الحساب بنجاح.\nكلمة المرور المؤقتة: ${(createdUser as any).temporaryPassword}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await adminUpdateUser(currentUser.id, formData);
      setIsEditModalOpen(false);
      setCurrentUser(null);
      await refreshUsers();
    }
  };

  const openEditModal = (user: any) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      specialty: user.specialty || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      await deleteUser(id);
      setDeletingId(null);
      await refreshUsers();
    } else {
      setDeletingId(id);
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleUserStatus(id);
    await refreshUsers();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary text-xl">👥</div>
            <span className="text-emerald-500 font-bold text-xs">+12%</span>
          </div>
          <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">إجمالي المرضى</h4>
          <div className="text-3xl font-black text-slate-800 mt-2">{users.filter(u => u.role === 'patient').length}</div>
        </div>
        
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary text-xl">👨‍⚕️</div>
            <span className="text-emerald-500 font-bold text-xs">نشط</span>
          </div>
          <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">الأطباء</h4>
          <div className="text-3xl font-black text-slate-800 mt-2">{users.filter(u => u.role === 'doctor').length}</div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 text-xl">💳</div>
            <span className="text-rose-500 font-bold text-xs">-3%</span>
          </div>
          <h4 className="text-slate-400 font-bold text-xs uppercase tracking-widest">إيرادات الشهر</h4>
          <div className="text-3xl font-black text-slate-800 mt-2">0 ر.ي</div>
        </div>

        <div className="bg-primary p-8 rounded-[3rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden">
          <div className="relative z-10 text-3xl font-black mb-2">98%</div>
          <h4 className="relative z-10 text-white/70 font-bold text-xs uppercase tracking-widest">رضا العملاء</h4>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
                <h3 className="text-2xl font-black text-slate-800">إدارة الكادر الطبي والموظفين</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">يمكنك إضافة، تعديل أو تعطيل حسابات الموظفين والأطباء</p>
            </div>
            <button 
                onClick={() => {
                    setFormData({ name: '', email: '', phone: '', role: 'doctor', specialty: '', password: '' });
                    setIsAddModalOpen(true);
                }}
                className="bg-primary text-white font-black px-8 py-4 rounded-[1.5rem] shadow-lg shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
            >
                <span className="text-xl">➕</span>
                إضافة مستخدم جديد
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <div key={user.id} className={`p-8 rounded-[2.5rem] border transition-all group relative overflow-hidden ${user.status === 'inactive' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50'}`}>
                {user.status === 'inactive' && (
                    <div className="absolute top-4 left-4 bg-rose-100 text-rose-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10">
                        معطل
                    </div>
                )}
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl uppercase ${user.role === 'admin' ? 'bg-amber-100 text-amber-600' : user.role === 'doctor' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-lg leading-tight">{user.name}</div>
                      <div className="text-xs text-slate-400 font-bold mt-1">
                        {user.role === 'doctor' ? 'طبيب متخصص' : user.role === 'employee' ? 'موظف استقبال' : user.role === 'admin' ? 'مدير النظام' : 'مريض'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                        <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">📧</span>
                        {user.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                        <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">📱</span>
                        {user.phone || '—'}
                    </div>
                    {user.role === 'doctor' && (
                        <div className="flex items-center gap-3 text-sm font-bold text-primary">
                            <span className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">🦷</span>
                            {user.specialty || 'طبيب عام'}
                        </div>
                    )}
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-slate-50">
                   <button 
                    onClick={() => openEditModal(user)}
                    className="flex-1 bg-slate-100 text-slate-600 font-black py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
                   >
                     تعديل
                   </button>
                   <button 
                    onClick={() => handleToggleStatus(user.id)}
                    className={`flex-1 font-black py-3 rounded-xl transition-all text-sm ${user.status === 'inactive' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
                   >
                     {user.status === 'inactive' ? 'تفعيل' : 'تعطيل'}
                   </button>
                   <button 
                    onClick={() => handleDelete(user.id)}
                    className={`h-11 px-4 flex items-center justify-center rounded-xl transition-all font-black text-xs ${deletingId === user.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-rose-50'}`}
                   >
                     {deletingId === user.id ? 'حذف؟' : '🗑️'}
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b border-slate-50">
                    <h3 className="text-2xl font-black text-slate-800">{isAddModalOpen ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}</h3>
                    <p className="text-slate-400 font-bold text-sm mt-1">يرجى ملء كافة البيانات المطلوبة لضمان عمل النظام بشكل صحيح</p>
                </div>

                <form onSubmit={isAddModalOpen ? handleAddUser : handleEditUser} className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                            <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                placeholder="محمد علي..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">رقم الجوال</label>
                            <input 
                                required
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                placeholder="05xxxxxxxx"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                        <input 
                            required
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            placeholder="user@juman.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الرتبة</label>
                            <select 
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                                className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all appearance-none"
                            >
                                <option value="doctor">طبيب</option>
                                <option value="employee">موظف استقبال</option>
                                <option value="patient">مريض</option>
                                <option value="admin">مدير نظام</option>
                            </select>
                        </div>
                        {formData.role === 'doctor' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التخصص</label>
                                <input 
                                    type="text" 
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                    placeholder="تقويم أسنان..."
                                />
                            </div>
                        )}
                    </div>

                    {isAddModalOpen && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">كلمة المرور المؤقتة</label>
                            <input 
                                type="password" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                                placeholder="اتركها للحصول على كلمة افتراضية..."
                            />
                        </div>
                    )}

                    <div className="flex gap-4 pt-6">
                        <button 
                            type="submit"
                            className="flex-1 h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all"
                        >
                            {isAddModalOpen ? 'حفظ الحساب الجديد' : 'تحديث البيانات'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
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

