export interface DentalService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

const DEFAULT_SERVICES: DentalService[] = [
  { id: 'srv_1', name: 'تنظيف الأسنان', price: 200, duration: 30, description: 'تنظيف الجير وتلميع الأسنان' },
  { id: 'srv_2', name: 'حشو تجميلي', price: 350, duration: 45, description: 'حشو الأسنان بمواد تجميلية مطابقة للون السن' },
  { id: 'srv_3', name: 'تقويم أسنان', price: 5000, duration: 60, description: 'جلسة تركيب أو متابعة التقويم' },
  { id: 'srv_4', name: 'خلع ضرس', price: 150, duration: 20, description: 'خلع بسيط للضرس أو السن' },
];

export const getServices = (): DentalService[] => {
  if (typeof window === 'undefined') return DEFAULT_SERVICES;
  const stored = localStorage.getItem('juman_services');
  return stored ? JSON.parse(stored) : DEFAULT_SERVICES;
};

export const addService = (data: Omit<DentalService, 'id'>) => {
  const services = getServices();
  const newService = { ...data, id: `srv_${Date.now()}` };
  localStorage.setItem('juman_services', JSON.stringify([...services, newService]));
  return newService;
};

export const updateService = (id: string, data: Partial<DentalService>) => {
  const services = getServices();
  const updated = services.map((s) => (s.id === id ? { ...s, ...data } : s));
  localStorage.setItem('juman_services', JSON.stringify(updated));
};

export const deleteService = (id: string) => {
  const services = getServices();
  const updated = services.filter((s) => s.id !== id);
  localStorage.setItem('juman_services', JSON.stringify(updated));
};
