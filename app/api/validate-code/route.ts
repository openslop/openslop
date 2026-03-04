import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body;

  if (!code || typeof code !== "string" || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("access_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  if (!data.is_active) {
    return NextResponse.json({ error: "This code is no longer active" }, { status: 401 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "This code has expired" }, { status: 401 });
  }

  if (data.max_uses && data.current_uses >= data.max_uses) {
    return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 401 });
  }

  // Increment usage count
  await supabase
    .from("access_codes")
    .update({ current_uses: data.current_uses + 1 })
    .eq("id", data.id);

  return NextResponse.json({ redirect: "/signup" });
}
