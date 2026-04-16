import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { email, password } = await req.json();

  // Create user with auto-confirm
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = userData.user.id;

  // Assign admin role
  await supabase.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });

  // Create profile
  await supabase.from("profiles").upsert({ user_id: userId, full_name: "Admin Toàn Tâm" }, { onConflict: "user_id" });

  return new Response(JSON.stringify({ success: true, user_id: userId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
