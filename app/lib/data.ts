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
  patientName?: string;
  doctorName?: string;
  type: 'xray' | 'document' | 'photo';
  photoVariant?: 'before' | 'after';
  filename: string;
  url: string;
  uploadedAt: string;
  notes?: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [];

const INITIAL_BILLS: Bill[] = [];

const INITIAL_RECORDS: MedicalRecord[] = [];

const INITIAL_EXPENSES: Expense[] = [];

const INITIAL_INVENTORY: InventoryItem[] = [];

const INITIAL_DENTAL_CHARTS: DentalChart[] = [];

const INITIAL_MEDICAL_FILES: MedicalFile[] = [];

const ensureCleanStart = () => {
  if (typeof window === 'undefined') return;
  const marker = localStorage.getItem('juman_clean_start_v1');
  if (marker) return;

  const keys = [
    'juman_appointments',
    'juman_bills',
    'juman_records',
    'juman_expenses',
    'juman_inventory',
    'juman_dental_charts',
    'juman_medical_files',
    'juman_installments',
  ];

  keys.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem('juman_clean_start_v1', '1');
};

export const getAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  ensureCleanStart();
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
  ensureCleanStart();
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
    addNotification({ type: 'bill_paid', title: 'تم الدفع ✅', message: `دفع ${bill.patientName} فاتورة ${bill.serviceName} بقيمة ${bill.total} ر.ي` });
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
  ensureCleanStart();
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
  ensureCleanStart();
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
  ensureCleanStart();
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
  ensureCleanStart();
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
  ensureCleanStart();
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
  ensureCleanStart();
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
