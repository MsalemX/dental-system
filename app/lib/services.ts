export interface DentalService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

const DEFAULT_SERVICES: DentalService[] = [];

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
