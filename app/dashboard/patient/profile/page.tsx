"use client";

import { useEffect, useState } from "react";
import { getSession, updateUser, User } from "../../../lib/auth";

export default function PatientProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: ''
  });

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      if (session) {
        setUser(session);
        setFormData({
          name: session.name,
          email: session.email,
          phone: session.phone || '',
          age: session.age?.toString() || '',
          gender: session.gender || ''
        });
      }
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(user.id, {
        ...formData,
        age: formData.age
      });

      setIsEditing(false);
      // Refresh local user state
      const updatedUser = await getSession();
      if (updatedUser) setUser(updatedUser);
      alert('تم تحديث البيانات بنجاح ✅');
    } catch (err) {
      alert('حدث خطأ أثناء التحديث');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-8">
        <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-primary/30">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{user.name}</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-sm italic">{user.role === 'patient' ? 'مريض معتمد' : user.role}</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="mr-auto bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            ✏️ تعديل الملف الشخصي
          </button>
        )}
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-12">
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2 mr-2">الاسم الكامل</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2 mr-2">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2 mr-2">رقم الجوال</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    disabled={!isEditing}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all"
                  />
               </div>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2 mr-2">العمر</label>
                    <input 
                      type="number" 
                      value={formData.age} 
                      disabled={!isEditing}
                      onChange={e => setFormData({...formData, age: e.target.value})}
                      className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2 mr-2">الجنس</label>
                    <select 
                      value={formData.gender} 
                      disabled={!isEditing}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                      className="w-full h-16 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-700 mt-0.5 disabled:opacity-60"
                    >
                      <option value="">اختر...</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                 </div>
               </div>
               
               <div className="bg-primary/5 p-8 rounded-3xl mt-8">
                  <h4 className="text-primary font-black text-sm mb-2">🔒 أمن البيانات</h4>
                  <p className="text-[11px] font-semibold text-primary/60 leading-relaxed">
                    يتم تشفير كافة بياناتك الشخصية والطبية وحمايتها وفق معايير الخصوصية الصحية. يمكنك طلب نسخة كاملة من بياناتك من خلال التواصل مع الإدارة.
                  </p>
               </div>
            </div>

            {isEditing && (
              <div className="md:col-span-2 pt-8 flex gap-4">
                <button type="submit" className="flex-1 h-18 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all">حفظ التغييرات ✅</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-12 h-18 bg-slate-100 text-slate-400 font-black rounded-2xl">إلغاء</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
