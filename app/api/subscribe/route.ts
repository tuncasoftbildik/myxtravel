import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("subscribers")
      .insert({ email: email.toLowerCase() });

    if (error) throw error;

    return NextResponse.json({ message: "Başarıyla abone oldunuz!" });
  } catch {
    return NextResponse.json(
      { error: "Bir hata oluştu, lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
