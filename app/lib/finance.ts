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

const INITIAL_EXPENSES: Expense[] = [];

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
