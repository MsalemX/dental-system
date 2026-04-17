import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type CreateUserPayload = {
  name: string;
  email: string;
  role: "admin" | "doctor" | "employee" | "patient";
  phone?: string;
  specialty?: string;
  password?: string;
  age?: string;
  gender?: string;
};

const randomPassword = () =>
  `Tmp!${Math.random().toString(36).slice(2, 10)}${Date.now().toString().slice(-2)}`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateUserPayload;
    const password = body.password?.trim() || randomPassword();

    const created = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password,
      email_confirm: true,
    });

    if (created.error || !created.data.user) {
      return NextResponse.json(
        { error: created.error?.message || "Failed to create auth user" },
        { status: 400 }
      );
    }

    const profileUpsert = await supabaseAdmin.from("profiles").upsert(
      {
        id: created.data.user.id,
        email: body.email,
        name: body.name,
        role: body.role,
        phone: body.phone || null,
        specialty: body.specialty || null,
        age: body.age ? Number(body.age) : null,
        gender:
          body.gender === "ذكر"
            ? "male"
            : body.gender === "أنثى"
            ? "female"
            : body.gender || null,
        status: "active",
      },
      { onConflict: "email" }
    );

    if (profileUpsert.error) {
      return NextResponse.json({ error: profileUpsert.error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: created.data.user.id,
      email: body.email,
      name: body.name,
      role: body.role,
      phone: body.phone || null,
      specialty: body.specialty || null,
      status: "active",
      temporaryPassword: body.password ? null : password,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
