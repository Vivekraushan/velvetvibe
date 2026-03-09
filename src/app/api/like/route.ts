import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = createClient();

  const { post_id } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check existing like
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", post_id)
    .eq("user_id", user.id)
    .maybeSingle(); // safer than .single()

  if (existing) {
    // 🔥 UNLIKE
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", user.id);

    return NextResponse.json({ liked: false });
  }

  // 🔥 LIKE
  const { error } = await supabase.from("likes").insert({
    post_id,
    user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ liked: true });
}