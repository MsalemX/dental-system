"use client";

import { useEffect, useState } from "react";
import { getMedicalRecords, MedicalRecord } from "../../../lib/data";
import { getSession } from "../../../lib/auth";

export default function PatientMedicalFile() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (session) {
      const allRecords = getMedicalRecords();
      setRecords(allRecords.filter(r => r.patientId === session.id));
    }
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div>
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">ملفي الطبي</h2>
        <p className="text-slate-400 font-bold mt-2">تاريخك العلاجي والتشخيصات والتقارير الطبية</p>
      </div>

      <div className="grid gap-8">
        {records.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] text-center border-2 border-dashed border-slate-100">
            <div className="text-5xl mb-6">📂</div>
            <div className="text-slate-400 font-black text-xl italic uppercase tracking-widest">لا توجد سجلات طبية مسجلة حالياً</div>
          </div>
        ) : (
          records.map((rec) => (
            <div key={rec.id} className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
              <div className="bg-slate-50 p-10 md:w-80 flex flex-col justify-between border-l border-slate-100 shrink-0">
                <div>
                   <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">تاريخ الزيارة</div>
                   <div className="text-xl font-black text-slate-800 mb-6">{rec.date}</div>
                   
                   <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">الطبيب المعالج</div>
                   <div className="font-black text-slate-700">{rec.doctorName}</div>
                </div>
                <div className="mt-8">
                   <span className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase">سجل طبي معتمد</span>
                </div>
              </div>
              
              <div className="p-10 flex-1 space-y-8">
                <div>
                  <h4 className="flex items-center gap-3 text-lg font-black text-slate-800 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">🩺</span>
                    التشخيص الطبي
                  </h4>
                  <div className="bg-slate-50 p-6 rounded-3xl font-bold text-slate-600 leading-relaxed">
                    {rec.diagnosis}
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-3 text-lg font-black text-slate-800 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">✨</span>
                    الخطة العلاجية والنتائج
                  </h4>
                  <p className="font-bold text-slate-500 leading-relaxed pr-4 border-r-4 border-slate-100">
                    {rec.treatment}
                  </p>
                </div>

                {rec.procedures && rec.procedures.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">الإجراءات المضمنة</h4>
                    <div className="flex flex-wrap gap-2">
                       {rec.procedures.map((p, i) => (
                         <span key={i} className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm">{p.service}</span>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
