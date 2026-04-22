import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE(req: NextRequest) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create admin client with service role key — bypasses RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Delete all user data first
    await adminClient.from("verifications").delete().in(
      "credential_id",
      (await adminClient.from("credentials").select("id").eq("user_id", user.id)).data?.map(c => c.id) ?? []
    );
    await adminClient.from("earnings").delete().eq("user_id", user.id);
    await adminClient.from("credentials").delete().eq("user_id", user.id);
    await adminClient.from("profiles").delete().eq("id", user.id);

    // Hard delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}