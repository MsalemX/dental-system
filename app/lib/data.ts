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
  status: 'unpaid' | 'paid' | 'installment';
  date: string;
  notes?: string;
  installments?: Installment[];
}

export interface Installment {
  id: string;
  billId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

export interface Expense {
  id: string;
  category: 'materials' | 'lab' | 'salary' | 'utilities' | 'other';
  description: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier?: string;
  lastRestocked?: string;
  notes?: string;
}

export interface DentalChart {
  patientId: string;
  teeth: { [toothId: string]: ToothData };
}

export interface ToothData {
  toothId: string;
  condition: 'healthy' | 'cavity' | 'filling' | 'crown' | 'extraction' | 'implant' | 'bridge';
  procedures: Procedure[];
  notes?: string;
}

export interface Procedure {
  id: string;
  type: string;
  date: string;
  notes?: string;
  images?: string[]; // URLs to X-ray images
}

export interface MedicalFile {
  id: string;
  patientId: string;
  type: 'xray' | 'document' | 'photo';
  filename: string;
  url: string;
  uploadedAt: string;
  notes?: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'app_1', patientId: 'patient_1', patientName: 'فهد العتيبي', doctor: 'د. سارة محمود', date: '2026-04-15', time: '10:30 ص', status: 'confirmed', type: 'تقويم أسنان' },
  { id: 'app_2', patientId: 'patient_2', patientName: 'سارة الشمري', doctor: 'د. ياسر العتيبي', date: '2026-04-15', time: '11:15 ص', status: 'pending', type: 'تنظيف أسنان' },
  { id: 'app_3', patientId: 'patient_3', patientName: 'محمد القحطاني', doctor: 'د. ليلي خالد', date: '2026-04-15', time: '01:00 م', status: 'arrived', type: 'خلع ضرس' },
  { id: 'app_4', patientId: 'patient_4', patientName: 'نورة الدوسري', doctor: 'د. أحمد سليمان', date: '2026-04-16', time: '09:00 ص', status: 'confirmed', type: 'حشوات تجميلية' },
  { id: 'app_5', patientId: 'patient_5', patientName: 'عبدالله العنزي', doctor: 'د. سارة محمود', date: '2026-04-16', time: '02:30 م', status: 'pending', type: 'كشف دوري' },
  { id: 'app_6', patientId: 'patient_6', patientName: 'ريم المطيري', doctor: 'د. ياسر العتيبي', date: '2026-04-17', time: '10:00 ص', status: 'confirmed', type: 'تبييض أسنان' },
  { id: 'app_7', patientId: 'patient_7', patientName: 'خالد الزهراني', doctor: 'د. ليلي خالد', date: '2026-04-12', time: '04:00 م', status: 'completed', type: 'تركيبات' },
  { id: 'app_8', patientId: 'patient_8', patientName: 'هيا السبيعي', doctor: 'د. أحمد سليمان', date: '2026-04-12', time: '11:30 ص', status: 'no-show', type: 'كشف دوري' },
  { id: 'app_9', patientId: 'patient_9', patientName: 'سلطان الحربي', doctor: 'د. سارة محمود', date: '2026-04-10', time: '01:30 م', status: 'completed', type: 'علاج عصب' },
  { id: 'app_10', patientId: 'patient_10', patientName: 'مروج الغامدي', doctor: 'د. ياسر العتيبي', date: '2026-04-11', time: '05:00 م', status: 'cancelled', type: 'تنظيف أسنان' },
];

const INITIAL_BILLS: Bill[] = [
  { id: 'bill_1', patientId: 'patient_1', patientName: 'فهد العتيبي', doctorName: 'د. سارة محمود', serviceName: 'تقويم أسنان', amount: 500, discount: 50, total: 450, status: 'unpaid', date: '2026-04-15' },
  { id: 'bill_2', patientId: 'patient_7', patientName: 'خالد الزهراني', doctorName: 'د. ليلي خالد', serviceName: 'تركيبات', amount: 1200, discount: 100, total: 1100, status: 'paid', date: '2026-04-12' },
  { id: 'bill_3', patientId: 'patient_9', patientName: 'سلطان الحربي', doctorName: 'د. سارة محمود', serviceName: 'علاج عصب', amount: 800, discount: 0, total: 800, status: 'paid', date: '2026-04-10' },
  { id: 'bill_4', patientId: 'patient_3', patientName: 'محمد القحطاني', doctorName: 'د. ليلي خالد', serviceName: 'خلع ضرس', amount: 350, discount: 0, total: 350, status: 'unpaid', date: '2026-04-15' },
  { id: 'bill_5', patientId: 'patient_4', patientName: 'نورة الدوسري', doctorName: 'د. أحمد سليمان', serviceName: 'حشوات تجميلية', amount: 450, discount: 45, total: 405, status: 'unpaid', date: '2026-04-16' },
];

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec_1',
    patientId: 'patient_1',
    patientName: 'فهد العتيبي',
    doctorId: 'doctor_1',
    doctorName: 'د. سارة محمود',
    date: '2026-04-10',
    diagnosis: 'تسوس عميق في الضرس العلوي الأيمن',
    treatment: 'تنظيف التسوس ووضع حشوة مؤقتة',
    notes: 'يحتاج لمراجعة بعد أسبوع لاستكمال الحشوة الدائمة',
    procedures: [{ id: 'proc_1', service: 'كشف وحشوة مؤقتة', price: 200, notes: '' }]
  },
  {
    id: 'rec_2',
    patientId: 'patient_9',
    patientName: 'سلطان الحربي',
    doctorId: 'doctor_1',
    doctorName: 'د. سارة محمود',
    date: '2026-04-10',
    diagnosis: 'التهاب في العصب',
    treatment: 'بدء علاج العصب وتنظيف القنوات',
    notes: 'تم صرف مضاد حيوي ومسكن',
    procedures: [{ id: 'proc_2', service: 'علاج عصب - مرحلة أولى', price: 400, notes: '' }]
  },
  {
    id: 'rec_3',
    patientId: 'patient_7',
    patientName: 'خالد الزهراني',
    doctorId: 'doctor_2',
    doctorName: 'د. ليلي خالد',
    date: '2026-04-12',
    diagnosis: 'فقدان الضرس رقم 14',
    treatment: 'تركيب جسر ثابت',
    notes: 'الجسر مركب بنجاح والمريض مرتاح للنتيجة',
    procedures: [{ id: 'proc_3', service: 'تركيب جسر ثابت', price: 1200, notes: '' }]
  }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp_1', category: 'materials', description: 'مواد حشو تجميلية', amount: 2500, date: '2026-04-01', notes: 'حشوات زرقاء وأبيض' },
  { id: 'exp_2', category: 'lab', description: 'مختبر خارجي - تيجان', amount: 1800, date: '2026-04-05', notes: 'تيجان زركونيا' },
  { id: 'exp_3', category: 'salary', description: 'رواتب الموظفين', amount: 15000, date: '2026-04-01', notes: 'رواتب شهر أبريل' },
  { id: 'exp_4', category: 'utilities', description: 'فواتير الكهرباء والماء', amount: 1200, date: '2026-04-10', notes: 'شهر مارس' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv_1', name: 'حشوة مؤقتة', category: 'مواد حشو', currentStock: 15, minStock: 10, unit: 'علبة', supplier: 'شركة الأدوية الطبية', lastRestocked: '2026-03-15' },
  { id: 'inv_2', name: 'مخدر موضعي', category: 'مخدرات', currentStock: 8, minStock: 15, unit: 'قارورة', supplier: 'مستشفى الملك فيصل', lastRestocked: '2026-03-20' },
  { id: 'inv_3', name: 'قفازات طبية', category: 'أدوات وقائية', currentStock: 50, minStock: 20, unit: 'علبة', supplier: 'شركة الوقاية الصحية', lastRestocked: '2026-04-01' },
  { id: 'inv_4', name: 'فرشاة تنظيف', category: 'أدوات', currentStock: 25, minStock: 10, unit: 'علبة', supplier: 'أدوات طبية العربية', lastRestocked: '2026-03-25' },
];

const INITIAL_DENTAL_CHARTS: DentalChart[] = [
  {
    patientId: 'patient_1',
    teeth: {
      '11': { toothId: '11', condition: 'cavity', procedures: [{ id: 'p1', type: 'حشوة مؤقتة', date: '2026-04-10' }], notes: 'تسوس عميق' },
      '12': { toothId: '12', condition: 'healthy', procedures: [], notes: '' },
      '13': { toothId: '13', condition: 'filling', procedures: [{ id: 'p2', type: 'حشوة دائمة', date: '2026-03-15' }], notes: 'حشوة قديمة' },
    }
  }
];

const INITIAL_MEDICAL_FILES: MedicalFile[] = [
  { id: 'file_1', patientId: 'patient_1', type: 'xray', filename: 'xray_tooth11.jpg', url: '/xray_tooth11.jpg', uploadedAt: '2026-04-10', notes: 'أشعة الضرس 11' },
  { id: 'file_2', patientId: 'patient_7', type: 'xray', filename: 'xray_bridge.jpg', url: '/xray_bridge.jpg', uploadedAt: '2026-04-12', notes: 'أشعة الجسر' },
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
  if (typeof window === 'undefined') return INITIAL_RECORDS;
  const stored = localStorage.getItem('juman_records');
  return stored ? JSON.parse(stored) : INITIAL_RECORDS;
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

// Expenses functions
export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  const stored = localStorage.getItem('juman_expenses');
  return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
};

export const addExpense = (expense: Omit<Expense, 'id'>) => {
  const expenses = getExpenses();
  const newExpense = { ...expense, id: `exp_${Date.now()}` };
  localStorage.setItem('juman_expenses', JSON.stringify([newExpense, ...expenses]));
  return newExpense;
};

export const updateExpense = (id: string, data: Partial<Expense>) => {
  const expenses = getExpenses();
  const updated = expenses.map(e => e.id === id ? { ...e, ...data } : e);
  localStorage.setItem('juman_expenses', JSON.stringify(updated));
};

export const deleteExpense = (id: string) => {
  const expenses = getExpenses();
  const updated = expenses.filter(e => e.id !== id);
  localStorage.setItem('juman_expenses', JSON.stringify(updated));
};

// Inventory functions
export const getInventory = (): InventoryItem[] => {
  if (typeof window === 'undefined') return INITIAL_INVENTORY;
  const stored = localStorage.getItem('juman_inventory');
  return stored ? JSON.parse(stored) : INITIAL_INVENTORY;
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
  const inventory = getInventory();
  const newItem = { ...item, id: `inv_${Date.now()}` };
  localStorage.setItem('juman_inventory', JSON.stringify([newItem, ...inventory]));
  return newItem;
};

export const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
  const inventory = getInventory();
  const updated = inventory.map(i => i.id === id ? { ...i, ...data } : i);
  localStorage.setItem('juman_inventory', JSON.stringify(updated));
};

export const deleteInventoryItem = (id: string) => {
  const inventory = getInventory();
  const updated = inventory.filter(i => i.id !== id);
  localStorage.setItem('juman_inventory', JSON.stringify(updated));
};

// Dental Chart functions
export const getDentalChart = (patientId: string): DentalChart | null => {
  if (typeof window === 'undefined') {
    return INITIAL_DENTAL_CHARTS.find(c => c.patientId === patientId) || null;
  }
  const stored = localStorage.getItem('juman_dental_charts');
  const charts: DentalChart[] = stored ? JSON.parse(stored) : INITIAL_DENTAL_CHARTS;
  return charts.find(c => c.patientId === patientId) || null;
};

export const updateDentalChart = (patientId: string, chart: DentalChart) => {
  const stored = localStorage.getItem('juman_dental_charts');
  const charts: DentalChart[] = stored ? JSON.parse(stored) : INITIAL_DENTAL_CHARTS;
  const updated = charts.filter(c => c.patientId !== patientId);
  updated.push(chart);
  localStorage.setItem('juman_dental_charts', JSON.stringify(updated));
};

// Medical Files functions
export const getMedicalFiles = (patientId?: string): MedicalFile[] => {
  if (typeof window === 'undefined') return INITIAL_MEDICAL_FILES;
  const stored = localStorage.getItem('juman_medical_files');
  const files: MedicalFile[] = stored ? JSON.parse(stored) : INITIAL_MEDICAL_FILES;
  return patientId ? files.filter(f => f.patientId === patientId) : files;
};

export const addMedicalFile = (file: Omit<MedicalFile, 'id'>) => {
  const files = getMedicalFiles();
  const newFile = { ...file, id: `file_${Date.now()}` };
  localStorage.setItem('juman_medical_files', JSON.stringify([newFile, ...files]));
  return newFile;
};

export const deleteMedicalFile = (id: string) => {
  const files = getMedicalFiles();
  const updated = files.filter(f => f.id !== id);
  localStorage.setItem('juman_medical_files', JSON.stringify(updated));
};

// Installments functions
export const getInstallments = (billId?: string): Installment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('juman_installments');
  const installments: Installment[] = stored ? JSON.parse(stored) : [];
  return billId ? installments.filter(i => i.billId === billId) : installments;
};

export const addInstallment = (installment: Omit<Installment, 'id'>) => {
  const installments = getInstallments();
  const newInstallment = { ...installment, id: `inst_${Date.now()}` };
  localStorage.setItem('juman_installments', JSON.stringify([newInstallment, ...installments]));
  return newInstallment;
};

export const payInstallment = (id: string) => {
  const installments = getInstallments();
  const updated = installments.map(i =>
    i.id === id ? { ...i, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] } : i
  );
  localStorage.setItem('juman_installments', JSON.stringify(updated));
};
