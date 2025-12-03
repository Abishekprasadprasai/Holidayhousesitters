import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Access denied - admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get pending users (not verified)
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("is_verified", false)
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Get user emails and roles
    const usersWithDetails = await Promise.all(
      (profilesData || []).map(async (profile) => {
        // Get role
        const { data: userRoleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.user_id)
          .maybeSingle();

        // Get email from auth.users
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);

        // Generate signed URL for document if it exists
        let signedDocumentUrl = null;
        if (profile.document_url) {
          // Extract the file path from the full URL or use the path directly
          const documentPath = profile.document_url.includes('identity-documents/')
            ? profile.document_url.split('identity-documents/')[1]
            : profile.document_url;
          
          const { data: signedData } = await supabaseAdmin.storage
            .from("identity-documents")
            .createSignedUrl(documentPath, 3600); // 1 hour expiry
          
          signedDocumentUrl = signedData?.signedUrl || null;
        }

        return {
          ...profile,
          document_url: signedDocumentUrl,
          email: authUser.user?.email || "N/A",
          role: userRoleData?.role || "N/A",
        };
      })
    );

    return new Response(JSON.stringify({ users: usersWithDetails }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
