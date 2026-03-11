import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { post_id } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", post_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", user.id);

    return NextResponse.json({ liked: false });
  }

  await supabase.from("likes").insert({
    post_id,
    user_id: user.id,
  });

  return NextResponse.json({ liked: true });
}