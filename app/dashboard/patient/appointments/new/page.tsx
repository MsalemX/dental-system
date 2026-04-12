"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addAppointment, getAppointments } from "../../../../lib/data";
import { getSession, getAllUsers } from "../../../../lib/auth";

export default function PatientNewAppointment() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    type: "تقويم أسنان",
    doctor: "",
    date: "",
    time: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      setUser(session);
      
      const drs = await getUsersByRole('doctor');
      setDoctors(drs);
      if (drs.length > 0) setFormData(prev => ({ ...prev, doctor: drs[0].name }));
    };
    init();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    addAppointment({
      patientId: user.id,
      patientName: user.name,
      doctor: formData.doctor,
      date: formData.date,
      time: formData.time,
      status: "pending",
      type: formData.type
    });

    setTimeout(() => {
      router.push("/dashboard/patient");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 rounded-3xl bg-primary/10 text-primary text-3xl mb-4">✨</div>
        <h2 className="text-4xl font-black text-slate-800">حجز موعد جديد</h2>
        <p className="text-slate-400 font-bold max-w-md mx-auto">اختر الخدمة والطبيب المناسب لك، وسنقوم بتأكيد الموعد بأسرع وقت ممكن.</p>
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">نوع الخدمة</label>
            <div className="grid grid-cols-2 gap-4">
               {["تقويم أسنان", "تنظيف وتلميع", "تبييض ليزر", "كشف دوري"].map(t => (
                 <button 
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, type: t})}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${formData.type === t ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">اختيار الطبيب</label>
            <div className="space-y-3">
               {doctors.map(dr => (
                 <button 
                  key={dr.id}
                  type="button"
                  onClick={() => setFormData({...formData, doctor: dr.name})}
                  className={`flex items-center gap-4 w-full p-4 rounded-2xl border-2 transition-all ${formData.doctor === dr.name ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-50 bg-slate-50 opacity-60 hover:opacity-100'}`}
                 >
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-primary border border-slate-100">
                     {dr.name.charAt(3)}
                   </div>
                   <div className="text-right">
                     <div className="font-black text-slate-700 text-sm">{dr.name}</div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase">{dr.specialty || 'طبيب أسنان'}</div>
                   </div>
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">التاريخ المفضل</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full h-16 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الوقت المفضل</label>
            <select 
              required
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              className="w-full h-16 rounded-2xl bg-slate-50 border-none px-6 font-bold text-slate-700 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">اختر الوقت من القائمة...</option>
              <option value="10:00 ص">10:00 صباحاً</option>
              <option value="11:30 ص">11:30 صباحاً</option>
              <option value="01:00 م">01:00 مساءً</option>
              <option value="04:00 م">04:00 مساءً</option>
              <option value="06:30 م">06:30 مساءً</option>
              <option value="08:00 م">08:00 مساءً</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-8">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full h-20 rounded-[2.5rem] bg-slate-800 text-white font-black text-xl shadow-2xl shadow-slate-300 transition-all active:scale-95 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary'}`}
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد طلب الموعد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
