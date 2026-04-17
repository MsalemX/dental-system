export interface WorkingDay {
  day: string;
  start: string;
  end: string;
  closed: boolean;
}

export interface ClinicSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  workingHours: WorkingDay[];
}

export interface Room {
  id: string;
  name: string;
  doctorId?: string; // Assigned doctor ID
}

const DEFAULT_WORKING_HOURS: WorkingDay[] = [
  { day: 'السبت', start: '09:00', end: '21:00', closed: false },
  { day: 'الأحد', start: '09:00', end: '21:00', closed: false },
  { day: 'الأثنين', start: '09:00', end: '21:00', closed: false },
  { day: 'الثلاثاء', start: '09:00', end: '21:00', closed: false },
  { day: 'الأربعاء', start: '09:00', end: '21:00', closed: false },
  { day: 'الخميس', start: '09:00', end: '21:00', closed: false },
  { day: 'الجمعة', start: '00:00', end: '00:00', closed: true },
];

const DEFAULT_SETTINGS: ClinicSettings = {
  name: 'جُمان لطب الأسنان',
  logo: 'https://cdn-icons-png.flaticon.com/512/3467/3467727.png',
  address: 'الرياض، المملكة العربية السعودية',
  phone: '920000000',
  email: 'info@dentalpro.com',
  latitude: 24.7136,
  longitude: 46.6753,
  workingHours: DEFAULT_WORKING_HOURS,
};

const DEFAULT_ROOMS: Room[] = [
  { id: 'room_1', name: 'غرفة 1' },
  { id: 'room_2', name: 'غرفة 2' },
];

export const getClinicSettings = (): ClinicSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem('juman_clinic_settings');
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const updateClinicSettings = (settings: ClinicSettings) => {
  localStorage.setItem('juman_clinic_settings', JSON.stringify(settings));
};

export const getRooms = (): Room[] => {
  if (typeof window === 'undefined') return DEFAULT_ROOMS;
  const stored = localStorage.getItem('juman_rooms');
  return stored ? JSON.parse(stored) : DEFAULT_ROOMS;
};

export const addRoom = (name: string) => {
  const rooms = getRooms();
  const newRoom = { id: `room_${Date.now()}`, name };
  localStorage.setItem('juman_rooms', JSON.stringify([...rooms, newRoom]));
  return newRoom;
};

export const deleteRoom = (id: string) => {
  const rooms = getRooms();
  const updated = rooms.filter((r) => r.id !== id);
  localStorage.setItem('juman_rooms', JSON.stringify(updated));
};

export const assignDoctorToRoom = (roomId: string, doctorId: string | undefined) => {
  const rooms = getRooms();
  const updated = rooms.map((r) =>
    r.id === roomId ? { ...r, doctorId } : (r.doctorId === doctorId ? { ...r, doctorId: undefined } : r)
  );
  localStorage.setItem('juman_rooms', JSON.stringify(updated));
};
