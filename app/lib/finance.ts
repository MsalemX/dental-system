export type ExpenseCategory = 
  | 'أدوات ومستلزمات'
  | 'رواتب'
  | 'إيجار'
  | 'صيانة'
  | 'مرافق وخدمات'
  | 'تسويق وإعلان'
  | 'أخرى';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'أدوات ومستلزمات',
  'رواتب',
  'إيجار',
  'صيانة',
  'مرافق وخدمات',
  'تسويق وإعلان',
  'أخرى',
];

export { EXPENSE_CATEGORIES };

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp_1', category: 'إيجار', amount: 5000, date: '2026-04-01', notes: 'إيجار شهر أبريل' },
  { id: 'exp_2', category: 'أدوات ومستلزمات', amount: 1200, date: '2026-04-05', notes: 'شراء قفازات وأدوات تعقيم' },
  { id: 'exp_3', category: 'رواتب', amount: 8000, date: '2026-04-10', notes: 'رواتب كادر الاستقبال' },
];

export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  const stored = localStorage.getItem('juman_expenses');
  return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
};

export const addExpense = (data: Omit<Expense, 'id'>) => {
  const expenses = getExpenses();
  const newExp = { ...data, id: `exp_${Date.now()}` };
  localStorage.setItem('juman_expenses', JSON.stringify([newExp, ...expenses]));
  return newExp;
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
