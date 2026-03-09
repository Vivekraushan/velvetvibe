import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { post_id, text } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" });

  const { error } = await supabase.from("comments").insert({
    post_id,
    user_id: user.id,
    text,
  });

  if (error) {
    console.error(error);
  }

  return NextResponse.json({ success: true });
}