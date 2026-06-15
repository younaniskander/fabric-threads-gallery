import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LineItem {
  id: string; // fabric id (required, validated server-side)
  name?: string;
  quantity: number;
  image?: string;
}

const FREE_SAMPLE_COUPON_ID = "M2GxWeE3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- AuthN: require a valid Supabase JWT ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authErr } = await userClient.auth.getUser(token);
    if (authErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const { items, currency = "egp" } = (await req.json()) as {
      items: LineItem[];
      currency?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Validate items: require fabric id + sane quantity ----
    for (const item of items) {
      if (!item.id || typeof item.id !== "string") {
        return new Response(JSON.stringify({ error: "Each item requires a valid fabric id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 50) {
        return new Response(JSON.stringify({ error: "Invalid quantity" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ---- Server-side fabric lookup (prevents client price tampering) ----
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? anonKey,
    );
    const ids = [...new Set(items.map((i) => i.id))];
    const { data: fabrics, error: fabricsErr } = await serviceClient
      .from("fabrics_db")
      .select("id, name, name_en, image_url")
      .in("id", ids);
    if (fabricsErr) throw fabricsErr;
    const fabricsById = new Map((fabrics ?? []).map((f: any) => [f.id, f]));
    for (const id of ids) {
      if (!fabricsById.has(id)) {
        return new Response(JSON.stringify({ error: `Unknown fabric: ${id}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://adams-fabric-dream.lovable.app";

    // Catalog currently has no numeric prices — checkout is for free fabric
    // samples only. All line items are priced server-side at 1 EGP nominal and
    // fully discounted by the 100% coupon. If/when paid SKUs are introduced,
    // store a numeric price column and read unit_amount from it here.
    const lineItems = items.map((item) => {
      const f: any = fabricsById.get(item.id);
      const name = f.name || f.name_en || "Fabric sample";
      const image = f.image_url && /^https?:\/\//.test(f.image_url) ? [f.image_url] : undefined;
      return {
        price_data: {
          currency,
          product_data: {
            name: `${name} (عينة مجانية)`,
            ...(image ? { images: image } : {}),
          },
          unit_amount: 100, // 1 EGP nominal, discounted to 0
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/gallery`,
      discounts: [{ coupon: FREE_SAMPLE_COUPON_ID }],
      client_reference_id: userId,
      metadata: { user_id: userId },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: "Checkout failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
