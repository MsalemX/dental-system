-- Supabase SQL schema for Dental System
-- This schema is designed for Supabase/PostgreSQL.
-- It includes tables for users, appointments, bills, invoices, medical records,
-- medical files, clinic settings, services, inventory, expenses, dental charts, rooms and notifications.

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles table for user metadata. Supabase Auth will manage authentication separately.
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'doctor', 'employee', 'patient')),
  phone text,
  specialty text,
  bio text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  age int,
  gender text check (gender in ('male', 'female')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_email on profiles(email);

-- Clinic settings and working hours
create table if not exists clinic_settings (
  id smallint primary key default 1,
  name text not null,
  logo text,
  address text,
  phone text,
  email text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  working_hours jsonb not null,
  updated_at timestamptz not null default now()
);

-- Rooms for clinic scheduling and doctor assignment
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  doctor_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rooms_doctor_id on rooms(doctor_id);

-- Appointment table
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  patient_name text not null,
  doctor_id uuid references profiles(id) on delete set null,
  doctor_name text not null,
  date date not null,
  time text not null,
  status text not null check (status in ('pending','confirmed','arrived','consulting','completed','cancelled','no-show')),
  type text not null,
  room_id uuid references rooms(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_patient_id on appointments(patient_id);
create index if not exists idx_appointments_doctor_id on appointments(doctor_id);
create index if not exists idx_appointments_date on appointments(date);

-- Service catalog
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  duration int not null default 0,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bills/invoices
create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  patient_name text not null,
  doctor_id uuid references profiles(id) on delete set null,
  doctor_name text not null,
  service_name text not null,
  amount numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status text not null check (status in ('unpaid','paid','installment')),
  date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bills_patient_id on bills(patient_id);
create index if not exists idx_bills_doctor_id on bills(doctor_id);
create index if not exists idx_bills_status on bills(status);

-- Installments for payment plans
create table if not exists installments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  due_date date not null,
  status text not null check (status in ('pending','paid','overdue')),
  paid_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_installments_bill_id on installments(bill_id);
create index if not exists idx_installments_status on installments(status);

-- Expenses and clinic costs
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('materials','lab','salary','utilities','other')),
  description text not null,
  amount numeric(12,2) not null default 0,
  date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_category on expenses(category);
create index if not exists idx_expenses_date on expenses(date);

-- Inventory items
create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  current_stock int not null default 0,
  min_stock int not null default 0,
  unit text not null,
  supplier text,
  last_restocked date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dental charts stored as JSON for flexible tooth structures
create table if not exists dental_charts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  chart jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_dental_charts_patient_id on dental_charts(patient_id);
create index if not exists idx_dental_charts_chart_gin on dental_charts using gin(chart);

-- Medical records and procedures stored in JSON
create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  patient_name text not null,
  doctor_id uuid references profiles(id) on delete set null,
  doctor_name text not null,
  date date not null,
  diagnosis text not null,
  treatment text not null,
  notes text,
  procedures jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_medical_records_patient_id on medical_records(patient_id);
create index if not exists idx_medical_records_doctor_id on medical_records(doctor_id);
create index if not exists idx_medical_records_procedures_gin on medical_records using gin(procedures);

-- Medical files and before/after photo metadata
create table if not exists medical_files (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  patient_name text,
  doctor_id uuid references profiles(id) on delete set null,
  doctor_name text,
  type text not null check (type in ('xray','document','photo')),
  photo_variant text check (photo_variant in ('before','after')),
  filename text not null,
  url text not null,
  uploaded_at date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_medical_files_patient_id on medical_files(patient_id);
create index if not exists idx_medical_files_doctor_id on medical_files(doctor_id);
create index if not exists idx_medical_files_type on medical_files(type);

-- Notifications for system alerts
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('appointment_new','appointment_cancelled','bill_paid','system')),
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);

-- Trigger helper: keep updated_at current automatically
create or replace function set_updated_at_column()
  returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at_column();

create trigger trigger_clinic_settings_updated_at
  before update on clinic_settings
  for each row execute function set_updated_at_column();

create trigger trigger_rooms_updated_at
  before update on rooms
  for each row execute function set_updated_at_column();

create trigger trigger_appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at_column();

create trigger trigger_services_updated_at
  before update on services
  for each row execute function set_updated_at_column();

create trigger trigger_bills_updated_at
  before update on bills
  for each row execute function set_updated_at_column();

create trigger trigger_installments_updated_at
  before update on installments
  for each row execute function set_updated_at_column();

create trigger trigger_expenses_updated_at
  before update on expenses
  for each row execute function set_updated_at_column();

create trigger trigger_inventory_items_updated_at
  before update on inventory_items
  for each row execute function set_updated_at_column();

create trigger trigger_dental_charts_updated_at
  before update on dental_charts
  for each row execute function set_updated_at_column();

create trigger trigger_medical_records_updated_at
  before update on medical_records
  for each row execute function set_updated_at_column();

create trigger trigger_medical_files_updated_at
  before update on medical_files
  for each row execute function set_updated_at_column();
