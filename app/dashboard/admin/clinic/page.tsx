"use client";

import { useEffect, useState } from "react";
import { getClinicSettings, updateClinicSettings, getRooms, addRoom, deleteRoom, assignDoctorToRoom, ClinicSettings, Room } from "../../../lib/clinic";
import { getAllUsers } from "../../../lib/auth";

export default function ClinicManagement() {
  const [activeTab, setActiveTab] = useState<'settings' | 'rooms'>('settings');
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setSettings(getClinicSettings());
      setRooms(getRooms());
      
      const allUsers = await getAllUsers();
      const allDoctors = allUsers.filter((u: any) => u.role === 'doctor');
      setDoctors(allDoctors);
    };
    fetchData();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      setIsSaving(true);
      updateClinicSettings(settings);
      setTimeout(() => {
        setIsSaving(false);
        alert('تم حفظ الإعدادات بنجاح');
      }, 500);
    }
  };

  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      addRoom(newRoomName);
      setNewRoomName('');
      setRooms(getRooms());
    }
  };

  const handleDeleteRoom = (id: string) => {
    if (deletingRoomId === id) {
      deleteRoom(id);
      setDeletingRoomId(null);
      setRooms(getRooms());
    } else {
      setDeletingRoomId(id);
      setTimeout(() => setDeletingRoomId(null), 3000);
    }
  };

  const handleAssignDoctor = (roomId: string, doctorId: string) => {
    assignDoctorToRoom(roomId, doctorId === 'none' ? undefined : doctorId);
    setRooms(getRooms());
  };

  const updateWorkingHour = (index: number, field: string, value: any) => {
    if (settings) {
      const newHours = [...settings.workingHours];
      newHours[index] = { ...newHours[index], [field]: value };
      setSettings({ ...settings, workingHours: newHours });
    }
  };

  if (!settings) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">إدارة العيادة</h2>
          <p className="text-slate-400 font-bold text-sm mt-1">تحديد إعدادات العيادة، أوقات العمل، وإدارة الغرف والأطباء</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
          >
            ⚙️ إعدادات العيادة
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === 'rooms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
          >
            🏢 إدارة الغرف
          </button>
        </div>
      </div>

      <div className="grid gap-8">
        {activeTab === 'settings' ? (
          <form onSubmit={handleSaveSettings} className="grid lg:grid-cols-3 gap-8">
            {/* General Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-lg">📝</span>
                  المعلومات الأساسية
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">اسم العيادة</label>
                    <input 
                      required
                      type="text" 
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">رقم هاتف العيادة</label>
                    <input 
                      required
                      type="text" 
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">العنوان بالتفصيل</label>
                    <input 
                      required
                      type="text" 
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">شعار العيادة (Logo)</label>
                    <div className="flex gap-4 items-center">
                      <label className="flex-1 cursor-pointer">
                        <div className="h-14 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-2xl px-6 flex items-center gap-3 transition-all group">
                          <span className="text-xl">📁</span>
                          <span className="font-bold text-slate-500 text-sm group-hover:text-primary transition-all">
                            {settings.logo && settings.logo.startsWith('data:') ? 'تم رفع الشعار ✔️' : 'اضغط لرفع صورة الشعار'}
                          </span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => setSettings({...settings, logo: ev.target?.result as string});
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200 shrink-0">
                        {settings.logo ? <img src={settings.logo} alt="Logo" className="max-w-full max-h-full object-contain" /> : <span className="text-2xl">🏥</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary text-lg">🕒</span>
                  أوقات العمل الأسبوعية
                </h3>
                
                <div className="space-y-4">
                  {settings.workingHours.map((wh, idx) => (
                    <div key={wh.day} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${wh.closed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-50 hover:border-primary/20'}`}>
                      <div className="w-24 font-black text-slate-700">{wh.day}</div>
                      
                      <div className="flex items-center gap-4">
                        {!wh.closed ? (
                          <>
                            <input 
                              type="time" 
                              value={wh.start}
                              onChange={(e) => updateWorkingHour(idx, 'start', e.target.value)}
                              className="bg-slate-50 border-0 rounded-xl px-3 py-2 font-bold text-slate-600 focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-slate-300 font-bold">إلى</span>
                            <input 
                              type="time" 
                              value={wh.end}
                              onChange={(e) => updateWorkingHour(idx, 'end', e.target.value)}
                              className="bg-slate-50 border-0 rounded-xl px-3 py-2 font-bold text-slate-600 focus:ring-2 focus:ring-primary"
                            />
                          </>
                        ) : (
                          <span className="text-rose-500 font-black text-sm px-10">مغلق (عطلة نهاية الأسبوع)</span>
                        )}
                        
                        <button 
                          type="button"
                          onClick={() => updateWorkingHour(idx, 'closed', !wh.closed)}
                          className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${wh.closed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
                        >
                          {wh.closed ? 'فتح' : 'إغلاق'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Save */}
            <div className="space-y-6">
              <div className="bg-primary p-10 rounded-[3rem] text-white shadow-2xl shadow-primary/30 space-y-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-2">حفظ التغييرات</h4>
                  <p className="text-primary-foreground/70 text-sm font-bold leading-relaxed">
                    تأكد من أن جميع المعلومات المدخلة صحيحة، سيتم تحديث بيانات العيادة فوراً لدى جميع المستخدمين.
                  </p>
                  <button 
                    disabled={isSaving}
                    type="submit"
                    className="w-full mt-8 h-16 bg-white text-primary font-black rounded-2xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </button>
                </div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Add New Room Card */}
            <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-6 hover:border-primary/50 transition-all group">
              <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-all">🏢</div>
              <div className="text-center">
                <h3 className="font-black text-slate-800">إضافة غرفة جديدة</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">إنشاء مساحة عمل للطبيب</p>
              </div>
              <form onSubmit={handleAddRoom} className="w-full space-y-3">
                <input 
                  type="text" 
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="اسم الغرفة (مثل: غرفة 3)"
                  className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary"
                />
                <button 
                  type="submit"
                  className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20"
                >
                  إضافة الآن
                </button>
              </form>
            </div>

            {/* Rooms List */}
            {rooms.map((room) => (
              <div key={room.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6 relative overflow-hidden group">
                <button 
                  onClick={() => handleDeleteRoom(room.id)}
                  className={`absolute top-6 left-6 h-10 px-3 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center transition-all font-black text-[10px] ${deletingRoomId === room.id ? 'bg-rose-500 text-white animate-pulse' : 'opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white'}`}
                >
                  {deletingRoomId === room.id ? 'حذف؟' : '🗑️'}
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary text-2xl">🚪</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{room.name}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">غرفة فحص نشطة</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">الطبيب المسؤول</label>
                  <select 
                    value={room.doctorId || 'none'}
                    onChange={(e) => handleAssignDoctor(room.id, e.target.value)}
                    className="w-full h-14 bg-slate-50 border-0 rounded-2xl px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="none">غير محدد</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                {room.doctorId ? (
                  <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-4 border border-primary/10">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">
                      {doctors.find(d => d.id === room.doctorId)?.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-primary">طبيب معين حالياً</div>
                      <div className="text-sm font-black text-slate-700">{doctors.find(d => d.id === room.doctorId)?.name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 font-bold text-sm border border-dashed border-slate-200">
                    لا يوجد طبيب معين لهذه الغرفة
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
