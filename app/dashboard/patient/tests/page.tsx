"use client";

import { useState } from "react";

export default function PatientTests() {
  const [files] = useState([
    { id: 1, name: 'أشعة بانورامية كاملة', date: '2026-03-10', type: 'X-RAY', size: '4.2 MB', icon: '🦴' },
    { id: 2, name: 'نتائج فحص اللثة', date: '2026-03-10', type: 'REPORT', size: '1.5 MB', icon: '📊' },
    { id: 3, name: 'خطة علاج التقويم المقترحة', date: '2026-02-15', type: 'PDF', size: '2.8 MB', icon: '📝' },
    { id: 4, name: 'صور فورية قبل العلاج', date: '2026-02-15', type: 'IMAGE', size: '12 MB', icon: '📸' },
  ]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">نتائج الفحوصات</h2>
          <p className="text-slate-400 font-bold mt-2">الأشعة الرقمية، التقارير المخبرية، والملفات المرفقة</p>
        </div>
        <div className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm text-xs font-black text-slate-300 uppercase italic">
          {files.length} ملف متاح
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {files.map((file) => (
          <div key={file.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group flex items-start gap-6">
            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">
               {file.icon}
            </div>
            
            <div className="flex-1 space-y-1">
               <div className="text-[10px] font-black text-primary uppercase tracking-widest">{file.type}</div>
               <h3 className="text-lg font-black text-slate-800">{file.name}</h3>
               <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span>📅 {file.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                  <span>📦 {file.size}</span>
               </div>
               
               <div className="pt-6 flex gap-3">
                  <button className="flex-1 h-12 rounded-2xl bg-slate-800 text-white font-black text-xs hover:bg-black transition-all">معاينة الملف</button>
                  <button className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all">⬇️</button>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 p-12 rounded-[4rem] border border-amber-100 text-center space-y-4">
         <div className="text-amber-500 text-4xl">🔬</div>
         <h4 className="text-xl font-black text-amber-900">هل تنتظر نتائج جديدة؟</h4>
         <p className="text-amber-700/70 font-bold text-sm max-w-lg mx-auto leading-relaxed">
           يتم تحديث الفحوصات المخبرية وتصوير الأشعة تلقائياً هنا بمجرد صدورها من المختبر أو الطبيب. إذا كان لديك استفسار، يرجى التواصل مع الاستقبال.
         </p>
      </div>
    </div>
  );
}
