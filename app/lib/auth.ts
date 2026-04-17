import { supabase } from "./supabaseClient";

export type UserRole = "admin" | "doctor" | "employee" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialty?: string;
  bio?: string;
  status?: "active" | "inactive";
  age?: string;
  gender?: string;
}

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  specialty: string | null;
  bio: string | null;
  status: "active" | "inactive" | null;
  age: number | null;
  gender: string | null;
};

const mapProfileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role,
  phone: profile.phone ?? undefined,
  specialty: profile.specialty ?? undefined,
  bio: profile.bio ?? undefined,
  status: profile.status ?? "active",
  age: profile.age != null ? String(profile.age) : undefined,
  gender: profile.gender ?? undefined,
});

const getProfileByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,name,role,phone,specialty,bio,status,age,gender")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileToUser(data as ProfileRow);
};

export const getSession = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return getProfileByEmail(data.user.email);
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,name,role,phone,specialty,bio,status,age,gender")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ProfileRow[]).map(mapProfileToUser);
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,name,role,phone,specialty,bio,status,age,gender")
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ProfileRow[]).map(mapProfileToUser);
};

export const login = async (email: string, pass: string): Promise<User | null> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) return null;

  const sessionUser = await getSession();
  if (!sessionUser) return null;

  return sessionUser;
};

export const register = async (): Promise<User | null> => {
  throw new Error("Self registration is disabled. Admin should create accounts.");
};

export const changePassword = async (
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return error ? { success: false, error: error.message } : { success: true };
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const payload = {
    name: data.name,
    phone: data.phone,
    specialty: data.specialty,
    bio: data.bio,
    status: data.status,
    age: data.age ? Number(data.age) : undefined,
    gender: data.gender,
  };

  const { error } = await supabase.from("profiles").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
};

export const adminAddUser = async (data: {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  specialty?: string;
  password?: string;
  age?: string;
  gender?: string;
}) => {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to create user");
  }

  return payload as User & { temporaryPassword?: string | null };
};

export const logout = async () => {
  await supabase.auth.signOut();
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const toggleUserStatus = async (id: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error(error?.message || "User not found");

  const nextStatus = data.status === "inactive" ? "active" : "inactive";
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ status: nextStatus })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);
};

export const updateUserProfile = updateUser;
export const adminUpdateUser = updateUser;
