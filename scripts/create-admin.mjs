import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME || "مدير النظام";
const adminPhone = process.env.ADMIN_PHONE || null;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
  );
}

if (!adminEmail || !adminPassword) {
  throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const run = async () => {
  const created = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (created.error && !created.error.message.toLowerCase().includes("already")) {
    throw created.error;
  }

  let authUserId = created.data.user?.id;

  if (!authUserId) {
    const listed = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listed.error) throw listed.error;
    const existing = listed.data.users.find((u) => u.email === adminEmail);
    authUserId = existing?.id;
  }

  if (!authUserId) {
    throw new Error("Could not resolve admin auth user id.");
  }

  const profileUpsert = await supabaseAdmin.from("profiles").upsert(
    {
      id: authUserId,
      email: adminEmail,
      name: adminName,
      role: "admin",
      phone: adminPhone,
      status: "active",
    },
    { onConflict: "email" }
  );

  if (profileUpsert.error) throw profileUpsert.error;

  console.log("Admin account ready:", adminEmail);
};

run().catch((err) => {
  console.error("Failed creating admin:", err.message || err);
  process.exit(1);
});
