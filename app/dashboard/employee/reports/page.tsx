"use client";

import { useEffect, useState, useMemo } from "react";
import { getBills, getAppointments, Bill, Appointment } from "../../../lib/data";
import { getAllUsers } from "../../../lib/auth";

export default function EmployeeDailyReports() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setBills(getBills());
      setAppointments(getAppointments());
      const users = await getAllUsers();
      setPatients(users.filter((u: any) => u.role === 'patient'));
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const todayBills = bills.filter(b => b.date === today && b.status === 'paid');
    const todayAppointments = appointments.filter(a => a.date === today);
    const newPatientsToday = patients.filter(p => true); // In a real app, we'd check registration date
    
    return {
      revenue: todayBills.reduce((s, b) => s + b.total, 0),
      appointmentsCount: todayAppointments.length,
      completedApps: todayAppointments.filter(a => a.status === 'completed').length,
      unpaidAmount: bills.filter(b => b.date === today && b.status === 'unpaid').reduce((s, b) => s + b.total, 0),
    };
  }, [bills, appointments, patients, today]);

  const todayActivities = useMemo(() => {
    const activities = [
        ...bills.filter(b => b.date === today).map(b => ({ type: 'bill', time: 'جديد', data: b })),
        ...appointments.filter(a => a.date === today).map(a => ({ type: 'appointment', time: a.time, data: a }))
    ];
    return activities;
  }, [bills, appointments, today]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800">التقرير اليومي</h2>
        <p className="text-slate-400 font-bold text-sm mt-1">ملخص النشاط المالي والطبي ليوم <span className="text-primary">{today}</span></p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'إيرادات اليوم المحصلة', value: stats.revenue, sub: 'ر.س', icon: '💰', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'إجمالي مواعيد اليوم', value: stats.appointmentsCount, sub: 'موعد', icon: '📅', color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'مواعيد مكتملة', value: stats.completedApps, sub: 'موعد', icon: '✅', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'مبالغ بانتظار التحصيل', value: stats.unpaidAmount, sub: 'ر.س', icon: '⏳', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((s, i) => (
          <div key={i} className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-xl ${s.bg} flex flex-col justify-between`}>
             <div className="text-4xl mb-4">{s.icon}</div>
             <div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value.toLocaleString()} <span className="text-sm">{s.sub}</span></div>
                <div className="text-[10px] font-black text-slate-400 uppercase mt-1">{s.label}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Status View */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">مواعيد اليوم</h3>
                <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black">تفصيلي</span>
            </div>
            {appointments.filter(a => a.date === today).length === 0 ? (
                <div className="p-20 text-center text-slate-300 font-bold">لا توجد مواعيد اليوم</div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {appointments.filter(a => a.date === today).map(app => (
                        <div key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="font-black text-slate-700">{app.time}</div>
                                <div>
                                    <div className="font-bold text-slate-800">{app.patientName}</div>
                                    <div className="text-xs text-slate-400">{app.doctor}</div>
                                </div>
                            </div>
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg ${app.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {app.status === 'completed' ? 'تم الانتهاء' : 'بانتظار الإتمام'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Financial Activity View */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">نشاط الفواتير</h3>
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black">مالي</span>
            </div>
            {bills.filter(b => b.date === today).length === 0 ? (
                <div className="p-20 text-center text-slate-300 font-bold">لا يوجد نشاط مالي اليوم</div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {bills.filter(b => b.date === today).map(bill => (
                        <div key={bill.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                            <div>
                                <div className="font-bold text-slate-800">{bill.patientName}</div>
                                <div className="text-xs text-slate-400">{bill.serviceName}</div>
                            </div>
                            <div className="text-right">
                                <div className={`font-black ${bill.status === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {bill.total.toLocaleString()} ر.س
                                </div>
                                <div className="text-[10px] font-bold text-slate-300 uppercase">{bill.status === 'paid' ? 'تم التحصيل' : 'لم يتم الدفع'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
