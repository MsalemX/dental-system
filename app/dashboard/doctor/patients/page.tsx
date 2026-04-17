"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointments, getMedicalRecords, addMedicalRecord, updateMedicalRecord, MedicalRecord, Appointment, MedicalProcedure } from "../../../lib/data";
import { getSession, User } from "../../../lib/auth";

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ id: "", diagnosis: "", treatment: "", notes: "", procedures: [] as MedicalProcedure[] });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      setUser(session);
      setAppointments(getAppointments());
      setRecords(getMedicalRecords());
    };
    init();
  }, []);

  const refreshRecords = () => setRecords(getMedicalRecords());

  // Extract unique patients the doctor has diagnosed or seen
  const patients = useMemo(() => {
    if (!user) return [];
    const myApps = appointments.filter(a => a.doctor === user.name);
    const myRecs = records.filter(r => r.doctorName === user.name);
    const uniqueNames = new Set([...myApps.map(a => a.patientName), ...myRecs.map(r => r.patientName)]);
    return Array.from(uniqueNames).map(name => {
      const pApps = myApps.filter(a => a.patientName === name);
      const pRecs = myRecs.filter(r => r.patientName === name);
      return {
        name,
        lastVisit: pApps.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || 'غير محدد',
        totalVisits: pApps.length,
        recordsCount: pRecs.length,
      };
    });
  }, [user, appointments, records]);

  const selectedPatientRecords = useMemo(() => {
    if (!selectedPatientName) return [];
    return records
      .filter(r => r.patientName === selectedPatientName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedPatientName, records]);

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPatientName) return;

    if (isEditing && formData.id) {
      updateMedicalRecord(formData.id, {
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        procedures: formData.procedures,
      });
    } else {
      addMedicalRecord({
        patientId: 'patient', // Mock, normally matching patient ID
        patientName: selectedPatientName,
        doctorId: user.id,
        doctorName: user.name,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        procedures: formData.procedures,
      });
    }
    setFormData({ id: "", diagnosis: "", treatment: "", notes: "", procedures: [] });
    setIsEditing(false);
    refreshRecords();
  };

  const openEdit = (rec: MedicalRecord) => {
    setIsEditing(true);
    setFormData({ id: rec.id, diagnosis: rec.diagnosis, treatment: rec.treatment, notes: rec.notes, procedures: rec.procedures || [] });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ id: "", diagnosis: "", treatment: "", notes: "", procedures: [] });
  };

  const addProcedureField = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [...prev.procedures, { id: Date.now().toString(), service: '', price: 0, notes: '' }]
    }));
  };

  const updateProcedureField = (index: number, field: keyof MedicalProcedure, value: any) => {
    const newProcs = [...formData.procedures];
    newProcs[index] = { ...newProcs[index], [field]: value };
    setFormData(prev => ({ ...prev, procedures: newProcs }));
  };

  const removeProcedureField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* Patient List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 min-h-[600px]">
          <h2 className="text-2xl font-black text-slate-800 mb-6">مرضاك المستفيدين</h2>
          <div className="space-y-3">
            {patients.length > 0 ? patients.map(p => (
              <button
                key={p.name}
                onClick={() => { setSelectedPatientName(p.name); cancelEdit(); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  selectedPatientName === p.name ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${selectedPatientName === p.name ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <div className={`font-black ${selectedPatientName === p.name ? 'text-white' : 'text-slate-800'}`}>{p.name}</div>
                    <div className={`text-[10px] font-bold ${selectedPatientName === p.name ? 'text-white/70' : 'text-slate-400'}`}>
                      آخر زيارة: {p.lastVisit}
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-black px-3 py-1 rounded-lg ${selectedPatientName === p.name ? 'bg-white/20' : 'bg-emerald-100 text-emerald-600'}`}>
                  {p.recordsCount} سجل
                </div>
              </button>
            )) : (
              <div className="text-center py-10 text-slate-400 font-bold text-sm">لم تقم بمعاينة أي مريض بعد.</div>
            )}
          </div>
        </div>
      </div>

      {/* Record Management */}
      <div className="lg:col-span-2 space-y-8">
        {!selectedPatientName ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="font-black text-slate-400 text-xl">اختر مريضاً לעرض التاريخ الطبي</h3>
            </div>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-3xl">
                  {selectedPatientName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">الملف الطبي: {selectedPatientName}</h2>
                  <span className="text-sm font-bold text-slate-400">{selectedPatientRecords.length} زيارات مسجلة</span>
                </div>
              </div>
              <button 
                onClick={() => cancelEdit()}
                className="bg-primary/10 text-primary font-black px-5 py-3 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                + إضافة سجل جديد
              </button>
            </div>

            {/* Record Form */}
            <div className="bg-white p-8 rounded-[3rem] border border-primary/20 shadow-xl shadow-primary/5">
              <h3 className="text-xl font-black text-slate-800 mb-6">{isEditing ? 'تعديل السجل الطبي' : 'جلسة طبية جديدة'}</h3>
              <form onSubmit={handleSaveRecord} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">التشخيص (Diagnosis)</label>
                  <input
                    required
                    type="text"
                    value={formData.diagnosis}
                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="مثال: تسوس سطحي في السن الضاحك الأول"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">العلاج المقدم (Treatment)</label>
                  <input
                    required
                    type="text"
                    value={formData.treatment}
                    onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                    placeholder="مثال: تنظيف وإزالة التسوس ووضع حشوة تجميلية"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">ملاحظات طبية (Notes)</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="تعليمات للمريض، حساسية للادوية، الخ..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 min-h-[100px] transition-all"
                  />
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-800">الإجراءات الطبية المنجزة</label>
                    <button type="button" onClick={addProcedureField} className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                      + إضافة إجراء
                    </button>
                  </div>
                  {formData.procedures.map((proc, idx) => (
                    <div key={proc.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                      <button type="button" onClick={() => removeProcedureField(idx)} className="absolute top-2 left-2 w-6 h-6 bg-white text-rose-500 rounded-full flex items-center justify-center text-xs font-black shadow-sm hidden group-hover:flex hover:bg-rose-50 border border-slate-100">✕</button>
                      
                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">اسم الخدمة</label>
                        <input type="text" required placeholder="مثال: حشو عصب" value={proc.service} onChange={(e) => updateProcedureField(idx, 'service', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-primary" />
                      </div>
                      
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">السعر (ر.ي)</label>
                        <input type="number" required min="0" value={proc.price === 0 ? '' : proc.price} onChange={(e) => updateProcedureField(idx, 'price', Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-primary" />
                      </div>

                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">ملاحظات الإجراء</label>
                        <input type="text" placeholder="مثال: الضرس العلوي الأيمن" value={proc.notes} onChange={(e) => updateProcedureField(idx, 'notes', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-primary" />
                      </div>
                    </div>
                  ))}
                  {formData.procedures.length > 0 && (
                    <div className="flex justify-start pt-2">
                       <span className="text-xs font-bold text-slate-400">إجمالي الفاتورة المتوقعة: <span className="text-primary font-black ml-1 block mt-1">{formData.procedures.reduce((acc, curr) => acc + (curr.price || 0), 0)} ر.ي</span></span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all">
                    {isEditing ? 'حفظ التعديلات' : 'حفظ السجل الجديد'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={cancelEdit} className="bg-slate-100 text-slate-500 font-black px-8 py-4 rounded-2xl hover:bg-slate-200 transition-all">
                      إلغاء التعديل
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Medical History Timeline */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
              <h3 className="text-xl font-black text-slate-800 mb-8">التاريخ الطبي (Medical History)</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {selectedPatientRecords.length > 0 ? selectedPatientRecords.map((rec, i) => (
                  <div key={rec.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-hover:bg-primary group-hover:text-white text-slate-500 font-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm transition-all z-10">
                      {selectedPatientRecords.length - i}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-lg transition-all group-hover:-translate-y-1 group-odd:bg-primary/5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-black text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100">{rec.date}</span>
                        <button onClick={() => openEdit(rec)} className="text-[10px] font-black text-primary hover:underline">تعديل ✎</button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">التشخيص</span>
                          <p className="font-bold text-slate-700 text-sm">{rec.diagnosis}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">العلاج</span>
                          <p className="font-bold text-primary text-sm">{rec.treatment}</p>
                        </div>
                        {rec.notes && (
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">ملاحظات</span>
                            <p className="font-medium text-slate-600 text-xs italic">"{rec.notes}"</p>
                          </div>
                        )}
                        {rec.procedures && rec.procedures.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">الإجراءات المنفذة</span>
                            <div className="space-y-2">
                              {rec.procedures.map((p, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                  <div>
                                    <div className="font-bold text-sm text-slate-700">{p.service}</div>
                                    {p.notes && <div className="text-[10px] text-slate-400 font-bold">{p.notes}</div>}
                                  </div>
                                  <div className="font-black text-primary text-xs shrink-0">{p.price} ر.ي</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">بواسطة:</span>
                        <span className="text-xs font-black text-slate-600">{rec.doctorName}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 font-bold text-slate-300 italic relative z-10 bg-white shadow-[0_0_20px_10px_white]">لا يوجد تاريخ طبي مسجل لهذا المريض بعد.</div>
                )}
              </div>
            </div>
            
          </>
        )}
      </div>

    </div>
  );
}
