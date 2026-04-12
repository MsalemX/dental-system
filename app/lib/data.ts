import { addNotification } from './notifications';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'arrived' | 'consulting' | 'completed' | 'cancelled' | 'no-show';
  type: string;
}

export interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  amount: number;      // base price
  discount: number;    // discount amount
  total: number;       // amount - discount
  status: 'unpaid' | 'paid';
  date: string;
  notes?: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'app_1', patientId: 'patient', patientName: 'فهد المريض', doctor: 'د. سارة محمود', date: '2026-04-15', time: '10:30 ص', status: 'confirmed', type: 'تقويم أسنان' },
  { id: 'app_2', patientId: 'patient', patientName: 'فهد المريض', doctor: 'د. ياسر العتيبي', date: '2026-03-02', time: '04:15 م', status: 'completed', type: 'كشف دوري' },
];

const INITIAL_BILLS: Bill[] = [
  { id: 'bill_1', patientId: 'patient', patientName: 'فهد المريض', doctorName: 'د. سارة محمود', serviceName: 'تقويم أسنان', amount: 500, discount: 0, total: 500, status: 'unpaid', date: '2026-04-15' },
];

export const getAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  const stored = localStorage.getItem('juman_appointments');
  return stored ? JSON.parse(stored) : INITIAL_APPOINTMENTS;
};

export const addAppointment = (app: Omit<Appointment, 'id'>) => {
  const apps = getAppointments();
  const newApp = { ...app, id: `app_${Date.now()}` };
  const updatedApps = [newApp, ...apps];
  localStorage.setItem('juman_appointments', JSON.stringify(updatedApps));
  // Trigger notification
  if (typeof window !== 'undefined') {
    addNotification({ type: 'appointment_new', title: 'موعد جديد', message: `تم حجز موعد لـ ${app.patientName} مع ${app.doctor} في ${app.date}` });
  }
  return newApp;
};

export const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
  const apps = getAppointments();
  const updated = apps.map(a => a.id === id ? { ...a, status } : a);
  localStorage.setItem('juman_appointments', JSON.stringify(updated));
  
  // Notify on cancellation
  if (status === 'cancelled' && typeof window !== 'undefined') {
    const app = apps.find(a => a.id === id);
    if (app) addNotification({ type: 'appointment_cancelled', title: 'إلغاء موعد', message: `تم إلغاء موعد ${app.patientName} مع ${app.doctor} في ${app.date}` });
  }

  // If completed, generate a bill automatically
  if (status === 'completed') {
    const app = apps.find(a => a.id === id);
    if (app) addBill({ 
      patientId: app.patientId, 
      patientName: app.patientName, 
      doctorName: app.doctor,
      serviceName: 'كشفية/استشارة',
      amount: 250, 
      discount: 0,
      total: 250,
      status: 'unpaid', 
      date: new Date().toISOString().split('T')[0] 
    });
  }
};

export const updateAppointment = (id: string, data: Partial<Appointment>) => {
  const apps = getAppointments();
  const updated = apps.map(a => a.id === id ? { ...a, ...data } : a);
  localStorage.setItem('juman_appointments', JSON.stringify(updated));
};

export const deleteAppointment = (id: string) => {
  const apps = getAppointments();
  const updated = apps.filter(a => a.id !== id);
  localStorage.setItem('juman_appointments', JSON.stringify(updated));
};


export const getBills = (): Bill[] => {
  if (typeof window === 'undefined') return INITIAL_BILLS;
  const stored = localStorage.getItem('juman_bills');
  return stored ? JSON.parse(stored) : INITIAL_BILLS;
};

export const addBill = (bill: Omit<Bill, 'id'>) => {
  const bills = getBills();
  const newBill = { ...bill, id: `bill_${Date.now()}` };
  localStorage.setItem('juman_bills', JSON.stringify([newBill, ...bills]));
  return newBill;
};


export const payBill = (id: string) => {
  const bills = getBills();
  const bill = bills.find(b => b.id === id);
  const updated = bills.map(b => b.id === id ? { ...b, status: 'paid' as const } : b);
  localStorage.setItem('juman_bills', JSON.stringify(updated));
  // Trigger notification
  if (bill && typeof window !== 'undefined') {
    addNotification({ type: 'bill_paid', title: 'تم الدفع ✅', message: `دفع ${bill.patientName} فاتورة ${bill.serviceName} بقيمة ${bill.total} ر.س` });
  }
};


export const updateBill = (id: string, data: Partial<Bill>) => {
  const bills = getBills();
  const updated = bills.map(b => b.id === id ? { ...b, ...data } : b);
  localStorage.setItem('juman_bills', JSON.stringify(updated));
};

export const deleteBill = (id: string) => {
  const bills = getBills();
  const updated = bills.filter(b => b.id !== id);
  localStorage.setItem('juman_bills', JSON.stringify(updated));
};

export interface MedicalProcedure {
  id: string;
  service: string;
  price: number;
  notes: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  procedures?: MedicalProcedure[];
}

export const getMedicalRecords = (): MedicalRecord[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('juman_records');
  return stored ? JSON.parse(stored) : [];
};

export const addMedicalRecord = (record: Omit<MedicalRecord, 'id' | 'date'>) => {
  const records = getMedicalRecords();
  const newRecord: MedicalRecord = {
    ...record,
    id: `rec_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };
  localStorage.setItem('juman_records', JSON.stringify([newRecord, ...records]));

  if (newRecord.procedures?.length) {
    newRecord.procedures.forEach(proc => {
      addBill({
        patientId: newRecord.patientId,
        patientName: newRecord.patientName,
        doctorName: newRecord.doctorName,
        serviceName: proc.service,
        amount: Number(proc.price),
        discount: 0,
        total: Number(proc.price),
        status: 'unpaid',
        date: newRecord.date,
        notes: proc.notes
      });
    });
  }

  return newRecord;
};

export const updateMedicalRecord = (id: string, data: Partial<MedicalRecord>) => {
  const records = getMedicalRecords();
  const updated = records.map(r => r.id === id ? { ...r, ...data } : r);
  localStorage.setItem('juman_records', JSON.stringify(updated));
};
